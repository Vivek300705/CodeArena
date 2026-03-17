import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: [
        "cpp",
        "c",
        "java",
        "python",
        "node", // Changed 'javascript' to 'node' to match your worker config
        "typescript",
        "go",
        "rust",
        "csharp",
        "kotlin",
        "swift",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "queued",
        "processing", // Added to show the worker is currently running it
        "completed", // General finish state
        "failed", // General error state
      ],
      default: "queued",
    },
    // The specific verdict from the judge
    verdict: {
      type: String,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
        null,
      ],
      default: null,
    },
    // Time taken in ms
    runtime: {
      type: Number,
      default: null,
    },
    // Memory used in KB/MB
    memory: {
      type: Number,
      default: null,
    },
    // Actual output from the user's code
    output: {
      type: String,
      default: null,
    },
    // Error stack trace or compiler message
    error: {
      type: String,
      default: null,
    },
    // Per-testcase tracking
    testcasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestcases: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Submission", submissionSchema);
