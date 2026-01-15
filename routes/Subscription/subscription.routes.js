import express from "express";
const router = express.Router();
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';

// 1. Controller Imports (Comma check karein)
import { 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  buySubscriptionPlan, 
  getAllPlansForAdmin,    
  getAllTransactionsForAdmin 
} from "../../controllers/Subscription/subscription.controller.js";


router.use(protect);

router.post("/buy-plan", buySubscriptionPlan);

router.use(authorize('admin'));

router.post("/create-plan", createSubscriptionPlan);
router.put("/update-plan/:planId", updateSubscriptionPlan);
router.get("/admin/all-plans", getAllPlansForAdmin);
router.get("/admin/transactions", getAllTransactionsForAdmin);

export default router;