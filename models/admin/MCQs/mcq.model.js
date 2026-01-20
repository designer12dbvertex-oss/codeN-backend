import mongoose from 'mongoose';

const mcqSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    subSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubSubject',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', default: null },

    mode: {
      type: String,
      enum: ['regular', 'exam'],
      default: 'regular', // default regular MCQ
    },

    question: {
      text: { type: String, trim: true },
      images: [{ type: String }], // Array of image URLs
    },

    options: [
      {
        text: { type: String, trim: true },
        image: { type: String, default: null }, // Single image per option
      },
    ],

    correctAnswer: { type: Number, required: true }, // Index (0, 1, 2, 3)

    explanation: {
      text: { type: String, trim: true },
      images: [{ type: String }],
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 1 },
    previousYearTag: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export default mongoose.model('MCQ', mcqSchema);
