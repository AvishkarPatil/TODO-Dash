import React, { useState, useEffect, useRef } from 'react';
import './TimeTracker.css';

const TimeTracker = ({ taskId, onTimeUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes
  const [isPomodoro, setIsPomodoro] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (isPomodoro && newTime >= pomodoroTime) {
            setIsRunning(false);
            playNotification();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, pomodoroTime, isPomodoro]);

  const playNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: 'Time for a break!',
        icon: '/favicon.ico'
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    if (timeElapsed > 0) {
      onTimeUpdate(taskId, timeElapsed);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeElapsed(0);
  };

  return (
    <div className="time-tracker">
      <div className="timer-display">
        <span className="time">{formatTime(timeElapsed)}</span>
        {isPomodoro && (
          <div className="pomodoro-progress">
            <div 
              className="progress-bar"
              style={{ width: `${(timeElapsed / pomodoroTime) * 100}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="timer-controls">
        <button 
          onClick={isRunning ? handleStop : handleStart}
          className={`btn ${isRunning ? 'btn-stop' : 'btn-start'}`}
        >
          {isRunning ? '⏸️' : '▶️'}
        </button>
        <button onClick={handleReset} className="btn btn-reset">🔄</button>
        <button 
          onClick={() => setIsPomodoro(!isPomodoro)}
          className={`btn ${isPomodoro ? 'btn-active' : ''}`}
        >
          🍅
        </button>
      </div>
    </div>
  );
};

export default TimeTracker;