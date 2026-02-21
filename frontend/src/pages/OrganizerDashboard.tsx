import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/Skeleton';
import type { Quiz } from '../types';

const OrganizerDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await quizAPI.getAll();
      setQuizzes(response.data.data || response.data); // Handle both paginated and non-paginated responses
    } catch (err: any) {
      setError('Failed to load quizzes');
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await quizAPI.delete(id);
      setQuizzes(quizzes.filter(q => q.id !== id));
      toast.success('Quiz deleted successfully');
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  const resetQuiz = async (id: string) => {
    if (!confirm('Reset this quiz? This will clear the lobby and allow you to organize it again.')) return;
    try {
      await quizAPI.resetQuiz(id);
      toast.success('Quiz reset successfully! You can now organize it again.');
      loadQuizzes(); // Reload to show updated status
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset quiz');
    }
  };

  if (loading) return <div style={containerStyle}><DashboardSkeleton /></div>;

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .quiz-card {
          animation: fadeIn 0.5s ease-out;
        }

        .quiz-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
        }

        .quiz-card button {
          transition: all 0.2s ease;
        }

        .quiz-card button:hover {
          transform: scale(1.05);
        }
      `}</style>
      
      <div style={headerStyle}>
        <h1>My Quizzes</h1>
        <button style={btnPrimaryStyle} onClick={() => navigate('/organizer/quiz/new')}>
          + Create Quiz
        </button>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={gridStyle}>
        {quizzes.length === 0 ? (
          <div style={emptyStyle}>
            <p>No quizzes yet. Create your first quiz!</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card" style={cardStyle}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#2c3e50' }}>{quiz.title}</h3>
                  <span style={getStatusBadgeStyle(quiz.status)}>
                    {quiz.status || 'DRAFT'}
                  </span>
                </div>
                <p style={descStyle}>{quiz.description || 'No description provided'}</p>
              </div>
              <div style={metaStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📝</span> Code: <strong style={{ color: '#3498db' }}>{quiz.code}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>❓</span> {quiz._count?.questions || 0} questions
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>👥</span> {quiz._count?.sessions || 0} attempts
                </span>
              </div>
              <div style={actionsStyle}>
                <button
                  style={btnStyle}
                  onClick={() => navigate(`/organizer/quiz/${quiz.id}`)}
                >
                  View
                </button>
                <button
                  style={btnResultsStyle}
                  onClick={() => navigate(`/organizer/quiz/${quiz.id}/live`)}
                >
                  Results
                </button>
                <button
                  style={btnLobbyStyle}
                  onClick={() => navigate(`/organizer/quiz/${quiz.id}/lobby`)}
                >
                  Lobby
                </button>
                <button
                  style={btnStyle}
                  onClick={() => navigate(`/organizer/quiz/${quiz.id}/edit`)}
                >
                  Edit
                </button>
                {(quiz.status === 'COMPLETED' || quiz.status === 'IN_PROGRESS') && (
                  <button
                    style={btnResetStyle}
                    onClick={() => resetQuiz(quiz.id)}
                  >
                    Reset
                  </button>
                )}
                <button
                  style={btnDangerStyle}
                  onClick={() => deleteQuiz(quiz.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const getStatusBadgeStyle = (status: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  };

  switch (status) {
    case 'DRAFT':
      return { ...baseStyle, background: '#95a5a6', color: 'white' };
    case 'WAITING':
      return { ...baseStyle, background: '#f39c12', color: 'white' };
    case 'IN_PROGRESS':
      return { ...baseStyle, background: '#3498db', color: 'white' };
    case 'COMPLETED':
      return { ...baseStyle, background: '#27ae60', color: 'white' };
    default:
      return { ...baseStyle, background: '#95a5a6', color: 'white' };
  }
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
};

const errorStyle: React.CSSProperties = {
  background: '#e74c3c',
  color: 'white',
  padding: '1rem',
  borderRadius: '4px',
  marginBottom: '1rem',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '1.5rem',
  alignItems: 'stretch',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem',
  color: '#7f8c8d',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  border: '1px solid #e8ecef',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  transition: 'transform 0.2s, box-shadow 0.2s',
  height: '100%',
};

const descStyle: React.CSSProperties = {
  color: '#7f8c8d',
  fontSize: '0.95rem',
  lineHeight: '1.5',
  flex: '1',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  fontSize: '0.85rem',
  color: '#7f8c8d',
  padding: '0.75rem',
  background: '#f8f9fa',
  borderRadius: '8px',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: 'auto',
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '600',
};

const btnStyle: React.CSSProperties = {
  padding: '0.6rem 1rem',
  background: '#5a6c7d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
};

const btnLobbyStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#8e44ad',
};

const btnResultsStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#16a085',
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#e74c3c',
};

const btnResetStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#f39c12',
};

export default OrganizerDashboard;
