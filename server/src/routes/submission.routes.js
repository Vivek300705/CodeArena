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

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Code submission and judging
 */

/**
 * @swagger
 * /api/v1/submissions:
 *   post:
 *     summary: Submit code for judging
 *     tags: [Submissions]
 *     description: |
 *       Adds the submission to a BullMQ queue. The verdict is delivered
 *       asynchronously via WebSocket (`SUBMISSION_UPDATED` event).
 *       **Rate limit:** 5 submissions / 60 seconds per user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [problemId, code, language]
 *             properties:
 *               problemId: { type: string }
 *               language:  { type: string, enum: [cpp, c, java, python, node, go, rust] }
 *               code:      { type: string, maxLength: 65536 }
 *     responses:
 *       201:
 *         description: Submission queued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Submission' }
 *       429:
 *         description: Rate limit exceeded
 *   get:
 *     summary: Get all submissions for the logged-in user
 *     tags: [Submissions]
 *     responses:
 *       200:
 *         description: List of submissions
 */

// Order: auth → sliding-window rate limit → code sanitization → controller
router.post("/", auth, submissionRateLimit, sanitizeCode, createSubmission);
router.get("/", auth, getSubmissions);

/**
 * @swagger
 * /api/v1/submissions/{id}:
 *   get:
 *     summary: Get a single submission status (for polling)
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Submission detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/Submission' }
 */
router.get("/:id", auth, getSubmissionById);

export default router;
