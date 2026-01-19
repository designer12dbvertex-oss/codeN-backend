import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      default: null,
    },

    profileImage: {
      type: String,
      trim: true,
      default: null,
    },

    mobile: {
      type: String,
      trim: true,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: null,
    },

    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'country',
      default: null,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
    },

    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'city',
      default: null,
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'college',
      default: null,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },

    passingYear: {
      type: String,
      default: null,
    },

    password: {
      type: String,
      select: false,
      default: null,
    },

    admissionYear: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    signUpBy: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
//working krishna
    subscription: {
      plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', default: null },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      isActive: { type: Boolean, default: false },
      selectedMonths: { type: Number, default: 0 }
    },
    subscriptionStatus: {
      type: String,
      enum: ['free', 'starter', 'professional', 'premium_plus'],
      default: 'free'
    }
  },
  
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
