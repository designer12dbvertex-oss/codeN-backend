import mongoose from 'mongoose';

const mcqSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },

    subSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubSubject',
      required: true,
      index: true,
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
      index: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length >= 2 && v.length <= 10; // At least 2 options, max 10
        },
        message: 'MCQ must have between 2 and 10 options',
      },
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be String or Array
      required: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    marks: {
      type: Number,
      default: 4, // NEET standard
    },
    negativeMarks: {
      type: Number,
      default: 1, // NEET standard
    },
    previousYearTag: {
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

export default mongoose.model('MCQ', mcqSchema);
