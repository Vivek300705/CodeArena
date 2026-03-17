import express from "express";
import {
  getLeaderboardHandler,
  getMyRankHandler,
} from "../controllers/leaderboard.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public: top-N leaderboard (cached 60s)
router.get("/leaderboard", getLeaderboardHandler);

// Private: caller's own rank
router.get("/leaderboard/me", auth, getMyRankHandler);

export default router;
