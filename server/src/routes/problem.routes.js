import express from "express";
import {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  getProblemBySlug,
} from "../controllers/problem.controller.js";
import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Problems
 *   description: Problem management
 */

/**
 * @swagger
 * /api/problems:
 *   get:
 *     summary: List problems (paginated, filterable)
 *     tags: [Problems]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [easy, medium, hard] }
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *         description: Comma-separated tags
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated problem list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:    { type: integer }
 *                 page:     { type: integer }
 *                 limit:    { type: integer }
 *                 problems: { type: array, items: { $ref: '#/components/schemas/Problem' } }
 */
router.get("/problems", getProblems);

/**
 * @swagger
 * /api/problems/{id}:
 *   get:
 *     summary: Get a single problem by ID
 *     tags: [Problems]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Problem object
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Problem' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/problems/:id", getProblemById);

/**
 * @swagger
 * /api/problems/slug/{slug}:
 *   get:
 *     summary: Get a problem by slug
 *     tags: [Problems]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: two-sum
 *     responses:
 *       200:
 *         description: Problem object
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Problem' }
 */
router.get("/problems/slug/:slug", getProblemBySlug);

/**
 * @swagger
 * /api/problems:
 *   post:
 *     summary: Create a problem (admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Problem' }
 *     responses:
 *       201:
 *         description: Created problem
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Problem' }
 *       403:
 *         description: Admin access required
 */
router.post("/problems", auth, adminOnly, createProblem);

/**
 * @swagger
 * /api/problems/{id}:
 *   put:
 *     summary: Update a problem (admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Problem' }
 *     responses:
 *       200:
 *         description: Updated problem
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Soft-delete a problem (admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.put("/problems/:id", auth, adminOnly, updateProblem);
router.delete("/problems/:id", auth, adminOnly, deleteProblem);

export default router;
