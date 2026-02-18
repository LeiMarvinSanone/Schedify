import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const API_BASE_URL = 'http://localhost:3000';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Account created successfully! You can now log in.');
        navigate('/login');
      } else {
        alert(data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  return (
    <>
      <h2 className="screen-title">Create Account</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            name="name"
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            name="email"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            name="password"
            placeholder="Enter your password"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            placeholder="Confirm your password"
          />
        </div>

        <button type="submit" className="submit-button">
          Sign Up
        </button>
      </form>

      <p className="login-link">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="link-btn"
        >
          Login
        </button>
      </p>
    </>
  );
};

export default SignUp;