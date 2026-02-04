// import mongoose from 'mongoose';

// const tagSchema = new mongoose.Schema(
//   {
//     chapterId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Chapter',
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//     },
//     status: {
//       type: String,
//       enum: ['active', 'inactive'],
//       default: 'active',
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Admin',
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Admin',
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model('Tag', tagSchema);

import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  }
}, { timestamps: true });

export default mongoose.model('Tag', tagSchema);