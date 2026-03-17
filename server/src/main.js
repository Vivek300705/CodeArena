import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import xssClean from "xss-clean";
import swaggerUi from "swagger-ui-express";
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
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with the HTTP server
initSocket(server);

// ── Security middleware (applied before everything else) ──────────────────
app.use(helmet());                // Sets 12+ security HTTP headers
app.use(cors());
app.use(express.json());
app.use(xssClean());              // Strip <script> tags from req.body / params
app.use(globalRateLimit);         // 200 req / 15 min per IP (Redis-backed)
// ─────────────────────────────────────────────────────────────────────────

app.use(requestLogger);

const port = process.env.PORT || 8000;

// Health check — used by Docker HEALTHCHECK and Nginx (rate-limit-exempt)
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: System metrics (memory, CPU, DB connections, cache hit rate)
 *     tags: [Observability]
 *     security: []
 *     responses:
 *       200:
 *         description: Current system metrics
 */
app.get("/metrics", metricsHandler);

// Swagger UI — available in all envs (disable behind auth in production if needed)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "CodeArena API Docs",
    swaggerOptions: { persistAuthorization: true },
  }),
);
// Raw OpenAPI JSON spec (for Postman import, CI validation, etc.)
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

app.use("/auth", authRoutes);
app.use("/api", problemRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api", benchmarkRoutes);

app.use(errorHandler);

// Connect to databases
connectDB();
redisClient.connect().catch((err) => {
  logger.error({ err: err.message }, "Failed to connect Redis at startup");
});

// CRITICAL: Use server.listen, not app.listen
server.listen(port, () => {
  logger.info(`🚀 Server and WebSockets running on port ${port}`);
});

