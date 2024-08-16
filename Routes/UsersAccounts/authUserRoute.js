import express from 'express';
import { register , login, verifyOTP, forgotPassword } from '../../Controllers/UsersAccounts/authUser.js';
import { validateRequest ,validateRegister , validateLogin, validateVerifyOTP, validateForgotPassword } from '../../Middleware/validationMiddleware.js';

import authenticateUser from '../../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/login' ,validateRequest(validateLogin), login);

router.post('/register' ,validateRequest(validateRegister), register);

router.post('/verify-otp', validateRequest(validateVerifyOTP), authenticateUser, verifyOTP );

router.post('/forgot-password', validateRequest(validateForgotPassword), forgotPassword);

export default router;