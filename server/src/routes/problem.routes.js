import express from "express";
import {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  getProblemBySlug
} from "../controllers/problem.controller.js";

import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";


const router = express.Router();

// Public routes
router.get("/problems", getProblems);
router.get("/problems/:id", getProblemById);

// Admin routes
router.post("/problems", auth, adminOnly, createProblem);
router.put("/problems/:id", auth, adminOnly, updateProblem);
router.delete("/problems/:id", auth, adminOnly, deleteProblem);
router.get("/problems/slug/:slug", getProblemBySlug);

export default router;
