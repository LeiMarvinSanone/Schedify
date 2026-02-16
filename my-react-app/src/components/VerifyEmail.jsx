import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const status = 'success';
  const message = 'Email verified successfully!';

  useEffect(() => {
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  }, [navigate]);

  return (
    <div className="verify-email-container">
      <div className="logo-container-small">
        <img src="/logo.png" alt="Schedify Logo" className="app-logo" />
      </div>

      <h2 className="screen-title">Email Verification</h2>

      <div className="verification-status">
        {status === 'verifying' && (
          <div className="status-verifying">
            <div className="spinner"></div>
            <p>Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="status-success">
            <div className="success-icon">✓</div>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="status-error">
            <div className="error-icon">✕</div>
            <p>{message}</p>
            <button
              className="retry-button"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;