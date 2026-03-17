import redisClient from "../config/redis.js";
import logger from "../config/logger.js";

/**
 * Retrieve a cached value by key.
 * @returns {Promise<any|null>} Parsed value or null on miss/error
 */
export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (data) {
      logger.debug({ key }, "Cache HIT");
      return JSON.parse(data);
    }
    logger.debug({ key }, "Cache MISS");
    return null;
  } catch (err) {
    logger.error({ err: err.message, key }, "Cache GET error");
    return null;
  }
};

/**
 * Store a value in the cache with a TTL (seconds).
 */
export const setCache = async (key, value, ttlSeconds = 3600) => {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    logger.debug({ key, ttlSeconds }, "Cache SET");
  } catch (err) {
    logger.error({ err: err.message, key }, "Cache SET error");
  }
};

/**
 * Delete a single cache key.
 */
export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    logger.debug({ key }, "Cache DELETE");
  } catch (err) {
    logger.error({ err: err.message, key }, "Cache DELETE error");
  }
};

/**
 * Delete all keys matching a glob pattern using SCAN.
 * Useful for invalidating lists like "problems:*".
 */
export const deleteCacheByPattern = async (pattern) => {
  try {
    let cursor = 0;
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = reply.cursor;
      if (reply.keys.length > 0) {
        await redisClient.del(reply.keys);
        logger.debug({ pattern, keys: reply.keys }, "Cache DELETE by pattern");
      }
    } while (cursor !== 0);
  } catch (err) {
    logger.error({ err: err.message, pattern }, "Cache DELETE pattern error");
  }
};
