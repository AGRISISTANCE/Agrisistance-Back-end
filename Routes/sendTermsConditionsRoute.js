import express from 'express';
import sendTermsConditions from '../Controllers/Terms-and-Conditions/sendTermsConditions.js';


const router = express.Router();

router.get('/terms-and-conditions', sendTermsConditions);

export default router;