import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';

const ParticipantDashboard = () => {
  const [quizCode, setQuizCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await quizAPI.joinByCode(quizCode);
      const quiz = response.data;
      navigate(`/participant/quiz/${quiz.id}/take`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <h1>Join a Quiz</h1>
        <p style={subtitleStyle}>Enter the quiz code provided by your organizer</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleJoinQuiz} style={formStyle}>
          <input
            type="text"
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
            placeholder="Enter Quiz Code (e.g., ABC123)"
            maxLength={6}
            required
            style={codeInputStyle}
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Joining...' : 'Join Quiz →'}
          </button>
        </form>

        <div style={infoStyle}>
          <p>📝 Quiz codes are 6 characters long</p>
          <p>🎯 You can take quizzes multiple times if allowed</p>
          <p>🏆 View your results after completing a quiz</p>
        </div>

        <button
          style={btnSecondaryStyle}
          onClick={() => navigate('/participant/results')}
        >
          View My Results
        </button>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 80px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '2rem',
};

const heroStyle: React.CSSProperties = {
  background: 'white',
  padding: '3rem',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
};

const subtitleStyle: React.CSSProperties = {
  color: '#7f8c8d',
  marginBottom: '2rem',
};

const errorStyle: React.CSSProperties = {
  background: '#e74c3c',
  color: 'white',
  padding: '1rem',
  borderRadius: '4px',
  marginBottom: '1rem',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem',
};

const codeInputStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '1.5rem',
  textAlign: 'center',
  border: '2px solid #3498db',
  borderRadius: '8px',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  letterSpacing: '0.2rem',
};

const btnStyle: React.CSSProperties = {
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
  padding: '0.75rem 1.5rem',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '1rem',
};

const infoStyle: React.CSSProperties = {
  textAlign: 'left',
  background: '#ecf0f1',
  padding: '1.5rem',
  borderRadius: '8px',
  marginBottom: '1rem',
};

export default ParticipantDashboard;
