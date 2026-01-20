// import express from 'express';
// import dotenv from 'dotenv';
// dotenv.config();
// import path from 'path';
// import connectDB from './config/db.js';
// import adminRoutes from './routes/admin/admin.routes.js';
// import locationRoutes from './routes/admin/location.route.js';
// import courseRoutes from './routes/admin/Course/course.routes.js';
// import subjectRoutes from './routes/admin/Subject/subject.routes.js';
// import subSubjectRoutes from './routes/admin/Sub-subject/subSubject.routes.js';
// import chapterRoutes from './routes/admin/Chapter/chapter.routes.js';
// import tagRoutes from './routes/admin/Tag/tag.routes.js';
// import mcqRoutes from './routes/admin/MCQs/mcq.routes.js';
// import bookmarkRoutes from './routes/admin/bookmark.routes.js';
// import adminTestRoutes from './routes/admin/testRoutes.js';
// import userTestRoutes from './routes/user/testRoutes.js';
// import userRoutes from './routes/user/user.routes.js';
// import { errorHandler, notFound } from './middleware/errorMiddleware.js';
// import AboutUs from './routes/admin/AboutUs/about.Routes.js';
// import Terms from './routes/admin/Terms$Condition/termRoute.js';
// import PrivacyRoutes from './routes/admin/PrivacyPolicy/privacy.routes.js';
// import subscriptionRoutes from './routes/admin/Subscription/subscription.routes.js';
// import videoRoutes from './routes/admin/Video/video.routes.js';
// import swaggerUi from 'swagger-ui-express';
// import swaggerJsdoc from 'swagger-jsdoc';

// import cors from 'cors';

// // Environment variables load karo

// // Express app initialize karo
// const app = express();

// // Database connect karo
// connectDB();
// import fs from 'fs'; // Top pe import kar lena
// if (!fs.existsSync('./uploads/videos'))
//   fs.mkdirSync('./uploads/videos', { recursive: true });
// app.use(cors());
// // static uploads
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// // Middleware
// app.use(express.json()); // JSON body parser
// app.use(express.urlencoded({ extended: true })); // URL encoded body parser

// // Routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/location', locationRoutes);
// app.use('/api/admin/courses', courseRoutes);
// app.use('/api/admin/subjects', subjectRoutes);
// app.use('/api/admin/sub-subjects', subSubjectRoutes);
// app.use('/api/admin/chapters', chapterRoutes);
// app.use('/api/admin/tags', tagRoutes);
// app.use('/api/admin/mcqs', mcqRoutes);
// app.use('/api/bookmarks', bookmarkRoutes);
// app.use('/api/admin/tests', adminTestRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/admin', AboutUs);
// app.use('/api/admin/terms', Terms);
// app.use('/api/tests', userTestRoutes);
// app.use('/api/admin/privacy', PrivacyRoutes);
// app.use('/api/plans', subscriptionRoutes);
// app.use('/api/admin/videos', videoRoutes);

// // Health check route
// app.get('/', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Server is running', // Server chal raha hai
//   });
// });

// // 404 handler
// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//   });
// });

// app.use(notFound);

// // Error handler middleware (sabse last mein)
// app.use(errorHandler);

// // Server start karo
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(
//     `Server running in ${
//       process.env.NODE_ENV || 'development'
//     } mode on port ${PORT}`
//   );
// });

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Config and DB
import connectDB from './config/db.js';

// Route Imports
import adminRoutes from './routes/admin/admin.routes.js';
import locationRoutes from './routes/admin/location.route.js';
import courseRoutes from './routes/admin/Course/course.routes.js';
import subjectRoutes from './routes/admin/Subject/subject.routes.js';
import subSubjectRoutes from './routes/admin/Sub-subject/subSubject.routes.js';
import chapterRoutes from './routes/admin/Chapter/chapter.routes.js';
import tagRoutes from './routes/admin/Tag/tag.routes.js';
import mcqRoutes from './routes/admin/MCQs/mcq.routes.js';
import bookmarkRoutes from './routes/admin/bookmark.routes.js';
import adminTestRoutes from './routes/admin/testRoutes.js';
import userTestRoutes from './routes/user/testRoutes.js';
import userRoutes from './routes/user/user.routes.js';
import AboutUs from './routes/admin/AboutUs/about.Routes.js';
import Terms from './routes/admin/Terms$Condition/termRoute.js';
import PrivacyRoutes from './routes/admin/PrivacyPolicy/privacy.routes.js';
import subscriptionRoutes from './routes/admin/Subscription/subscription.routes.js';
import videoRoutes from './routes/admin/Video/video.routes.js';
import Topic from './routes/admin/Topic/topic.js';
import PaymentList from './routes/admin/paymentRoute.js';

// Middleware Imports
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Load Env
dotenv.config();

// Initialize App
const app = express();

// Connect Database
connectDB();

// Create Uploads Directory if not exists
// Create Uploads Directories if not exists
const uploadDirs = [
  './uploads/videos',
  './uploads/chapter-image',
  './uploads/mcq-images',
  './uploads/admin-profile',
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// --- Swagger Configuration ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cod_ON API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for Admin and User panels',
      contact: {
        name: 'Developer Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Local Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Yeh path aapke saare routes folder ko scan karega
  apis: ['./routes/**/*.js', './routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// --- Global Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- API Routes ---

// Admin Specific Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin', AboutUs);
app.use('/api/admin/courses', courseRoutes);
app.use('/api/admin/subjects', subjectRoutes);
app.use('/api/admin/sub-subjects', subSubjectRoutes);
app.use('/api/admin/chapters', chapterRoutes);
app.use('/api/admin/topics', Topic);
app.use('/api/admin/tags', tagRoutes);
app.use('/api/admin/mcqs', mcqRoutes);
app.use('/api/admin/tests', adminTestRoutes);
app.use('/api/admin/terms', Terms);
app.use('/api/admin/privacy', PrivacyRoutes);
app.use('/api/admin/videos', videoRoutes);
app.use('/api/admin', PaymentList);

// Shared/Other Routes
app.use('/api/location', locationRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/plans', subscriptionRoutes);

// User Specific Routes
app.use('/api/users', userRoutes);
app.use('/api/tests', userTestRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    swagger: `http://localhost:${process.env.PORT || 4000}/api-docs`,
  });
});

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
  });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
