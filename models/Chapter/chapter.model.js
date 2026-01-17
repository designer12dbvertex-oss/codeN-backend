import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    subSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubSubject',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    weightage: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    targetMcqs: { type: Number, default: 50 },
    isFreePreview: {
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
    timestamps: true,
  }
);

// Index for subSubjectId and name combination
chapterSchema.index({ subSubjectId: 1, name: 1 }, { unique: true });

export default mongoose.model('Chapter', chapterSchema);
