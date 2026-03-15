import express from "express";
import { createSubmission, getSubmissions } from "../controllers/submission.controller.js";
import auth from "../middleware/auth.js";

const router=express.Router();
router.post("/submissions",auth,createSubmission);
router.get("/submissions",auth,getSubmissions);
export default router;