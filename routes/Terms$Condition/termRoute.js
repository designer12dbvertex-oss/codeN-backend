import express from 'express';
const router = express.Router();
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';
import { addTerms, getTerms } from '../../controllers/Terms&Condition/terms.controller.js';




// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.post('/terms-conditions', addTerms);
router.get('/terms-conditions', getTerms);

export default router;