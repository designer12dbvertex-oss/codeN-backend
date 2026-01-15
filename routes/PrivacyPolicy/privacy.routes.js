import express from 'express';
const router = express.Router();
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';
import { addPrivacyPolicy, getPrivacyPolicy } from '../../controllers/PrivacyPolicy/privacy.controller.js';

router.use(protect);
router.use(authorize('admin'));
router.post('/privacy-policy', addPrivacyPolicy);
router.get('/privacy-policy', getPrivacyPolicy);

export default router;