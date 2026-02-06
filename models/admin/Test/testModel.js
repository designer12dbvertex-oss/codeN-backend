// models/admin/Test/testModel.js
import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    academicYear: { type: String, required: true },
    testTitle: { type: String, required: true, trim: true },

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

    testMode: {
      type: String,
      enum: ['regular', 'exam'],
      required: true,
    },

    mcqLimit: { type: Number, required: true, min: 1 },
    timeLimit: { type: Number, default: null },

    mcqs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MCQ' }],
    totalQuestions: { type: Number, default: 0 },

    description: { type: String, default: '' },

    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Test', testSchema);
