import { spawn } from "child_process";
import fs from "fs";
import path from "path";
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
 * Helper: Run a command (Docker or local) with timeout.
 */
const runCommandWrapper = (cmd, timeoutMs) => {
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
 * Execute code using Docker (default) or directly (if USE_DOCKER=false).
 */
export async function executeCode({ language, tcDir, fileName, memoryLimit, timeoutMs = 15000 }) {
  const useDocker = process.env.USE_DOCKER !== "false";

  if (useDocker) {
    logger.info(`Executing in Docker for ${fileName}...`);
    const dockerCmd = `docker run --rm -v "${normalizePathForDocker(tcDir)}:/app/code" --read-only --tmpfs /tmp:exec --cap-drop ALL --security-opt no-new-privileges --cpus=0.5 -m ${memoryLimit || 256}m --network none codearena-runner bash /app/runner.sh ${language} /app/code/${fileName} /app/code/input.txt`;
    return await runCommandWrapper(dockerCmd, timeoutMs);
  } else {
    logger.info(`Executing directly (No Docker) for ${fileName}...`);
    
    // Fallback direct execution commands matching runner.sh
    const filePath = path.join(tcDir, fileName);
    const inputPath = path.join(tcDir, "input.txt");
    const tmpDir = tcDir; // Use testcase dir instead of /tmp to avoid concurrency issues
    const mainExe = path.join(tmpDir, "main");
    
    let cmd = "";
    // Note: timeout command might not be available on all OSes natively (e.g. Windows),
    // but on Linux (Render) it is. For local Windows, runCommandWrapper already enforces a hard timeout.
    
    const isWindows = process.platform === "win32";
    const timeoutPrefix = isWindows ? "" : "timeout 2s "; // 2s per execution, fallback
    
    if (language === "cpp") {
      cmd = `g++ "${filePath}" -O2 -o "${mainExe}" && ${timeoutPrefix}"${mainExe}" < "${inputPath}"`;
    } else if (language === "c") {
      cmd = `gcc "${filePath}" -O2 -o "${mainExe}" && ${timeoutPrefix}"${mainExe}" < "${inputPath}"`;
    } else if (language === "python" || language === "py") {
      cmd = `${isWindows ? "python" : "python3"} "${filePath}" < "${inputPath}"`;
    } else if (language === "node" || language === "javascript" || language === "js") {
      cmd = `node "${filePath}" < "${inputPath}"`;
    } else if (language === "java") {
      const classPath = path.basename(filePath, ".java");
      cmd = `javac "${filePath}" && cd "${tmpDir}" && ${timeoutPrefix}java ${classPath} < "${inputPath}"`;
    } else if (language === "go") {
      cmd = `go build -o "${mainExe}" "${filePath}" && ${timeoutPrefix}"${mainExe}" < "${inputPath}"`;
    } else if (language === "rust" || language === "rs") {
      cmd = `rustc -o "${mainExe}" "${filePath}" && ${timeoutPrefix}"${mainExe}" < "${inputPath}"`;
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }

    return await runCommandWrapper(cmd, timeoutMs);
  }
}
