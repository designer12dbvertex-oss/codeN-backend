import mongoose from 'mongoose';
import crypto from 'crypto';

const topicSchema = new mongoose.Schema(
  {
    // ✅ Topic kis Chapter ka hai (Subject → SubSubject → Chapter → Topic)
    codonId: {
      type: String,
      unique: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
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

    order: {
      type: Number,
      default: 0,
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
  { timestamps: true }
);

// 🔁 Unique: same chapter me same topic name duplicate na ho
topicSchema.index({ chapterId: 1, name: 1 }, { unique: true });
topicSchema.pre('save', function (next) {
  if (!this.codonId) {
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.codonId = `Codon-ID-${random}`;
  }
  next();
});

export default mongoose.model('Topic', topicSchema);
