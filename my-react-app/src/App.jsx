import { useState } from 'react';
import './App.css';

function App() {

  const weeklySchedule = {
    Monday: [
      { time: "7:00 AM - 10:00 AM", subject: "Software Engineering 2", room: "LAB B" },
      { time: "10:00 AM - 11:00 AM", subject: "Intro to Machine Learning", room: "CCB RM 6" }
    ],
    Tuesday: [
      { time: "9:00 AM - 10:00 AM", subject: "Software Engineering 2", room: "CCB RM 2" },
      { time: "10:00 AM - 11:00 AM", subject: "Life and Works of Rizal", room: "CCB RM 2" },
      { time: "1:00 PM - 4:00 PM", subject: "Intro to Machine Learning", room: "LAB A" }
    ],
    Wednesday: [
      { time: "7:00 AM - 9:00 AM", subject: "Computer Org & Architecture", room: "CCB RM 4" },
      { time: "11:00 AM - 12:00 PM", subject: "Scientific & Technical Writing", room: "CCB RM 5" },
      { time: "2:00 PM - 4:00 PM", subject: "App Dev & Emerging Tech 2", room: "CCB RM 3" },
      { time: "4:00 PM - 5:00 PM", subject: "Life and Works of Rizal", room: "ICT RM 6" }
    ],
    Thursday: [
      { time: "9:00 AM - 10:00 AM", subject: "Software Engineering 2", room: "CCB RM 3" },
      { time: "10:00 AM - 11:00 AM", subject: "Intro to Machine Learning", room: "CCB RM 6" },
      { time: "11:00 AM - 12:00 PM", subject: "Life and Works of Rizal", room: "TBA" },
      { time: "1:00 PM - 4:00 PM", subject: "Computer Org & Architecture", room: "LAB C" }
    ],
    Friday: [
      { time: "9:00 AM - 11:00 AM", subject: "Scientific & Technical Writing", room: "CCB RM 5" },
      { time: "1:00 PM - 4:00 PM", subject: "App Dev & Emerging Tech 2", room: "LAB A" }
    ]
  };

  const days = Object.keys(weeklySchedule);
  const [selectedDay, setSelectedDay] = useState("Monday");

  // Create alarms from selected day's schedule
  const [alarmStates, setAlarmStates] = useState({});

  const toggleAlarm = (key) => {
    setAlarmStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="phone-wrapper">
      <div className="phone-container">

        <h1 className="app-title">Schedify</h1>

        <button className="create-btn">
          Create New Class Schedule
        </button>

        {/* Weekly Calendar */}
        <div className="weekly-section">
          <p className="section-title">Weekly Calendar</p>

          <div className="days-container">
            {days.map((day, index) => (
              <button
                key={index}
                className={`day-circle ${selectedDay === day ? "active-day" : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                {day.slice(0,1)}
              </button>
            ))}
          </div>

          <div className="weekly-card">
            <h3 className="day-title">{selectedDay}</h3>

            {weeklySchedule[selectedDay].map((item, index) => (
              <div key={index} className="weekly-item">
                <p className="time">{item.time}</p>
                <p>{item.subject}</p>
                <p className="room">{item.room}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Alarms (CONNECTED) */}
        <div className="alarm-section">
          <p className="section-title">Incoming Alarms</p>

          {weeklySchedule[selectedDay].map((item, index) => {

            const alarmKey = `${selectedDay}-${index}`;
            const startTime = item.time.split(" - ")[0];

            return (
              <div key={alarmKey} className="alarm-card">

                <div className="alarm-header">
                  <h3>{item.subject}</h3>

                  <div className="alarm-toggle">
                    <span>1 hr before</span>
                    <input
                      type="checkbox"
                      checked={alarmStates[alarmKey] || false}
                      onChange={() => toggleAlarm(alarmKey)}
                    />
                  </div>
                </div>

                <p><strong>Start:</strong> {startTime}</p>
                <p>Room: {item.room}</p>

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}

export default App;
