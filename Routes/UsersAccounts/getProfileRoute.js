import express from 'express';
import authenticateUser from '../../Middleware/authMiddleware.js';
import getProfile from '../../Controllers/UsersAccounts/getProfile.js';

const router = express.Router();

router.get('/profile', authenticateUser, getProfile);

export default router;