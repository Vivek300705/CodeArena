import express from "express";
import { registerUser } from "../controllers/registerUser.js";
import { loginUser } from "../controllers/loginUser.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login",loginUser);

export default router;
