# 🎯 IQnite Quiz Platform - API Documentation

## 🚀 Server Running
**Base URL**: `http://localhost:3000/api`

---

## 📡 Available Endpoints

### ✅ **Health Check**
```
GET /api/health
```

---

## 🔐 **Authentication Endpoints**

### Register User
```http
POST /api/auth/register

Body:
{
  "email": "organizer@example.com",
  "username": "quiz_master",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "organizer@example.com",
    "username": "quiz_master",
    "role": "PARTICIPANT",  // Default role
    ...
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login
```http
POST /api/auth/login

Body:
{
  "usernameOrEmail": "quiz_master",
  "password": "SecurePass123!"
}
```

### Get Current User
```http
POST /api/auth/me
Authorization: Bearer <accessToken>
```

---

## 📝 **Quiz Management** (For Organizers)

### Create Quiz
```http
POST /api/quiz
Authorization: Bearer <accessToken>

Body:
{
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your JS knowledge",
  "isPublic": true,
  "duration": 30,           // minutes
  "passingScore": 70,        // percentage
  "maxAttempts": 3,
  "showAnswers": true,       // Show correct answers after completion
  "shuffleQuestions": false,
  "scheduledAt": "2026-02-20T10:00:00Z",  // optional
  "expiresAt": "2026-03-20T10:00:00Z"      // optional
}

Response:
{
  "id": "quiz-uuid",
  "title": "JavaScript Fundamentals Quiz",
  "code": "ABC123",          // 6-character join code
  "organizerId": "user-uuid",
  ...
}
```

### Get All Quizzes
```http
GET /api/quiz
GET /api/quiz?myQuizzes=true          // Only my quizzes
GET /api/quiz?public=true              // Only public quizzes
Authorization: Bearer <accessToken>
```

### Get Quiz by ID
```http
GET /api/quiz/:id
Authorization: Bearer <accessToken>
```

### Update Quiz
```http
PATCH /api/quiz/:id
Authorization: Bearer <accessToken>

Body:
{
  "title": "Updated Quiz Title",
  "isActive": true
}
```

### Delete Quiz
```http
DELETE /api/quiz/:id
Authorization: Bearer <accessToken>
```

### Get Quiz Statistics (Organizer only)
```http
GET /api/quiz/:id/stats
Authorization: Bearer <accessToken>

Response:
{
  "quiz": { "id", "title", "code" },
  "stats": {
    "totalParticipants": 15,
    "completed": 12,
    "inProgress": 3,
    "averageScore": 18.5,
    "averagePercentage": 74.2
  },
  "leaderboard": [
    {
      "rank": 1,
      "participant": { "id", "username", "firstName", "lastName" },
      "score": 25,
      "totalPoints": 25,
      "percentage": 100,
      "timeSpent": 450,
      "completedAt": "2026-02-17T..."
    },
    ...
  ]
}
```

---

## ❓ **Question Management** (For Organizers)

### Add Question to Quiz
```http
POST /api/question
Authorization: Bearer <accessToken>

Body:
{
  "quizId": "quiz-uuid",
  "type": "MULTIPLE_CHOICE",  // or "TRUE_FALSE", "SHORT_ANSWER"
  "question": "What is the output of typeof null?",
  "options": [
    "object",
    "null",
    "undefined",
    "number"
  ],
  "correctAnswer": "object",  // For MCQ: option text or index
  "points": 2,
  "timeLimit": 30,             // seconds (optional)
  "order": 1,
  "explanation": "typeof null returns 'object' due to a legacy bug"
}
```

### Bulk Add Questions
```http
POST /api/question/bulk
Authorization: Bearer <accessToken>

Body:
{
  "quizId": "quiz-uuid",
  "questions": [
    { /* question 1 */ },
    { /* question 2 */ },
    ...
  ]
}
```

### Get Questions for Quiz
```http
GET /api/question?quizId=quiz-uuid
Authorization: Bearer <accessToken>
```

### Update Question
```http
PATCH /api/question/:id
Authorization: Bearer <accessToken>

Body:
{
  "question": "Updated question text",
  "points": 3
}
```

### Delete Question
```http
DELETE /api/question/:id
Authorization: Bearer <accessToken>
```

---

## 🎮 **Quiz Session** (For Participants)

### Join Quiz by Code
```http
POST /api/quiz/join
Authorization: Bearer <accessToken>

Body:
{
  "code": "ABC123"
}

Response:
{
  "id": "quiz-uuid",
  "title": "JavaScript Fundamentals Quiz",
  "description": "...",
  "code": "ABC123",
  "organizer": { "username", "firstName", "lastName" },
  "_count": {
    "questions": 10,
    "sessions": 5
  }
}
```

### Start Quiz
```http
POST /api/session/start
Authorization: Bearer <accessToken>

Body:
{
  "quizId": "quiz-uuid"
}

Response:
{
  "session": {
    "id": "session-uuid",
    "status": "IN_PROGRESS",
    "startedAt": "2026-02-17T..."
  },
  "quiz": {
    "id": "quiz-uuid",
    "title": "JavaScript Fundamentals Quiz",
    "duration": 30,
    "totalPoints": 25,
    "questionCount": 10
  },
  "questions": [
    {
      "id": "q1-uuid",
      "type": "MULTIPLE_CHOICE",
      "question": "What is the output of typeof null?",
      "options": ["object", "null", "undefined", "number"],
      "points": 2,
      "timeLimit": 30,
      "order": 1
      // Note: correctAnswer is NOT included
    },
    ...
  ]
}
```

### Submit Answer
```http
POST /api/session/:sessionId/answer
Authorization: Bearer <accessToken>

