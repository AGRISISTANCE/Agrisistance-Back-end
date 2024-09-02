import express from 'express';

import indexUsersAccount from './indexUsersAccounts.js';

import landCRUD from './landCRUDRoute.js';

import modelsPredictions from './modelsPredictionRoute.js';

import sendTermsConditions from './sendTermsConditionsRoute.js';


const router = express.Router();

router.use('/land', landCRUD);

router.use (indexUsersAccount);


router.use('/model', modelsPredictions);

router.use(sendTermsConditions);


export default router;