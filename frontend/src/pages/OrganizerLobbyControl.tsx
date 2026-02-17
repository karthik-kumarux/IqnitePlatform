import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

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
    fetchQuizAndParticipants();
    const interval = setInterval(fetchQuizAndParticipants, 3000);
    return () => clearInterval(interval);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{quiz?.title}</h1>
                <p className="text-purple-100">Quiz Code: <span className="font-mono font-bold text-yellow-300">{quiz?.code}</span></p>
                {quiz?.description && (
                  <p className="text-purple-100 mt-2">{quiz.description}</p>
                )}
              </div>
              <button
                onClick={() => navigate('/organizer/dashboard')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                Back
              </button>
            </div>
          </div>

          {/* Participants Count */}
          <div className="bg-purple-50 p-6 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                  {participants.length}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'} Waiting
                  </h2>
                  <p className="text-gray-600 text-sm">Ready to start the quiz</p>
                </div>
              </div>
              <button
                onClick={handleStartQuiz}
                disabled={starting || participants.length === 0}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition ${
                  participants.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : starting
                    ? 'bg-purple-400 cursor-wait'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {starting ? 'Starting...' : 'Start Quiz 🚀'}
              </button>
            </div>
          </div>

          {/* Participants List */}
          <div className="p-6">
            {participants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Waiting for Participants</h3>
                <p className="text-gray-600">Share the quiz code <span className="font-mono font-bold text-purple-600">{quiz?.code}</span> with participants</p>
                <p className="text-gray-500 text-sm mt-2">Participants will appear here when they join</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Participants in Lobby</h3>
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{participant.participantName}</p>
                        <p className="text-sm text-gray-500">
                          Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-t border-blue-100 p-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share the quiz code with participants to join</li>
                  <li>• Wait for all participants to join the lobby</li>
                  <li>• Click "Start Quiz" when you're ready to begin</li>
                  <li>• Participants will automatically be redirected when quiz starts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
