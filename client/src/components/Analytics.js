import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = ({ tasks = [], users = [] }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState({
    taskCompletion: {},
    userProductivity: {},
    timeTracking: {},
    labelDistribution: {}
  });

  useEffect(() => {
    calculateAnalytics();
  }, [tasks, users, timeRange]);

  const calculateAnalytics = () => {
    const now = new Date();
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90
    };
    
    const daysBack = ranges[timeRange];
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Task completion analytics
    const completedTasks = tasks.filter(task => 
      task.status === 'done' && new Date(task.completedAt) >= cutoffDate
    );
    
    const taskCompletion = {
      total: tasks.length,
      completed: completedTasks.length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      review: tasks.filter(t => t.status === 'review').length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0
    };

    // User productivity
    const userProductivity = users.map(user => {
      const userTasks = tasks.filter(task => task.assignee === user.id);
      const userCompleted = userTasks.filter(task => 
        task.status === 'done' && new Date(task.completedAt) >= cutoffDate
      );
      
      return {
        id: user.id,
        name: user.name,
        totalTasks: userTasks.length,
        completedTasks: userCompleted.length,
        completionRate: userTasks.length > 0 ? (userCompleted.length / userTasks.length * 100).toFixed(1) : 0,
        avgTimePerTask: userCompleted.reduce((acc, task) => acc + (task.timeSpent || 0), 0) / (userCompleted.length || 1)
      };
    });

    // Time tracking analytics
    const totalTimeSpent = tasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0);
    const avgTimePerTask = tasks.length > 0 ? totalTimeSpent / tasks.length : 0;

    // Label distribution
    const labelCounts = {};
    tasks.forEach(task => {
      if (task.labels) {
        task.labels.forEach(label => {
          labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
        });
      }
    });

    setAnalytics({
      taskCompletion,
      userProductivity,
      timeTracking: { totalTimeSpent, avgTimePerTask },
      labelDistribution: labelCounts
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Team Analytics</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-select"
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="quarter">Last 90 days</option>
        </select>
      </div>

      <div className="analytics-grid">
        {/* Task Completion Overview */}
        <div className="analytics-card">
          <h3>Task Overview</h3>
          <div className="completion-stats">
            <div className="stat">
              <span className="stat-number">{analytics.taskCompletion.total}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat">
              <span className="stat-number">{analytics.taskCompletion.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat">
              <span className="stat-number">{analytics.taskCompletion.completionRate}%</span>
              <span className="stat-label">Completion Rate</span>
            </div>
          </div>
          
          <div className="status-breakdown">
            <div className="status-bar">
              <div 
                className="status-segment todo"
                style={{ width: `${(analytics.taskCompletion.todo / analytics.taskCompletion.total) * 100}%` }}
              />
              <div 
                className="status-segment in-progress"
                style={{ width: `${(analytics.taskCompletion.inProgress / analytics.taskCompletion.total) * 100}%` }}
              />
              <div 
                className="status-segment review"
                style={{ width: `${(analytics.taskCompletion.review / analytics.taskCompletion.total) * 100}%` }}
              />
              <div 
                className="status-segment done"
                style={{ width: `${(analytics.taskCompletion.completed / analytics.taskCompletion.total) * 100}%` }}
              />
            </div>
            <div className="status-legend">
              <span><span className="legend-color todo"></span> To Do ({analytics.taskCompletion.todo})</span>
              <span><span className="legend-color in-progress"></span> In Progress ({analytics.taskCompletion.inProgress})</span>
              <span><span className="legend-color review"></span> Review ({analytics.taskCompletion.review})</span>
              <span><span className="legend-color done"></span> Done ({analytics.taskCompletion.completed})</span>
            </div>
          </div>
        </div>

        {/* User Productivity */}
        <div className="analytics-card">
          <h3>Team Productivity</h3>
          <div className="user-list">
            {analytics.userProductivity.map(user => (
              <div key={user.id} className="user-stats">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="completion-rate">{user.completionRate}%</span>
                </div>
                <div className="user-metrics">
                  <span>{user.completedTasks}/{user.totalTasks} tasks</span>
                  <span>{formatTime(user.avgTimePerTask)} avg</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${user.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Tracking */}
        <div className="analytics-card">
          <h3>Time Tracking</h3>
          <div className="time-stats">
            <div className="time-metric">
              <span className="time-number">{formatTime(analytics.timeTracking.totalTimeSpent)}</span>
              <span className="time-label">Total Time Logged</span>
            </div>
            <div className="time-metric">
              <span className="time-number">{formatTime(analytics.timeTracking.avgTimePerTask)}</span>
              <span className="time-label">Average per Task</span>
            </div>
          </div>
        </div>

        {/* Label Distribution */}
        <div className="analytics-card">
          <h3>Label Usage</h3>
          <div className="label-stats">
            {Object.entries(analytics.labelDistribution).map(([label, count]) => (
              <div key={label} className="label-stat">
                <span className="label-name">{label}</span>
                <span className="label-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;