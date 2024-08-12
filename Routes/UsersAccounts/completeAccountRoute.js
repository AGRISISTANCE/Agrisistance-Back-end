import express from 'express';
import completeAccount from '../../Controllers/UsersAccounts/completeAccount.js';

const router = express.Router();

router.post('/complete-account/:user_id', completeAccount);

export default router;
