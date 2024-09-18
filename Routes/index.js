import express from 'express';

import googleOAuth from './googleOAuth.route.js';
import authUsere from './auth.route.js';
import profile from './profile.route.js';

import land from './land.route.js';

import modelsPredictions from './models-prediction.route.js';

import post from './post.route.js';

import sendTermsConditions from './send-terms-conditions.route.js';


const router = express.Router();

router.use('/auth', authUsere);
router.use('/auth/google', googleOAuth);
router.use('/profile', profile);

router.use('/land', land);

router.use('/model', modelsPredictions);

router.use('/network', post)

router.use(sendTermsConditions);


export default router;