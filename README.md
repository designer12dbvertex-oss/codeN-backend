# CodeN Backend

Node.js aur Express based backend API with admin authentication.

## Features

- ✅ MongoDB with Mongoose
- ✅ JWT-based authentication
- ✅ Admin role only
- ✅ Password hashing with bcrypt
- ✅ Clean folder structure
- ✅ Error handling middleware
- ✅ Input validation

## Installation

1. Dependencies install karo:
```bash
npm install
```

2. `.env` file create karo aur `.env.example` ko copy karo:
```bash
cp .env.example .env
```

3. `.env` file mein apne MongoDB URI aur JWT secret set karo

4. Server start karo:
```bash
npm start
```

Development mode ke liye (auto-reload):
```bash
npm run dev
```

## API Endpoints

### Admin Login
- **POST** `/api/admin/login`
- **Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "admin": {
        "id": "...",
        "name": "...",
        "email": "...",
        "role": "admin"
      },
      "token": "jwt_token_here"
    }
  }
  ```

### Health Check
- **GET** `/api/health`

## Project Structure

```
CodeN-backend/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── generateToken.js      # JWT token generation
├── controllers/
│   └── admin.controller.js   # Admin controller (login)
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── Authorization.middleware.js  # Role-based authorization
│   └── errorMiddleware.js    # Global error handling
├── models/
│   └── admin.model.js        # Admin model
├── routes/
│   └── admin.routes.js       # Admin routes
├── server.js                 # Entry point
├── .env.example              # Environment variables example
└── package.json
```

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time (default: 30d)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Usage

### Protected Routes

Protected routes ke liye `authMiddleware` aur `Authorization.middleware` use karo:

```javascript
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/Authorization.middleware.js';

router.get('/profile', protect, authorize('admin'), getProfile);
```

### Request Headers

Protected routes ke liye header mein token bhejo:

```
Authorization: Bearer <your_jwt_token>
```

