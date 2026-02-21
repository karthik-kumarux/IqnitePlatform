import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'ORGANIZER') {
        navigate('/organizer');
      } else {
        navigate('/participant');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Login to IQnite</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email or Username</label>
            <input
              type="text"
              value={formData.usernameOrEmail}
              onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
              required
              style={inputStyle}
              placeholder="Enter email or username"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={linkTextStyle}>
          Don't have an account? <Link to="/register" style={linkStyle}>Register</Link>
        </p>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 80px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#ecf0f1',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px',
};

const titleStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#2c3e50',
  marginBottom: '1.5rem',
};

const errorStyle: React.CSSProperties = {
  background: '#e74c3c',
  color: 'white',
  padding: '0.75rem',
  borderRadius: '4px',
  marginBottom: '1rem',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
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

const btnStyle: React.CSSProperties = {
  padding: '0.75rem',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '1rem',
};

const linkTextStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '1rem',
  color: '#7f8c8d',
};

const linkStyle: React.CSSProperties = {
  color: '#3498db',
  textDecoration: 'none',
  fontWeight: '600',
};

export default Login;
