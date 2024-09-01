import express from 'express';

import indexUsersAccount from './indexUsersAccounts.js';

import landCRUD from './landCRUDRoute.js';

<<<<<<< HEAD
import getWeatherData from './getWeatherRoute.js';
=======
>>>>>>> 132946e119d83d635c49d4a747df5500399424e4
import modelsPredictions from './modelsPredictionRoute.js';

import sendTermsConditions from './sendTermsConditionsRoute.js';


const router = express.Router();

router.use('/land', landCRUD);

router.use (indexUsersAccount);


router.use('/model', modelsPredictions);

router.use(sendTermsConditions);


export default router;