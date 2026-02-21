import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <h1 style={logoStyle} onClick={() => navigate('/')}>IQnite</h1>
        <div style={menuStyle}>
          {isAuthenticated ? (
            <>
              <span style={userStyle}>👤 {user?.username} ({user?.role})</span>
              {user?.role === 'ADMIN' && (
                <button style={btnStyle} onClick={() => navigate('/admin')}>
                  Admin Panel
                </button>
              )}
              {user?.role === 'ORGANIZER' && (
                <button style={btnStyle} onClick={() => navigate('/organizer')}>
                  Dashboard
                </button>
              )}
              {user?.role === 'PARTICIPANT' && (
                <button style={btnStyle} onClick={() => navigate('/participant')}>
                  My Quizzes
                </button>
              )}
              <button style={btnDangerStyle} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button style={btnStyle} onClick={() => navigate('/login')}>
                Login
              </button>
              <button style={btnPrimaryStyle} onClick={() => navigate('/register')}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const navStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  background: '#2c3e50',
  color: 'white',
  padding: '1rem 0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  zIndex: 1000,
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoStyle: React.CSSProperties = {
  margin: 0,
  cursor: 'pointer',
  fontSize: '1.8rem',
  fontWeight: 'bold',
};

const menuStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
};

const userStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
};

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: '#34495e',
  color: 'white',
  fontSize: '1rem',
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: '#3498db',
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: '#e74c3c',
};

export default Navbar;
