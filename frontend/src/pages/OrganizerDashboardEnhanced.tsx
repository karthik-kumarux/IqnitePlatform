import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/Skeleton';
import type { Quiz } from '../types';

const OrganizerDashboardEnhanced = () => {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [currentPage, showRecentOnly]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (showRecentOnly) {
        // Load only recent/completed quizzes
        const [activeRes, recentRes] = await Promise.all([
          quizAPI.getActiveQuiz().catch(() => ({ data: null })),
          quizAPI.getRecentQuizzes(currentPage, 10),
        ]);
        setActiveQuiz(activeRes.data);
        setRecentQuizzes(recentRes.data.data || []);
        setTotalPages(recentRes.data.pagination?.totalPages || 1);
        setAllQuizzes([]);
      } else {
        // Load all quizzes (draft, waiting, in-progress)
        const [activeRes, allRes] = await Promise.all([
          quizAPI.getActiveQuiz().catch(() => ({ data: null })),
          quizAPI.getAll({ myQuizzes: true, page: currentPage, limit: 10 }),
        ]);
        setActiveQuiz(activeRes.data);
        setAllQuizzes(allRes.data.data || allRes.data || []);
        setTotalPages(allRes.data.pagination?.totalPages || 1);
        setRecentQuizzes([]);
      }
    } catch (err: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await quizAPI.delete(id);
      toast.success('Quiz deleted successfully');
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  const resetQuiz = async (id: string) => {
    if (!confirm('End this quiz session? This will move it to history and clear the lobby.')) return;
    try {
      await quizAPI.resetQuiz(id);
      toast.success('Quiz session ended and moved to history!');
      loadDashboardData(); // Reload to show updated status
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to end quiz');
    }
  };

  const viewResults = (quizId: string) => {
    navigate(`/organizer/quiz/${quizId}/results`);
  };

  if (loading) return <div style={containerStyle}><DashboardSkeleton /></div>;

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
        }
        .quiz-card { animation: fadeIn 0.5s ease-out; }
        .quiz-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
        .active-quiz-card { animation: pulse 2s infinite; }
        .btn:hover { transform: scale(1.05); }
      `}</style>
      
      <div style={headerStyle}>
        <h1>📊 Organizer Dashboard</h1>
        <button style={btnPrimaryStyle} onClick={() => navigate('/organizer/quiz/new')}>
          + Create Quiz
        </button>
      </div>

      {/* View Toggle */}
      <div style={toggleContainerStyle}>
        <button 
          style={showRecentOnly ? btnSecondaryStyle : btnToggleActiveStyle}
          onClick={() => { setShowRecentOnly(false); setCurrentPage(1); }}
        >
          📝 All Quizzes
        </button>
        <button 
          style={showRecentOnly ? btnToggleActiveStyle : btnSecondaryStyle}
          onClick={() => { setShowRecentOnly(true); setCurrentPage(1); }}
        >
          📜 Recent History
        </button>
      </div>

      {/* Active Quiz Section */}
      {activeQuiz && (
        <div style={sectionStyle}>
          <h2 style={{ color: '#27ae60', marginBottom: '1rem' }}>
            🟢 Currently Active Quiz
          </h2>
          <div className="quiz-card active-quiz-card" style={{...quizCardStyle, border: '2px solid #27ae60'}}>
            <div style={cardHeaderStyle}>
              <h3 style={{color: '#27ae60'}}>{activeQuiz.title}</h3>
              <span style={{...statusBadgeStyle, background: '#27ae60'}}>IN PROGRESS</span>
            </div>
            {activeQuiz.description && <p style={descStyle}>{activeQuiz.description}</p>}
            <div style={metaStyle}>
              <span>📝 Code: <strong>{activeQuiz.code}</strong></span>
              <span>❓ {activeQuiz._count?.questions || 0} questions</span>
              <span>👥 {activeQuiz._count?.sessions || 0} participants</span>
            </div>
            <div style={actionsStyle}>
              <button 
                style={{...btnStyle, background: '#3498db'}} 
                onClick={() => navigate(`/organizer/quiz/${activeQuiz.id}/live`)}
              >
                📊 View Live Dashboard
              </button>
              <button 
                style={{...btnStyle, background: '#e74c3c'}} 
                onClick={() => resetQuiz(activeQuiz.id)}
              >
                ⏹️ End Quiz Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Quizzes or Recent Quizzes */}
      <div style={sectionStyle}>
        <h2 style={{ marginBottom: '1rem' }}>
          {showRecentOnly ? '📜 Recent Quiz History' : '📝 All Quizzes'}
        </h2>
        
        {showRecentOnly && recentQuizzes.length === 0 && (
          <div style={emptyStyle}>
            <p>No completed quizzes yet. Start organizing quizzes to see history!</p>
          </div>
        )}

        {!showRecentOnly && allQuizzes.length === 0 && (
          <div style={emptyStyle}>
            <p>No quizzes yet. Create your first quiz!</p>
          </div>
        )}

        <div style={gridStyle}>
          {(showRecentOnly ? recentQuizzes : allQuizzes).map((quiz) => (
            <div key={quiz.id} className="quiz-card" style={quizCardStyle}>
              <div style={cardHeaderStyle}>
                <h3>{quiz.title}</h3>
                <span style={{
                  ...statusBadgeStyle,
                  background: quiz.status === 'COMPLETED' ? '#95a5a6' : 
                             quiz.status === 'IN_PROGRESS' ? '#27ae60' :
                             quiz.status === 'WAITING' ? '#f39c12' : '#3498db'
                }}>
                  {quiz.status}
                </span>
              </div>
              {quiz.description && <p style={descStyle}>{quiz.description}</p>}
              <div style={metaStyle}>
                <span>📝 Code: <strong>{quiz.code}</strong></span>
                <span>❓ {quiz._count?.questions || 0} questions</span>
                <span>👥 {(quiz._count?.sessions || 0) + (quiz._count?.guestSessions || 0)} sessions</span>
              </div>
              <div style={actionsStyle}>
                {quiz.status === 'COMPLETED' ? (
                  <>
                    <button 
                      style={{...btnStyle, background: '#3498db'}} 
                      onClick={() => viewResults(quiz.id)}
                      className="btn"
                    >
                      📊 View Results
                    </button>
                    <button 
                      style={{...btnStyle, background: '#27ae60'}} 
                      onClick={() => navigate(`/organizer/quiz/${quiz.id}`)}
                      className="btn"
                    >
                      ✏️ Edit & Reuse
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      style={{...btnStyle, background: '#3498db'}} 
                      onClick={() => navigate(`/organizer/quiz/${quiz.id}`)}
                      className="btn"
                    >
                      👁️ View
                    </button>
                    <button 
                      style={{...btnStyle, background: '#f39c12'}} 
                      onClick={() => navigate(`/organizer/quiz/${quiz.id}/edit`)}
                      className="btn"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      style={{...btnStyle, background: '#e74c3c'}} 
                      onClick={() => deleteQuiz(quiz.id)}
                      className="btn"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={paginationStyle}>
            <button 
              style={btnSecondaryStyle}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Previous
            </button>
            <span style={{ margin: '0 1rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              style={btnSecondaryStyle}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
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

const toggleContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  justifyContent: 'center',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '3rem',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '1.5rem',
};

const quizCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid #e0e0e0',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '0.75rem',
};

const statusBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white',
  textTransform: 'uppercase',
};

const descStyle: React.CSSProperties = {
  color: '#666',
  marginBottom: '1rem',
  fontSize: '0.9rem',
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  marginBottom: '1rem',
  fontSize: '0.85rem',
  color: '#555',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
};

const btnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '100px',
  padding: '0.6rem 1rem',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  fontWeight: '500',
  fontSize: '0.85rem',
  transition: 'all 0.2s ease',
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#3498db',
  flex: 'initial',
};

const btnSecondaryStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#95a5a6',
};

const btnToggleActiveStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#3498db',
  boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem',
  color: '#999',
  background: '#f8f9fa',
  borderRadius: '12px',
};

const paginationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '2rem',
};

export default OrganizerDashboardEnhanced;
