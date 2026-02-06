import express from 'express';
import UserModel from '../../../models/user/userModel.js';
import PromoCode from '../../../models/admin/promo/promo.model.js';
import SubscriptionPlan from '../../../models/admin/SubscriptionPlan/scriptionplan.model.js';
import { protect } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';

const router = express.Router();

router.post('/apply', async (req, res) => {
  try {
    const { promoCode, planId, months, userId } = req.body;

    // Purani line ko comment hi rehne dein
    // const userId = req.user._id;

    // 2. Promo code fetch logic (same rahega)
    const promo = await PromoCode.findOne({
      code: promoCode.toUpperCase(),
      isActive: true,
    });
    if (!promo)
      return res.status(400).json({ message: 'Invalid or Expired Promo Code' });

    // 3. User check (Ab ye body wali ID use karega)
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message:
          "User record not found. Please provide a valid 'userId' in JSON body from your database.",
      });
    }

    // 4. Promo use check (Promo milne ke BAAD hi access karein)
    // Ab 'promo._id' safe hai kyunki upar check laga diya hai
    const alreadyUsed = user.usedPromoCodes.find(
      (p) => p.promoId && p.promoId.toString() === promo._id.toString()
    );

    if (alreadyUsed) {
      return res
        .status(400)
        .json({ message: 'You have already used this promo code' });
    }

    // ... baaki ka calculation logic same rahega ...

    // 5. Plan check
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const pricingOption = plan.pricing.find((p) => p.months === months);
    if (!pricingOption)
      return res.status(400).json({ message: 'Invalid duration' });

    // Discount Calculation Logic...
    let discountAmount = 0;
    const originalPrice = pricingOption.price;

    if (promo.discountType === 'percentage') {
      discountAmount = (originalPrice * promo.discountValue) / 100;
      if (promo.maxDiscount > 0 && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = promo.discountValue;
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return res.status(200).json({
      success: true,
      message: 'Promo Code Applied!',
      originalPrice,
      discountAmount,
      finalPrice,
      promoCode: promo.code,
    });
  } catch (error) {
    console.error('Promo Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});
// POST: Admin naya promo code banayega
router.post('/add', async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      usageLimit,
      expiryDate,
      applicableMonths,
    } = req.body;

    // Check karein ki code pehle se toh nahi hai
    const existingPromo = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingPromo) {
      return res
        .status(400)
        .json({ success: false, message: 'Promo code already exists!' });
    }

    const newPromo = new PromoCode({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount: maxDiscount || 0,
      minPurchase: minPurchase || 0,
      usageLimit: usageLimit || 1000,
      expiryDate,
      applicableMonths: applicableMonths || [],
      isActive: true,
      usedCount: 0,
    });

    await newPromo.save();

    res.status(201).json({
      success: true,
      message: 'Promo Code Created Successfully!',
      data: newPromo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating promo code',
      error: error.message,
    });
  }
});

router.get('/list', async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: promos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.delete('/delete/:id', async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Promo deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
