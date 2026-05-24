console.log("--> WORKER: Module start");

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { URL } from "url";
import { Worker } from "bullmq";

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
    
    // Listen to 'exit' instead of 'close' to bypass Windows pipe deadlocks!
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

import Submission from "../models/submission.model.js";
import Problem from "../models/Problem.model.js";
import logger from "../config/logger.js";

import dotenv from "dotenv";
import connectDB from "../config/db_config.js";
import redisClient, { createRedisClient } from "../config/redis.js";
import { addScore } from "../services/leaderboard.service.js";

console.log("--> WORKER: All Modules Loaded");

dotenv.config();

console.log("--> WORKER: calling connectDB()");
connectDB();
console.log("--> WORKER: connectDB() called");

connectDB();
console.log("--> WORKER: connectDB() called");

function parseBool(value) {
  if (value == null) return undefined;
  const v = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(v)) return true;
  if (["0", "false", "no", "n", "off"].includes(v)) return false;
  return undefined;
}

function shouldUseTls(redisUrl) {
  const forced = parseBool(process.env.REDIS_TLS);
  if (forced !== undefined) return forced;
  return String(redisUrl || "").startsWith("rediss://");
}

/**
 * HELPER: Normalize Windows path for Docker
 */
const normalizePathForDocker = (absolutePath) => {
  return absolutePath
    .replace(/^([A-Za-z]):\\/, (match, drive) => `/${drive.toLowerCase()}/`)
    .replace(/\\/g, "/");
};

