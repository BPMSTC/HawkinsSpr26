# CYOA Backend API

Backend API for the Choose Your Own Adventure application, built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - **Local MongoDB**: Install MongoDB Community Server and start it
   - **MongoDB Atlas**: Create a free cluster at mongodb.com/atlas and get your connection string

3. Configure environment variables in `.env`:
   - Update `MONGODB_URI` with your MongoDB connection string
   - Change `JWT_SECRET` to a secure random string

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will run on http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Request/Response Examples

#### Register
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```json
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

## User Model

Users have the following fields:
- `username` (required, unique)
- `email` (required, unique)
- `password` (required, hashed)
- `createdAt` (automatic)
- `storyProgress` (optional array for storing user progress in stories)