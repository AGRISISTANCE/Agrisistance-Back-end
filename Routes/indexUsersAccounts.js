import express from 'express';

import googleOAuth from './UsersAccounts/googleOAuthRoute.js';
import authUsereRoute from './UsersAccounts/authUserRoute.js';

import profileCRUD from './UsersAccounts/profileCRUDRoute.js';

import profileSettings from './UsersAccounts/profileSettingsRoute.js';


const router = express.Router();

router.use('/auth', authUsereRoute);
router.use('/auth/google', googleOAuth);

router.use('/profile', profileSettings, profileCRUD);

//router.use('/profile', profileCRUD);

export default router;