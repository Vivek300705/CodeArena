import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import Problem from "../models/Problem.model.js";
import logger from "../config/logger.js";

/**
 * Helper: Normalize Windows path for Docker volume mounts.
 * Converts D:\project\... → /d/project/...
 */
const normalizePathForDocker = (absolutePath) => {
  return absolutePath
    .replace(/^([A-Za-z]):\\/, (match, drive) => `/${drive.toLowerCase()}/`)
    .replace(/\\/g, "/");
};

/**
 * Helper: Run a Docker command with timeout.
 */
const runDockerWrapper = (cmd, timeoutMs) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { shell: true, windowsHide: true });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });

    let isDone = false;
    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        child.kill("SIGKILL");
        const err = new Error("Time Limit Exceeded");
        err.code = 124;
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      }
    }, timeoutMs);

    child.on("exit", (code) => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      if (code !== 0 && code !== null) {
        const err = new Error(`Command failed with code ${code}`);
        err.code = code;
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });

    child.on("error", (err) => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      err.stdout = stdout;
      err.stderr = stderr;
      reject(err);
    });
  });
};

/**
 * @desc    Run code against visible example test cases (synchronous response)
 * @route   POST /api/v1/submissions/run
 * @access  Private
 */
export const runCode = async (req, res, next) => {
  const { problemId, code, language } = req.body;

  if (!problemId || !code || !language) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: problemId, code, or language",
    });
  }

  let problem;
  try {
    problem = await Problem.findById(problemId);
  } catch (err) {
    return res.status(404).json({ success: false, message: "Problem not found." });
  }

  if (!problem) {
    return res.status(404).json({ success: false, message: "Problem not found." });
  }

  // Use visible examples for the RUN feature
  const examples = problem.examples || [];
  if (examples.length === 0) {
    return res.status(400).json({
      success: false,
      message: "This problem has no example test cases to run against.",
    });
  }

  const runId = crypto.randomBytes(8).toString("hex");
  const workDir = path.join(process.cwd(), "src", "workers", "tmp", `run_${runId}`);

  try {
    // Determine file extension
    let ext = "js";
    const langMap = { python: "py", cpp: "cpp", c: "c", java: "java", go: "go", rust: "rs", node: "js" };
    ext = langMap[language] || "js";

    const fileName = `solution.${ext}`;

    // Combine user code with driver code (same logic as submission worker)
    const driverEntry = problem.driverCode?.find((d) => d.language === language);
    let finalCode = driverEntry
      ? code + "\n\n" + driverEntry.code
      : code;

    if (language === "cpp" && driverEntry) {
      const cppHeader = "#include <bits/stdc++.h>\nusing namespace std;\n\n";
      if (!finalCode.includes("#include")) {
        finalCode = cppHeader + finalCode;
      }
    }

    const results = [];

    for (let i = 0; i < examples.length; i++) {
      const ex = examples[i];
      const tcDir = path.join(workDir, `tc_${i}`);

      if (!fs.existsSync(tcDir)) {
        fs.mkdirSync(tcDir, { recursive: true });
      }

      const codePath = path.join(tcDir, fileName);
      fs.writeFileSync(codePath, finalCode);
      fs.writeFileSync(path.join(tcDir, "input.txt"), ex.input || "");

      const start = Date.now();
      const dockerCmd = `docker run --rm -v "${normalizePathForDocker(tcDir)}:/app/code" --read-only --tmpfs /tmp:exec --cap-drop ALL --security-opt no-new-privileges --cpus=0.5 -m ${problem.memoryLimit || 256}m --network none codearena-runner bash /app/runner.sh ${language} /app/code/${fileName} /app/code/input.txt`;

      try {
        const { stdout, stderr } = await runDockerWrapper(dockerCmd, 15000);
        const elapsed = Date.now() - start;

        if (stderr.trim()) {
          results.push({
            testcase: i + 1,
            input: ex.input,
            expected: ex.output,
            actual: null,
            passed: false,
            error: stderr.trim().substring(0, 1000),
            verdict: "Runtime Error",
            runtime: elapsed,
          });
        } else {
          const actual = stdout.trim();
          const expected = (ex.output || "").trim();
          const passed = actual === expected;
          results.push({
            testcase: i + 1,
            input: ex.input,
            expected: ex.output,
            actual,
            passed,
            error: null,
            verdict: passed ? "Accepted" : "Wrong Answer",
            runtime: elapsed,
          });
        }
      } catch (execError) {
        const elapsed = Date.now() - start;
        const errorMsg = execError.stderr || execError.stdout || execError.message;

        // Detect Docker connection failures
        const isDockerError =
          errorMsg.includes("npipe") ||
          errorMsg.includes("docker") && errorMsg.includes("connect") ||
          errorMsg.includes("Cannot connect to the Docker daemon") ||
          errorMsg.includes("docker.sock") ||
          errorMsg.includes("pipe/dockerDesktop");

        if (isDockerError) {
          // Clean up and return immediately with a clear error
          if (fs.existsSync(workDir)) {
            fs.rmSync(workDir, { recursive: true, force: true });
          }
          return res.status(503).json({
            success: false,
            message: "Code execution engine (Docker) is not available. Please ensure Docker Desktop is running.",
            dockerError: true,
          });
        }

        const verdict = execError.code === 124 ? "Time Limit Exceeded" : "Runtime Error";
        results.push({
          testcase: i + 1,
          input: ex.input,
          expected: ex.output,
          actual: null,
          passed: false,
          error: errorMsg ? errorMsg.substring(0, 1000) : "Unknown Error",
          verdict,
          runtime: elapsed,
        });
      }
    }

    const allPassed = results.every((r) => r.passed);

    res.status(200).json({
      success: true,
      data: {
        results,
        totalTestcases: examples.length,
        testcasesPassed: results.filter((r) => r.passed).length,
        allPassed,
        overallVerdict: allPassed ? "Accepted" : results.find((r) => !r.passed)?.verdict || "Wrong Answer",
      },
    });
  } catch (error) {
    logger.error({ err: error.message, stack: error.stack }, "Controller Error: runCode");
    next(error);
  } finally {
    // Cleanup temp directory
    try {
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      logger.warn(`Cleanup failed for ${workDir}: ${cleanupErr.message}`);
    }
  }
};
