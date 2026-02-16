import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import admin from 'firebase-admin';

// Config and DB
import connectDB from './config/db.js';

// Route Importss
import adminRoutes from './routes/admin/admin.routes.js';
import locationRoutes from './routes/admin/location.route.js';
import courseRoutes from './routes/admin/Course/course.routes.js';
import subjectRoutes from './routes/admin/Subject/subject.routes.js';
import subSubjectRoutes from './routes/admin/Sub-subject/subSubject.routes.js';
import chapterRoutes from './routes/admin/Chapter/chapter.routes.js';
import tagRoutes from './routes/admin/Tag/tag.routes.js';
import mcqRoutes from './routes/admin/MCQs/mcq.routes.js';
import bookmarkRoutes from './routes/admin/bookmark.routes.js';
import adminTestRoutes from './routes/admin/Test/testRoutes.js';
import userTestRoutes from './routes/user/testRoutes.js';
import userRoutes from './routes/user/user.routes.js';
import AboutUs from './routes/admin/AboutUs/about.Routes.js';
import Terms from './routes/admin/Terms$Condition/termRoute.js';
import PrivacyRoutes from './routes/admin/PrivacyPolicy/privacy.routes.js';
import subscriptionRoutes from './routes/admin/Subscription/subscription.routes.js';
import videoRoutes from './routes/admin/Video/video.routes.js';
import Topic from './routes/admin/Topic/topic.js';
import PaymentList from './routes/admin/paymentRoute.js';
import faculty from './routes/admin/faculty/faculty.routes.js';
import promo from './routes/admin/promo/promo.routes.js';
import Rating from './models/admin/Rating.js';
import mongoose from 'mongoose';
// Middleware Imports
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
// import { startSubscriptionCron } from './cron/subscription.cron.js';

// Load Env
dotenv.config();

// Firebase Admin Setup
const serviceAccount = JSON.parse(
  fs.readFileSync(
    new URL('./config/firebase-service-account.json', import.meta.url),
    'utf8'
  )
);
const formattedPrivateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      ...serviceAccount,
      private_key: formattedPrivateKey, // Yahan formatted wali key use karni hai
    }),
    projectId: serviceAccount.project_id,
  });
}
console.log('✅ Firebase Admin SDK Initialized');

// Initialize App
const app = express();
// Start Server
const PORT = process.env.PORT || 4000;
// Connect Database
connectDB();
mongoose.connection.once('open', async () => {
  console.log('✅ Mongo Connected');
  await Rating.syncIndexes();
  console.log('✅ Rating indexes synced');
});
// Create Uploads Directory if not exists
// Create Uploads Directories if not exists
const uploadDirs = [
  './uploads/videos',
  './uploads/chapter-image',
  './uploads/mcq-images',
  './uploads/admin-profile',
  './uploads/user-profile',
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
        url:
          process.env.BASE_URL ||
          `http://localhost:${process.env.PORT || 4000}`,
        description: 'API Server',
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

app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI route
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

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
app.use('/api/faculty', faculty);
app.use('/api/promo', promo);
// Shared/Other Routes
app.use('/api/location', locationRoutes);
// app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/plans', subscriptionRoutes);

// User Specific Routes
app.use('/api/users', userRoutes);
app.use('/api/tests', userTestRoutes);

// Root Health Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cod_ON Backend API Live 🚀',
  });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
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
console.log('Server time:', new Date().toISOString());

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // startSubscriptionCron();
  console.log(
    `📄 Swagger Docs: ${
      process.env.BASE_URL || `http://localhost:${PORT}`
    }/api-docs`
  );
});
