import express from 'express';

import indexUsersAccount from './indexUsersAccounts.js';


import landCRUD from './landCRUDRoute.js';

import getWeatherData from './getWeatherRoute.js';
import predict from './predictRoute.js';

import sendTermsConditions from './sendTermsConditionsRoute.js';


const router = express.Router();

router.use('/land', landCRUD);

router.use (indexUsersAccount);

router.use('/weather', getWeatherData);

router.use('/model', predict);

router.use(sendTermsConditions);


export default router;