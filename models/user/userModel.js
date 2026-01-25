import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Password hashing ke liye zaroori hai

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
      ref: 'Country',
      default: null,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
    },

    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null,
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
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
    googleId: { type: String, index: true },

    // ✅ Yahan Login ke baad token save hoga
    refreshToken: {
      type: String,
      select: false,
      default: null,
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
    // userModel.js mein mobile field ko is tarah update karein
    mobile: {
      type: String,
      trim: true,
      unique: true, // Login ke liye unique hona zaroori hai
      sparse: true, // Taaki null values par error na aaye
      default: null,
    },
    // ... baki fields ke saath ye add karein
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    subscription: {
      plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        default: null,
      },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      isActive: { type: Boolean, default: false },
      selectedMonths: { type: Number, default: 0 },
    },
    subscriptionStatus: {
      type: String,
      enum: ['free', 'starter', 'professional', 'premium_plus'],
      default: 'free',
    },
  },
  { timestamps: true }
);

// ✅ PASSWORD HASHING MIDDLEWARE
userSchema.pre('save', async function (next) {
  // Agar password change NAHI hua hai (jaise sirf login token save ho raha ho), toh hashing skip karo
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
