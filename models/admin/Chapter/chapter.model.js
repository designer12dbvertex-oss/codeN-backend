// import mongoose from 'mongoose';

// const chapterSchema = new mongoose.Schema(
//   {
//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Course',
//       required: true,
//     },

//     subSubjectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'SubSubject',
//       required: true,
//     },

//     // ✅ ADD THIS FIELD
//     topicId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Topic',
//       required: true, // har chapter kisi topic ka hona chahiye
//     },

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     image: {
//       type: String,
//       default: null,
//     },
//     weightage: {
//       type: Number,
//       default: 0,
//     },
//     order: {
//       type: Number,
//       default: 0,
//     },
//     targetMcqs: { type: Number, default: 50 },
//     isFreePreview: {
//       type: Boolean,
//       default: false,
//     },
//     status: {
//       type: String,
//       enum: ['active', 'inactive'],
//       default: 'active',
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Admin',
//       required: true,
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Admin',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // 🔁 Index update (subSubjectId + topicId + name unique)
// chapterSchema.index({ subSubjectId: 1, topicId: 1, name: 1 }, { unique: true });

// export default mongoose.model('Chapter', chapterSchema);

import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    subSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubSubject',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    chapterCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    weightage: {
      type: Number,
      default: 0,
    },

    order: {
      type: Number,
      default: 0,
    },

    targetMcqs: {
      type: Number,
      default: 50,
    },

    isFreePreview: {
      type: Boolean,
      default: false,
    },
    topicSequence: {
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

// 🔁 Updated unique index
chapterSchema.index({ subSubjectId: 1, name: 1 }, { unique: true });

export default mongoose.model('Chapter', chapterSchema);
