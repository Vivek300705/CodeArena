console.log("--> WORKER: Module start");
import { Worker } from "bullmq";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { createClient } from "redis";
import Submission from "../models/submission.model.js";
import Problem from "../models/Problem.model.js";
import logger from "../config/logger.js";
console.log("--> WORKER: Standard Modules Loaded");
import dotenv from "dotenv";
import connectDB from "../config/db_config.js";
import redisClient from "../config/redis.js";
import { addScore } from "../services/leaderboard.service.js";
console.log("--> WORKER: All Modules Loaded");

dotenv.config();
console.log("--> WORKER: calling connectDB()");
connectDB();
console.log("--> WORKER: connectDB() called");

async function boot() {
  // Connect the shared Redis client (used by cache + leaderboard services)
  logger.info("Connecting Shared Redis...");
  await redisClient.connect().catch((err) => {
    logger.warn(`Shared Redis already connecting: ${err.message}`);
  });
  logger.info("Shared Redis Connected.");

  // Dedicated Redis pub/sub client — pub/sub requires its own connection
  const redisPub = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  });
  redisPub.on("error", (err) => logger.error(`RedisPub Error: ${err.message}`));

  logger.info("Connecting RedisPub...");
  await redisPub.connect();
  logger.info("RedisPub Connected. Starting Worker.");

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
      let testcasesPassed = 0;
      const totalTestcases = testCases.length;

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
        // Combine user code + hidden driver code (LeetCode-style)
        const driverEntry = problem.driverCode?.find(
          (d) => d.language === submission.language
        );
        let finalCode = driverEntry
          ? submission.code + "\n\n" + driverEntry.code
          : submission.code;
        
        // For C++: always prepend the standard header if driver code exists
        // This ensures problems seeded without explicit #include still compile.
        if (submission.language === "cpp" && driverEntry) {
          const cppHeader = "#include <bits/stdc++.h>\nusing namespace std;\n\n";
          if (!finalCode.includes("#include")) {
            finalCode = cppHeader + finalCode;
          }
        }
        
        fs.writeFileSync(codePath, finalCode);
        fs.writeFileSync(path.join(workDir, "input.txt"), input);

        const start = Date.now();

        // Docker Command - Hardened with security flags:
        //  --read-only        : container fs is read-only (writes go to /tmp only)
        //  --cap-drop ALL     : drop ALL Linux capabilities (no root escalation)
        //  --security-opt no-new-privileges : block setuid/setgid privilege escalation
        //  --cpus=0.5         : throttle to 0.5 CPU cores to prevent abuse
        //  --network none     : no outbound network
        //  -m <limit>m        : memory cap from problem config
        const dockerCmd = `docker run --rm \
-v "${normalizePathForDocker(workDir)}:/app/code" \
--read-only \
--tmpfs /tmp:exec \
--cap-drop ALL \
--security-opt no-new-privileges \
--cpus=0.5 \
-m ${problem.memoryLimit}m \
--network none \
codearena-runner bash /app/runner.sh ${submission.language} /app/code/${fileName} /app/code/input.txt`;

        logger.info(`🐳 Executing: ${dockerCmd}`);

        try {
          const { stdout, stderr } = await execPromise(dockerCmd, { timeout: 15000, killSignal: 'SIGKILL' });

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
        testcasesPassed++;  // test case passed!
      }

      submission.status = "completed";
      submission.verdict = overallVerdict;
      submission.error = overallError;
      submission.runtime = maxTime;
      submission.testcasesPassed = testcasesPassed;
      submission.totalTestcases = totalTestcases;
    } catch (error) {
      logger.error(`❌ Fatal Worker Error: ${error.message}`);
      submission.status = "failed";
      submission.verdict = "Runtime Error";
      submission.error = error.message;
    } finally {
      await submission.save();

      // ── Leaderboard Scoring ──────────────────────────────────────────────
      // Award 10 pts for first Accepted submission per user-problem pair.
      // A permanent Redis key prevents duplicate awards for the same problem.
      if (submission.verdict === "Accepted") {
        const dedupKey = `leaderboard:awarded:${submission.userId}:${submission.problemId}`;
        const alreadyAwarded = await redisClient.exists(dedupKey);
        if (!alreadyAwarded) {
          await addScore(submission.userId.toString(), 10);
          await redisClient.set(dedupKey, "1"); // permanent dedup marker
          logger.info(
            { userId: submission.userId, problemId: submission.problemId },
            "🏆 Leaderboard: 10 pts awarded",
          );
        } else {
          logger.debug(
            { userId: submission.userId, problemId: submission.problemId },
            "Leaderboard: duplicate Accepted — no points awarded",
          );
        }
      }
      // ────────────────────────────────────────────────────────────────────

      // Notify the Socket.io server via Redis Pub/Sub
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
  { connection: { host: "127.0.0.1", port: 6379 } });

  logger.info("📡 Submission Worker is online and waiting for jobs...");
}

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

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

boot();