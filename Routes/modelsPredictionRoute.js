import express from 'express';
import { generateBusinessPlan, chatBot } from '../Controllers/modelsPredictions.js';
import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();


router.post('/generate-business-plan', authenticateUser, generateBusinessPlan);
router.post('/chat-bot', authenticateUser, chatBot);

export default router;
