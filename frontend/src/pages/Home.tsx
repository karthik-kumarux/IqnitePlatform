import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <h1 style={titleStyle}>Welcome to IQnite 🎯</h1>
        <p style={subtitleStyle}>
          Create engaging quizzes and host interactive quiz sessions
        </p>
        <div style={featuresStyle}>
          <div style={featureCardStyle}>
            <h3>📝 For Organizers</h3>
            <p>Create quizzes, add questions, and track participant performance</p>
            <button style={btnPrimaryStyle} onClick={() => navigate('/register')}>
              Become an Organizer
            </button>
          </div>
          <div style={featureCardStyle}>
            <h3>🎮 For Participants</h3>
            <p>Join quizzes with a code - no registration required!</p>
            <button style={btnSecondaryStyle} onClick={() => navigate('/join')}>
              Join Quiz Now
            </button>
          </div>
        </div>
        <div style={ctaStyle}>
          <button style={btnLargeStyle} onClick={() => navigate('/join')}>
            Join a Quiz →
          </button>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 80px)',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const heroStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  maxWidth: '1000px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '3.5rem',
  marginBottom: '1rem',
  fontWeight: 'bold',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '3rem',
  opacity: 0.9,
};

const featuresStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  marginBottom: '3rem',
};

const featureCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  padding: '2rem',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const btnPrimaryStyle: React.CSSProperties = {
  marginTop: '1rem',
  padding: '0.75rem 1.5rem',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
};

const btnSecondaryStyle: React.CSSProperties = {
  ...btnPrimaryStyle,
  background: '#2ecc71',
};

const ctaStyle: React.CSSProperties = {
  marginTop: '2rem',
};

const btnLargeStyle: React.CSSProperties = {
  padding: '1rem 3rem',
  background: 'white',
  color: '#667eea',
  border: 'none',
  borderRadius: '50px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
};

export default Home;
