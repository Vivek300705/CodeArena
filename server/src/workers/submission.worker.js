import { Worker } from "bullmq";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { createClient } from "redis";
import Submission from "../models/submission.model.js";
import Problem from "../models/Problem.model.js";
import logger from "../config/logger.js";
import dotenv from "dotenv";
import connectDB from "../config/db_config.js";

dotenv.config();
connectDB();

const execPromise = promisify(exec);

/**
 * HELPER: Normalizes Windows absolute paths for Docker volumes.
 * Converts "C:\Users\..." to "/c/users/..."
 */
const normalizePathForDocker = (absolutePath) => {
  return absolutePath
    .replace(/^([A-Za-z]):\\/, (match, drive) => `/${drive.toLowerCase()}/`)
    .replace(/\\/g, "/");
};

// Handle Process Errors to keep worker alive
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

// Setup Redis Publisher for WebSockets
const redisPub = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});
redisPub.on("error", (err) => logger.error(`RedisPub Error: ${err.message}`));
await redisPub.connect();

const worker = new Worker(
  "submissionQueue",
  async (job) => {
    const { submissionId, problemId } = job.data;

    // Use absolute path for Windows reliability
    const workDir = path.join(
      process.cwd(),
      "src",
      "workers",
      "tmp",
      submissionId,
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
      /**
       * TESTCASE LOADING
       * Fetch test cases directly from the DB problem document.
       */
      const testCases = problem.testcases;

      if (!testCases || testCases.length === 0) {
        throw new Error("No test cases found for this problem in the database.");
      }

      if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

      let overallVerdict = "Accepted";
      let overallError = null;
      let maxTime = 0;

      for (let i = 0; i < testCases.length; i++) {
        const { input, output: expected } = testCases[i];
        let ext;
        if (submission.language === "python") ext = "py";
        else if (submission.language === "cpp") ext = "cpp";
        else if (submission.language === "c") ext = "c";
        else if (submission.language === "java") ext = "java";
        else if (submission.language === "go") ext = "go";
        else if (submission.language === "rust") ext = "rs";
        else ext = "js"; // node / javascript
        const fileName = `solution.${ext}`;
        const codePath = path.join(workDir, fileName);

        // Write files to the temporary directory
        fs.writeFileSync(codePath, submission.code);
        fs.writeFileSync(path.join(workDir, "input.txt"), input);

        const dockerPath = normalizePathForDocker(workDir);
        const start = Date.now();

        // Docker Command - Note the use of quotes around volume path for Windows spaces
        const dockerCmd = `docker run --rm -v "${dockerPath}:/app/code" -m ${problem.memoryLimit}m --network none codearena-runner bash /app/runner.sh ${submission.language} /app/code/${fileName} /app/code/input.txt`;

        logger.info(`🐳 Executing: ${dockerCmd}`);

        try {
          const { stdout, stderr } = await execPromise(dockerCmd);

          if (stderr.trim()) {
            overallVerdict = "Runtime Error";
            overallError = stderr.trim().substring(0, 1000);
            break;
          }

          if (stdout.trim() !== expected.trim()) {
            overallVerdict = "Wrong Answer";
            break;
          }
        } catch (execError) {
          const actualError =
            execError.stderr || execError.stdout || execError.message;
          logger.warn(`Execution Error: ${actualError}`);

          overallVerdict =
            execError.code === 124 ? "Time Limit Exceeded" : "Runtime Error";
          overallError = actualError.substring(0, 1000);
          break;
        }

        maxTime = Math.max(maxTime, Date.now() - start);
      }

      submission.status = "completed";
      submission.verdict = overallVerdict;
      submission.error = overallError;
      submission.runtime = maxTime;
    } catch (error) {
      logger.error(`❌ Fatal Worker Error: ${error.message}`);
      submission.status = "failed";
      submission.verdict = "Runtime Error";
      submission.error = error.message;
    } finally {
      await submission.save();

      // Notify the Socket.io server via Redis Pub/Sub
      await redisPub.publish(
        "SUBMISSION_UPDATED",
        JSON.stringify({
          submissionId: submission._id.toString(),
          userId: submission.userId.toString(),
          verdict: submission.verdict,
          status: submission.status,
        }),
      );

      logger.info(
        `🏁 Finished Submission ${submissionId} with verdict: ${submission.verdict}`,
      );

      // Cleanup temporary files
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    }
  },
  { connection: { host: "127.0.0.1", port: 6379 } },
);

logger.info("📡 Submission Worker is online and waiting for jobs...");