import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user] = useState({
    name: 'Student 1',
    email: 'student.1@gmail.com',
  });

  const handleLogout = () => {
    // Clear any auth tokens/data here
    navigate('/login');
  };

  return (
    <div className="profile-screen">
      <h1 className="dashboard-title">Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="40" fill="#7fb069"/>
            <path d="M40 45c-8.284 0-15-6.716-15-15s6.716-15 15-15 15 6.716 15 15-6.716 15-15 15zm0 5c12.15 0 22 9.85 22 22H18c0-12.15 9.85-22 22-22z" fill="#2d3748"/>
          </svg>
        </div>

        <div className="profile-info">
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-detail">{user.email}</p>
          <p className="profile-detail">Student ID: {user.studentId}</p>
        </div>
      </div>

      <div className="profile-menu">
        <button className="menu-item">
          <span>Edit Profile</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <path d="M7 4l6 6-6 6" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        </button>

        <button className="menu-item">
          <span>Notifications Settings</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <path d="M7 4l6 6-6 6" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        </button>

        <button className="menu-item">
          <span>About</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <path d="M7 4l6 6-6 6" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        </button>

        <button className="menu-item logout" onClick={handleLogout}>
          <span>Logout</span>
          <svg width="20" height="20" viewBox="0 0 20 20" stroke="#f56565" fill="none" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Profile;