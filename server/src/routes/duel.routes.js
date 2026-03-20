import express from "express";
import {
  challengeUser,
  acceptChallenge,
  getDuel,
  triggerPowerup,
  getDuelHistory,
  cancelDuel,
} from "../controllers/duel.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.post("/challenge", challengeUser);
router.post("/accept", acceptChallenge);
router.get("/history", getDuelHistory);
router.get("/:id", getDuel);
router.post("/:id/powerup", triggerPowerup);
router.post("/:id/cancel", cancelDuel);

export default router;
