import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import SignUp from './components/SignUp';
import VerifyEmail from './components/VerifyEmail';
import Home from './components/Home';
import CreateSchedule from './components/CreateSchedule';
import EditSchedule from './components/EditSchedule';
import Schedules from './components/Schedules';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
import './App.css';

const StatusBar = () => (
  <div className="status-bar">
    <span className="time">12:00 AM</span>
    <div className="status-icons">
      <div className="signal-bars">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      <div className="wifi-icon">
        <svg width="15" height="12" viewBox="0 0 15 12" fill="white">
          <path d="M7.5 12C8.05 12 8.5 11.55 8.5 11C8.5 10.45 8.05 10 7.5 10C6.95 10 6.5 10.45 6.5 11C6.5 11.55 6.95 12 7.5 12Z"/>
          <path d="M7.5 8C8.88 8 10.17 8.54 11.12 9.42L12.24 8.3C10.93 6.99 9.13 6.25 7.5 6.25C5.87 6.25 4.07 6.99 2.76 8.3L3.88 9.42C4.83 8.54 6.12 8 7.5 8Z"/>
          <path d="M7.5 4C9.76 4 11.85 4.94 13.36 6.45L14.48 5.33C12.61 3.46 10.15 2.5 7.5 2.5C4.85 2.5 2.39 3.46 0.52 5.33L1.64 6.45C3.15 4.94 5.24 4 7.5 4Z"/>
        </svg>
      </div>
      <div className="battery-icon">
        <svg width="24" height="12" viewBox="0 0 24 12" fill="white">
          <rect x="1" y="2" width="18" height="8" rx="1.5" stroke="white" strokeWidth="1" fill="none"/>
          <rect x="2.5" y="3.5" width="15" height="5" rx="0.5" fill="white"/>
          <rect x="20" y="4" width="2" height="4" rx="0.5" fill="white"/>
        </svg>
      </div>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();

  const getActiveNav = () => {
    switch (location.pathname) {
      case '/home':
        return 'home';
      case '/schedules':
        return 'schedules';
      case '/profile':
        return 'profile';
      default:
        return '';
    }
  };

  const shouldShowNav = ['/home', '/schedules', '/profile', '/create-schedule'].includes(location.pathname);

  return (
    <div className="App">
      <div className="app-container">
        <div className="screens-wrapper">
          {/* Welcome Screen */}
          <div className="screen-container">
            <div className="screen-label"></div>
            <div className="phone-frame">
              <StatusBar />
              <div className="screen-content">
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/create-schedule" element={<CreateSchedule />} />
                  <Route path="/edit-schedule/:id" element={<EditSchedule />} />
                  <Route path="/schedules" element={<Schedules />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              {shouldShowNav && <BottomNav active={getActiveNav()} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
