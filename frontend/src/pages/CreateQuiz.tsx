import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

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
    randomizeOptions: false,
    enableAdaptiveDifficulty: false,
    questionPoolSize: '',
    questionPoolTags: [] as string[],
    scheduledAt: '',
    expiresAt: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const addPoolTag = () => {
    if (tagInput.trim() && !formData.questionPoolTags.includes(tagInput.trim())) {
      setFormData({ ...formData, questionPoolTags: [...formData.questionPoolTags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removePoolTag = (tagToRemove: string) => {
    setFormData({ ...formData, questionPoolTags: formData.questionPoolTags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        passingScore: formData.passingScore ? parseInt(formData.passingScore) : undefined,
        questionPoolSize: formData.questionPoolSize ? parseInt(formData.questionPoolSize) : undefined,
        questionPoolTags: formData.questionPoolTags.length > 0 ? formData.questionPoolTags : undefined,
        scheduledAt: formData.scheduledAt || undefined,
        expiresAt: formData.expiresAt || undefined,
      };
      
      const response = await quizAPI.create(payload);
      toast.success('Quiz created successfully!');
      navigate(`/organizer/quiz/${response.data.id}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create quiz';
      setError(errorMsg);
      toast.error(errorMsg);
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

        {/* Advanced Features Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'none',
              border: '1px solid #3498db',
              color: '#3498db',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Features (Question Pools, Randomization)
          </button>
        </div>

        {showAdvanced && (
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50' }}>Advanced Quiz Settings</h3>
            
            <div style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={formData.randomizeOptions}
                  onChange={(e) => setFormData({ ...formData, randomizeOptions: e.target.checked })}
                />
                <span>Randomize MCQ Options Order</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={formData.enableAdaptiveDifficulty}
                  onChange={(e) => setFormData({ ...formData, enableAdaptiveDifficulty: e.target.checked })}
                />
                <span>Enable Adaptive Difficulty (Coming Soon)</span>
              </label>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Question Pool Size (Optional)</label>
              <input
                type="number"
                min="1"
                value={formData.questionPoolSize}
                onChange={(e) => setFormData({ ...formData, questionPoolSize: e.target.value })}
                style={inputStyle}
                placeholder="Select N random questions (leave empty for all)"
              />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                Randomly select this many questions from your question bank
              </small>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Filter by Tags (Optional)</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPoolTag())}
                  placeholder="Type a tag and press Enter"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button 
                  type="button" 
                  onClick={addPoolTag}
                  style={{ padding: '0.75rem 1rem', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Add Tag
                </button>
              </div>
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                Only show questions with these tags
              </small>
              {formData.questionPoolTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {formData.questionPoolTags.map((tag, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: '#3498db',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removePoolTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          padding: 0,
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
