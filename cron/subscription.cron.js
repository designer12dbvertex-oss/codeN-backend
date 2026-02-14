import cron from 'node-cron';
import User from '../models/user/userModel.js';

export const startSubscriptionCron = () => {
  // 🔥 Har 1 ghante me run karega
  cron.schedule('0 * * * *', async () => {
    console.log('⏳ Running 3-Day Trial Expiry Cron...');

    try {
      const now = new Date();

      // ✅ 1️⃣ Free Trial Expire
      const trialResult = await User.updateMany(
        {
          trialExpiry: { $lte: now },
          isTrialExpired: false,
          subscriptionStatus: 'free',
        },
        {
          $set: { isTrialExpired: true },
        }
      );

      console.log(`Trial expired users: ${trialResult.modifiedCount}`);

      // ✅ 2️⃣ Paid Subscription Expire
      const subResult = await User.updateMany(
        {
          'subscription.endDate': { $lte: now },
          'subscription.isActive': true,
        },
        {
          $set: {
            'subscription.isActive': false,
            subscriptionStatus: 'free',
          },
        }
      );

      console.log(`Subscription expired users: ${subResult.modifiedCount}`);
    } catch (error) {
      console.error('❌ Cron Error:', error);
    }
  });
};
