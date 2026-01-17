import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // "12th" === "12TH"
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate classes
ClassSchema.index({ name: 1 }, { unique: true });

const ClassModel = mongoose.model('Class', ClassSchema);
export default ClassModel;
