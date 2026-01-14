import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';
import adminRoutes from './routes/admin.routes.js';
import locationRoutes from './routes/location.route.js';
import courseRoutes from './routes/Course/course.routes.js';
import subjectRoutes from './routes/Subject/subject.routes.js';
import subSubjectRoutes from './routes/Sub-subject/subSubject.routes.js';
import chapterRoutes from './routes/Chapter/chapter.routes.js';
import mcqRoutes from './routes/MCQs/mcq.routes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import cors from 'cors';

// Environment variables load karo
dotenv.config();

// Express app initialize karo
const app = express();


// Database connect karo
connectDB();
app.use(cors());
// static uploads
app.use('/uploads', express.static(path.resolve('uploads')));

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
app.use('/api/admin/mcqs', mcqRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running', // Server chal raha hai
  });
});

// 404 handler
app.use(notFound);

// Error handler middleware (sabse last mein)
app.use(errorHandler);

// Server start karo
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});
