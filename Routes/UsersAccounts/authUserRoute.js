import express from 'express';
import { register, login, verifyUserEmail, verifyOTP, forgotPassword, resetPassword } from '../../Controllers/UsersAccounts/authUser.js';
import { validateRequest ,validateRegister , validateLogin, validateVerifyOTP, validateForgotPassword, validateResetPassword } from '../../Middleware/validationMiddleware.js';

import authenticateUser from '../../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/login' ,validateRequest(validateLogin), login);

router.post('/register' ,validateRequest(validateRegister), register);
router.get('/register/verify/:token', verifyUserEmail);

router.post('/verify-otp', validateRequest(validateVerifyOTP), authenticateUser, verifyOTP );

router.post('/forgot-password', validateRequest(validateForgotPassword), forgotPassword);
<<<<<<< HEAD
router.put('/reset-password/:user_id', validateRequest(validateResetPassword), resetPassword);
=======
router.put('/reset-password/:token', validateRequest(validateResetPassword), resetPassword);
>>>>>>> 132946e119d83d635c49d4a747df5500399424e4

export default router;