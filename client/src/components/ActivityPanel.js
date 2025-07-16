import React from 'react';
import '../styles/ActivityPanel.css';

const ActivityPanel = ({ activities }) => {

  const getActionIcon = (action) => {
    switch (action) {
      case 'created':
        return '➕';
      case 'updated':
        return '✏️';
      case 'deleted':
        return '🗑️';
      case 'moved':
        return '📤';
      case 'assigned':
        return '👤';
      default:
        return '📝';
    }
  };

  const getActionText = (action, metadata) => {
    switch (action) {
      case 'created':
        return `created task "${metadata?.title || 'Unknown'}"`;
      case 'updated':
        return `updated task "${metadata?.title || 'Unknown'}"`;
      case 'deleted':
        return `deleted task "${metadata?.title || 'Unknown'}"`;
      case 'moved':
        return `moved task "${metadata?.title || 'Unknown'}" to ${metadata?.newStatus || 'Unknown'}`;
      case 'assigned':
        return `assigned task "${metadata?.title || 'Unknown'}"`;
      default:
        return `performed ${action} on task`;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="activity-panel">
      <div className="activity-header">
        <h3>Activity Log</h3>
        <span className="activity-count">{activities.length} activities</span>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="no-activities">
            <p>No activities yet</p>
            <span>Activities will appear here as you work</span>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-icon">
                {getActionIcon(activity.action)}
              </div>
              <div className="activity-content">
                <div className="activity-user">
                  {activity.user?.username || 'Unknown User'}
                </div>
                <div className="activity-text">
                  {getActionText(activity.action, activity.metadata)}
                </div>
                <div className="activity-time">
                  {formatTime(activity.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityPanel; 