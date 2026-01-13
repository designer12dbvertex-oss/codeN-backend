import express from 'express';
import { loginAdmin } from '../controllers/admin.controller.js';
// import { validateAdminToken } from '../middleware/adminToken.middleware.js';

const router = express.Router();

// Require a valid admin token header for login attempts
router.post('/login', loginAdmin);

export default router;
