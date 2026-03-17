import redisClient from "../config/redis.js";
import logger from "../config/logger.js";

/**
 * Redis Sliding Window Rate Limiter for code submissions.
 *
 * Algorithm:
 *  1. ZADD the current timestamp as both score and member
 *  2. ZREMRANGEBYSCORE to drop entries outside the window
 *  3. ZCARD to count remaining entries
 *  4. EXPIRE to auto-clean the key
 *
 * Limit: MAX_SUBMISSIONS per WINDOW_MS per authenticated user.
 */
const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 60 * 1000; // 60 seconds

const submissionRateLimit = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(); // unauthenticated — let auth middleware handle

    const key = `rate:submissions:${userId}`;
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    // Atomic multi-command via pipeline
    await redisClient.zAdd(key, { score: now, value: String(now) });
    await redisClient.zRemRangeByScore(key, "-inf", windowStart);
    const count = await redisClient.zCard(key);
    await redisClient.expire(key, Math.ceil(WINDOW_MS / 1000));

    const remaining = MAX_SUBMISSIONS - count;

    // Set informational headers
    res.setHeader("X-RateLimit-Limit", MAX_SUBMISSIONS);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
    res.setHeader("X-RateLimit-Window", `${WINDOW_MS / 1000}s`);

    if (count > MAX_SUBMISSIONS) {
      logger.warn({ userId, count }, "Submission rate limit exceeded");

      const oldest = await redisClient.zRange(key, 0, 0, { BY: "RANK" });
      const retryAfterMs = oldest.length
        ? WINDOW_MS - (now - Number(oldest[0]))
        : WINDOW_MS;

      res.setHeader("Retry-After", Math.ceil(retryAfterMs / 1000));

      return res.status(429).json({
        success: false,
        message: `Too many submissions. Limit: ${MAX_SUBMISSIONS} per ${WINDOW_MS / 1000}s.`,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      });
    }

    next();
  } catch (err) {
    // If Redis is down, don't block the user — just log and continue
    logger.error({ err: err.message }, "Submission rate limiter error — bypassing");
    next();
  }
};

export default submissionRateLimit;
