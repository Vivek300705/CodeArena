import express from "express";
import {
  getLeaderboardHandler,
  getMyRankHandler,
} from "../controllers/leaderboard.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Global contest rankings
 */

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get top-N global leaderboard (cached 60s)
 *     tags: [Leaderboard]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 100 }
 *         description: Number of entries to return
 *     responses:
 *       200:
 *         description: Leaderboard rankings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 cached:  { type: boolean, description: "true if served from Redis cache" }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/LeaderboardEntry' }
 */
router.get("/leaderboard", getLeaderboardHandler);

/**
 * @swagger
 * /api/leaderboard/me:
 *   get:
 *     summary: Get the authenticated user's rank and score
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: User rank data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId: { type: string }
 *                     rank:   { type: integer, nullable: true }
 *                     score:  { type: number, nullable: true }
 */
router.get("/leaderboard/me", auth, getMyRankHandler);

export default router;
