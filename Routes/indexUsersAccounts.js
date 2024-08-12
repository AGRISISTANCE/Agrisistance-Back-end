import express from 'express';

import googleOAuth from './UsersAccounts/googleOAuthRoute.js';
import authUsereRoute from './UsersAccounts/authUserRoute.js';

import verifyUserEmail from './UsersAccounts/verifyUserEmailRoute.js';
import completeAccount from './UsersAccounts/completeAccountRoute.js';

import editProfile from './UsersAccounts/editProfileRoute.js';
import UpdateSubscription from './UsersAccounts/updateSubscriptionRoute.js';
import UploadPFP from './UsersAccounts/uploadPFPRoute.js';
import unable2FA from './UsersAccounts/unable2FARoute.js';
import changePassword from './UsersAccounts/changePasswordRoute.js';

import deleteAccount from './UsersAccounts/deleteAccountRoute.js';

import getProfile from './UsersAccounts/getProfileRoute.js';


const router = express.Router();

router.use('/auth', authUsereRoute);
router.use('/auth/google', googleOAuth);

router.use('/user', verifyUserEmail);
router.use('/user', completeAccount);

router.use('/user', editProfile);
router.use('/user', UpdateSubscription);
router.use('/user', UploadPFP);
router.use('/user', unable2FA);
router.use('/user', changePassword);

router.use('/user', deleteAccount);

router.use('/user', getProfile);

export default router;