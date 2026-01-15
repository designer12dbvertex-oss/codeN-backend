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
      default: null,
    },

    image: {
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

    password: {
      type: String,
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
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
