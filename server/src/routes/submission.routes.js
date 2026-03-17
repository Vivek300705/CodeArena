import express from "express";
import {
  createSubmission,
  getSubmissions,
  getSubmissionById,
} from "../controllers/submission.controller.js";
import auth from "../middleware/auth.js";
import submissionRateLimit from "../middleware/submissionRateLimit.js";
import sanitizeCode from "../middleware/sanitizeCode.js";

const router = express.Router();

// Because this router is mounted at "/api/v1/submissions" in main.js,
// using "/" here actually means "/api/v1/submissions"
// Order: auth → sliding-window rate limit → code sanitization → controller
router.post("/", auth, submissionRateLimit, sanitizeCode, createSubmission);
router.get("/", auth, getSubmissions);
router.get("/:id", auth, getSubmissionById);

export default router;

