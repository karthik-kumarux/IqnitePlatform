import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuthStore();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('').slice(0, 6);
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/verify-otp', {
        email,
        otp: otpString,
      });

      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);

      // Navigate based on role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'ORGANIZER':
          navigate('/organizer');
          break;
        case 'PARTICIPANT':
          navigate('/participant');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/api/auth/resend-otp', { email });
      alert('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to resend OTP';
      setError(errorMsg);
      
      // If it's an email service error, show helpful message
      if (errorMsg.includes('email service') || errorMsg.includes('email credentials')) {
        setError('Email service is not configured. Please contact administrator or use test OTP: Check your database for the OTP value.');
      }
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    navigate('/register');
    return null;
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>✉️</div>
          <h1 style={titleStyle}>Verify Your Email</h1>
          <p style={subtitleStyle}>
            We've sent a 6-digit OTP to<br />
            <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={otpContainerStyle} onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={otpInputStyle}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div style={resendContainerStyle}>
            <p style={resendTextStyle}>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              style={resendBtnStyle}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>⚠️ Development Mode:</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#856404' }}>
                If email is not configured, check your PostgreSQL database for the OTP:
                <br />
                <code style={{ background: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'block', marginTop: '0.5rem' }}>
                  SELECT "verificationOtp" FROM users WHERE email = '{email}'
                </code>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 80px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '2rem',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  padding: '3rem',
  maxWidth: '500px',
  width: '100%',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const iconStyle: React.CSSProperties = {
  fontSize: '4rem',
  marginBottom: '1rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  color: '#2c3e50',
  marginBottom: '0.5rem',
};

const subtitleStyle: React.CSSProperties = {
  color: '#7f8c8d',
  fontSize: '1rem',
  lineHeight: '1.6',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const otpContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'center',
};

const otpInputStyle: React.CSSProperties = {
  width: '50px',
  height: '60px',
  fontSize: '1.5rem',
  textAlign: 'center',
  border: '2px solid #dfe4ea',
  borderRadius: '8px',
  outline: 'none',
  transition: 'all 0.3s',
};

const errorStyle: React.CSSProperties = {
  padding: '0.75rem',
  background: '#fee',
  color: '#c00',
  borderRadius: '8px',
  fontSize: '0.9rem',
  textAlign: 'center',
};

const btnStyle: React.CSSProperties = {
  padding: '1rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s',
};

const resendContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: '1rem',
  borderTop: '1px solid #dfe4ea',
};

const resendTextStyle: React.CSSProperties = {
  color: '#7f8c8d',
  fontSize: '0.9rem',
  marginBottom: '0.5rem',
};

const resendBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#667eea',
  border: 'none',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  textDecoration: 'underline',
};

export default VerifyOtp;
