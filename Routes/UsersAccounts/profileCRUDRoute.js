import express from 'express';
import { getProfile, editProfile, deleteProfile } from '../../Controllers/UsersAccounts/profileCRUD.js';
import authenticateUser from '../../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/get-profile', authenticateUser, getProfile);
router.put('/edit-profile', authenticateUser, editProfile);
router.delete('/delete-profile', authenticateUser, deleteProfile);

export default router;