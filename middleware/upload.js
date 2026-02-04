// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // default directories
// const adminProfileDir = 'uploads/admin-profile';
// const chapterImageDir = 'uploads/chapter-image';

// // ensure admin-profile directory exists
// if (!fs.existsSync(adminProfileDir)) {
//   fs.mkdirSync(adminProfileDir, { recursive: true });
// }

// // ensure chapter-image directory exists
// if (!fs.existsSync(chapterImageDir)) {
//   fs.mkdirSync(chapterImageDir, { recursive: true });
// }

// // storage config
// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     /**
//      * 🔹 IMPORTANT:
//      * Existing behavior untouched
//      * Sirf chapter route ke liye path add kiya
//      */
//     if (req.baseUrl && req.baseUrl.includes('chapters')) {
//       cb(null, chapterImageDir); // ✅ chapter images
//     } else {
//       cb(null, adminProfileDir); // ✅ admin profile images
//     }
//   },

//   filename(req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const uniqueName = `${req.admin._id}-${Date.now()}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// // file filter (images only)
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpg|jpeg|png|webp/;
//   const extname = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed'));
//   }
// };

// const uploadAdminProfile = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 2 * 1024 * 1024, // 2MB
//   },
// });

// export default uploadAdminProfile;

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const adminProfileDir = 'uploads/admin-profile';
const chapterImageDir = 'uploads/chapter-image';
const mcqImageDir = 'uploads/mcq-images'; // New folder for MCQs

// Ensure directories exist
[adminProfileDir, chapterImageDir, mcqImageDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // if (req.baseUrl && req.baseUrl.includes('chapters')) {
    if (req.baseUrl?.includes('/chapters')) {
      cb(null, chapterImageDir);
    } else if (req.baseUrl && req.baseUrl.includes('mcqs')) {
      cb(null, mcqImageDir); // ✅ MCQ images saved here
    } else {
      cb(null, adminProfileDir);
    }
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);

    let prefix = 'file';
    if (req.baseUrl?.includes('chapters')) prefix = 'chapter';
    else if (req.baseUrl?.includes('mcqs')) prefix = 'mcq';
    else if (req.baseUrl?.includes('admin')) prefix = 'admin';

    cb(
      null,
      `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;
  const isMatch =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);
  isMatch ? cb(null, true) : cb(new Error('Only images allowed'));
};

const uploadAdminProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for MCQs
});

export default uploadAdminProfile;
