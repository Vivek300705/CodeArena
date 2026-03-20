import express from "express";
import {
  challengeUser,
  acceptChallenge,
  getDuel,
  triggerPowerup,
  getDuelHistory,
} from "../controllers/duel.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/challenge", challengeUser);
router.post("/accept", acceptChallenge);
router.get("/history", getDuelHistory);
router.get("/:id", getDuel);
router.post("/:id/powerup", triggerPowerup);

export default router;
