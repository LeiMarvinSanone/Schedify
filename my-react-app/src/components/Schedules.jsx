import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import './Schedules.css';

const API_BASE_URL = 'http://localhost:3000';

// Sample data as requested with day information
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

const Schedules = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, scheduleId: null, scheduleTitle: '' });

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view schedules');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules on component mount
  useEffect(() => {
    // Use sample data for now
    setSchedules(SAMPLE_SCHEDULES);
    setLoading(false);
  }, []);

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };





  // Handle delete schedule
  const handleDeleteClick = (scheduleId, scheduleTitle) => {
    setDeleteModal({ show: true, scheduleId, scheduleTitle });
  };

  const handleConfirmDelete = () => {
    const { scheduleId } = deleteModal;
    setSchedules(schedules.filter(schedule => schedule._id !== scheduleId));
    setDeleteModal({ show: false, scheduleId: null, scheduleTitle: '' });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ show: false, scheduleId: null, scheduleTitle: '' });
  };

  return (
    <div className="schedules-screen">
      <h1 className="dashboard-title">My Schedules</h1>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading schedules...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={() => fetchSchedules()} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* No Schedules */}
      {!loading && !error && schedules.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No schedules yet</h3>
          <p>Create your first class schedule to get started.</p>
          <button
            className="create-schedule-btn"
            onClick={() => navigate('/create-schedule')}
          >
            Create New Class Schedule
          </button>
        </div>
      )}

      {/* Schedules List */}
      {!loading && !error && schedules.length > 0 && (
        <>
          <div className="schedules-list">
            {schedules.map(schedule => (
              <div key={schedule._id} className="schedule-card">
                <div className="card-content">
                  <div className="card-info">
                    <span className="course-title">{schedule.title}</span>
                    <span className="separator">•</span>
                    <span className="time">{formatTime(schedule.time)}</span>
                    <span className="separator">•</span>
                    <span className="professor">{schedule.professor}</span>
                    <span className="separator">•</span>
                    <span className="location">{schedule.room}</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(schedule._id, schedule.title)}
                    aria-label="Delete schedule"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Create New Schedule Button */}
          <div className="create-button-container">
            <button
              className="create-schedule-btn"
              onClick={() => navigate('/create-schedule')}
            >
              <Plus size={20} />
              Create New Class Schedule
            </button>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete?</h3>
            <p>Are you sure you want to delete "{deleteModal.scheduleTitle}"?</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={handleCancelDelete}>
                No
              </button>
              <button className="confirm-btn" onClick={handleConfirmDelete}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;