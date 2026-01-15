import multer from 'multer';
import path from 'path';

// File kahan save hogi aur uska naam kya hoga
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/'); // Ensure karein ki ye folder exists karta ho
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Sirf video files allow karne ke liye filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

export const uploadVideoFile = multer({ storage, fileFilter });