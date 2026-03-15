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
        "javascript",
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
        "running",
        "accepted",
        "wrong_answer",
        "runtime_error",
        "time_limit_exceeded",
        "compilation_error",
      ],
      default: "queued",
    },

    runtime: {
      type: Number,
      default: null,
    },

    memory: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Submission", submissionSchema);
