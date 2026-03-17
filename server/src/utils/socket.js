import { Server } from "socket.io";
import { createClient } from "redis";
import logger from "../config/logger.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // 1. Setup Redis Subscriber for Worker updates
  const redisSub = createClient({ url: process.env.REDIS_URL || "redis://127.0.0.1:6379" });

  redisSub
    .connect()
    .then(() => {
      logger.info("📡 Redis Subscribed for Socket updates");
      
      return redisSub.subscribe("SUBMISSION_UPDATED", (message) => {
        const data = JSON.parse(message);
        // Emit to the room named after the userId
        io.to(data.userId).emit("submission_update", data);
        logger.info(
          { submissionId: data.submissionId, verdict: data.verdict },
          "Real-time update emitted to user",
        );
      });
    })
    .catch((err) => logger.error("Redis Socket Connection Error:", err));

  // 2. Handle Client Connections
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    console.log("✅ Socket connected:", socket.id);

    if (userId) {
      socket.join(userId);
      logger.info(`User ${userId} joined room`);
    }

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
