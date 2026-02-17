# IQnite - Quiz Platform 🎯

A full-stack quiz platform built with **NestJS** (backend) and **React + TypeScript** (frontend) that enables organizers to create and manage quizzes while participants can join and take quizzes using unique codes.

## 🚀 Features

### For Organizers
- ✅ Create and manage quizzes with unique 6-character codes
- ✅ Add multiple question types (Multiple Choice, True/False, Short Answer)
- ✅ Configure quiz settings (duration, passing score, max attempts, etc.)
- ✅ Schedule quizzes with start and expiry dates
- ✅ Auto-grading system with instant results
- ✅ View quiz statistics and leaderboards
- ✅ Shuffle questions option for better quiz security

### For Participants
- ✅ Join quizzes using unique codes
- ✅ Take quizzes with real-time progress tracking
- ✅ View instant results with detailed feedback
- ✅ See correct answers and explanations (if enabled)
- ✅ Track quiz history and performance

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma 7** - Next-generation ORM with PostgreSQL adapter
- **PostgreSQL 17** - Robust relational database
- **JWT + Passport.js** - Secure authentication
- **bcrypt** - Password hashing
- **TypeScript** - Type-safe development

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe frontend code
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **TanStack Query** - Powerful async state management
- **Axios** - HTTP client

## 📋 Prerequisites

- **Node.js** v22.16.0 or higher
- **PostgreSQL** 17 or higher
- **npm** v11.4.2 or higher

## 🔧 Installation & Setup

### 1. Database Setup

1. Install PostgreSQL 17
2. Create database and user:
```sql
CREATE DATABASE iqnite;
CREATE USER iqnite_user WITH PASSWORD 'iqnite_dev_2026';
GRANT ALL PRIVILEGES ON DATABASE iqnite TO iqnite_user;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
DATABASE_URL="postgresql://iqnite_user:iqnite_dev_2026@localhost:5432/iqnite?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start development server
npm run start:dev
```

Backend will run on **http://localhost:3000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on **http://localhost:5173**

## 🎮 Usage Guide

### Getting Started

1. **Register an Account**
   - Visit http://localhost:5173
   - Click "Register"
   - Choose role: Organizer or Participant
   - Fill in your details

2. **As an Organizer:**
   - Login and navigate to Organizer Dashboard
   - Click "Create Quiz"
   - Add quiz details (title, description, settings)
   - Add questions (Multiple Choice, True/False, or Short Answer)
   - Share the generated 6-character code with participants

3. **As a Participant:**
   - Login and navigate to Participant Dashboard
   - Enter the quiz code provided by the organizer
   - Take the quiz
   - View your results and performance

## 📚 API Documentation

Complete API documentation is available in `QUIZ_API_DOCS.md` with 20+ endpoints including:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/me` - Get current user

### Quiz Management
- `GET /api/quiz` - Get all quizzes
- `POST /api/quiz` - Create quiz
- `GET /api/quiz/:id` - Get quiz details
- `PATCH /api/quiz/:id` - Update quiz
- `DELETE /api/quiz/:id` - Delete quiz
- `POST /api/quiz/join` - Join quiz by code
- `GET /api/quiz/:id/stats` - Get quiz statistics

### Questions
- `POST /api/question` - Add question
- `POST /api/question/bulk` - Add multiple questions
- `GET /api/question?quizId=xxx` - Get quiz questions
- `PATCH /api/question/:id` - Update question
- `DELETE /api/question/:id` - Delete question

### Quiz Sessions
- `POST /api/session/start` - Start quiz session
- `POST /api/session/:id/answer` - Submit answer
- `POST /api/session/:id/complete` - Complete quiz
- `GET /api/session/:id` - Get session results
- `GET /api/session/my/results` - Get my results

## 🏗️ Project Structure

```
IQnite/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── auth/                  # Authentication module
│   │   ├── quiz/                  # Quiz management
│   │   ├── question/              # Question management
│   │   ├── session/               # Quiz session handling
│   │   ├── prisma/                # Prisma service
│   │   ├── app.module.ts          # Root module
│   │   └── main.ts                # Application entry
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/            # Reusable components
    │   │   ├── Navbar.tsx
    │   │   └── PrivateRoute.tsx
    │   ├── pages/                 # Page components
    │   │   ├── Home.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── OrganizerDashboard.tsx
    │   │   ├── CreateQuiz.tsx
    │   │   ├── QuizDetails.tsx
    │   │   ├── ParticipantDashboard.tsx
    │   │   ├── TakeQuiz.tsx
    │   │   └── QuizResults.tsx
    │   ├── services/              # API services
    │   │   └── api.ts
    │   ├── store/                 # State management
    │   │   └── authStore.ts
    │   ├── types/                 # TypeScript types
    │   │   └── index.ts
    │   ├── App.tsx                # Main app component
    │   └── main.tsx               # Application entry
    └── package.json
```

## 🗄️ Database Schema

### Core Models
- **User** - User accounts (ADMIN, ORGANIZER, PARTICIPANT)
- **Profile** - Extended user information
- **Quiz** - Quiz details and configuration
- **Question** - Quiz questions (3 types)
- **QuizSession** - Active/completed quiz attempts
- **Answer** - Submitted answers with scoring
- **Session** - User sessions
- **RefreshToken** - JWT refresh tokens

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT-based authentication
- ✅ Refresh token mechanism
- ✅ Rate limiting (100 requests/minute)
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ CORS configuration

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/api/health
# Response: {"status":"ok","database":"connected"}
```

### Test Flow
1. Register as Organizer
2. Create a quiz
3. Add questions
4. Register as Participant
5. Join quiz with code
6. Take quiz
7. View results

## 📦 Production Build

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder
```

## 🌐 Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/iqnite?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"
PORT=3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3000/api
```

## 🐛 Troubleshooting

### Backend Issues
- **Database connection error**: Check PostgreSQL is running and credentials are correct
- **Prisma errors**: Run `npx prisma generate` and `npx prisma migrate deploy`
- **Port already in use**: Change PORT in backend or kill the process

### Frontend Issues
- **API connection error**: Ensure backend is running on port 3000
- **CORS errors**: Backend CORS is configured for localhost:5173
- **Module errors**: Delete `node_modules` and run `npm install`

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

Built with ❤️ for educational purposes

## 🚀 Future Enhancements

- [ ] Add quiz categories and tags
- [ ] Implement image support for questions
- [ ] Add quiz templates
- [ ] Real-time quiz sessions with WebSockets
- [ ] Export results to CSV/PDF
- [ ] Add quiz analytics dashboard
- [ ] Mobile responsive improvements
- [ ] Dark mode support
- [ ] Email notifications
- [ ] Social authentication (Google, GitHub)

---

**Ready to deploy!** 🎉
