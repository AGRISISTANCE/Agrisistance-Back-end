import express from 'express';
import { resetPassword, updatePassword, updateEmail, verifyUpdateEmail, completeAccount, unable2FA, UploadPFP, verifyUserEmail, UpdateSubscription } from '../../Controllers/UsersAccounts/profileSettings.js';
import authenticateUser from '../../Middleware/authMiddleware.js';
import { validateRequest,validateCompleteAccount,validateUnable2FA, validateResetPassword, validateUpdateEmail, validateUploadPFP,validateUpdatePassword, validateUpdateSubscriptionType } from '../../Middleware/validationMiddleware.js';

const router = express.Router();

router.post('/reset-password/:user_id', validateRequest(validateResetPassword), resetPassword);
router.post('/update-password', validateRequest(validateUpdatePassword), authenticateUser, updatePassword);

router.put('/update-email', validateRequest(validateUpdateEmail), authenticateUser, updateEmail);
router.get('/update-email/verify/:token', verifyUpdateEmail);

router.post('/complete-account/:user_id', validateRequest(validateCompleteAccount), completeAccount);

router.put("/unable-2fa", validateRequest(validateUnable2FA), authenticateUser, unable2FA);

router.put('/upload-pfp', validateRequest(validateUploadPFP), authenticateUser, UploadPFP);

router.get('/register/verify/:token', verifyUserEmail);

router.put('/update-subscription', validateRequest(validateUpdateSubscriptionType), authenticateUser, UpdateSubscription);


export default router;