Body:
{
  "questionId": "q1-uuid",
  "answer": "object",      // For MCQ: option text, For True/False: "true"/"false"
  "timeSpent": 15          // seconds (optional)
}

Response:
{
  "answerId": "answer-uuid",
  "isCorrect": true,
  "pointsEarned": 2,
  // If showAnswers is true:
  "correctAnswer": "object",
  "explanation": "typeof null returns 'object' due to a legacy bug"
}
```

### Complete Quiz
```http
POST /api/session/:sessionId/complete
Authorization: Bearer <accessToken>

Response:
{
  "sessionId": "session-uuid",
  "score": 23,
  "totalPoints": 25,
  "percentage": 92,
  "passed": true,
  "timeSpent": 450,         // seconds
  "answeredQuestions": 10,
  "totalQuestions": 10,
  // If showAnswers is true:
  "answers": [
    {
      "questionId": "q1-uuid",
      "question": "What is the output of typeof null?",
      "yourAnswer": "object",
      "correctAnswer": "object",
      "isCorrect": true,
      "pointsEarned": 2,
      "explanation": "..."
    },
    ...
  ]
}
```

### Get Current Session
```http
GET /api/session/:sessionId
Authorization: Bearer <accessToken>

Response:
{
  "session": {
    "id": "session-uuid",
    "status": "IN_PROGRESS",
    "score": 10,
    "totalPoints": 25,
    "startedAt": "...",
    "completedAt": null
  },
  "quiz": { ... },
  "questions": [ ... ],
  "answeredQuestions": [
    {
      "questionId": "q1-uuid",
      "answer": "object",
      "isCorrect": true,
      "pointsEarned": 2
    }
  ]
}
```

### Get My Results
```http
GET /api/session/my/results
Authorization: Bearer <accessToken>

Response:
[
  {
    "sessionId": "session-uuid",
    "quiz": {
      "id": "quiz-uuid",
      "title": "JavaScript Fundamentals Quiz",
      "passingScore": 70
    },
    "score": 23,
    "totalPoints": 25,
    "percentage": 92,
    "passed": true,
    "completedAt": "2026-02-17T...",
    "timeSpent": 450
  },
  ...
]
```

---

## 📊 **Database Models**

### User Roles
- `ADMIN` - Platform administrator
- `ORGANIZER` - Can create and manage quizzes
- `PARTICIPANT` - Can join and take quizzes (default)

### Question Types
- `MULTIPLE_CHOICE` - Multiple choice with options
- `TRUE_FALSE` - True or False
- `SHORT_ANSWER` - Text-based answer

### Session Status
- `IN_PROGRESS` - Currently taking quiz
- `COMPLETED` - Finished successfully
- `ABANDONED` - Left without completing
- `TIMED_OUT` - Exceeded time limit

---

## 🔒 **Authentication**

All endpoints except `/auth/register` and `/auth/login` require:
```
Authorization: Bearer <accessToken>
```

**Access Token**: Valid for 7 days
**Refresh Token**: Valid for 30 days

---

## ⚡ **Rate Limiting**

- **100 requests per minute** per IP
- Applies to all endpoints

---

## 🎯 **Workflow Examples**

### **For Quiz Organizers:**

1. Register/Login
2. Create a quiz (`POST /api/quiz`)
3. Add questions (`POST /api/question` or `/api/question/bulk`)
4. Share quiz code with participants
5. Monitor stats (`GET /api/quiz/:id/stats`)

### **For Quiz Participants:**

1. Register/Login
2. Join quiz by code (`POST /api/quiz/join`)
3. Start quiz session (`POST /api/session/start`)
4. Answer questions (`POST /api/session/:sessionId/answer`)
5. Complete quiz (`POST /api/session/:sessionId/complete`)
6. View results (`GET /api/session/my/results`)

---

## 🧪 **Testing the API**

Use **Postman**, **Thunder Client**, or **curl**:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!"
  }'

# Create Quiz (replace TOKEN)
curl -X POST http://localhost:3000/api/quiz \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Quiz",
    "duration": 15,
    "passingScore": 60
  }'
```

---

## 🎨 **Features**

✅ User authentication with JWT
✅ Role-based access (Organizer/Participant)
✅ Create unlimited quizzes
✅ Multiple question types
✅ Timed quizzes
✅ Quiz scheduling
✅ Auto-grading
✅ Leaderboards
✅ Quiz statistics
✅ Answer explanations
✅ Multiple attempts support
✅ Question shuffling
✅ Session tracking

---

## 📝 **Notes**

- Quiz codes are auto-generated (6 characters, unique)
- Participants cannot see correct answers until completion (if enabled)
- Only organizers can see quiz statistics
- Session data persists even if user disconnects
- All timestamps are in ISO 8601 format (UTC)

---

**Server Status**: ✅ **RUNNING**
**API Ready**: ✅ **YES**
**Database**: ✅ **Connected**

Happy Quizzing! 🎯
