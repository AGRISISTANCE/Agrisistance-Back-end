import express from 'express';

import authUsereRoute from './authUserRoute.js';
import addtSoilData from './addSoilDataRoute.js';
import UpdateSubscription from './updateSubscriptionRoute.js';
import UploadPFP from './uploadPFPRoute.js';
import AddPestData from './addPestDataRoute.js';
import addYiledPrediction from './addYieldPredictionRoute.js';
import addFinancialData from './addFinancialDataRoute.js';
import getWeatherData from './getWeatherRoute.js';
import predict from './predictRoute.js';
import verifyUserEmail from './verifyUserEmailRoute.js';
import editProfile from './editProfileRoute.js';
import deleteAccount from './deleteAccountRoute.js';
import sendTermsConditions from './sendTermsConditionsRoute.js';
import unable2FA from './unable2FARoute.js';
import completeAccount from './completeAccountRoute.js';

import googleOAuth from './googleOAuthRoute.js';

const router = express.Router();



router.use('/auth', authUsereRoute);
router.use('/user', verifyUserEmail);
router.use('/user', UpdateSubscription);
router.use('/user', UploadPFP);
router.use('/user', editProfile);
router.use('/user', deleteAccount);
router.use('/user', unable2FA);
router.use('/user', completeAccount);

router.use('/auth/google', googleOAuth);


router.use('/soil', addtSoilData);
router.use('/pest', AddPestData);   
router.use('/yield', addYiledPrediction);
router.use('/financial', addFinancialData);
router.use('/weather', getWeatherData);

router.use('/model', predict);

router.use(sendTermsConditions);


export default router;