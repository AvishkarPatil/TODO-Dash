import React, { useState } from 'react';
import '../styles/Modal.css';

const ConflictModal = ({ conflictData, onResolved }) => {
  const [resolution, setResolution] = useState('merge');
  const [loading, setLoading] = useState(false);

  const currentVersion = conflictData.currentVersion;
  const incomingVersion = conflictData.incomingVersion;

  const handleResolve = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${currentVersion._id}/resolve-conflict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resolution,
          chosenVersion: resolution === 'overwrite' ? incomingVersion : null
        })
      });

      if (response.ok) {
        onResolved();
      } else {
        alert('Failed to resolve conflict');
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      alert('Failed to resolve conflict');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content conflict-modal">
        <div className="modal-header">
          <h2>⚠️ Conflict Detected</h2>
          <p>This task was modified by another user while you were editing it.</p>
        </div>

        <div className="conflict-content">
          <div className="conflict-versions">
            <div className="version-section">
              <h3>Current Version</h3>
              <div className="version-details">
                <p><strong>Title:</strong> {currentVersion.title}</p>
                <p><strong>Description:</strong> {currentVersion.description || 'No description'}</p>
                <p><strong>Priority:</strong> {currentVersion.priority}</p>
                <p><strong>Status:</strong> {currentVersion.status}</p>
              </div>
            </div>

            <div className="version-section">
              <h3>Incoming Changes</h3>
              <div className="version-details">
                <p><strong>Title:</strong> {incomingVersion.title}</p>
                <p><strong>Description:</strong> {incomingVersion.description || 'No description'}</p>
                <p><strong>Priority:</strong> {incomingVersion.priority}</p>
                <p><strong>Status:</strong> {incomingVersion.status}</p>
              </div>
            </div>
          </div>

          <div className="resolution-options">
            <h3>Choose Resolution Method:</h3>
            
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="resolution"
                  value="merge"
                  checked={resolution === 'merge'}
                  onChange={(e) => setResolution(e.target.value)}
                />
                <span className="radio-label">
                  <strong>Merge Changes</strong>
                  <small>Combine both versions (recommended)</small>
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="resolution"
                  value="overwrite"
                  checked={resolution === 'overwrite'}
                  onChange={(e) => setResolution(e.target.value)}
                />
                <span className="radio-label">
                  <strong>Use Incoming Version</strong>
                  <small>Replace current version with incoming changes</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={handleResolve}
            className="resolve-button"
            disabled={loading}
          >
            {loading ? 'Resolving...' : 'Resolve Conflict'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal; 