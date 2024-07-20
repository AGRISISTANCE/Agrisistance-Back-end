import express from 'express';

import authUsereRoute from './authUserRoute.js';

const router = express.Router();



router.use('/user', authUsereRoute);



export default router;
