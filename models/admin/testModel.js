// import mongoose from 'mongoose';

// const testSchema = new mongoose.Schema({
//     courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
//     subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
//     subSubjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubSubject' },
//     chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
//     testTitle: { type: String, required: true },
//     month: { type: String, required: true },
//     academicYear: { type: String, required: true },
//     questions: [{
//         questionText: { type: String },
//         questionImage: { type: String }, // Question image ke liye
//         options: [{
//             text: { type: String },
//             optionImage: { type: String }, // Iska naam 'image' se badal kar 'optionImage' kar diya hai taaki frontend se match kare
//             isCorrect: { type: Boolean, default: false } // Iski zarurat padegi validation ke liye
//         }],
//         correctAnswer: { type: Number, required: true },
//         explanation: { type: String }
//     }],
//     duration: { type: Number },
//     endDate: { type: Date, required: true },
//     status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
//     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
// }, { timestamps: true });

// // Duration logic
// testSchema.pre('save', function(next) {
//     if (this.questions) this.duration = this.questions.length;
//     next();
// });

// export default mongoose.model('Test', testSchema);

import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    academicYear: { type: String, required: true },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    testTitle: { type: String, required: true },

    category: {
      type: String,
      enum: ['grand', 'subject'],
      required: true,
    },

    testMode: {
      type: String,
      enum: ['regular', 'exam'],
      required: true,
    },

    // Subject Test ke liye filters
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    subSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubSubject' }],
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],

    mcqLimit: { type: Number, required: true },

    timeLimit: { type: Number }, // sirf Exam Mode ke liye

    questions: [
      {
        questionText: { type: String },
        questionImage: { type: String },
        options: [
          {
            text: { type: String },
            optionImage: { type: String },
            isCorrect: { type: Boolean, default: false },
          },
        ],
        correctAnswer: { type: Number, required: true },
        explanation: { type: String },
        chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
      },
    ],

    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export default mongoose.model('Test', testSchema);
