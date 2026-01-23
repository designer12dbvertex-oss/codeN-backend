import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    // ===== BASIC INFORMATION =====
    month: {
      type: String,
      required: [true, 'Month is required'],
      enum: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    },

    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}-\d{4}$/, 'Format should be YYYY-YYYY (e.g., 2024-2025)'],
    },

    testTitle: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
      minlength: [3, 'Test title must be at least 3 characters'],
      maxlength: [100, 'Test title must not exceed 100 characters'],
    },

    // ===== TEST CATEGORIZATION =====
    category: {
      type: String,
      enum: {
        values: ['grand', 'subject'],
        message: 'Category must be either "grand" or "subject"',
      },
      required: [true, 'Category is required'],
    },

    testMode: {
      type: String,
      enum: {
        values: ['regular', 'exam'],
        message: 'Test mode must be either "regular" or "exam"',
      },
      required: [true, 'Test mode is required'],
    },

    // ===== COURSE INFORMATION =====
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: function () {
        return this.category === 'grand';
      },
    },

    // ===== SUBJECT TEST FILTERS =====
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],

    subSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubSubject',
      },
    ],

    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],

    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
      },
    ],

    // ===== TEST CONFIGURATION =====
    mcqLimit: {
      type: Number,
      required: [true, 'MCQ limit is required'],
      min: [1, 'MCQ limit must be at least 1'],
    },

    timeLimit: {
      type: Number, // in minutes
      required: function () {
        return this.testMode === 'exam';
      },
      min: [1, 'Time limit must be at least 1 minute'],
      validate: {
        validator: function () {
          if (this.testMode === 'exam') {
            return this.timeLimit && this.timeLimit > 0;
          }
          return true;
        },
        message: 'Time limit is required for Exam Mode',
      },
    },

    // ===== QUESTIONS ARRAY =====
    questions: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          auto: true,
        },
        questionText: {
          type: String,
          required: true,
        },
        questionImage: {
          type: String, // URL to image
          default: null,
        },
        options: [
          {
            _id: false,
            text: {
              type: String,
              required: true,
            },
            optionImage: {
              type: String, // URL to image
              default: null,
            },
            isCorrect: {
              type: Boolean,
              default: false,
            },
          },
        ],
        correctAnswer: {
          type: Number, // 0-3 index
          required: true,
          min: 0,
          max: 3,
        },
        explanation: {
          type: String,
          default: '',
        },
        chapterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Chapter',
        },
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
      },
    ],

    // ===== STATUS & METADATA =====
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'draft'],
        message: 'Status must be "active", "inactive", or "draft"',
      },
      default: 'active',
    },

    description: {
      type: String,
      default: '',
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

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ===== INDEXES FOR PERFORMANCE =====
testSchema.index({ category: 1, status: 1 });
testSchema.index({ courseId: 1 });
testSchema.index({ createdAt: -1 });
testSchema.index({ testTitle: 'text' });

// ===== VIRTUAL FIELDS =====
testSchema.virtual('totalQuestions').get(function () {
  return this.questions ? this.questions.length : 0;
});

// ===== MIDDLEWARES =====

// Validate at least one filter is selected for Subject Test
testSchema.pre('save', function (next) {
  if (this.category === 'subject') {
    const hasFilter =
      this.subjects?.length > 0 ||
      this.subSubjects?.length > 0 ||
      this.topics?.length > 0 ||
      this.chapters?.length > 0;

    if (!hasFilter) {
      return next(
        new Error(
          'At least one filter (Subject/SubSubject/Topic/Chapter) must be selected for Subject Test'
        )
      );
    }
  }

  // For Exam Mode, ensure timeLimit is set
  if (this.testMode === 'exam' && !this.timeLimit) {
    return next(new Error('Time limit is required for Exam Mode'));
  }

  next();
});

export default mongoose.model('Test', testSchema);
