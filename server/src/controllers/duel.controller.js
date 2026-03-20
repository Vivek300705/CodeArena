import duelService from "../services/duelService.js";
import Duel from "../models/Duel.model.js";
import matchEngine from "../services/matchEngine.js";

// POST /duel/challenge
// Starts a pending match, returning the room code / duelId
export const challengeUser = async (req, res, next) => {
  try {
    const user1Id = req.user.id;
    const { opponentId } = req.body; // Can be empty for random matchmaking or specific user

    // For now we assume a specific opponent
    const { duelId, problems } = await duelService.setupDuel(
      user1Id,
      opponentId || user1Id // fallback if testing
    );

    res.status(201).json({
      success: true,
      data: {
        duelId,
        problems,
      },
      message: "Challenge created",
    });
  } catch (error) {
    next(error);
  }
};

// POST /duel/accept
export const acceptChallenge = async (req, res, next) => {
  try {
    const { duelId } = req.body;
    const userId = req.user.id;

    const duel = await Duel.findById(duelId);
    if (!duel) {
      return res.status(404).json({ success: false, message: "Duel not found" });
    }

    // Verify user is part of the duel (or allow anyone if it's open matchmaking)
    const isPlayer = duel.players.some((p) => p.user.toString() === userId);
    if (!isPlayer && duel.players[1].user.toString() !== userId) {
      // Add the user to the duel if not already
      duel.players[1] = { user: userId, score: 0, ratingChange: 0 };
      await duel.save();
    }

    // Start match
    await duelService.startDuel(duelId);

    res.status(200).json({
      success: true,
      message: "Duel started",
      data: { duelId },
    });
  } catch (error) {
    next(error);
  }
};

// GET /duel/:id
export const getDuel = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check volatile state first
    const activeMatch = await matchEngine.getMatch(id);
    const duelDoc = await Duel.findById(id).populate("players.user", "username").populate("problems.problem", "title difficulty");

    if (!duelDoc) {
      return res.status(404).json({ success: false, message: "Duel not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        duel: duelDoc,
        activeState: activeMatch || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /duel/:id/powerup
export const triggerPowerup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { powerupType } = req.body;
    const userId = req.user.id;

    const activeMatch = await matchEngine.getMatch(id);
    if (!activeMatch) {
      return res.status(400).json({ success: false, message: "Duel is not active" });
    }

    // Here we would handle the powerup (store in redis or DB logs)
    // For now simply log it
    await Duel.findByIdAndUpdate(id, {
      $push: {
        logs: {
          message: `${userId} used powerup: ${powerupType}`,
          type: "powerup",
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Powerup ${powerupType} triggered`,
    });
  } catch (error) {
    next(error);
  }
};

// GET /duel/history
export const getDuelHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const history = await Duel.find({
      "players.user": userId,
      status: "completed",
    })
      .populate("players.user", "username")
      .populate("winner", "username")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
