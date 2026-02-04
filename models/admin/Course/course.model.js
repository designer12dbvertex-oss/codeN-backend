import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    examType: {
      type: String,
      enum: ['NEET'],
      default: 'NEET',
    },

    year: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      default: 0, // free course = 0
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default mongoose.model('Course', courseSchema);
