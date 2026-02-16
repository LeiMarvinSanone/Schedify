import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      // Mock login - no API call
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('studentId', 'mock-student-id');
      navigate('/home'); // Redirect to home/dashboard after login
    } else {
      setErrors(newErrors);
    }
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <>
      <div className="logo-container-small">
        <img src="/logo.png" alt="Schedify Logo" className="app-logo" />
      </div>

      <h2 className="screen-title">Schedify</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            name="email"
            placeholder="Enter your email"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            value={formData.password}
            onChange={handleChange}
            name="password"
            placeholder="Enter your password"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button
          type="button"
          className="link-button"
          onClick={handleCreateAccount}
        >
          Create an account
        </button>

        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
    </>
  );
};

export default Login;