import express from 'express';
import sendTermsConditions from '../Controllers/sendTermsConditions.js';


const router = express.Router();

router.get('/terms-and-conditions', sendTermsConditions);

export default router;