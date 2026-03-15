import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    timeLimit: {
      type: Number,
      default: 1000,
    },

    memoryLimit: {
      type: Number,
      default: 256,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Problem", problemSchema);
