import mongoose from "mongoose";

const customTestAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mcqIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MCQ",
      },
    ],

    answers: [
      {
        mcqId: mongoose.Schema.Types.ObjectId,
        selectedIndex: Number,
      },
    ],

    mode: {
      type: String,
      enum: ["regular", "exam"],
      default: "regular",
    },

    status: {
      type: String,
      enum: ["in_progress", "completed", "auto_submitted"],
      default: "in_progress",
    },

    startedAt: Date,
    submittedAt: Date,

    result: {
      totalQuestions: Number,
      correct: Number,
      incorrect: Number,
      notAttempted: Number,
      scorePercentage: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "CustomTestAttempt",
  customTestAttemptSchema
);
