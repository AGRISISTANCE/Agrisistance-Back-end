import express from 'express';
import UpdateSubscription from '../Controllers/UsersAccounts/updateSubscription.js';
import authenticateUser from '../Middleware/authMiddleware.js';
import { validateRequest, validateUpdateSubscriptionType } from '../Middleware/validationMiddleware.js';

const router = express.Router();

router.put('/update-subscription', validateRequest(validateUpdateSubscriptionType), authenticateUser, UpdateSubscription);

export default router;
