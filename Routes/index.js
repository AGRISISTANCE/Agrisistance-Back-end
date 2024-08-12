import express from 'express';

import indexUsersAccount from './indexUsersAccounts.js';


import addtSoilData from './addSoilDataRoute.js';

import AddPestData from './addPestDataRoute.js';
import addYiledPrediction from './addYieldPredictionRoute.js';
import addFinancialData from './addFinancialDataRoute.js';
import getWeatherData from './getWeatherRoute.js';
import predict from './predictRoute.js';

import sendTermsConditions from './sendTermsConditionsRoute.js';


const router = express.Router();



router.use (indexUsersAccount);

router.use('/soil', addtSoilData);
router.use('/pest', AddPestData);   
router.use('/yield', addYiledPrediction);
router.use('/financial', addFinancialData);
router.use('/weather', getWeatherData);

router.use('/model', predict);

router.use(sendTermsConditions);


export default router;