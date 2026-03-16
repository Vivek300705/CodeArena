import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./config/logger.js";
import requestLogger from "./middleware/requestLogger.js";
import connectDB from "./config/db_config.js";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import { initSocket } from "./utils/socket.js";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with the HTTP server
initSocket(server);

app.use(express.json());
app.use(cors());
app.use(requestLogger);

const port = process.env.PORT || 8000;

// Removed app.get("/") to prevent WebSocket handshake interference

app.use("/auth", authRoutes);
app.use("/api", problemRoutes);
app.use("/api/v1/submissions", submissionRoutes);

app.use(errorHandler);

connectDB();

// CRITICAL: Use server.listen, not app.listen
server.listen(port, () => {
  logger.info(`🚀 Server and WebSockets running on port ${port}`);
});
