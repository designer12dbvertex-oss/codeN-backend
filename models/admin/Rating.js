// import mongoose from 'mongoose';

// const ratingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   rating: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 5
//   },
//   review: {
//     type: String,
//     trim: true
//   }
// }, { timestamps: true });

// export default mongoose.model('Rating', ratingSchema);

import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 👇 Ye field add karna compulsory hai
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Ek user ek video ko ek hi baar rate kar sake (Optional but good)
ratingSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);