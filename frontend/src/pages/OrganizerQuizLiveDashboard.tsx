import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:3000/api';

interface Participant {
  id: string;
  participantName: string;
  score: number;
  totalPoints: number;
  percentage: number | null;
  status: string;
  startedAt: string;
  completedAt: string | null;
  answersCount: number;
}

interface Quiz {
  id: string;
  title: string;
  code: string;
  status: string;
  _count?: {
    questions: number;
  };
}

const OrganizerQuizLiveDashboard = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    if (!quizId) {
      setError('Invalid quiz ID');
      setLoading(false);
      return;
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, [quizId, accessToken]);

  const fetchDashboardData = async () => {
    if (!quizId || !accessToken) return;

    try {
      const [quizRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${API_URL}/quiz/${quizId}/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      setQuiz(quizRes.data);
      
      // Transform leaderboard data to participants format
      const leaderboardData = statsRes.data.leaderboard || [];
      const participantsData = leaderboardData.map((entry: any) => ({
        id: entry.participant.id,
        participantName: entry.participant.username || entry.participant.email,
        score: entry.score,
        totalPoints: entry.totalPoints,
        percentage: entry.percentage,
        status: entry.completedAt ? 'COMPLETED' : 'IN_PROGRESS',
        startedAt: entry.startedAt || new Date().toISOString(),
        completedAt: entry.completedAt,
        answersCount: entry.score, // Approximation
      }));

      setParticipants(participantsData);
      setLoading(false);
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    }
  };

  const handleEndQuiz = async () => {
    if (!confirm('Are you sure you want to end this quiz?')) return;

    try {
      await axios.patch(
        `${API_URL}/quiz/${quizId}`,
        { status: 'COMPLETED' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert('Quiz ended successfully');
      navigate('/organizer');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to end quiz');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: '9999px', height: '3rem', width: '3rem', borderBottom: '2px solid #9333ea', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#4b5563' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '2rem', maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>Error</h2>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            style={{ backgroundColor: '#9333ea', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalParticipants = participants.length;
  const completedCount = participants.filter(p => p.status === 'COMPLETED').length;
  const inProgressCount = totalParticipants - completedCount;
  const averageScore = totalParticipants > 0
    ? participants.reduce((sum, p) => sum + (p.percentage || 0), 0) / totalParticipants
    : 0;

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        {/* Header */}
        <div style={headerCardStyle}>
          <div style={headerGradientStyle}>
            <div style={headerContentStyle}>
              <div>
                <h1 style={titleStyle}>{quiz?.title}</h1>
                <p style={subtitleStyle}>
                  Quiz Code: <span style={codeStyle}>{quiz?.code}</span>
                  {' | '}
                  Status: <span style={statusStyle}>{quiz?.status}</span>
                </p>
              </div>
              <div style={buttonGroupStyle}>
                <button
                  onClick={() => navigate('/organizer')}
                  style={backButtonStyle}
                >
                  ← Back to Dashboard
                </button>
                <button
                  onClick={handleEndQuiz}
                  style={endButtonStyle}
                  disabled={quiz?.status === 'COMPLETED'}
                >
                  End Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={statsContainerStyle}>
            <div style={statBoxStyle}>
              <div style={statNumberStyle}>{totalParticipants}</div>
              <div style={statLabelStyle}>Total Participants</div>
            </div>
            <div style={statBoxStyle}>
              <div style={{ ...statNumberStyle, color: '#10b981' }}>{completedCount}</div>
              <div style={statLabelStyle}>Completed</div>
            </div>
            <div style={statBoxStyle}>
              <div style={{ ...statNumberStyle, color: '#3b82f6' }}>{inProgressCount}</div>
              <div style={statLabelStyle}>In Progress</div>
            </div>
            <div style={statBoxStyle}>
              <div style={{ ...statNumberStyle, color: '#f97316' }}>{averageScore.toFixed(1)}%</div>
              <div style={statLabelStyle}>Average Score</div>
            </div>
          </div>
        </div>

        {/* Live Updates Indicator */}
        <div style={liveIndicatorStyle}>
          <div style={liveIndicatorContentStyle}>
            <div style={liveIndicatorTextStyle}>
              <span style={pulseDotStyle}>●</span>
              <span style={liveTextStyle}>Live Updates Active</span>
            </div>
            <span style={refreshTextStyle}>Refreshing every 3 seconds</span>
          </div>
          <button
            onClick={fetchDashboardData}
            style={refreshButtonStyle}
          >
            Refresh Now
          </button>
        </div>

        {/* Participants Table */}
        <div style={tableCardStyle}>
          <div style={tablePaddingStyle}>
            <h2 style={tableHeadingStyle}>Participants Progress</h2>
            
            {participants.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={emptyIconStyle}>📊</div>
                <h3 style={emptyHeadingStyle}>No Participants Yet</h3>
                <p style={emptyTextStyle}>Waiting for participants to join and start the quiz</p>
              </div>
            ) : (
              <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                  <thead style={theadStyle}>
                    <tr>
                      <th style={thStyle}>Rank</th>
                      <th style={thStyle}>Participant</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Score</th>
                      <th style={thStyle}>Percentage</th>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>Completed At</th>
                    </tr>
                  </thead>
                  <tbody style={tbodyStyle}>
                    {participants
                      .sort((a, b) => {
                        // First sort by completion status (completed first)
                        if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1;
                        if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1;
                        // Then by score (highest first)
                        if (b.score !== a.score) return b.score - a.score;
                        // If scores are equal, sort by time (fastest first - lower time is better)
                        const timeA = a.timeSpent || Number.MAX_SAFE_INTEGER;
                        const timeB = b.timeSpent || Number.MAX_SAFE_INTEGER;
                        if (timeA !== timeB) return timeA - timeB;
                        // Finally by percentage
                        return (b.percentage || 0) - (a.percentage || 0);
                      })
                      .map((participant, index) => {
                        // Only give medals to completed participants with scores
                        const isCompleted = participant.status === 'COMPLETED';
                        const hasScore = participant.score > 0;
                        const completedRank = isCompleted && hasScore ? 
                          participants
                            .filter(p => p.status === 'COMPLETED' && p.score > 0)
                            .sort((a, b) => {
                              if (b.score !== a.score) return b.score - a.score;
                              const timeA = a.timeSpent || Number.MAX_SAFE_INTEGER;
                              const timeB = b.timeSpent || Number.MAX_SAFE_INTEGER;
                              return timeA - timeB;
                            })
                            .findIndex(p => p.id === participant.id) + 1
                          : null;

                        return (
                        <tr key={participant.id} style={trStyle}>
                          <td style={tdStyle}>
                            <div style={rankCellStyle}>
                              {completedRank === 1 && <span style={medalStyle}>🥇</span>}
                              {completedRank === 2 && <span style={medalStyle}>🥈</span>}
                              {completedRank === 3 && <span style={medalStyle}>🥉</span>}
                              <span style={rankTextStyle}>#{index + 1}</span>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <div style={nameCellStyle}>
                              {participant.participantName}
                            </div>
                          </td>
                          <td style={tdStyle}>
                            {participant.status === 'COMPLETED' ? (
                              <span style={completedBadgeStyle}>
                                Completed
                              </span>
                            ) : (
                              <span style={inProgressBadgeStyle}>
                                In Progress
                              </span>
                            )}
                          </td>
                          <td style={tdStyle}>
                            <span style={scoreBoldStyle}>{participant.score}</span> / {participant.totalPoints}
                          </td>
                          <td style={tdStyle}>
                            <div style={percentageCellStyle}>
                              <div>
                                <div style={percentageTextStyle}>
                                  {participant.percentage?.toFixed(1)}%
                                </div>
                                <div style={progressBarBgStyle}>
                                  <div
                                    style={{
                                      ...progressBarStyle,
                                      width: `${participant.percentage || 0}%`,
                                      backgroundColor: 
                                        (participant.percentage || 0) >= 70
                                          ? '#10b981'
                                          : (participant.percentage || 0) >= 50
                                          ? '#eab308'
                                          : '#ef4444'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            {participant.timeSpent ? (
                              <span style={{ fontWeight: 'bold', color: '#6366f1' }}>
                                {Math.floor(participant.timeSpent / 60)}:{(participant.timeSpent % 60).toString().padStart(2, '0')}
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td style={tdStyle}>
                            {participant.completedAt
                              ? new Date(participant.completedAt).toLocaleTimeString()
                              : '-'}
                          </td>
                        </tr>
                      )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f9fafb',
  padding: '2rem 1rem',
};

const maxWidthStyle: React.CSSProperties = {
  maxWidth: '80rem',
  margin: '0 auto',
};

const headerCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '0.5rem',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  marginBottom: '1.5rem',
};

const headerGradientStyle: React.CSSProperties = {
  background: 'linear-gradient(to right, #9333ea, #3b82f6)',
  padding: '1.5rem',
  color: 'white',
};

const headerContentStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.875rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
};

const subtitleStyle: React.CSSProperties = {
  color: '#e9d5ff',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontWeight: 'bold',
  color: '#fde047',
};

const statusStyle: React.CSSProperties = {
  fontWeight: '600',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
};

const backButtonStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
};

const endButtonStyle: React.CSSProperties = {
  backgroundColor: '#dc2626',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
};

const statsContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1rem',
  padding: '1.5rem',
  backgroundColor: '#f9fafb',
};

const statBoxStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '1rem',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
};

const statNumberStyle: React.CSSProperties = {
  fontSize: '1.875rem',
  fontWeight: 'bold',
  color: '#9333ea',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#6b7280',
};

const liveIndicatorStyle: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '0.5rem',
  padding: '1rem',
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const liveIndicatorContentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const liveIndicatorTextStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const pulseDotStyle: React.CSSProperties = {
  color: '#10b981',
  fontSize: '1.5rem',
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

const liveTextStyle: React.CSSProperties = {
  color: '#1e3a8a',
  fontWeight: '600',
};

const refreshTextStyle: React.CSSProperties = {
  color: '#1d4ed8',
};

const refreshButtonStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.875rem',
  transition: 'background-color 0.3s',
};

const tableCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '0.5rem',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
};

const tablePaddingStyle: React.CSSProperties = {
  padding: '1.5rem',
};

const tableHeadingStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '1rem',
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem 0',
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: '4rem',
  marginBottom: '1rem',
};

const emptyHeadingStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem',
};

const emptyTextStyle: React.CSSProperties = {
  color: '#6b7280',
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const theadStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
};

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: '500',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tbodyStyle: React.CSSProperties = {
  backgroundColor: 'white',
};

const trStyle: React.CSSProperties = {
  borderTop: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
  color: '#1f2937',
};

const rankCellStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const medalStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginRight: '0.5rem',
};

const rankTextStyle: React.CSSProperties = {
  fontWeight: '500',
};

const nameCellStyle: React.CSSProperties = {
  fontWeight: '500',
};

const completedBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '9999px',
  backgroundColor: '#d1fae5',
  color: '#065f46',
  display: 'inline-block',
};

const inProgressBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '9999px',
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  display: 'inline-block',
};

const scoreBoldStyle: React.CSSProperties = {
  fontWeight: '600',
};

const percentageCellStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const percentageTextStyle: React.CSSProperties = {
  fontWeight: '500',
  fontSize: '0.875rem',
};

const progressBarBgStyle: React.CSSProperties = {
  width: '6rem',
  backgroundColor: '#e5e7eb',
  borderRadius: '9999px',
  height: '0.5rem',
  marginTop: '0.25rem',
};

const progressBarStyle: React.CSSProperties = {
  height: '0.5rem',
  borderRadius: '9999px',
};

export default OrganizerQuizLiveDashboard;