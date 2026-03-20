import mongoose from "mongoose";

const DuelSchema = new mongoose.Schema(
  {
    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        score: {
          type: Number,
          default: 0,
        },
        ratingChange: {
          type: Number,
          default: 0,
        },
      },
    ],
    problems: [
      {
        problem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    logs: [
      {
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["score", "powerup", "submission", "system"],
          default: "system",
        },
      },
    ],
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Duel", DuelSchema);
