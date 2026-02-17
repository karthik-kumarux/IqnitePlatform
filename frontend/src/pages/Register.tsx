import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'PARTICIPANT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      
      if (user.role === 'ORGANIZER') {
        navigate('/organizer');
      } else {
        navigate('/participant');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Register for IQnite</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={inputStyle}
            >
              <option value="PARTICIPANT">Participant</option>
              <option value="ORGANIZER">Organizer</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                style={inputStyle}
              />
            </div>
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
            <small style={{ color: '#7f8c8d' }}>
              Min 8 chars, with uppercase, lowercase, number & special char
            </small>
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={linkTextStyle}>
          Already have an account? <Link to="/login" style={linkStyle}>Login</Link>
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
  padding: '2rem 1rem',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '500px',
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
  flex: 1,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
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

export default Register;