async function boot() {
  // ✅ Shared Redis (for cache, leaderboard)
  logger.info("Connecting Shared Redis...");
  await (typeof redisClient.safeConnect === "function"
    ? redisClient.safeConnect()
    : redisClient.connect()
  ).catch((err) => {
    logger.warn(`Shared Redis already connecting: ${err.message}`);
  });
  logger.info("Shared Redis Connected.");

  // ✅ Pub/Sub Redis (node-redis)
  async function connectWithTlsFallback(clientFactory) {
    let client = clientFactory({ tls: undefined });
    try {
      const url = process.env.REDIS_URL;
      const isRediss = String(url || "").startsWith("rediss://");

      const connectPromise = client.connect();
      const tlsMismatchPromise =
        isRediss
          ? new Promise((_, reject) => {
              const onError = (err) => {
                const msg = (err?.message || String(err || "")).toLowerCase();
                const looksLikeTlsMismatch =
                  msg.includes("packet length too long") ||
                  msg.includes("wrong version number") ||
                  msg.includes("unknown protocol") ||
                  msg.includes("tls_get_more_records");
                if (looksLikeTlsMismatch) {
                  client.off("error", onError);
                  reject(err);
                }
              };
              client.on("error", onError);
              connectPromise.finally(() => client.off("error", onError));
            })
          : new Promise(() => {});

      await Promise.race([connectPromise, tlsMismatchPromise]);
      return client;
    } catch (err) {
      const url = process.env.REDIS_URL;
      const isRediss = String(url || "").startsWith("rediss://");
      const msg = (err?.message || String(err || "")).toLowerCase();
      const looksLikeTlsMismatch =
        msg.includes("packet length too long") ||
        msg.includes("wrong version number") ||
        msg.includes("unknown protocol") ||
        msg.includes("tls_get_more_records");

      if (isRediss && looksLikeTlsMismatch) {
        logger.warn(
          { err: err.message },
          "RedisPub TLS handshake failed; retrying without TLS (check REDIS_URL scheme)"
        );
        try {
          client.disconnect();
        } catch {
          // ignore
        }
        client = clientFactory({ tls: false });
        await client.connect();
        return client;
      }
      throw err;
    }
  }

  const redisPub = await connectWithTlsFallback((opts) =>
    createRedisClient({ url: process.env.REDIS_URL, ...opts })
  );

  redisPub.on("error", (err) => logger.error(`RedisPub Error: ${err.message}`));
  logger.info("RedisPub Connected.");

  // ✅ BullMQ Redis (CRITICAL FIX)
  const redisUrl = new URL(process.env.REDIS_URL);

  const worker = new Worker(
    "submissionQueue",
    async (job) => {
      const { submissionId, problemId } = job.data;

      const workDir = path.join(
        process.cwd(),
        "src",
        "workers",
        "tmp",
        submissionId
      );

      const submission = await Submission.findById(submissionId);
      const problem = await Problem.findById(problemId);

      if (!submission || !problem) {
        logger.error(`Worker missing data for Submission: ${submissionId}`);
        return;
      }

      logger.info(`🏃 Processing Submission ${submissionId}...`);
      submission.status = "processing";
      await submission.save();

      try {
        const testCases = problem.testcases;

        if (!testCases || testCases.length === 0) {
          throw new Error("No test cases found in DB.");
        }

        if (!fs.existsSync(workDir)) {
          fs.mkdirSync(workDir, { recursive: true });
        }

        let overallVerdict = "Accepted";
        let overallError = null;
        let maxTime = 0;
        let testcasesPassed = 0;
        const totalTestcases = testCases.length;

        let ext = "js";
        if (submission.language === "python") ext = "py";
        else if (submission.language === "cpp") ext = "cpp";
        else if (submission.language === "c") ext = "c";
        else if (submission.language === "java") ext = "java";
        else if (submission.language === "go") ext = "go";
        else if (submission.language === "rust") ext = "rs";

        const fileName = `solution.${ext}`;
        const driverEntry = problem.driverCode?.find(
          (d) => d.language === submission.language
        );

        let finalCode = driverEntry
          ? submission.code + "\n\n" + driverEntry.code
          : submission.code;

        if (submission.language === "cpp" && driverEntry) {
          const cppHeader =
            "#include <bits/stdc++.h>\nusing namespace std;\n\n";
          if (!finalCode.includes("#include")) {
            finalCode = cppHeader + finalCode;
          }
        }

        let batchSize = 5;
        let hasFailure = false;

        for (let i = 0; i < testCases.length; i += batchSize) {
          const chunk = testCases.slice(i, i + batchSize);
          
          const results = await Promise.all(chunk.map(async (tc, idx) => {
            const actualIndex = i + idx;
            const tcDir = path.join(workDir, `tc_${actualIndex}`);
            if (!fs.existsSync(tcDir)) {
              fs.mkdirSync(tcDir, { recursive: true });
            }

            const codePath = path.join(tcDir, fileName);
            fs.writeFileSync(codePath, finalCode);
            fs.writeFileSync(path.join(tcDir, "input.txt"), tc.input);

            const start = Date.now();
            const dockerCmd = `docker run --rm -v "${normalizePathForDocker(tcDir)}:/app/code" --read-only --tmpfs /tmp:exec --cap-drop ALL --security-opt no-new-privileges --cpus=0.5 -m ${problem.memoryLimit}m --network none codearena-runner bash /app/runner.sh ${submission.language} /app/code/${fileName} /app/code/input.txt`;

            try {
              logger.info(`Executing Docker for testcase ${actualIndex}...`);
              const { stdout, stderr } = await runDockerWrapper(dockerCmd, 15000);
              
              if (stderr.trim()) {
                return { verdict: "Runtime Error", error: stderr.trim().substring(0, 1000), time: Date.now() - start };
              }
              if (stdout.trim() !== tc.output.trim()) {
                return { verdict: "Wrong Answer", error: null, time: Date.now() - start };
              }
              return { verdict: "Accepted", error: null, time: Date.now() - start };
            } catch (execError) {
              const actualError = execError.stderr || execError.stdout || execError.message;
              
              // Detect Docker connection failures
              const isDockerError =
                actualError.includes("npipe") ||
                (actualError.includes("docker") && actualError.includes("connect")) ||
                actualError.includes("Cannot connect to the Docker daemon") ||
                actualError.includes("docker.sock") ||
                actualError.includes("pipe/dockerDesktop");

              if (isDockerError) {
                return { 
                  verdict: "Runtime Error", 
                  error: "Code execution engine (Docker) is not available. Please ensure Docker Desktop is running.", 
                  time: Date.now() - start 
                };
              }

              const verdict = execError.code === 124 ? "Time Limit Exceeded" : "Runtime Error";
              return { verdict, error: actualError ? actualError.substring(0, 1000) : "Unknown Error", time: Date.now() - start };
            }
          }));

          for (const res of results) {
            maxTime = Math.max(maxTime, res.time);
            if (res.verdict === "Accepted") {
              testcasesPassed++;
            } else {
              overallVerdict = res.verdict;
              overallError = res.error;
              hasFailure = true;
              break;
            }
          }
          
          if (hasFailure) break;
        }

        submission.status = "completed";
        submission.verdict = overallVerdict;
        submission.error = overallError;
        submission.runtime = maxTime;
        submission.testcasesPassed = testcasesPassed;
        submission.totalTestcases = totalTestcases;
      } catch (error) {
        logger.error(`❌ Worker Error: ${error.message}`);
        submission.status = "failed";
        submission.verdict = "Runtime Error";
        submission.error = error.message;
      } finally {
        try {
          await submission.save();
        } catch (saveErr) {
          logger.error(`❌ Worker Save Error: ${saveErr.message}`);
        }

        // ✅ Leaderboard logic
        if (submission.verdict === "Accepted") {
          const key = `leaderboard:awarded:${submission.userId}:${submission.problemId}`;
          const exists = await redisClient.exists(key);

          if (!exists) {
            await addScore(submission.userId.toString(), 10);
            await redisClient.set(key, "1");
          }
        }

        // ✅ Pub/Sub update
        await redisPub.publish(
          "SUBMISSION_UPDATED",
          JSON.stringify({
            submissionId: submission._id.toString(),
            userId: submission.userId.toString(),
            verdict: submission.verdict,
            status: submission.status,
            error: submission.error,
            runtime: submission.runtime,
            testcasesPassed: submission.testcasesPassed,
            totalTestcases: submission.totalTestcases,
          })
        );

        // Cleanup
        if (fs.existsSync(workDir)) {
          fs.rmSync(workDir, { recursive: true, force: true });
        }
      }
    },
    {
      connection: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port),
        username: redisUrl.username,
        password: redisUrl.password,
        tls: shouldUseTls(process.env.REDIS_URL) ? {} : undefined,
      },
    }
  );

  logger.info("📡 Worker running...");
}

// Process safety
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

boot();