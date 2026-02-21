import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

interface QuizResultsData {
  quiz: {
    id: string;
    title: string;
    description: string;
    code: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  statistics: {
    totalParticipants: number;
    completedCount: number;
    inProgressCount: number;
    totalQuestions: number;
    averageScore: number;
    averagePercentage: number;
  };
  participants: Array<{
    id: string;
    name: string;
    email: string;
    type: 'authenticated' | 'guest';
    score: number;
    totalPoints: number;
    percentage: number;
    status: string;
    startedAt: string;
    completedAt: string;
    timeSpent: number;
    answers: any[];
  }>;
}

const OrganizerQuizResults = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<QuizResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      const response = await quizAPI.getQuizResults(id!);
      setResults(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load quiz results');
      navigate('/organizer');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div style={containerStyle}>Loading results...</div>;
  }

  if (!results) {
    return <div style={containerStyle}>No results found</div>;
  }

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .result-row { animation: slideIn 0.3s ease-out; }
        .result-row:hover { background: #f8f9fa; }
      `}</style>

      <button style={btnBackStyle} onClick={() => navigate('/organizer')}>
        ← Back to Dashboard
      </button>

      {/* Quiz Header */}
      <div style={headerCardStyle}>
        <h1>📊 {results.quiz.title}</h1>
        {results.quiz.description && <p style={descStyle}>{results.quiz.description}</p>}
        <div style={metaStyle}>
          <span>📝 Quiz Code: <strong>{results.quiz.code}</strong></span>
          <span>📅 Created: {formatDate(results.quiz.createdAt)}</span>
          <span>📅 Last Updated: {formatDate(results.quiz.updatedAt)}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statIconStyle}>👥</div>
          <div>
            <div style={statValueStyle}>{results.statistics.totalParticipants}</div>
            <div style={statLabelStyle}>Total Participants</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>✅</div>
          <div>
            <div style={statValueStyle}>{results.statistics.completedCount}</div>
            <div style={statLabelStyle}>Completed</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>⏳</div>
          <div>
            <div style={statValueStyle}>{results.statistics.inProgressCount}</div>
            <div style={statLabelStyle}>In Progress</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>❓</div>
          <div>
            <div style={statValueStyle}>{results.statistics.totalQuestions}</div>
            <div style={statLabelStyle}>Questions</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>📈</div>
          <div>
            <div style={statValueStyle}>{results.statistics.averageScore.toFixed(1)}</div>
            <div style={statLabelStyle}>Avg Score</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>🎯</div>
          <div>
            <div style={statValueStyle}>{results.statistics.averagePercentage.toFixed(1)}%</div>
            <div style={statLabelStyle}>Avg Percentage</div>
          </div>
        </div>
      </div>

      {/* Participant Results Table */}
      <div style={tableCardStyle}>
        <h2 style={{ marginBottom: '1.5rem' }}>🏆 Participant Leaderboard</h2>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thStyle}>Rank</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Percentage</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Time Spent</th>
                <th style={thStyle}>Completed At</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.participants.map((participant, index) => (
                <tr key={participant.id} className="result-row" style={tableRowStyle}>
                  <td style={tdStyle}>
                    <div style={rankStyle}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{participant.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{participant.email}</div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      ...typeBadgeStyle,
                      background: participant.type === 'authenticated' ? '#3498db' : '#95a5a6'
                    }}>
                      {participant.type === 'authenticated' ? '👤 User' : '👻 Guest'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <strong>{participant.score}</strong> / {participant.totalPoints}
                  </td>
                  <td style={tdStyle}>
                    <div style={progressContainerStyle}>
                      <div style={{
                        ...progressBarStyle,
                        width: `${participant.percentage || 0}%`,
                        background: participant.percentage >= 70 ? '#27ae60' :
                                   participant.percentage >= 50 ? '#f39c12' : '#e74c3c'
                      }} />
                      <span style={progressTextStyle}>{participant.percentage?.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      ...statusBadgeStyle,
                      background: participant.status === 'COMPLETED' ? '#27ae60' : '#f39c12'
                    }}>
                      {participant.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{formatTime(participant.timeSpent)}</td>
                  <td style={tdStyle}>
                    {participant.completedAt ? formatDate(participant.completedAt) : 'N/A'}
                  </td>
                  <td style={tdStyle}>
                    <button
                      style={btnViewAnswersStyle}
                      onClick={() => setSelectedParticipant(participant)}
                    >
                      📝 View Answers
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Details Modal */}
      {selectedParticipant && (
        <div style={modalOverlayStyle} onClick={() => setSelectedParticipant(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2>📝 {selectedParticipant.name}'s Answers</h2>
            <div style={answerListStyle}>
              {selectedParticipant.answers.map((answer: any, idx: number) => (
                <div key={answer.id} style={answerCardStyle}>
                  <div style={answerHeaderStyle}>
                    <span style={{ fontWeight: '600' }}>Question {idx + 1}</span>
                    <span style={{
                      ...answerBadgeStyle,
                      background: answer.isCorrect ? '#27ae60' : '#e74c3c'
                    }}>
                      {answer.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                    </span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: answer.question.question }} />
                  <div style={answerDetailsStyle}>
                    <p><strong>Answer Given:</strong> {answer.answer}</p>
                    <p><strong>Correct Answer:</strong> {answer.question.correctAnswer}</p>
                    <p><strong>Points:</strong> {answer.points} / {answer.question.points}</p>
                  </div>
                </div>
              ))}
            </div>
            <button style={btnCloseModalStyle} onClick={() => setSelectedParticipant(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '2rem',
};

const btnBackStyle: React.CSSProperties = {
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  marginBottom: '2rem',
  fontWeight: '500',
};

const headerCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '2rem',
  marginBottom: '2rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const descStyle: React.CSSProperties = {
  color: '#666',
  marginTop: '0.5rem',
  marginBottom: '1rem',
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5rem',
  fontSize: '0.9rem',
  color: '#555',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '2rem',
};

const statCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const statIconStyle: React.CSSProperties = {
  fontSize: '2rem',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  color: '#2c3e50',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#7f8c8d',
};

const tableCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '2rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHeaderStyle: React.CSSProperties = {
  background: '#f8f9fa',
};

const thStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left',
  fontWeight: '600',
  color: '#2c3e50',
  borderBottom: '2px solid #dee2e6',
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid #dee2e6',
  transition: 'background 0.2s',
};

const tdStyle: React.CSSProperties = {
  padding: '1rem',
};

const rankStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
};

const typeBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'white',
  display: 'inline-block',
};

const progressContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100px',
  height: '24px',
  background: '#ecf0f1',
  borderRadius: '12px',
  overflow: 'hidden',
};

const progressBarStyle: React.CSSProperties = {
  height: '100%',
  transition: 'width 0.3s ease',
};

const progressTextStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: '#2c3e50',
};

const statusBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'white',
  textTransform: 'uppercase',
};

const btnViewAnswersStyle: React.CSSProperties = {
  background: '#3498db',
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '500',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '2rem',
  maxWidth: '800px',
  maxHeight: '80vh',
  overflow: 'auto',
  width: '90%',
};

const answerListStyle: React.CSSProperties = {
  marginTop: '1.5rem',
  marginBottom: '1.5rem',
};

const answerCardStyle: React.CSSProperties = {
  background: '#f8f9fa',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
};

const answerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.75rem',
};

const answerBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'white',
};

const answerDetailsStyle: React.CSSProperties = {
  marginTop: '0.75rem',
  padding: '0.75rem',
  background: 'white',
  borderRadius: '6px',
  fontSize: '0.9rem',
};

const btnCloseModalStyle: React.CSSProperties = {
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  padding: '0.75rem 2rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '500',
  width: '100%',
};

export default OrganizerQuizResults;
