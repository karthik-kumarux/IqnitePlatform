import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, questionAPI } from '../services/api';
import type { Quiz, Question } from '../types';
import RichTextEditor from '../components/RichTextEditor';
import axios from 'axios';

// Helper function to convert video URLs to embed format
const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  return url;
};

const QuizDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuizData();
    }
  }, [id]);

  const loadQuizData = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        quizAPI.getById(id!),
        questionAPI.getByQuiz(id!),
      ]);
      setQuiz(quizRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      alert('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await questionAPI.delete(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  if (loading) return <div style={containerStyle}>Loading...</div>;
  if (!quiz) return <div style={containerStyle}>Quiz not found</div>;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1>{quiz.title}</h1>
          <p style={codeStyle}>Quiz Code: <strong>{quiz.code}</strong></p>
          {quiz.description && <p>{quiz.description}</p>}
        </div>
        <button style={btnPrimaryStyle} onClick={() => setShowAddQuestion(true)}>
          + Add Question
        </button>
      </div>

      <div style={metaStyle}>
        <div>📝 {questions.length} Questions</div>
        <div>👥 {quiz._count?.sessions || 0} Attempts</div>
        <div>⏱️ {quiz.duration ? `${quiz.duration} min` : 'No time limit'}</div>
        <div>✅ {quiz.passingScore ? `Pass: ${quiz.passingScore}%` : 'No passing score'}</div>
      </div>

      {/* Quiz Action Buttons */}
      {questions.length > 0 && (
        <div style={actionButtonsContainerStyle}>
          <button 
            style={btnLobbyStyle} 
            onClick={() => navigate(`/organizer/quiz/${id}/lobby`)}
          >
            🚪 Open Lobby
          </button>
          <button 
            style={btnStartStyle} 
            onClick={() => navigate(`/organizer/quiz/${id}/live`)}
          >
            ▶️ Start Quiz / View Live
          </button>
        </div>
      )}

      <h2>Questions</h2>
      {questions.length === 0 ? (
        <div style={emptyStyle}>No questions yet. Add your first question!</div>
      ) : (
        <div style={questionListStyle}>
          {questions.map((q, idx) => (
            <div key={q.id} style={questionCardStyle}>
              <div style={questionHeaderStyle}>
                <span style={questionNumberStyle}>Q{idx + 1}</span>
                <span style={typeStyle}>{q.type}</span>
                <span>{q.points} pts</span>
              </div>
              
              {/* Question text with rich text support */}
              <div 
                style={questionTextStyle}
                dangerouslySetInnerHTML={{ __html: q.question }}
              />
              
              {/* Image display */}
              {(q as any).imageUrl && (
                <div style={{ marginBottom: '1rem' }}>
                  <img 
                    src={(q as any).imageUrl} 
                    alt="Question" 
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} 
                  />
                </div>
              )}
              
              {/* Video embed */}
              {(q as any).videoUrl && (
                <div style={{ marginBottom: '1rem', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src={getEmbedUrl((q as any).videoUrl)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              {q.type === 'MULTIPLE_CHOICE' && q.options && (
                <div style={optionsStyle}>
                  {q.options.map((opt, i) => (
                    <div key={i} style={optionStyle}>
                      {opt} {opt === q.correctAnswer && '✅'}
                    </div>
                  ))}
                </div>
              )}
              {q.explanation && <p style={explanationStyle}>💡 {q.explanation}</p>}
              <button style={btnDangerStyle} onClick={() => deleteQuestion(q.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddQuestion && (
        <AddQuestionModal
          quizId={id!}
          onClose={() => setShowAddQuestion(false)}
          onAdded={() => {
            setShowAddQuestion(false);
            loadQuizData();
          }}
        />
      )}
    </div>
  );
};

const AddQuestionModal = ({ quizId, onClose, onAdded }: any) => {
  const [formData, setFormData] = useState({
    type: 'MULTIPLE_CHOICE',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    timeLimit: '',
    explanation: '',
    imageUrl: '',
    videoUrl: '',
    difficulty: 'MEDIUM',
    tags: [] as string[],
  });
  const [useRichText, setUseRichText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      alert('Only JPG, PNG, GIF, and WebP images are allowed');
      return;
    }

    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:3000/api/upload/image', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      // response.data.url now contains base64 data URL (data:image/jpeg;base64,...)
      const imageUrl = response.data.url;
      console.log('✅ Image uploaded as base64, length:', imageUrl.length);
      setFormData(prev => ({ ...prev, imageUrl }));
      setImagePreview(imageUrl);
      alert('Image uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    setImagePreview('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        quizId,
        ...formData,
        options: formData.type === 'MULTIPLE_CHOICE' ? formData.options.filter(o => o) : undefined,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : undefined,
        imageUrl: formData.imageUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };
      console.log('📤 Sending question payload:', payload);
      console.log('🖼️  imageUrl in payload:', payload.imageUrl);
      await questionAPI.create(payload);
      onAdded();
    } catch (err) {
      alert('Failed to add question');
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Add Question</h2>
          <label htmlFor="useRichText" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              id="useRichText"
              name="useRichText"
              type="checkbox"
              checked={useRichText}
              onChange={(e) => setUseRichText(e.target.checked)}
            />
            Rich Text Editor
          </label>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="questionType">Type</label>
            <select
              id="questionType"
              name="questionType"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={inputStyle}
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label>Question * {useRichText && <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>(Supports LaTeX: use formula button)</span>}</label>
            {useRichText ? (
              <RichTextEditor
                value={formData.question}
                onChange={(value) => setFormData({ ...formData, question: value })}
                placeholder="Enter your question here... Use formula button for LaTeX math"
              />
            ) : (
              <textarea
                id="questionText"
                name="questionText"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                style={{ ...inputStyle, minHeight: '80px' }}
                placeholder="Enter your question here..."
              />
            )}
          </div>

          {/* Image Upload Section */}
          <div style={fieldStyle}>
            <label htmlFor="imageUpload">Image (Optional)</label>
            {!imagePreview ? (
              <div>
                <input
                  id="imageUpload"
                  name="imageUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ marginBottom: '0.5rem' }}
                />
                {uploading && <p style={{ color: '#3498db', fontSize: '0.9rem' }}>Uploading...</p>}
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Max size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
              </div>
            ) : (
              <div>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <button type="button" onClick={removeImage} style={{ ...btnSecondaryStyle, padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Remove Image
                </button>
              </div>
            )}
          </div>

          {/* Video URL Section */}
          <div style={fieldStyle}>
            <label htmlFor="videoUrl">Video URL (Optional)</label>
            <input
              id="videoUrl"
              name="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              style={inputStyle}
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
            />
            <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Supports YouTube and Vimeo embeds</p>
          </div>

          {formData.type === 'MULTIPLE_CHOICE' && (
            <div style={fieldStyle}>
              <label>Options</label>
              {formData.options.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...formData.options];
                    newOpts[i] = e.target.value;
                    setFormData({ ...formData, options: newOpts });
                  }}
                  placeholder={`Option ${i + 1}`}
                  style={inputStyle}
                />
              ))}
            </div>
          )}

          <div style={fieldStyle}>
            <label>Correct Answer *</label>
            {formData.type === 'TRUE_FALSE' ? (
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select...</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <input
                id="correctAnswer"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                required
                style={inputStyle}
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label>Points</label>
              <input
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Time Limit (seconds)</label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                style={inputStyle}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* Tags Section */}
          <div style={fieldStyle}>
            <label>Tags (Optional) <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>- For question pools</span></label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Type a tag and press Enter"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button 
                type="button" 
                onClick={addTag}
                style={{ ...btnSecondaryStyle, padding: '0.75rem 1rem' }}
              >
                Add Tag
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.tags.map((tag, idx) => (
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
                      onClick={() => removeTag(tag)}
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

          <div style={fieldStyle}>
            <label>Explanation (Optional)</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              style={{ ...inputStyle, minHeight: '60px' }}
              placeholder="Explanation shown after answering..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" style={btnSecondaryStyle} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={btnPrimaryStyle}>
              Add Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '2rem',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '2rem',
};

const codeStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: '#3498db',
  margin: '0.5rem 0',
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  gap: '2rem',
  padding: '1rem',
  background: '#ecf0f1',
  borderRadius: '4px',
  marginBottom: '2rem',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  color: '#7f8c8d',
  background: '#ecf0f1',
  borderRadius: '4px',
};

const questionListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const questionCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  border: '1px solid #ecf0f1',
};

const questionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  marginBottom: '1rem',
};

const questionNumberStyle: React.CSSProperties = {
  background: '#3498db',
  color: 'white',
  padding: '0.25rem 0.75rem',
  borderRadius: '4px',
  fontWeight: 'bold',
};

const typeStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#7f8c8d',
};

const questionTextStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  marginBottom: '1rem',
  color: '#2c3e50',
};

const optionsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const optionStyle: React.CSSProperties = {
  padding: '0.5rem',
  background: '#ecf0f1',
  borderRadius: '4px',
};

const explanationStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#7f8c8d',
  fontStyle: 'italic',
  marginBottom: '1rem',
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

const modalStyle: React.CSSProperties = {
  background: 'white',
  padding: '2rem',
  borderRadius: '8px',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
};

const fieldStyle: React.CSSProperties = {
  marginBottom: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  flex: 1,
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid #bdc3c7',
  borderRadius: '4px',
  fontSize: '1rem',
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

const btnDangerStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const actionButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  padding: '1.5rem',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '2px solid #e9ecef',
};

const btnLobbyStyle: React.CSSProperties = {
  flex: 1,
  padding: '1rem 1.5rem',
  background: '#f39c12',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
};

const btnStartStyle: React.CSSProperties = {
  flex: 1,
  padding: '1rem 1.5rem',
  background: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
};

export default QuizDetails;
