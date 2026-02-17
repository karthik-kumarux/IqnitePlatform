import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const JoinQuiz = () => {
  const [quizCode, setQuizCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Join lobby instead of directly taking quiz
      const lobbyResponse = await axios.post(`${API_URL}/quiz/lobby/join`, { 
        participantName,
        quizCode
      });

      console.log('Lobby response:', lobbyResponse.data);

      if (!lobbyResponse.data.quizId) {
        throw new Error('Quiz ID not received from server');
      }

      // Store lobby and participant info in session storage
      sessionStorage.setItem('guestParticipantName', participantName);
      sessionStorage.setItem('guestQuizId', lobbyResponse.data.quizId);
      sessionStorage.setItem('lobbyId', lobbyResponse.data.lobbyId);
      
      // Navigate to lobby waiting room
      navigate(`/quiz/${lobbyResponse.data.quizId}/lobby`);
    } catch (err: any) {
      console.error('Join error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to join quiz. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <h1>Join a Quiz</h1>
        <p style={subtitleStyle}>Enter the quiz code to get started - no registration required!</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleJoinQuiz} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Your Name</label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Enter your name"
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Quiz Code</label>
            <input
              type="text"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code (e.g., ABC123)"
              maxLength={6}
              required
              style={codeInputStyle}
            />
          </div>

          <button type="submit" disabled={loading || !participantName || quizCode.length !== 6} style={btnStyle}>
            {loading ? 'Joining...' : 'Join Quiz →'}
          </button>
        </form>

        <div style={infoStyle}>
          <p>📝 No account needed - just your name and the quiz code</p>
          <p>🎯 Quiz codes are exactly 6 characters</p>
          <p>🏆 Get instant results after completing the quiz</p>
        </div>

        <div style={linkContainerStyle}>
          <p style={linkTextStyle}>
            Already have an account? <a href="/login" style={linkStyle}>Login</a>
          </p>
          <p style={linkTextStyle}>
            Want to create quizzes? <a href="/register" style={linkStyle}>Register as Organizer</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
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
};

const subtitleStyle: React.CSSProperties = {
  color: '#7f8c8d',
  marginBottom: '2rem',
  textAlign: 'center',
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
  gap: '1.5rem',
  marginBottom: '2rem',
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#2c3e50',
  fontSize: '0.95rem',
};

const inputStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '1rem',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
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
  marginTop: '0.5rem',
};

const infoStyle: React.CSSProperties = {
  textAlign: 'left',
  background: '#ecf0f1',
  padding: '1.5rem',
  borderRadius: '8px',
  marginBottom: '1.5rem',
  fontSize: '0.95rem',
};

const linkContainerStyle: React.CSSProperties = {
  borderTop: '1px solid #ecf0f1',
  paddingTop: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const linkTextStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#7f8c8d',
  fontSize: '0.9rem',
};

const linkStyle: React.CSSProperties = {
  color: '#3498db',
  textDecoration: 'none',
  fontWeight: '600',
};

export default JoinQuiz;
