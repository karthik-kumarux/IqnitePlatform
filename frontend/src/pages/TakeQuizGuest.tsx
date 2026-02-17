import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Quiz, Question } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TakeQuizGuest = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const name = sessionStorage.getItem('guestParticipantName');
    const storedQuizId = sessionStorage.getItem('guestQuizId');
    
    if (!name || storedQuizId !== id) {
      navigate('/join');
      return;
    }
    
    setParticipantName(name);
    startQuiz();
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (!quiz || !quiz.duration || submitting) return;

    const durationInSeconds = quiz.duration * 60;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = durationInSeconds - elapsed;

    if (remaining <= 0) {
      handleSubmit();
      return;
    }

    setTimeRemaining(remaining);

    const timer = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTime) / 1000);
      const newRemaining = durationInSeconds - newElapsed;

      if (newRemaining <= 0) {
        clearInterval(timer);
        handleSubmit();
      } else {
        setTimeRemaining(newRemaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, submitting]);

  const startQuiz = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        axios.get(`${API_URL}/quiz/${id}`),
        axios.get(`${API_URL}/quiz/${id}/questions`),
      ]);
      
      setQuiz(quizRes.data);
      setQuestions(questionsRes.data.sort((a: Question, b: Question) => a.order - b.order));

      // Create guest session
      const guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(guestSessionId);
      
      sessionStorage.setItem('guestSessionId', guestSessionId);
      sessionStorage.setItem('guestSessionStart', startTime.toString());
      sessionStorage.setItem('guestAnswers', JSON.stringify({}));
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load quiz:', err);
      alert('Failed to load quiz');
      navigate('/join');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    sessionStorage.setItem('guestAnswers', JSON.stringify(newAnswers));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Calculate score
      let score = 0;
      let totalPoints = 0;
      const answersArray = questions.map((question) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        const pointsEarned = isCorrect ? question.points : 0;
        if (isCorrect) score += question.points;
        totalPoints += question.points;
        
        return {
          questionId: question.id,
          question: {
            question: question.question,
            correctAnswer: question.correctAnswer,
            points: question.points,
            explanation: question.explanation,
          },
          userAnswer: userAnswer || '',
          answer: userAnswer || '', // For backend
          isCorrect,
          pointsEarned,
        };
      });

      const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Submit to backend
      await axios.post(`${API_URL}/quiz/guest/submit`, {
        quizId: id,
        guestName: participantName,
        sessionId: sessionId,
        score,
        totalPoints,
        timeSpent,
        answers: answersArray.map(a => ({
          questionId: a.questionId,
          answer: a.answer,
          pointsEarned: a.pointsEarned,
        })),
      });

      const resultData = {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          showAnswers: true,
          passingScore: quiz.passingScore || null,
        },
        participantName,
        score,
        totalPoints,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        answers: answersArray,
      };

      sessionStorage.setItem('guestQuizResults', JSON.stringify(resultData));
      navigate(`/quiz/${id}/results`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading quiz...</div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>Quiz not found or has no questions</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={containerStyle}>
      <div style={quizCardStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>{quiz.title}</h1>
            <p style={participantStyle}>Participant: {participantName}</p>
          </div>
          {timeRemaining !== null && (
            <div style={{
              ...timerStyle,
              color: timeRemaining < 60 ? '#ef4444' : timeRemaining < 300 ? '#f59e0b' : '#10b981'
            }}>
              <span style={{ fontSize: '0.9rem' }}>⏱️ Time Left:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        <div style={progressBarContainerStyle}>
          <div style={{ ...progressBarStyle, width: `${progress}%` }}></div>
        </div>

        <div style={questionContainerStyle}>
          <div style={questionHeaderStyle}>
            <span style={questionNumberStyle}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span style={pointsStyle}>{currentQuestion.points} points</span>
          </div>

          <h2 style={questionTextStyle}>{currentQuestion.question}</h2>

          {currentQuestion.type === 'MULTIPLE_CHOICE' && (
            <div style={optionsContainerStyle}>
              {(currentQuestion.options as string[]).map((option, index) => (
                <label key={index} style={optionLabelStyle}>
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    style={radioStyle}
                  />
                  <span style={optionTextStyle}>{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'TRUE_FALSE' && (
            <div style={optionsContainerStyle}>
              <label style={optionLabelStyle}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value="true"
                  checked={answers[currentQuestion.id] === 'true'}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  style={radioStyle}
                />
                <span style={optionTextStyle}>True</span>
              </label>
              <label style={optionLabelStyle}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value="false"
                  checked={answers[currentQuestion.id] === 'false'}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  style={radioStyle}
                />
                <span style={optionTextStyle}>False</span>
              </label>
            </div>
          )}

          {currentQuestion.type === 'SHORT_ANSWER' && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here"
              style={textInputStyle}
            />
          )}
        </div>

        <div style={navigationStyle}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={currentQuestionIndex === 0 ? disabledButtonStyle : secondaryButtonStyle}
          >
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={submitButtonStyle}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button onClick={handleNext} style={primaryButtonStyle}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const quizCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  maxWidth: '800px',
  width: '100%',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const timerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  padding: '1rem',
  borderRadius: '8px',
  minWidth: '120px',
  textAlign: 'center',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
};

const participantStyle: React.CSSProperties = {
  fontSize: '1rem',
  opacity: 0.9,
};

const progressBarContainerStyle: React.CSSProperties = {
  height: '8px',
  backgroundColor: '#e0e0e0',
  width: '100%',
};

const progressBarStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#4caf50',
  transition: 'width 0.3s ease',
};

const questionContainerStyle: React.CSSProperties = {
  padding: '2rem',
};

const questionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '1rem',
};

const questionNumberStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '0.9rem',
};

const pointsStyle: React.CSSProperties = {
  color: '#667eea',
  fontWeight: 'bold',
  fontSize: '0.9rem',
};

const questionTextStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  color: '#2c3e50',
  marginBottom: '1.5rem',
};

const optionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const optionLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const radioStyle: React.CSSProperties = {
  marginRight: '1rem',
  width: '20px',
  height: '20px',
  cursor: 'pointer',
};

const optionTextStyle: React.CSSProperties = {
  fontSize: '1rem',
  color: '#2c3e50',
};

const textInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem',
  fontSize: '1rem',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  boxSizing: 'border-box',
};

const navigationStyle: React.CSSProperties = {
  padding: '2rem',
  display: 'flex',
  justifyContent: 'space-between',
  borderTop: '1px solid #e0e0e0',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: 'white',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#667eea',
  background: 'white',
  border: '2px solid #667eea',
  borderRadius: '8px',
  cursor: 'pointer',
};

const submitButtonStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: 'white',
  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

const disabledButtonStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#999',
  background: '#e0e0e0',
  border: 'none',
  borderRadius: '8px',
  cursor: 'not-allowed',
};

const loadingStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '1.5rem',
  textAlign: 'center',
};

const errorStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '1.5rem',
  textAlign: 'center',
};

export default TakeQuizGuest;
