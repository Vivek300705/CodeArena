import { Server } from "socket.io";
import logger from "../config/logger.js";
import { createRedisClient } from "../config/redis.js";
import matchEngine from "../services/matchEngine.js";
import duelService from "../services/duelService.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // 1. Setup Redis Subscriber for Worker updates
  async function connectWithTlsFallback() {
    let client = createRedisClient({ url: process.env.REDIS_URL });
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
          "RedisSub TLS handshake failed; retrying without TLS (check REDIS_URL scheme)"
        );
        try {
          client.disconnect();
        } catch {
          // ignore
        }
        client = createRedisClient({ url, tls: false });
        await client.connect();
        return client;
      }
      throw err;
    }
  }

  connectWithTlsFallback()
    .then((redisSub) => {
      logger.info("📡 Redis Subscribed for Socket updates");
      
      return redisSub.subscribe("SUBMISSION_UPDATED", async (message) => {
        const data = JSON.parse(message);
        // Emit to the room named after the userId
        io.to(data.userId).emit("submission_update", data);
        logger.info(
          { submissionId: data.submissionId, verdict: data.verdict },
          "Real-time update emitted to user",
        );

        // Duel System Integration
        try {
          const activeMatchId = await matchEngine.getActiveMatchForUser(data.userId);
          if (activeMatchId) {
            const duelData = await duelService.processSubmissionVerdict(
              activeMatchId,
              data.userId,
              data.problemId,
              data.verdict
            );
            
            // Broadcast submission to duel room
            io.to(`duel:${activeMatchId}`).emit("duel_submission_update", {
              userId: data.userId,
              problemId: data.problemId,
              verdict: data.verdict,
              pointsEarned: duelData?.points || 0,
              isFirstSolver: duelData?.isFirstSolver || false
            });

            // If score changed, broadcast
            if (duelData && duelData.points !== 0) {
              io.to(`duel:${activeMatchId}`).emit("duel_score_update", {
                userId: data.userId,
                newScore: duelData.newScore,
              });
            }
          }
        } catch (err) {
          logger.error("Error processing duel submission:", err);
        }
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

    // Duel Events
    socket.on("join_duel", (matchId) => {
      socket.join(`duel:${matchId}`);
      logger.info(`User ${userId} joined duel ${matchId}`);
    });

    socket.on("duel_powerup", (data) => {
      const { matchId, powerupType } = data;
      // Broadcast powerup usage
      io.to(`duel:${matchId}`).emit("powerup_used", {
        usedBy: userId,
        powerupType
      });
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
