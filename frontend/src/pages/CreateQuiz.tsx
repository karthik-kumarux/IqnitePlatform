import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    duration: '',
    passingScore: '',
    maxAttempts: 3,
    showAnswers: true,
    shuffleQuestions: false,
    scheduledAt: '',
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        passingScore: formData.passingScore ? parseInt(formData.passingScore) : undefined,
        scheduledAt: formData.scheduledAt || undefined,
        expiresAt: formData.expiresAt || undefined,
      };
      
      const response = await quizAPI.create(payload);
      navigate(`/organizer/quiz/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Create New Quiz</h1>
      {error && <div style={errorStyle}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Quiz Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={inputStyle}
            placeholder="Enter quiz title"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ ...inputStyle, minHeight: '100px' }}
            placeholder="Enter quiz description"
          />
        </div>

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              style={inputStyle}
              placeholder="Leave empty for no time limit"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Passing Score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.passingScore}
              onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
              style={inputStyle}
              placeholder="e.g., 70"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Max Attempts</label>
            <input
              type="number"
              min="1"
              value={formData.maxAttempts}
              onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Start Date/Time</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Expiry Date/Time</label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={checkboxGroupStyle}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            />
            <span>Public Quiz</span>
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={formData.showAnswers}
              onChange={(e) => setFormData({ ...formData, showAnswers: e.target.checked })}
            />
            <span>Show Answers After Submission</span>
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={formData.shuffleQuestions}
              onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
            />
            <span>Shuffle Questions</span>
          </label>
        </div>

        <div style={actionsStyle}>
          <button type="button" style={btnSecondaryStyle} onClick={() => navigate('/organizer')}>
            Cancel
          </button>
          <button type="submit" style={btnPrimaryStyle} disabled={loading}>
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem',
};

const errorStyle: React.CSSProperties = {
  background: '#e74c3c',
  color: 'white',
  padding: '1rem',
  borderRadius: '4px',
  marginBottom: '1rem',
};

const formStyle: React.CSSProperties = {
  background: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const fieldStyle: React.CSSProperties = {
  marginBottom: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  flex: 1,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const labelStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#2c3e50',
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid #bdc3c7',
  borderRadius: '4px',
  fontSize: '1rem',
};

const checkboxGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end',
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

const btnSecondaryStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '600',
};

export default CreateQuiz;
