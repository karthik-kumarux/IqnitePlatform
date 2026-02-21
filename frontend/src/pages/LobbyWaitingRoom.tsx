import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { websocketService } from '../services/websocket';

const API_URL = 'http://localhost:3000/api';

interface QuizStatus {
  id: string;
  title: string;
  status: 'DRAFT' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  code: string;
}

function LobbyWaitingRoom() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const [quizStatus, setQuizStatus] = useState<QuizStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const participantName = sessionStorage.getItem('guestParticipantName') || 'Guest';

  useEffect(() => {
    // Check if quizId exists
    if (!quizId) {
      setError('Invalid quiz ID. Please join a quiz from the join page.');
      setLoading(false);
      return;
    }

    const initializeWaitingRoom = async () => {
      // Initial status check
      try {
        const response = await axios.get(`${API_URL}/quiz/${quizId}/status`);
        setQuizStatus(response.data);
        setLoading(false);

        // If quiz has already started, redirect immediately
        if (response.data.status === 'IN_PROGRESS') {
          navigate(`/quiz/${quizId}/take`);
          return;
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to check quiz status');
        setLoading(false);
        return;
      }

      // Connect to WebSocket and join room
      websocketService.connect();
      
      // Wait a bit for connection to establish
      setTimeout(() => {
        websocketService.joinQuizRoom(quizId);
        console.log('🔗 Connected to WebSocket, joined quiz room:', quizId);
      }, 100);
    };

    initializeWaitingRoom();

    // Listen for quiz started event
    const handleQuizStarted = (data: any) => {
      console.log('🚀 Quiz started event received:', data);
      navigate(`/quiz/${quizId}/take`);
    };

    const handleQuizStatusChange = (data: any) => {
      console.log('📊 Quiz status changed:', data);
      if (data.status === 'IN_PROGRESS') {
        navigate(`/quiz/${quizId}/take`);
      }
    };

    // Listen for being removed by organizer
    const handleParticipantRemoved = (data: any) => {
      const myLobbyId = sessionStorage.getItem('lobbyId');
      if (data.lobbyId === myLobbyId) {
        console.log('🚫 You have been removed from the lobby by the organizer');
        // Clear session storage
        sessionStorage.removeItem('lobbyId');
        sessionStorage.removeItem('guestParticipantName');
        sessionStorage.removeItem('guestQuizId');
        // Show alert and redirect
        alert('You have been removed from the lobby by the organizer.');
        navigate('/join');
      }
    };

    websocketService.on('quizStarted', handleQuizStarted);
    websocketService.on('quizStatusChange', handleQuizStatusChange);
    websocketService.on('participantRemoved', handleParticipantRemoved);

    return () => {
      websocketService.off('quizStarted', handleQuizStarted);
      websocketService.off('quizStatusChange', handleQuizStatusChange);
      websocketService.off('participantRemoved', handleParticipantRemoved);
      if (quizId) {
        websocketService.leaveQuizRoom(quizId);
      }
    };
  }, [quizId, navigate]);

  const handleLeaveLobby = () => {
    const lobbyId = sessionStorage.getItem('lobbyId');
    if (lobbyId) {
      axios.delete(`${API_URL}/quiz/lobby/${lobbyId}`).catch(() => {});
    }
    sessionStorage.removeItem('lobbyId');
    sessionStorage.removeItem('guestParticipantName');
    sessionStorage.removeItem('guestQuizId');
    navigate('/join');
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={spinnerStyle}></div>
          <p style={{ marginTop: '1.5rem', color: '#7f8c8d', fontSize: '1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2c3e50', marginBottom: '1rem' }}>Error</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '2rem', fontSize: '1rem' }}>{error}</p>
          <button
            onClick={() => navigate('/join')}
            style={{
              ...leaveButtonStyle,
              background: '#667eea',
              color: 'white',
              border: 'none',
            }}
          >
            Back to Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconContainerStyle}>
          <span style={iconStyle}>⏳</span>
        </div>
        
        <h1 style={titleStyle}>Waiting in Lobby</h1>
        <p style={subtitleStyle}>
          Welcome, <span style={nameHighlightStyle}>{participantName}</span>!
        </p>

        <div style={quizInfoStyle}>
          <h2 style={quizTitleStyle}>{quizStatus?.title}</h2>
          <div style={quizMetaStyle}>
            <div style={codeContainerStyle}>
              <span style={labelStyle}>Quiz Code:</span>
              <span style={codeStyle}>{quizStatus?.code}</span>
            </div>
            <div style={statusContainerStyle}>
              <span style={pulseStyle}></span>
              <span style={statusTextStyle}>Waiting for organizer</span>
            </div>
          </div>
        </div>

        <div style={infoBoxStyle}>
          <span style={infoIconStyle}>ℹ️</span>
          <div>
            <h3 style={infoTitleStyle}>Please Wait</h3>
            <p style={infoTextStyle}>
              The quiz organizer will start the quiz shortly. You'll be automatically redirected when it begins.
            </p>
          </div>
        </div>

        <button style={leaveButtonStyle} onClick={handleLeaveLobby}>
          Leave Lobby
        </button>

        <div style={loadingContainerStyle}>
          <div style={dotsStyle}>
            <div style={{ ...dotStyle, animationDelay: '0s' }}>•</div>
            <div style={{ ...dotStyle, animationDelay: '0.2s' }}>•</div>
            <div style={{ ...dotStyle, animationDelay: '0.4s' }}>•</div>
          </div>
          <p style={loadingTextStyle}>Checking for quiz start...</p>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  maxWidth: '600px',
  width: '100%',
  padding: '3rem',
  textAlign: 'center',
};

const iconContainerStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80px',
  height: '80px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '50%',
  marginBottom: '1.5rem',
};

const iconStyle: React.CSSProperties = {
  fontSize: '2.5rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '0.5rem',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: '#7f8c8d',
  marginBottom: '2rem',
};

const nameHighlightStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#667eea',
};

const quizInfoStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
};

const quizTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#2c3e50',
  marginBottom: '1rem',
};

const quizMetaStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
};

const codeContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#7f8c8d',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#667eea',
  background: 'white',
  padding: '0.25rem 0.75rem',
  borderRadius: '6px',
};

const statusContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const pulseStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  background: '#f39c12',
  borderRadius: '50%',
  animation: 'pulse 2s infinite',
};

const statusTextStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#7f8c8d',
};

const infoBoxStyle: React.CSSProperties = {
  background: '#e3f2fd',
  border: '2px solid #90caf9',
  borderRadius: '12px',
  padding: '1.25rem',
  display: 'flex',
  gap: '1rem',
  textAlign: 'left',
  marginBottom: '2rem',
};

const infoIconStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  flexShrink: 0,
};

const infoTitleStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#1565c0',
  marginBottom: '0.5rem',
  fontSize: '1rem',
};

const infoTextStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#1976d2',
  lineHeight: '1.5',
  margin: 0,
};

const leaveButtonStyle: React.CSSProperties = {
  padding: '0.875rem 2rem',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  background: 'white',
  color: '#5f6368',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
  marginBottom: '2rem',
};

const loadingContainerStyle: React.CSSProperties = {
  marginTop: '2rem',
};

const dotsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.5rem',
  marginBottom: '0.75rem',
};

const dotStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  color: '#667eea',
  animation: 'bounce 1.4s infinite ease-in-out',
};

const loadingTextStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#95a5a6',
  margin: 0,
};

const spinnerStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  border: '4px solid #e0e0e0',
  borderTop: '4px solid #667eea',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};

export default LobbyWaitingRoom;
