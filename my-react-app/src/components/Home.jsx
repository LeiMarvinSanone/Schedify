import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from './StatusBar';
import BottomNav from './BottomNav';
import './Home.css';

// Sample data with day information
const SAMPLE_SCHEDULES = [
  {
    _id: '1',
    title: 'Software Engineering 2',
    time: '07:00',
    professor: 'Prof. A',
    room: 'CCB LAB A',
    building: 'CCB LAB A',
    day: 'M' // Monday
  },
  {
    _id: '2',
    title: 'Life and Works of Rizal',
    time: '10:00',
    professor: 'Prof. A',
    room: 'CCB ROOM 3',
    building: 'CCB ROOM 3',
    day: 'T' // Tuesday
  },
  {
    _id: '3',
    title: 'AppDev',
    time: '15:00',
    professor: 'Prof. A',
    room: 'CCB LAB B',
    building: 'CCB LAB B',
    day: 'W' // Wednesday
  },
  {
    _id: '4',
    title: 'Software Engineering 2',
    time: '14:00',
    professor: 'Prof. A',
    room: 'CCB ROOM 3',
    building: 'CCB ROOM 3',
    day: 'Th' // Thursday
  },
  {
    _id: '5',
    title: 'Database Systems',
    time: '09:00',
    professor: 'Prof. B',
    room: 'CCB LAB A',
    building: 'CCB LAB A',
    day: 'F' // Friday
  },
  {
    _id: '6',
    title: 'Web Development',
    time: '13:00',
    professor: 'Prof. C',
    room: 'CCB ROOM 2',
    building: 'CCB ROOM 2',
    day: 'M' // Monday
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('T'); // Tuesday selected by default
  const classes = SAMPLE_SCHEDULES;
  const [showDayView, setShowDayView] = useState(false);
  const [daySchedules, setDaySchedules] = useState([]);

  const days = [
    { short: 'M', full: 'Monday' },
    { short: 'T', full: 'Tuesday' },
    { short: 'W', full: 'Wednesday' },
    { short: 'Th', full: 'Thursday' },
    { short: 'F', full: 'Friday' },
    { short: 'Sat', full: 'Saturday' },
    { short: 'Su', full: 'Sunday' }
  ];



  // Get schedules for selected day
  const getSchedulesForDay = (dayShort) => {
    return classes.filter(cls => cls.day && cls.day.includes(dayShort));
  };

  // Check if a day has schedules
  const hasSchedulesForDay = (dayShort) => {
    return getSchedulesForDay(dayShort).length > 0;
  };

  const handleScheduleClick = (scheduleId) => {
    navigate(`/edit-schedule/${scheduleId}`);
  };

  const handleCreateNew = () => {
    navigate('/create-schedule');
  };

  const handleDayClick = (dayShort) => {
    setSelectedDay(dayShort);
    const schedulesForDay = getSchedulesForDay(dayShort);
    setDaySchedules(schedulesForDay);
    setShowDayView(true);
  };

  const handleBackToMain = () => {
    setShowDayView(false);
    setDaySchedules([]);
  };

  // Convert 24-hour time to 12-hour format
  const formatTime = (time24) => {
    const [hour, minute] = time24.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  return (
    <div className="home-dashboard">
      <h1 className="dashboard-title">Schedify</h1>

      {/* Create New Button */}
      <button className="create-new-btn" onClick={handleCreateNew}>
        Create New Class Schedule
      </button>

      {/* Schedule List */}
      <div className="schedule-list">
        {classes.slice(0, 3).map(cls => (
          <div
            key={cls._id}
            className="schedule-item"
            onClick={() => handleScheduleClick(cls._id)}
          >
            <span className="schedule-name">{cls.title}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M7 4l6 6-6 6" stroke="white" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Day Selector */}
      <div className="day-section">
        <h3 className="section-title">Day(s)</h3>
        <div className="day-selector">
          {days.map(day => (
            <button
              key={day.short}
              className={`day-btn ${selectedDay === day.short ? 'active' : ''} ${hasSchedulesForDay(day.short) ? 'has-schedules' : ''}`}
              onClick={() => handleDayClick(day.short)}
            >
              {day.short}
              {hasSchedulesForDay(day.short) && <span className="day-indicator"></span>}
            </button>
          ))}
        </div>
      </div>

      {/* Day-Specific View */}
      {showDayView && (
        <div className="day-view-modal">
          <div className="day-view-header">
            <button className="back-btn" onClick={handleBackToMain}>
              ← Back
            </button>
            <h3 className="day-view-title">
              {days.find(d => d.short === selectedDay)?.full} Schedules
            </h3>
          </div>
          <div className="day-schedules-list">
            {daySchedules.length > 0 ? (
              daySchedules.map(cls => (
                <div key={cls._id} className="day-schedule-item">
                  <div className="schedule-info">
                    <h4 className="schedule-title">{cls.title}</h4>
                    <p className="schedule-details">
                      {formatTime(cls.time)} • {cls.room} • {cls.professor}
                    </p>
                  </div>
                  <div className="schedule-alarms">
                    {cls.alarms && cls.alarms.map((alarm, index) => (
                      <span key={index} className="alarm-chip">
                        {alarm} min
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-schedules">No schedules for this day</p>
            )}
          </div>
        </div>
      )}

      {/* Ongoing Reminders */}
      {!showDayView && (
        <div className="reminders-section">
          <h3 className="section-title">Ongoing Reminders</h3>
          {classes.slice(0, 5).map(cls => (
            <div key={cls._id} className="reminder-card">
              <div className="reminder-info">
                <p className="reminder-class">{cls.title}</p>
                <p className="reminder-time">Start Time</p>
                <p className="reminder-time-value">{formatTime(cls.time)}</p>
              </div>
              <div className="reminder-alarms">
                {cls.alarms && cls.alarms.map((alarm, index) => (
                  <span key={index} className="alarm-chip">
                    {alarm} min before
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
