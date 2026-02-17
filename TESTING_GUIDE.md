# IQnite Testing Guide 🧪

Quick guide to test all features of your IQnite quiz platform.

## 🚀 Prerequisites

Ensure both servers are running:
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev
# Should show: http://localhost:3000

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Should show: http://localhost:5173
```

## ✅ Testing Checklist

### 1. Home Page
- [ ] Visit http://localhost:5173
- [ ] Verify gradient purple background
- [ ] See "Welcome to IQnite 🎯" heading
- [ ] Two feature cards visible (Organizers & Participants)
- [ ] "Get Started" button visible

### 2. Registration - Organizer
- [ ] Click "Register" in navbar
- [ ] Select "Organizer" from role dropdown
- [ ] Fill in form:
  - Email: organizer@test.com
  - Username: testorganizer
  - First Name: Test
  - Last Name: Organizer
  - Password: Test123!@#
- [ ] Click "Register"
- [ ] Should redirect to Organizer Dashboard

### 3. Create Quiz
- [ ] Click "+ Create Quiz" button
- [ ] Fill in quiz details:
  - Title: "JavaScript Basics Quiz"
  - Description: "Test your JavaScript knowledge"
  - Duration: 30 (minutes)
  - Passing Score: 70 (%)
  - Max Attempts: 3
  - Check "Show Answers After Submission"
- [ ] Click "Create Quiz"
- [ ] Note the 6-character quiz code (e.g., ABC123)

### 4. Add Questions
- [ ] In quiz details page, click "+ Add Question"
- [ ] **Question 1 - Multiple Choice:**
  - Type: Multiple Choice
  - Question: "What is the correct way to declare a variable?"
  - Options: 
    - var x = 5
    - variable x = 5
    - v x = 5
    - declare x = 5
  - Correct Answer: var x = 5
  - Points: 10
  - Explanation: "var, let, and const are used to declare variables"
  - Click "Add Question"

- [ ] **Question 2 - True/False:**
  - Type: True/False
  - Question: "JavaScript is case-sensitive"
  - Correct Answer: true
  - Points: 5
  - Click "Add Question"

- [ ] **Question 3 - Short Answer:**
  - Type: Short Answer
  - Question: "What method adds an element to the end of an array?"
  - Correct Answer: push
  - Points: 5
  - Click "Add Question"

- [ ] Verify all 3 questions appear in quiz details
- [ ] Note the quiz code for next steps

### 5. Logout & Register Participant
- [ ] Click "Logout" in navbar
- [ ] Click "Register"
- [ ] Select "Participant" role
- [ ] Fill in form:
  - Email: participant@test.com
  - Username: testparticipant
  - First Name: Test
  - Last Name: Participant
  - Password: Test123!@#
- [ ] Click "Register"
- [ ] Should redirect to Participant Dashboard

### 6. Join Quiz
- [ ] See "Join a Quiz" page
- [ ] Enter the 6-character quiz code from step 3
- [ ] Click "Join Quiz →"
- [ ] Should start the quiz session

### 7. Take Quiz
- [ ] **Question 1 (Multiple Choice):**
  - See progress bar (Question 1 of 3)
  - Read question
  - Select "var x = 5"
  - Click "Next →"

- [ ] **Question 2 (True/False):**
  - Progress bar shows Question 2 of 3
  - Select "True"
  - Click "Next →"

- [ ] **Question 3 (Short Answer):**
  - Progress bar shows Question 3 of 3
  - Type "push"
  - Click "Submit Quiz"

### 8. View Results
- [ ] Should see "Quiz Completed! 🎉"
- [ ] Score circle shows 100% (20/20 points)
- [ ] See "✅ Passed!" badge
- [ ] Verify statistics:
  - Quiz Title: JavaScript Basics Quiz
  - Questions Answered: 3
  - Time Taken: (should show time)
- [ ] See "Your Answers" section
- [ ] All 3 questions marked ✅ Correct
- [ ] Explanations visible (for Q1)
- [ ] Click "Back to Dashboard"

### 9. Test Failed Quiz (Optional)
- [ ] Join the same quiz again using code
- [ ] Answer questions incorrectly:
  - Q1: Select wrong option
  - Q2: Select False
  - Q3: Type "pop"
- [ ] Submit quiz
- [ ] Should see lower score
- [ ] See "❌ Did not pass" if below 70%
- [ ] See correct answers highlighted

### 10. Organizer - View Statistics
- [ ] Logout as participant
- [ ] Login as organizer (organizer@test.com / Test123!@#)
- [ ] Go to Organizer Dashboard
- [ ] Click "View" on the quiz
- [ ] Should see:
  - Quiz Code
  - Question count: 3
  - Attempts: 2 (or number of times taken)
- [ ] Verify questions are listed

### 11. Edit Quiz
- [ ] Click "Edit" on quiz card
- [ ] Update quiz title to "JavaScript Basics - Updated"
- [ ] Change passing score to 80%
- [ ] Save changes
- [ ] Verify updates reflected

### 12. Delete Question
- [ ] In quiz details, click "Delete" on a question
- [ ] Confirm deletion
- [ ] Verify question removed
- [ ] Question count updated

### 13. API Health Check
- [ ] Open browser: http://localhost:3000/api/health
- [ ] Should see: `{"status":"ok","database":"connected"}`

## 🐛 Common Issues & Solutions

### Frontend shows blank page
- Check browser console (F12) for errors
- Verify backend is running on port 3000
- Check .env file has correct API_URL

### Cannot login/register
- Check backend terminal for errors
- Verify database is running: `psql -U iqnite_user -d iqnite`
- Check JWT_SECRET is set in backend .env

### Quiz code not working
- Ensure code is exactly 6 characters
- Codes are case-sensitive
- Verify quiz exists in organizer's dashboard

### Questions not saving
- Check backend logs for validation errors
- Verify question type matches (MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER)
- For multiple choice, ensure at least 2 options

### Auto-grading not working
- Check correctAnswer exactly matches submission
- For true/false, use lowercase "true" or "false"
- For short answer, match is case-sensitive

## 📊 Test Results Example

After completing all tests, you should have:
- ✅ 2 user accounts (organizer + participant)
- ✅ 1 quiz with 3 questions
- ✅ 2+ quiz sessions (attempts)
- ✅ All features working correctly

## 🎯 Advanced Testing

### Test Edge Cases
1. **Max Attempts:**
   - Take same quiz 3 times (max attempts)
   - 4th attempt should fail

2. **Empty Quiz:**
   - Create quiz without questions
   - Try to join - should handle gracefully

3. **Long Content:**
   - Create question with very long text
   - Verify UI handles it properly

4. **Special Characters:**
   - Use special characters in questions
   - Test with emojis 🎯
   - Verify proper escaping

5. **Concurrent Users:**
   - Open in multiple browsers
   - Multiple participants take same quiz
   - Verify no conflicts

## 🔍 Debug Mode

To see detailed API calls:

1. Open Browser DevTools (F12)
2. Go to Network tab
3. Filter: Fetch/XHR
4. Take any action (login, create quiz, etc.)
5. Inspect request/response

### Sample API Calls
```javascript
// Login
POST http://localhost:3000/api/auth/login
Body: { "email": "test@test.com", "password": "Test123!@#" }

// Create Quiz
POST http://localhost:3000/api/quiz
Headers: { "Authorization": "Bearer <token>" }
Body: { "title": "Test Quiz", ... }

// Join Quiz
POST http://localhost:3000/api/quiz/join
Headers: { "Authorization": "Bearer <token>" }
Body: { "code": "ABC123" }
```

## ✅ Test Complete

If all tests pass, your IQnite platform is **fully functional** and ready for production deployment!

---

**Happy Testing!** 🎉
