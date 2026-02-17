import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

interface QuizStatus {
  id: string;
  title: string;
  status: 'DRAFT' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  code: string;
}

export default function LobbyWaitingRoom() {
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

    // Check quiz status every 2 seconds
    const checkQuizStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/quiz/${quizId}/status`);
        setQuizStatus(response.data);
        setLoading(false);

        // If quiz has started, redirect to take quiz
        if (response.data.status === 'IN_PROGRESS') {
          navigate(`/quiz/${quizId}/take`);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to check quiz status');
        setLoading(false);
      }
    };

    checkQuizStatus();
    const interval = setInterval(checkQuizStatus, 2000);

    return () => clearInterval(interval);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/join')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Waiting in Lobby</h1>
          <p className="text-gray-600">
            Welcome, <span className="font-semibold text-purple-600">{participantName}</span>!
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{quizStatus?.title}</h2>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Quiz Code: <span className="font-mono font-bold text-purple-600">{quizStatus?.code}</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></span>
              <span className="text-sm text-gray-600">Waiting for organizer</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Please Wait</h3>
              <p className="text-sm text-blue-800">
                The quiz organizer will start the quiz shortly. You'll be automatically redirected when it begins.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleLeaveLobby}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Leave Lobby
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-bounce">•</div>
            <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</div>
            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</div>
          </div>
          <p className="mt-2">Checking for quiz start...</p>
        </div>
      </div>
    </div>
  );
}
