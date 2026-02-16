import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <>
      <h1 className="welcome-title">Welcome to Schedify!</h1>

      <div className="logo-container">
        <img src="/logo.png" alt="Schedify Logo" className="app-logo" />
      </div>

      <p className="welcome-subtitle">Smart reminders for your schedules</p>

      <button className="primary-button" onClick={handleGetStarted}>
        Get Started
      </button>
    </>
  );
};

export default Welcome;