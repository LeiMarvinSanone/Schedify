import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = ({ active = 'home' }) => {
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (isActive) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? '#7fb069' : '#cbd5e0'}>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      path: '/home'
    },
    {
      id: 'schedules',
      label: 'Schedules',
      icon: (isActive) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#7fb069' : '#cbd5e0'} strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      path: '/schedules'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (isActive) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#7fb069' : '#cbd5e0'} strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      path: '/profile'
    }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon(active === item.id)}
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;