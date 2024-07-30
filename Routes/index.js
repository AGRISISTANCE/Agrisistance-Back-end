import express from 'express';

import authUsereRoute from './authUserRoute.js';
import addtSoilData from '../Routes/addSoilDataRoute.js';
import UpdateSubscription from '../Routes/updateSubscriptionRoute.js';
import UploadPFP from '../Routes/uploadPFPRoute.js';
import AddPestData from '../Routes/addPestDataRoute.js';
import addYiledPrediction from './addYieldPredictionRoute.js';
import addFinancialData from './addFinancialDataRoute.js';
import getWeatherData from '../Routes/getWeatherRoute.js';
import predict from './predictRoute.js';
import verifyUserEmail from './verifyUserEmailRoute.js';
import editProfile from '../Routes/editProfileRoute.js';
import deleteAccount from '../Routes/deleteAccountRoute.js';
import sendTermsConditions from '../Routes/sendTermsConditionsRoute.js';

const router = express.Router();



router.use('/user', authUsereRoute);
router.use('/user', verifyUserEmail);
router.use('/user', UpdateSubscription);
router.use('/user', UploadPFP);
router.use('/user', editProfile);
router.use('/user', deleteAccount);


router.use('/soil', addtSoilData);
router.use('/pest', AddPestData);   
router.use('/yield', addYiledPrediction);
router.use('/financial', addFinancialData);
router.use('/weather', getWeatherData);

router.use('/model', predict);

router.use(sendTermsConditions);


export default router;