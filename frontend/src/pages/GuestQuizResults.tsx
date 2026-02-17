import { useNavigate } from 'react-router-dom';

const GuestQuizResults = () => {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={resultsCardStyle}>
        <div style={successIconStyle}>✅</div>
        <h1 style={titleStyle}>Quiz Completed!</h1>
        <p style={messageStyle}>
          Thank you for participating. Your responses have been submitted successfully.
        </p>
        
        <div style={actionsStyle}>
          <button style={btnStyle} onClick={() => {
            sessionStorage.clear();
            navigate('/join');
          }}>
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const resultsCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  maxWidth: '600px',
  width: '100%',
  padding: '3rem',
  textAlign: 'center',
};

const successIconStyle: React.CSSProperties = {
  fontSize: '4rem',
  marginBottom: '1rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '1rem',
};

const messageStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: '#7f8c8d',
  marginBottom: '2rem',
};

const actionsStyle: React.CSSProperties = {
  marginTop: '2rem',
};

const btnStyle: React.CSSProperties = {
  padding: '1rem 2rem',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background 0.3s ease',
};

export default GuestQuizResults;
