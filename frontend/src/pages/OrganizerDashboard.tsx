import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import type { Quiz } from '../types';

const OrganizerDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await quizAPI.getAll();
      setQuizzes(response.data);
    } catch (err: any) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await quizAPI.delete(id);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  if (loading) return <div style={containerStyle}>Loading...</div>;

  return (
    <div style={containerStyle}>
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
            <div key={quiz.id} style={cardStyle}>
              <h3>{quiz.title}</h3>
              <p style={descStyle}>{quiz.description}</p>
              <div style={metaStyle}>
                <span>📝 Code: <strong>{quiz.code}</strong></span>
                <span>❓ {quiz._count?.questions || 0} questions</span>
                <span>👥 {quiz._count?.sessions || 0} attempts</span>
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
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.5rem',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem',
  color: '#7f8c8d',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #ecf0f1',
};

const descStyle: React.CSSProperties = {
  color: '#7f8c8d',
  marginBottom: '1rem',
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  fontSize: '0.9rem',
  color: '#95a5a6',
  marginBottom: '1rem',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
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
  padding: '0.5rem 1rem',
  background: '#34495e',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const btnLobbyStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#9b59b6',
};

const btnResultsStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#16a085',
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#e74c3c',
};

export default OrganizerDashboard;
