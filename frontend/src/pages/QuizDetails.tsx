import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quizAPI, questionAPI } from '../services/api';
import type { Quiz, Question } from '../types';

const QuizDetails = () => {
  const { id } = useParams<{ id: string }>();
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
              <p style={questionTextStyle}>{q.question}</p>
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        quizId,
        ...formData,
        options: formData.type === 'MULTIPLE_CHOICE' ? formData.options.filter(o => o) : undefined,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : undefined,
      };
      await questionAPI.create(payload);
      onAdded();
    } catch (err) {
      alert('Failed to add question');
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Add Question</h2>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label>Type</label>
            <select
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
            <label>Question *</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
              style={{ ...inputStyle, minHeight: '80px' }}
            />
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
          </div>

          <div style={fieldStyle}>
            <label>Explanation</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              style={{ ...inputStyle, minHeight: '60px' }}
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

export default QuizDetails;
