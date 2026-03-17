import { api } from './api.js';

/**
 * Fetch the global leaderboard — GET /api/leaderboard
 */
export const getLeaderboard = async (limit = 50) => {
  const res = await api.get(`/api/leaderboard?limit=${limit}`);
  return res.data; // { success, cached, data: [{rank, userId, score}] }
};

/**
 * Fetch the authenticated user's rank — GET /api/leaderboard/me
 */
export const getMyRank = async () => {
  const res = await api.get('/api/leaderboard/me');
  return res.data.data; // { userId, rank, score }
};
