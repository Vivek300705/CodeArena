import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";
import logger from "../config/logger.js";

/**
 * Global API rate limiter: 200 requests per 15 minutes per IP.
 * Uses Redis as backing store so limits survive server restarts.
 */
let limiterInstance = null;

const globalRateLimit = (req, res, next) => {
  if (!limiterInstance) {
    limiterInstance = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200,
      standardHeaders: true,  // Sends RateLimit-* headers (RFC 6585)
      legacyHeaders: false,   // Disable X-RateLimit-* legacy headers
      message: {
        success: false,
        message: "Too many requests from this IP. Please try again after 15 minutes.",
      },
      store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: "rate:global:",
      }),
      handler: (req, res, next, options) => {
        logger.warn(
          { ip: req.ip, path: req.path },
          "Global rate limit exceeded",
        );
        res.status(options.statusCode).json(options.message);
      },
      skip: (req) => {
        // Never rate-limit health checks or preview endpoints
        return req.path === "/health";
      },
    });
  }
  
  return limiterInstance(req, res, next);
};

export default globalRateLimit;

