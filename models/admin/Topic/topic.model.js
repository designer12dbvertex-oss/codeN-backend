import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    // ❌ Removed chapterId (topic → chapter one-to-many hona chahiye)
    // chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    // ✅ Topic kis Sub-Subject ka hai
    subSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubSubject',
      required: true,
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
  },
  { timestamps: true }
);

// 🔁 Unique: same sub-subject me same topic name duplicate na ho
topicSchema.index({ subSubjectId: 1, name: 1 }, { unique: true });

export default mongoose.model('Topic', topicSchema);
