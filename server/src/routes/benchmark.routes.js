import express from "express";
import { benchmarkHandler } from "../controllers/benchmark.controller.js";
import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

// Admin-only benchmark endpoint (results cached 10 min)
router.get("/benchmark", auth, adminOnly, benchmarkHandler);

export default router;
