import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';

const QuizResults = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

  const loadResults = async () => {
    try {
      const response = await sessionAPI.getSession(sessionId!);
      setSession(response.data);
    } catch (err) {
      alert('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={containerStyle}>Loading results...</div>;
  if (!session) return <div style={containerStyle}>Results not found</div>;

  const passed = session.quiz.passingScore
    ? (session.percentage || 0) >= session.quiz.passingScore
    : null;

  return (
    <div style={containerStyle}>
      <div style={resultsCardStyle}>
        <h1>Quiz Completed! 🎉</h1>
        
        <div style={scoreContainerStyle}>
          <div style={scoreCircleStyle}>
            <div style={percentageStyle}>{Math.round(session.percentage || 0)}%</div>
            <div style={scoreTextStyle}>
              {session.score} / {session.totalPoints} points
            </div>
          </div>
        </div>

        {passed !== null && (
          <div style={passed ? passedStyle : failedStyle}>
            {passed ? '✅ Passed!' : '❌ Did not pass'}
            {session.quiz.passingScore && ` (Required: ${session.quiz.passingScore}%)`}
          </div>
        )}

        <div style={statsStyle}>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{session.quiz.title}</div>
            <div style={statLabelStyle}>Quiz Title</div>
          </div>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{session.answers?.length || 0}</div>
            <div style={statLabelStyle}>Questions Answered</div>
          </div>
          <div style={statItemStyle}>
            <div style={statValueStyle}>
              {session.timeSpent ? `${Math.floor(session.timeSpent / 60)}:${(session.timeSpent % 60).toString().padStart(2, '0')}` : 'N/A'}
            </div>
            <div style={statLabelStyle}>Time Taken</div>
          </div>
        </div>

        {session.quiz.showAnswers && session.answers && (
          <div style={answersContainerStyle}>
            <h2>Your Answers</h2>
            {session.answers.map((answer: any, idx: number) => (
              <div key={answer.id} style={answerCardStyle}>
                <div style={answerHeaderStyle}>
                  <span style={questionNumberStyle}>Q{idx + 1}</span>
                  <span style={answer.isCorrect ? correctStyle : incorrectStyle}>
                    {answer.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                  <span>{answer.pointsEarned}/{answer.question.points} pts</span>
                </div>
                <p style={questionTextStyle}>{answer.question.question}</p>
                <div style={answerDetailsStyle}>
                  <div>
                    <strong>Your answer:</strong> {answer.answer}
                  </div>
                  {!answer.isCorrect && (
                    <div>
                      <strong>Correct answer:</strong> {answer.question.correctAnswer}
                    </div>
                  )}
                  {answer.question.explanation && (
                    <div style={explanationStyle}>
                      💡 {answer.question.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={actionsStyle}>
          <button style={btnStyle} onClick={() => navigate('/participant')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '2rem',
  minHeight: 'calc(100vh - 80px)',
};

const resultsCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

const scoreContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  margin: '2rem 0',
};

const scoreCircleStyle: React.CSSProperties = {
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
};

const percentageStyle: React.CSSProperties = {
  fontSize: '3rem',
  fontWeight: 'bold',
};

const scoreTextStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  marginTop: '0.5rem',
};

const passedStyle: React.CSSProperties = {
  background: '#2ecc71',
  color: 'white',
  padding: '1rem',
  borderRadius: '8px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  margin: '1rem 0',
};

const failedStyle: React.CSSProperties = {
  ...passedStyle,
  background: '#e74c3c',
};

const statsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  margin: '2rem 0',
};

const statItemStyle: React.CSSProperties = {
  padding: '1rem',
  background: '#ecf0f1',
  borderRadius: '8px',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '0.5rem',
};

const statLabelStyle: React.CSSProperties = {
  color: '#7f8c8d',
  fontSize: '0.9rem',
};

const answersContainerStyle: React.CSSProperties = {
  marginTop: '2rem',
  textAlign: 'left',
};

const answerCardStyle: React.CSSProperties = {
  background: '#f8f9fa',
  padding: '1.5rem',
  borderRadius: '8px',
  marginBottom: '1rem',
  border: '1px solid #ecf0f1',
};

const answerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  marginBottom: '1rem',
};

const questionNumberStyle: React.CSSProperties = {
  background: '#3498db',
  color: 'white',
  padding: '0.25rem 0.75rem',
  borderRadius: '4px',
  fontWeight: 'bold',
};

const correctStyle: React.CSSProperties = {
  color: '#2ecc71',
  fontWeight: 'bold',
};

const incorrectStyle: React.CSSProperties = {
  color: '#e74c3c',
  fontWeight: 'bold',
};

const questionTextStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  marginBottom: '1rem',
  color: '#2c3e50',
};

const answerDetailsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  color: '#7f8c8d',
};

const explanationStyle: React.CSSProperties = {
  background: '#fff3cd',
  padding: '0.75rem',
  borderRadius: '4px',
  marginTop: '0.5rem',
  color: '#856404',
};

const actionsStyle: React.CSSProperties = {
  marginTop: '2rem',
};

const btnStyle: React.CSSProperties = {
  padding: '1rem 2rem',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default QuizResults;
