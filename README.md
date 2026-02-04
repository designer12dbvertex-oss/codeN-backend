CodeN Backend

Node.js and Express-based backend API with admin authentication.

Features

✅ MongoDB with Mongoose

✅ JWT-based authentication

✅ Admin role only

✅ Password hashing using bcrypt

✅ Clean folder structure

✅ Global error handling middleware

✅ Input validation

Installation

Install dependencies:

npm install

Create a .env file by copying .env.example:

copy .env.example .env

Set your MongoDB URI and JWT secret inside the .env file.

Start the server:

npm start

For development mode (auto-reload):

npm run server

Health Check

GET /api/health

Project Structure
CodeN-backend/
├── config/
│ ├── db.js # MongoDB connection
│ └── generateToken.js # JWT token generation
├── controllers/
│ ├── admin.controller.js # Admin controller (login)
│ ├── country.controller.js
│ ├── state.controller.js
│ ├── city.controller.js
│ └── college.controller.js
├── middleware/
│ ├── authMiddleware.js # JWT verification
│ ├── Authorization.middleware.js # Role-based authorization
│ └── errorMiddleware.js # Global error handling
├── models/
│ ├── admin.model.js # Admin model
│ ├── country.model.js
│ ├── state.model.js
│ ├── city.model.js
│ └── college.model.js
├── routes/
│ ├── admin.routes.js # Admin routes
│ ├── country.routes.js
│ ├── state.routes.js
│ ├── city.routes.js
│ └── college.routes.js
├── server.js # Entry point
├── .env.example # Environment variables example
└── package.json

Environment Variables

Configured using the .env file.

Usage
Protected Routes

For protected routes, use authMiddleware and Authorization.middleware..
