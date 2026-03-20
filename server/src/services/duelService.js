import mongoose from "mongoose";
import Problem from "../models/Problem.model.js";
import Submission from "../models/submission.model.js";
import Duel from "../models/Duel.model.js";
import matchEngine from "./matchEngine.js";
import { calculateSubmissionPoints } from "./scoreEngine.js";
import { calculateEloChange } from "./eloService.js";
import User from "../models/User.model.js";

class DuelService {
  async getUnsolvedProblems(user1Id, user2Id, difficulty, limit = 1) {
    // Find all accepted problems for both users
    const solvedSubmissions = await Submission.find({
      userId: { $in: [user1Id, user2Id] },
      verdict: "Accepted",
    }).select("problemId");

    const solvedProblemIds = solvedSubmissions.map((sub) => sub.problemId);

    // Query for problems not in solved array matching difficulty
    const problems = await Problem.aggregate([
      {
        $match: {
          _id: { $nin: solvedProblemIds },
          difficulty: difficulty,
          isDeleted: false,
        },
      },
      { $sample: { size: limit } },
    ]);

    return problems;
  }

  async setupDuel(user1Id, user2Id) {
    // Find 3 problems: 1 easy, 1 medium, 1 hard if possible. Fallbacks to random if not enough
    const easy = await this.getUnsolvedProblems(user1Id, user2Id, "easy", 1);
    const mid = await this.getUnsolvedProblems(user1Id, user2Id, "medium", 1);
    const hard = await this.getUnsolvedProblems(user1Id, user2Id, "hard", 1);

    const selectedProblems = [...easy, ...mid, ...hard];
    // If we couldn't find 3 specific difficulty ones, just grab 3 random
    if (selectedProblems.length < 3) {
      const more = await Problem.aggregate([
        { $match: { isDeleted: false } },
        { $sample: { size: 3 - selectedProblems.length } },
      ]);
      selectedProblems.push(...more);
    }

    // Create Duel in DB
    const duelDoc = new Duel({
      players: [
        { user: user1Id },
        { user: user2Id }
      ],
      problems: selectedProblems.map((p) => ({ problem: p._id })),
      status: "pending",
    });

    await duelDoc.save();

    return { duelId: duelDoc._id.toString(), problems: selectedProblems };
  }

  async startDuel(duelId) {
    const duel = await Duel.findById(duelId).populate("problems.problem");
    if (!duel) throw new Error("Duel not found");

    duel.status = "active";
    duel.startTime = new Date();
    await duel.save();

    const p1 = duel.players[0].user.toString();
    const p2 = duel.players[1].user.toString();
    const problems = duel.problems.map((p) => p.problem);

    await matchEngine.createMatch(duelId, [p1, p2], problems);
    return duel;
  }

  async processSubmissionVerdict(matchId, userId, problemId, verdict, wrongAttemptsCount = 0) {
    const matchData = await matchEngine.getMatch(matchId);
    if (!matchData) return; // Match probably expired / ended

    const isCorrect = verdict === "Accepted";
    
    // We need the problem difficulty
    const problem = await Problem.findById(problemId);
    if (!problem) return;

    let isFirstSolver = false;
    if (isCorrect) {
      isFirstSolver = await matchEngine.markProblemSolved(matchId, problemId, userId);
    }

    const minutesElapsed = Math.floor((Date.now() - parseInt(matchData.startTime)) / 60000);
    const points = calculateSubmissionPoints(
      problem.difficulty,
      isFirstSolver,
      isCorrect,
      minutesElapsed,
      wrongAttemptsCount
    );

    const newScore = await matchEngine.addScore(matchId, userId, points);

    // Log the event asynchronously
    Duel.findByIdAndUpdate(matchId, {
      $push: {
        logs: {
          message: `${userId} submitted solution for ${problem.title}. Verdict: ${verdict}. Points: ${points}`,
          type: "submission",
        },
      },
      // update the mongo doc scores too
      $set: {
        "players.$[elem].score": newScore
      }
    }, {
      arrayFilters: [ { "elem.user": userId } ]
    }).catch(console.error);

    return { points, newScore, isFirstSolver };
  }

  async endDuel(duelId) {
    const matchData = await matchEngine.endMatch(duelId);
    if (!matchData) return;

    const duel = await Duel.findById(duelId);
    if (!duel) return;

    duel.status = "completed";
    duel.endTime = new Date();

    const p1Score = parseInt(matchData.score1 || 0);
    const p2Score = parseInt(matchData.score2 || 0);

    const p1Id = matchData.player1;
    const p2Id = matchData.player2;

    duel.players = duel.players.map(p => {
      if (p.user.toString() === p1Id) p.score = p1Score;
      if (p.user.toString() === p2Id) p.score = p2Score;
      return p;
    });

    if (p1Score > p2Score) duel.winner = p1Id;
    else if (p2Score > p1Score) duel.winner = p2Id;

    // ELO update
    try {
       // Since the standard User schema doesn't have Elo yet, 
       // we might need to add it or store it. Let's assume rating will be stored.
       // For now, calculate the change just in the Duel doc.
       const user1 = await User.findById(p1Id);
       const user2 = await User.findById(p2Id);
       const rating1 = user1.elo || 1200;
       const rating2 = user2.elo || 1200;

       const { changeA, changeB } = calculateEloChange(rating1, rating2, p1Score, p2Score);
       
       duel.players.forEach(p => {
         if (p.user.toString() === p1Id) p.ratingChange = changeA;
         if (p.user.toString() === p2Id) p.ratingChange = changeB;
       });

       // Also update user's elo if we wanted to
       await User.findByIdAndUpdate(p1Id, { $inc: { elo: changeA } });
       await User.findByIdAndUpdate(p2Id, { $inc: { elo: changeB } });

    } catch (e) {
      console.error("Elo calculation error:", e);
    }

    await duel.save();
    return duel;
  }
}

export default new DuelService();
