import redisClient from "../config/redis.js";

const DUEL_PREFIX = "duel:";

class MatchEngine {
  async createMatch(matchId, players, problems) {
    const matchKey = `${DUEL_PREFIX}${matchId}`;
    const startTime = Date.now();

    // Store basic match info
    await redisClient.hSet(matchKey, {
      status: "active",
      startTime: startTime,
      player1: players[0],
      player2: players[1],
      score1: 0,
      score2: 0,
    });

    // Store problems state
    for (const problem of problems) {
      // track if a problem is solved, and by whom
      await redisClient.hSet(`${matchKey}:problems:${problem._id}`, {
        status: "unsolved",
        firstSolver: "none"
      });
    }

    // Expire match after 2 hours max to prevent memory leaks
    await redisClient.expire(matchKey, 7200); 

    // Store reverse mapping for user -> match
    await redisClient.set(`active_match:${players[0]}`, matchId, { EX: 7200 });
    await redisClient.set(`active_match:${players[1]}`, matchId, { EX: 7200 });
    
    return { matchId, startTime, players, problems };
  }

  async getMatch(matchId) {
    const matchKey = `${DUEL_PREFIX}${matchId}`;
    const matchData = await redisClient.hGetAll(matchKey);
    return Object.keys(matchData).length === 0 ? null : matchData;
  }

  async getActiveMatchForUser(userId) {
    return await redisClient.get(`active_match:${userId}`);
  }

  async getProblemState(matchId, problemId) {
    const key = `${DUEL_PREFIX}${matchId}:problems:${problemId}`;
    const state = await redisClient.hGetAll(key);
    return Object.keys(state).length === 0 ? null : state;
  }

  async markProblemSolved(matchId, problemId, userId) {
    const key = `${DUEL_PREFIX}${matchId}:problems:${problemId}`;
    const state = await this.getProblemState(matchId, problemId);
    
    if (state && state.status === "unsolved") {
      await redisClient.hSet(key, {
        status: "solved",
        firstSolver: userId
      });
      return true; // Was first solver
    }
    return false;
  }

  async addScore(matchId, userId, points) {
    const matchKey = `${DUEL_PREFIX}${matchId}`;
    const matchData = await this.getMatch(matchId);
    if (!matchData) return null;

    let newScore = 0;
    if (matchData.player1 === userId) {
      newScore = parseInt(matchData.score1) + points;
      await redisClient.hSet(matchKey, "score1", newScore);
    } else if (matchData.player2 === userId) {
      newScore = parseInt(matchData.score2) + points;
      await redisClient.hSet(matchKey, "score2", newScore);
    }

    return newScore;
  }

  async endMatch(matchId) {
    const matchKey = `${DUEL_PREFIX}${matchId}`;
    await redisClient.hSet(matchKey, "status", "completed");
    const matchData = await this.getMatch(matchId);
    
    // Optional: cleanup immediately, or let it expire
    // Cleanup reverse mapping
    await redisClient.del(`active_match:${matchData.player1}`);
    await redisClient.del(`active_match:${matchData.player2}`);

    return matchData;
  }
}

export default new MatchEngine();
