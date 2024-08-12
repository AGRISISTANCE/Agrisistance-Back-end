import express from 'express';
import { resetPasswor, updatePassword } from '../../Controllers/UsersAccounts/changePassword.js';
import authenticateUser from '../../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/reset-password/:user_id', resetPasswor);

router.post('/update-password', authenticateUser, updatePassword);

export default router;