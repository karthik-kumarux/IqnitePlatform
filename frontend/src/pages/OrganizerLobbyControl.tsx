import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { websocketService } from '../services/websocket';

const API_URL = 'http://localhost:3000/api';

interface LobbyParticipant {
  id: string;
  participantName: string;
  joinedAt: string;
}

interface Quiz {
  id: string;
  title: string;
  code: string;
  status: 'DRAFT' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  description?: string;
}

export default function OrganizerLobbyControl() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) {
      setError('Invalid quiz ID');
      setLoading(false);
      return;
    }
    
    const initializeLobby = async () => {
      // Initial fetch
      await fetchQuizAndParticipants();

      // Connect to WebSocket and wait for connection
      websocketService.connect();
      
      // Small delay to ensure connection is established
      setTimeout(() => {
        websocketService.joinQuizRoom(quizId);
      }, 100);
    };

    initializeLobby();

    // Listen for real-time updates
    const handleParticipantJoined = (participant: LobbyParticipant) => {
      console.log('✅ Participant joined:', participant);
      setParticipants((prev) => {
        // Check if participant already exists
        if (prev.some(p => p.id === participant.id)) {
          return prev;
        }
        return [...prev, participant];
      });
    };

    const handleParticipantLeft = (data: { participantId: string }) => {
      console.log('❌ Participant left:', data.participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== data.participantId));
    };

    const handleQuizStatusChange = (data: { status: string }) => {
      console.log('📊 Quiz status changed:', data.status);
      if (data.status === 'IN_PROGRESS') {
        navigate(`/organizer/quiz/${quizId}/live`);
      }
    };

    websocketService.on('participantJoined', handleParticipantJoined);
    websocketService.on('participantLeft', handleParticipantLeft);
    websocketService.on('quizStatusChange', handleQuizStatusChange);

    return () => {
      websocketService.off('participantJoined', handleParticipantJoined);
      websocketService.off('participantLeft', handleParticipantLeft);
      websocketService.off('quizStatusChange', handleQuizStatusChange);
      if (quizId) {
        websocketService.leaveQuizRoom(quizId);
      }
    };
  }, [quizId]);

  const fetchQuizAndParticipants = async () => {
    if (!quizId) return;
    
    try {
      const [quizRes, participantsRes] = await Promise.all([
        axios.get(`${API_URL}/quiz/${quizId}/status`),
        axios.get(`${API_URL}/quiz/${quizId}/lobby/participants`),
      ]);

      setQuiz(quizRes.data);
      setParticipants(participantsRes.data);
      setLoading(false);

      // If quiz has started, redirect to live dashboard
      if (quizRes.data.status === 'IN_PROGRESS') {
        navigate(`/organizer/quiz/${quizId}/live`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (participants.length === 0) {
      alert('No participants in the lobby. Wait for participants to join before starting.');
      return;
    }

    if (!accessToken) {
      alert('You are not logged in. Please login again.');
      navigate('/login');
      return;
    }

    setStarting(true);
    try {
      console.log('Starting quiz with token:', accessToken?.substring(0, 20) + '...');
      await axios.post(
        `${API_URL}/quiz/${quizId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      // Clear the lobby after starting
      await axios.delete(`${API_URL}/quiz/${quizId}/lobby/clear`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      navigate(`/organizer/quiz/${quizId}/live`);
    } catch (err: any) {
      console.error('Start quiz error:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Failed to start quiz';
      if (err.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        setError(errorMsg);
      }
      setStarting(false);
    }
  };

  const handleRemoveParticipant = async (lobbyId: string) => {
    try {
      await axios.delete(`${API_URL}/quiz/lobby/${lobbyId}`);
      setParticipants(participants.filter(p => p.id !== lobbyId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove participant');
    }
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={spinnerStyle}></div>
        <p style={loadingTextStyle}>Loading lobby...</p>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div style={errorContainerStyle}>
        <div style={errorCardStyle}>
          <div style={errorIconStyle}>⚠️</div>
          <h2 style={errorTitleStyle}>Error</h2>
          <p style={errorMessageStyle}>{error}</p>
          <button style={errorButtonStyle} onClick={() => navigate('/organizer/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={mainCardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={quizTitleStyle}>{quiz?.title}</h1>
            <div style={quizCodeContainerStyle}>
              <span style={codeLabel}>Quiz Code:</span>
              <span style={codeValueStyle}>{quiz?.code}</span>
            </div>
            {quiz?.description && (
              <p style={descriptionStyle}>{quiz.description}</p>
            )}
          </div>
          <button style={backButtonStyle} onClick={() => navigate('/organizer/dashboard')}>
            ← Back
          </button>
        </div>

        {/* Participants Count Bar */}
        <div style={countBarStyle}>
          <div style={countInfoStyle}>
            <div style={participantBadgeStyle}>
              {participants.length}
            </div>
            <div>
              <h2 style={countTitleStyle}>
                {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'} Waiting
              </h2>
              <p style={countSubtitleStyle}>Ready to start the quiz</p>
            </div>
          </div>
          <button
            onClick={handleStartQuiz}
            disabled={starting || participants.length === 0}
            style={
              participants.length === 0
                ? startButtonDisabledStyle
                : starting
                ? startButtonLoadingStyle
                : startButtonStyle
            }
          >
            {starting ? '⏳ Starting...' : '🚀 Start Quiz'}
          </button>
        </div>

        {/* Participants List */}
        <div style={participantsContainerStyle}>
          {participants.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>⏳</div>
              <h3 style={emptyTitleStyle}>Waiting for Participants</h3>
              <p style={emptyMessageStyle}>
                Share the quiz code <span style={emptyCodeStyle}>{quiz?.code}</span> with participants
              </p>
              <p style={emptySubMessageStyle}>Participants will appear here when they join</p>
            </div>
          ) : (
            <div>
              <h3 style={listTitleStyle}>Participants in Lobby</h3>
              <div style={participantListStyle}>
                {participants.map((participant, index) => (
                  <div key={participant.id} style={participantCardStyle}>
                    <div style={participantInfoStyle}>
                      <div style={participantNumberStyle}>
                        {index + 1}
                      </div>
                      <div>
                        <p style={participantNameStyle}>{participant.participantName}</p>
                        <p style={participantTimeStyle}>
                          Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      style={removeButtonStyle}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={instructionsBoxStyle}>
          <span style={instructionsIconStyle}>💡</span>
          <div>
            <h4 style={instructionsTitleStyle}>Instructions</h4>
            <ul style={instructionsListStyle}>
              <li>• Share the quiz code with participants to join</li>
              <li>• Wait for all participants to join the lobby</li>
              <li>• Click "Start Quiz" when you're ready to begin</li>
              <li>• Participants will automatically be redirected when quiz starts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const loadingContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
};

const spinnerStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  border: '4px solid #e0e0e0',
  borderTop: '4px solid #8e44ad',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const loadingTextStyle: React.CSSProperties = {
  color: '#7f8c8d',
  fontSize: '1rem',
};

const errorContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
};

const errorCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  padding: '3rem',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
};

const errorIconStyle: React.CSSProperties = {
  fontSize: '4rem',
  marginBottom: '1rem',
};

const errorTitleStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '1rem',
};

const errorMessageStyle: React.CSSProperties = {
  color: '#7f8c8d',
  marginBottom: '2rem',
  fontSize: '1rem',
};

const errorButtonStyle: React.CSSProperties = {
  padding: '0.875rem 2rem',
  background: '#8e44ad',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const pageContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: '2rem 1rem',
};

const mainCardStyle: React.CSSProperties = {
  maxWidth: '1000px',
  margin: '0 auto',
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)',
  padding: '2rem',
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '1rem',
};

const quizTitleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
  margin: 0,
};

const quizCodeContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.5rem',
  marginBottom: '0.5rem',
};

const codeLabel: React.CSSProperties = {
  fontSize: '0.95rem',
  opacity: 0.9,
};

const codeValueStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  background: 'rgba(255,255,255,0.2)',
  padding: '0.25rem 0.75rem',
  borderRadius: '6px',
  color: '#fff59d',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  opacity: 0.9,
  marginTop: '0.5rem',
  margin: 0,
};

const backButtonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: '500',
};

const countBarStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f3e7f9 0%, #e1f5fe 100%)',
  padding: '1.5rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
  borderBottom: '1px solid #e8eaf6',
};

const countInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const participantBadgeStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)',
  color: 'white',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(142, 68, 173, 0.3)',
};

const countTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#2c3e50',
  margin: 0,
};

const countSubtitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#7f8c8d',
  margin: 0,
  marginTop: '0.25rem',
};

const startButtonStyle: React.CSSProperties = {
  padding: '1rem 2rem',
  background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '1.1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
};

const startButtonDisabledStyle: React.CSSProperties = {
  ...startButtonStyle,
  background: '#bdc3c7',
  cursor: 'not-allowed',
  boxShadow: 'none',
};

const startButtonLoadingStyle: React.CSSProperties = {
  ...startButtonStyle,
  background: '#95a5a6',
  cursor: 'wait',
};

const participantsContainerStyle: React.CSSProperties = {
  padding: '2rem',
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem 1rem',
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: '4rem',
  marginBottom: '1rem',
};

const emptyTitleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#2c3e50',
  marginBottom: '0.75rem',
};

const emptyMessageStyle: React.CSSProperties = {
  fontSize: '1rem',
  color: '#7f8c8d',
  marginBottom: '0.5rem',
};

const emptyCodeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontWeight: 'bold',
  color: '#8e44ad',
  background: '#f3e7f9',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
};

const emptySubMessageStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#95a5a6',
};

const listTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#2c3e50',
  marginBottom: '1rem',
};

const participantListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const participantCardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 1.25rem',
  background: '#f8f9fa',
  borderRadius: '10px',
  transition: 'all 0.2s',
  border: '1px solid #e9ecef',
};

const participantInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const participantNumberStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)',
  color: 'white',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  fontSize: '1rem',
};

const participantNameStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#2c3e50',
  margin: 0,
  fontSize: '1rem',
};

const participantTimeStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#95a5a6',
  margin: 0,
  marginTop: '0.25rem',
};

const removeButtonStyle: React.CSSProperties = {
  color: '#e74c3c',
  background: 'transparent',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '0.9rem',
  fontWeight: '500',
};

const instructionsBoxStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
  borderTop: '2px solid #b39ddb',
  padding: '1.5rem 2rem',
  display: 'flex',
  gap: '1rem',
};

const instructionsIconStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  flexShrink: 0,
};

const instructionsTitleStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#4a148c',
  marginBottom: '0.75rem',
  fontSize: '1.05rem',
  margin: 0,
  marginBottom: '0.5rem',
};

const instructionsListStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#6a1b9a',
  lineHeight: '1.8',
  margin: 0,
  paddingLeft: '0',
  listStyle: 'none',
};
