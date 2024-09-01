import express from 'express';
import { generateBusinessPlan, chatBot } from '../Controllers/modelsPredictions.js';
import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();


router.post('/generate-business-plan', authenticateUser, generateBusinessPlan);
<<<<<<< HEAD
router.post('/chat-bot', authenticateUser, chatBot);
=======
router.post('/chat-bot', chatBot);
>>>>>>> 132946e119d83d635c49d4a747df5500399424e4

export default router;
