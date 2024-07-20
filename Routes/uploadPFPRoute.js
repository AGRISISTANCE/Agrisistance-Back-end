import express from 'express';
import UploadPFP from '../Controllers/uploadPFP.js';
import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload-pfp', authenticateUser, UploadPFP);

export default router;
