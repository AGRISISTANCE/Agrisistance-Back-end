import express from "express";
import authenticateUser from "../../Middleware/authMiddleware.js";
import unable2FA from "../../Controllers/UsersAccounts/unable2FA.js";

const router = express.Router();

router.put("/unable-2fa", authenticateUser, unable2FA);

export default router;