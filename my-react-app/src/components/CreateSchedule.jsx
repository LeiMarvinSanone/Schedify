import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';
import './CreateSchedule.css';

const API_BASE_URL = 'http://localhost:3000';

const CreateSchedule = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    room: '',
    building: '',
    professor: '',
    hour: '12',
    minute: '00',
    period: 'AM',
    days: [], // Array of selected days
    alarms: [30, 15, 5] // Default all alarms enabled
  });

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = ['00', '01', '02', '03', '15', '30', '45'];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAlarmChange = (alarmMinutes, checked) => {
    setFormData(prev => ({
      ...prev,
      alarms: checked
        ? [...prev.alarms, alarmMinutes].sort((a, b) => b - a) // Sort descending
        : prev.alarms.filter(alarm => alarm !== alarmMinutes)
    }));
  };

  const handleDayChange = (dayShort, checked) => {
    setFormData(prev => ({
      ...prev,
      days: checked
        ? [...prev.days, dayShort]
        : prev.days.filter(day => day !== dayShort)
    }));
  };

  const handleSaveClick = () => {
    // Validate form
    if (!formData.subject || !formData.room || !formData.building || !formData.professor) {
      alert('Please fill in all fields');
      return;
    }
    if (formData.days.length === 0) {
      alert('Please select at least one day');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      // Get student ID from localStorage
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      const token = localStorage.getItem('token');

      if (!studentData._id || !token) {
        alert('Please log in first');
        navigate('/login');
        return;
      }

      // Convert 12-hour time to 24-hour format
      let hour24 = parseInt(formData.hour);
      if (formData.period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (formData.period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      const time24 = `${hour24.toString().padStart(2, '0')}:${formData.minute}`;

      // Use today's date as default since no date field
      const today = new Date().toISOString().split('T')[0];

      // Create schedules for each selected day
      const createPromises = formData.days.map(async (dayShort) => {
        const scheduleData = {
          studentId: studentData._id,
          title: formData.subject,
          professor: formData.professor,
          date: today,
          time: time24,
          room: formData.room,
          building: formData.building,
          day: dayShort,
          description: `Class on ${getFullDayName(dayShort)}`,
          alarms: formData.alarms
        };

        const response = await fetch(`${API_BASE_URL}/api/schedules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(scheduleData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create schedule');
        }

        return response.json();
      });

      // Wait for all schedules to be created
      await Promise.all(createPromises);

      alert('Class created successfully!');
      setShowConfirm(false);
      navigate('/schedules'); // Navigate to schedules view instead of home

    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule: ' + error.message);
      setShowConfirm(false);
    }
  };

  // Helper function to get full day name
  const getFullDayName = (short) => {
    const dayMap = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'Th': 'Thursday',
      'F': 'Friday',
      'Sat': 'Saturday',
      'Su': 'Sunday'
    };
    return dayMap[short] || short;
  };

  const handleCancelSave = () => {
    setShowConfirm(false);
  };

  return (
    <div className="create-schedule-screen">
      <h1 className="dashboard-title">Schedify</h1>

      <form className="schedule-form">
        {/* Subject */}
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-input"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder="Enter subject name"
          />
        </div>

        {/* Room */}
        <div className="form-group">
          <label className="form-label">Room</label>
          <input
            type="text"
            className="form-input"
            value={formData.room}
            onChange={(e) => handleChange('room', e.target.value)}
            placeholder="Enter room number"
          />
        </div>

        {/* Building */}
        <div className="form-group">
          <label className="form-label">Building</label>
          <input
            type="text"
            className="form-input"
            value={formData.building}
            onChange={(e) => handleChange('building', e.target.value)}
            placeholder="Enter building name"
          />
        </div>

        {/* Professor */}
        <div className="form-group">
          <label className="form-label">Professor</label>
          <input
            type="text"
            className="form-input"
            value={formData.professor}
            onChange={(e) => handleChange('professor', e.target.value)}
            placeholder="Enter professor name"
          />
        </div>

        {/* Time Picker */}
        <div className="form-group">
          <label className="form-label">Time</label>
          <div className="time-picker">
            {/* Hour */}
            <select
              className="time-select"
              value={formData.hour}
              onChange={(e) => handleChange('hour', e.target.value)}
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>

            {/* Minute */}
            <select
              className="time-select"
              value={formData.minute}
              onChange={(e) => handleChange('minute', e.target.value)}
            >
              {minutes.map(minute => (
                <option key={minute} value={minute}>{minute}</option>
              ))}
            </select>

            {/* AM/PM */}
            <select
              className="time-select period"
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Day Selection */}
        <div className="form-group">
          <label className="form-label">Days</label>
          <div className="day-options">
            {[
              { short: 'M', full: 'Monday' },
              { short: 'T', full: 'Tuesday' },
              { short: 'W', full: 'Wednesday' },
              { short: 'Th', full: 'Thursday' },
              { short: 'F', full: 'Friday' },
              { short: 'Sat', full: 'Saturday' },
              { short: 'Su', full: 'Sunday' }
            ].map(day => (
              <label key={day.short} className="day-checkbox">
                <input
                  type="checkbox"
                  checked={formData.days.includes(day.short)}
                  onChange={(e) => handleDayChange(day.short, e.target.checked)}
                />
                <span className="day-text">{day.full}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Alarm Settings */}
        <div className="form-group">
          <label className="form-label">Set Alarms</label>
          <div className="alarm-options">
            {[30, 15, 5].map(minutes => (
              <label key={minutes} className="alarm-checkbox">
                <input
                  type="checkbox"
                  checked={formData.alarms.includes(minutes)}
                  onChange={(e) => handleAlarmChange(minutes, e.target.checked)}
                />
                <span className="alarm-text">{minutes} minutes before</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          className="save-class-btn"
          onClick={handleSaveClick}
        >
          Save Class
        </button>
      </form>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <ConfirmDialog
          message="Save?"
          onConfirm={handleConfirmSave}
          onCancel={handleCancelSave}
        />
      )}
    </div>
  );
};

export default CreateSchedule;