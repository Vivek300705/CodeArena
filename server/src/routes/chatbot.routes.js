import express from 'express';
import { handleChat } from '../controllers/chatbot.controller.js';

const router = express.Router();

// Route for handling chatbot messages
router.post('/', handleChat);

export default router;
