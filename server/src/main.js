import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import http from "http";

import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./config/logger.js";
import requestLogger from "./middleware/requestLogger.js";
import connectDB from "./config/db_config.js";
import redisClient from "./config/redis.js";
import globalRateLimit from "./middleware/globalRateLimit.js";
import { swaggerSpec } from "./config/swagger.js";
import { metricsHandler } from "./controllers/metrics.controller.js";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import benchmarkRoutes from "./routes/benchmark.routes.js";
import { initSocket } from "./utils/socket.js";

dotenv.config();

// 🔥 Crash protection (VERY IMPORTANT)
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION:", err);
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// ── Security Middleware ─────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:80",
  "http://localhost",
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(globalRateLimit);
app.use(requestLogger);

// ── Routes ──────────────────────────────────────────────────

// Health check (Render uses this)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/metrics", metricsHandler);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "CodeArena API Docs",
    swaggerOptions: { persistAuthorization: true },
  })
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

app.use("/auth", authRoutes);
app.use("/api", problemRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api", benchmarkRoutes);

// Error handler (must be last)
app.use(errorHandler);

// ── START SERVER FIRST (CRITICAL FIX) ───────────────────────

const PORT = process.env.PORT || 10000;

console.log("🚀 Starting CodeArena...");
console.log("PORT:", PORT);
console.log("MONGO:", process.env.MONGODB_URI ? "OK" : "MISSING");
console.log("REDIS:", process.env.REDIS_URL ? "OK" : "MISSING");

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

// ── Initialize Services (NON-BLOCKING) ──────────────────────

(async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    logger.info("✅ MongoDB connected");
  } catch (err) {
    logger.error(
      { err: err.message },
      "❌ MongoDB connection failed"
    );
  }

  try {
    console.log("Connecting to Redis...");
    await redisClient.connect();
    logger.info("✅ Redis connected");
  } catch (err) {
    logger.error(
      { err: err.message },
      "❌ Redis connection failed"
    );
  }
})();