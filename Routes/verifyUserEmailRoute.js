import express from 'express';
import verifyUserEmail from '../Controllers/UsersAccounts/verifyUserEmail.js';

const router = express.Router();

router.get('/register/verify/:token', verifyUserEmail);

export default router;