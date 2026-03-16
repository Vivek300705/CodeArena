import mongoose from "mongoose";
import slugify from "slugify";
const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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

    testcases: [
      {
        input: String,
        output: String,
        isHidden: {
          type: Boolean,
          default: false
        }
      }
    ],

    boilerplates: [
      {
        language: String,
        code: String
      }
    ],

    examples: [
      {
        input: String,
        output: String,
        explanation: String
      }
    ],

    timeLimit: {
      type: Number,
      default: 1000,
    },

    memoryLimit: {
      type: Number,
      default: 256,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({createdAt:-1});
problemSchema.index(
  { title: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
problemSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
    });
  }

  next();
});

export default mongoose.model("Problem", problemSchema);
