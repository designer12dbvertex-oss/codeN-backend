import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import connectDB from './config/db.js';
import adminRoutes from './routes/admin.routes.js';
import locationRoutes from './routes/location.route.js';
import courseRoutes from './routes/Course/course.routes.js';
import subjectRoutes from './routes/Subject/subject.routes.js';
import subSubjectRoutes from './routes/Sub-subject/subSubject.routes.js';
import chapterRoutes from './routes/Chapter/chapter.routes.js';
import tagRoutes from './routes/Tag/tag.routes.js';
import mcqRoutes from './routes/MCQs/mcq.routes.js';
import bookmarkRoutes from './routes/bookmark.routes.js';
import adminTestRoutes from './routes/admin/testRoutes.js';
import userTestRoutes from './routes/user/testRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import AboutUs from './routes/AboutUs/about.Routes.js';
import Terms from './routes/Terms$Condition/termRoute.js';
import PrivacyRoutes from './routes/PrivacyPolicy/privacy.routes.js';
import subscriptionRoutes from './routes/Subscription/subscription.routes.js';
import videoRoutes from './routes/Video/video.routes.js';

import cors from 'cors';

// Environment variables load karo

// Express app initialize karo
const app = express();

// Database connect karo
connectDB();
import fs from 'fs'; // Top pe import kar lena
if (!fs.existsSync('./uploads/videos'))
  fs.mkdirSync('./uploads/videos', { recursive: true });
app.use(cors());
// static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Middleware
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL encoded body parser

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/admin/courses', courseRoutes);
app.use('/api/admin/subjects', subjectRoutes);
app.use('/api/admin/sub-subjects', subSubjectRoutes);
app.use('/api/admin/chapters', chapterRoutes);
app.use('/api/admin/tags', tagRoutes);
app.use('/api/admin/mcqs', mcqRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin/tests', adminTestRoutes);

app.use('/api/admin', AboutUs);
app.use('/api/admin/terms', Terms);
app.use('/api/tests', userTestRoutes);
app.use('/api/admin/privacy', PrivacyRoutes);
app.use('/api/plans', subscriptionRoutes);
app.use('/api/admin/videos', videoRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running', // Server chal raha hai
  });
});

// 404 handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.use(notFound);

// Error handler middleware (sabse last mein)
app.use(errorHandler);

// Server start karo
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});
