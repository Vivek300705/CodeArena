import express from "express";
import {
  createSubmission,
  getSubmissions,
} from "../controllers/submission.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Because this router is mounted at "/api/v1/submissions" in main.js,
// using "/" here actually means "/api/v1/submissions"
router.post("/", auth, createSubmission);
router.get("/", auth, getSubmissions);

export default router;
