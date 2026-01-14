import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },

    subSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubSubject',
      default: null,
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },

    scopeType: {
      type: String,
      enum: ['subject', 'sub-subject', 'chapter'],
      required: true,
    },

    testType: {
      type: String,
      enum: ['regular', 'exam'],
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number, // minutes (only for regular)
      default: null,
    },

    perQuestionTime: {
      type: Number, // seconds (exam mode)
      default: 60,
    },

    marksPerQuestion: {
      type: Number,
      default: 4,
    },

    negativeMarks: {
      type: Number,
      default: 1,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Test', testSchema);
