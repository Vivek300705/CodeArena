import redisClient from "../config/redis.js";
import logger from "../config/logger.js";
import { deleteCache } from "./cache.service.js";

const LEADERBOARD_KEY = "leaderboard:global";
const LEADERBOARD_CACHE_KEY = "leaderboard:top50";
const LEADERBOARD_CACHE_TTL = 60; // seconds

/**
 * Add/update a user's score on the global leaderboard.
 * Uses ZINCRBY so multiple accepted submissions accumulate.
 * Call with scoreIncrement=0 and handle deduplication externally.
 *
 * @param {string} userId
 * @param {number} scoreIncrement  Points to add (default 10)
 */
export const addScore = async (userId, scoreIncrement = 10) => {
  try {
    await redisClient.zIncrBy(LEADERBOARD_KEY, scoreIncrement, userId);
    // Bust cached leaderboard snapshot
    await deleteCache(LEADERBOARD_CACHE_KEY);
    logger.info({ userId, scoreIncrement }, "Leaderboard score updated");
  } catch (err) {
    logger.error({ err: err.message, userId }, "Leaderboard addScore error");
  }
};

/**
 * Get top N users from the leaderboard.
 * Returns array: [{ rank, userId, score }]
 *
 * @param {number} topN  Number of entries to return (default 50)
 */
export const getLeaderboard = async (topN = 50) => {
  try {
    // ZRANGE with REV + WITHSCORES gives us highest-score-first
    const entries = await redisClient.zRangeWithScores(
      LEADERBOARD_KEY,
      0,
      topN - 1,
      { REV: true }
    );

    return entries.map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.value,
      score: entry.score,
    }));
  } catch (err) {
    logger.error({ err: err.message }, "Leaderboard getLeaderboard error");
    return [];
  }
};

/**
 * Get a specific user's rank and score.
 * @param {string} userId
 * @returns {{ rank: number|null, score: number|null }}
 */
export const getUserRank = async (userId) => {
  try {
    const [rank, score] = await Promise.all([
      redisClient.zRevRank(LEADERBOARD_KEY, userId),
      redisClient.zScore(LEADERBOARD_KEY, userId),
    ]);

    return {
      userId,
      rank: rank !== null ? rank + 1 : null, // 0-indexed → 1-indexed
      score: score ?? null,
    };
  } catch (err) {
    logger.error({ err: err.message, userId }, "Leaderboard getUserRank error");
    return { userId, rank: null, score: null };
  }
};

export { LEADERBOARD_CACHE_KEY, LEADERBOARD_CACHE_TTL };
