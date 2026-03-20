import {
  getLeaderboard,
  getUserRank,
  LEADERBOARD_CACHE_KEY,
  LEADERBOARD_CACHE_TTL,
} from "../services/leaderboard.service.js";
import { getCache, setCache } from "../services/cache.service.js";
import logger from "../config/logger.js";
import User from "../models/User.model.js";

/**
 * @desc  Get top-50 leaderboard (cached 60s)
 * @route GET /api/leaderboard
 * @access Public
 */
export const getLeaderboardHandler = async (req, res, next) => {
  try {
    const topN = Math.min(Number(req.query.limit) || 50, 100);

    // Try cache first
    const cached = await getCache(LEADERBOARD_CACHE_KEY);
    if (cached) {
      return res.json({ success: true, cached: true, data: cached });
    }

    const rawData = await getLeaderboard(topN);

    // Fetch usernames for the userIds from MongoDB
    const userIds = rawData.map(entry => entry.userId);
    const users = await User.find({ _id: { $in: userIds } }).select("username");
    
    // Create a map for quick lookup
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.username;
      return acc;
    }, {});

    // Enrich the data with usernames
    const data = rawData.map(entry => ({
      ...entry,
      username: userMap[entry.userId] || "Unknown Coder"
    }));

    // Cache the result
    await setCache(LEADERBOARD_CACHE_KEY, data, LEADERBOARD_CACHE_TTL);

    logger.info({ count: data.length }, "Leaderboard fetched from Redis");
    res.json({ success: true, cached: false, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get the authenticated user's rank and score
 * @route GET /api/leaderboard/me
 * @access Private
 */
export const getMyRankHandler = async (req, res, next) => {
  try {
    const rankData = await getUserRank(req.user.userId);
    res.json({ success: true, data: rankData });
  } catch (error) {
    next(error);
  }
};
