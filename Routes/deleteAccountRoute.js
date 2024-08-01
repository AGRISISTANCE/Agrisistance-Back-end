import express from 'express';
import deleteAccount from '../Controllers/UsersAccounts/deleteAccount.js';
import authenticateUser from '../Middleware/authMiddleware.js';


const router = express.Router();

router.delete('/delete-account', authenticateUser, deleteAccount);

export default router;
