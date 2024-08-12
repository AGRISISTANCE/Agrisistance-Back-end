import express from 'express';
import editProfile from '../../Controllers/UsersAccounts/editProfile.js';
import authenticateUser from '../../Middleware/authMiddleware.js';
import { validateRequest, validateUpdateSubscriptionType } from '../../Middleware/validationMiddleware.js';

const router = express.Router();

router.put('/edit-profile', authenticateUser, editProfile);

export default router;
