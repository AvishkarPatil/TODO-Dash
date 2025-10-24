import React, { useState } from 'react';
import './LabelManager.css';

const LabelManager = ({ taskLabels = [], availableLabels = [], onLabelsUpdate }) => {
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#007bff');

  const predefinedColors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1',
    '#fd7e14', '#20c997', '#e83e8c', '#6c757d', '#17a2b8'
  ];

  const handleLabelToggle = (label) => {
    const isSelected = taskLabels.some(l => l.id === label.id);
    let updatedLabels;
    
    if (isSelected) {
      updatedLabels = taskLabels.filter(l => l.id !== label.id);
    } else {
      updatedLabels = [...taskLabels, label];
    }
    
    onLabelsUpdate(updatedLabels);
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    const newLabel = {
      id: Date.now().toString(),
      name: newLabelName.trim(),
      color: newLabelColor
    };

    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newLabel)
      });

      if (response.ok) {
        const createdLabel = await response.json();
        onLabelsUpdate([...taskLabels, createdLabel]);
        setNewLabelName('');
        setNewLabelColor('#007bff');
      }
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  return (
    <div className="label-manager">
      <div className="current-labels">
        {taskLabels.map(label => (
          <span 
            key={label.id} 
            className="label"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
            <button 
              onClick={() => handleLabelToggle(label)}
              className="label-remove"
            >
              ×
            </button>
          </span>
        ))}
        <button 
          onClick={() => setShowLabelPicker(!showLabelPicker)}
          className="add-label-btn"
        >
          + Label
        </button>
      </div>

      {showLabelPicker && (
        <div className="label-picker">
          <div className="available-labels">
            <h4>Available Labels</h4>
            {availableLabels.map(label => (
              <div 
                key={label.id}
                className={`label-option ${taskLabels.some(l => l.id === label.id) ? 'selected' : ''}`}
                onClick={() => handleLabelToggle(label)}
              >
                <span 
                  className="label-color"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
              </div>
            ))}
          </div>

          <div className="create-label">
            <h4>Create New Label</h4>
            <div className="label-form">
              <input
                type="text"
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="label-name-input"
              />
              <div className="color-picker">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    className={`color-option ${newLabelColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewLabelColor(color)}
                  />
                ))}
              </div>
              <button 
                onClick={handleCreateLabel}
                className="create-btn"
                disabled={!newLabelName.trim()}
              >
                Create Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelManager;