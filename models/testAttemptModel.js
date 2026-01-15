import mongoose from 'mongoose';

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },

    currentIndex: {
      type: Number,
      default: 0,
    },

    answers: [
      {
        mcqId: mongoose.Schema.Types.ObjectId,
        selectedOption: Number,
        isCorrect: Boolean,
      },
    ],

    startedAt: Date,
    endsAt: Date,
    submittedAt: Date,
    score: Number,
  },
  { timestamps: true }
);

export default mongoose.model('TestAttempt', testAttemptSchema);
