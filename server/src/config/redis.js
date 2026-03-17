import { createClient } from "redis";
import logger from "./logger.js";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  logger.error({ err: err.message }, "Redis Client Error");
});

redisClient.on("connect", () => {
  logger.info("✅ Redis client connected");
});

redisClient.on("reconnecting", () => {
  logger.warn("🔄 Redis client reconnecting...");
});

export default redisClient;
