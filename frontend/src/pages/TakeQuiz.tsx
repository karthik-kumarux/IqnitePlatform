import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, questionAPI, sessionAPI } from '../services/api';
import type { Quiz, Question } from '../types';

const TakeQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      startQuiz();
    }
  }, [id]);

  const startQuiz = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        quizAPI.getById(id!),
        questionAPI.getByQuiz(id!),
      ]);
      
      setQuiz(quizRes.data);
      setQuestions(questionsRes.data.sort((a: Question, b: Question) => a.order - b.order));

      const sessionRes = await sessionAPI.start(id!);
      setSessionId(sessionRes.data.id);
      setStartTime(Date.now());
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start quiz');
      navigate('/participant');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const question = questions[currentQuestionIndex];
    setAnswers({ ...answers, [question.id]: answer });
  };

  const handleNext = async () => {
    const question = questions[currentQuestionIndex];
    const answer = answers[question.id];

    if (answer && sessionId) {
      try {
        await sessionAPI.submitAnswer(sessionId, {
          questionId: question.id,
          answer,
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
        });
      } catch (err) {
        console.error('Failed to submit answer:', err);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await completeQuiz();
    }
  };

  const completeQuiz = async () => {
    if (!sessionId) return;
    
    setSubmitting(true);
    try {
      await sessionAPI.complete(sessionId);
      navigate(`/participant/quiz/${id}/results/${sessionId}`);
    } catch (err) {
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={containerStyle}>Loading quiz...</div>;
  if (!quiz || questions.length === 0) {
    return <div style={containerStyle}>No questions available</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div style={containerStyle}>
      <div style={quizHeaderStyle}>
        <h1>{quiz.title}</h1>
        <div style={progressBarStyle}>
          <div style={{ ...progressFillStyle, width: `${progress}%` }} />
        </div>
        <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
      </div>

      <div style={questionCardStyle}>
        <div style={questionHeaderStyle}>
          <span style={typeStyle}>{currentQuestion.type}</span>
          <span>{currentQuestion.points} points</span>
        </div>

        <h2 style={questionTextStyle}>{currentQuestion.question}</h2>

        <div style={answersStyle}>
          {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options ? (
            currentQuestion.options.map((option, idx) => (
              <label key={idx} style={optionLabelStyle}>
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswer(option)}
                  style={radioStyle}
                />
                <span style={optionTextStyle}>{option}</span>
              </label>
            ))
          ) : currentQuestion.type === 'TRUE_FALSE' ? (
            <>
              <label style={optionLabelStyle}>
                <input
                  type="radio"
                  name="answer"
                  value="true"
                  checked={answers[currentQuestion.id] === 'true'}
                  onChange={() => handleAnswer('true')}
                  style={radioStyle}
                />
                <span style={optionTextStyle}>True</span>
              </label>
              <label style={optionLabelStyle}>
                <input
                  type="radio"
                  name="answer"
                  value="false"
                  checked={answers[currentQuestion.id] === 'false'}
                  onChange={() => handleAnswer('false')}
                  style={radioStyle}
                />
                <span style={optionTextStyle}>False</span>
              </label>
            </>
          ) : (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
              style={textInputStyle}
            />
          )}
        </div>

        <div style={actionsStyle}>
          {currentQuestionIndex > 0 && (
            <button
              style={btnSecondaryStyle}
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            >
              ← Previous
            </button>
          )}
          <button
            style={btnPrimaryStyle}
            onClick={handleNext}
            disabled={!answers[currentQuestion.id] || submitting}
          >
            {currentQuestionIndex === questions.length - 1
              ? submitting ? 'Submitting...' : 'Submit Quiz'
              : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem',
  minHeight: 'calc(100vh - 80px)',
};

const quizHeaderStyle: React.CSSProperties = {
  marginBottom: '2rem',
  textAlign: 'center',
};

const progressBarStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  background: '#ecf0f1',
  borderRadius: '4px',
  overflow: 'hidden',
  margin: '1rem 0',
};

const progressFillStyle: React.CSSProperties = {
  height: '100%',
  background: '#3498db',
  transition: 'width 0.3s ease',
};

const questionCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const questionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '1.5rem',
  color: '#7f8c8d',
};

const typeStyle: React.CSSProperties = {
  background: '#ecf0f1',
  padding: '0.25rem 0.75rem',
  borderRadius: '4px',
  fontSize: '0.9rem',
};

const questionTextStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  color: '#2c3e50',
  marginBottom: '2rem',
};

const answersStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem',
};

const optionLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  border: '2px solid #ecf0f1',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const radioStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  cursor: 'pointer',
};

const optionTextStyle: React.CSSProperties = {
  flex: 1,
  fontSize: '1.1rem',
};

const textInputStyle: React.CSSProperties = {
  padding: '1rem',
  border: '2px solid #ecf0f1',
  borderRadius: '8px',
  fontSize: '1.1rem',
  width: '100%',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
};

const btnPrimaryStyle: React.CSSProperties = {
  flex: 1,
  padding: '1rem',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: '1rem 2rem',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default TakeQuiz;
