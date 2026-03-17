import redisClient from "../config/redis.js";
import mongoose from "mongoose";
import os from "os";

// In-memory counters (reset on restart; extend with Redis for multi-instance)
const counters = {
  requests: 0,
  submissions: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

/** Call from request logger to increment request counter */
export const incRequests = () => counters.requests++;
export const incSubmissions = () => counters.submissions++;
export const incCacheHit = () => counters.cacheHits++;
export const incCacheMiss = () => counters.cacheMisses++;

/**
 * @desc  Detailed system metrics (JSON)
 * @route GET /metrics
 * @access Public (no secrets exposed)
 */
export const metricsHandler = async (req, res) => {
  // ── Redis info ─────────────────────────────────────────────────────────────
  let redisInfo = { status: "disconnected" };
  try {
    const info = await redisClient.info("stats");
    const connectedClients = await redisClient.clientList();
    const memoryInfo = await redisClient.info("memory");
    const usedMemoryMatch = memoryInfo.match(/used_memory_human:(\S+)/);
    const opsMatch = info.match(/instantaneous_ops_per_sec:(\d+)/);
    redisInfo = {
      status: "connected",
      usedMemory: usedMemoryMatch ? usedMemoryMatch[1] : "unknown",
      instantaneousOpsPerSec: opsMatch ? Number(opsMatch[1]) : 0,
      connectedClients: connectedClients.length,
    };
  } catch {
    redisInfo = { status: "error" };
  }

  // ── MongoDB info ────────────────────────────────────────────────────────────
  const mongoState = ["disconnected", "connected", "connecting", "disconnecting"];
  const mongoStatus = mongoState[mongoose.connection.readyState] ?? "unknown";

  // ── Process info ────────────────────────────────────────────────────────────
  const memUsage = process.memoryUsage();

  res.json({
    timestamp: new Date().toISOString(),
    uptime: {
      processSeconds: Math.floor(process.uptime()),
      system: os.uptime(),
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      memoryMB: {
        rss:      +(memUsage.rss        / 1024 / 1024).toFixed(2),
        heapUsed: +(memUsage.heapUsed   / 1024 / 1024).toFixed(2),
        heapTotal:+(memUsage.heapTotal  / 1024 / 1024).toFixed(2),
        external: +(memUsage.external   / 1024 / 1024).toFixed(2),
      },
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg(),
    },
    connections: {
      mongodb: mongoStatus,
      redis: redisInfo,
    },
    counters: {
      ...counters,
      cacheHitRate: counters.cacheHits + counters.cacheMisses > 0
        ? `${((counters.cacheHits / (counters.cacheHits + counters.cacheMisses)) * 100).toFixed(1)}%`
        : "N/A",
    },
  });
};
