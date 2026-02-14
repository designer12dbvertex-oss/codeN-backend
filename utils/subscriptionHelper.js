import UserModel from '../models/user/userModel.js';

export const enforceSubscription = async (userId, res) => {
  const user = await UserModel.findById(userId).select(
    'subscriptionStatus trialExpiry subscription isTrialExpired'
  );

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return false;
  }

  const now = new Date();

  // ✅ Paid plan active
  if (
    user.subscription?.isActive &&
    user.subscription?.endDate > now
  ) {
    return true;
  }

  // ✅ Trial valid
  if (
    user.subscriptionStatus === 'free' &&
    user.trialExpiry > now &&
    user.isTrialExpired === false
  ) {
    return true;
  }

  res.status(403).json({
    success: false,
    message: 'Your 3-day free trial has expired. Please subscribe.',
  });

  return false;
};
