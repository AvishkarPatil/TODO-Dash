import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import '../styles/TaskCard.css';

const TaskCard = ({ task, index, onEdit, onDelete, onSmartAssign }) => {
  const [showActions, setShowActions] = useState(false);
  const [isSuccessMove, setIsSuccessMove] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44ff44';
      default: return '#cccccc';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);
    return due < today;
  };

  const isDueToday = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);
    return due.getTime() === today.getTime();
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''} ${isSuccessMove ? 'success-move' : ''}`}
          data-task-id={task._id}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className="task-header">
            <h4 className="task-title">{task.title}</h4>
            <div 
              className="priority-indicator"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            ></div>
          </div>
          
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          
          <div className="task-meta">
            {task.assignedTo && (
              <div className="assigned-to">
                Assigned to: {task.assignedTo.username}
              </div>
            )}
            
            {task.dueDate && (
              <div className="due-date">
                Due: {formatDate(task.dueDate)}
                {task.status === 'done' ? (
                  <span className="due-badge done">Done!</span>
                ) : (
                  <>
                    {isOverdue(task.dueDate) && (
                      <span className="due-badge overdue">Overdue!</span>
                    )}
                    {isDueToday(task.dueDate) && !isOverdue(task.dueDate) && (
                      <span className="due-badge due-today">Due Today!</span>
                    )}
                  </>
                )}
              </div>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <div className="task-tags">
                {task.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {task.updatedAt && (
              <div className="task-updated">
                Last updated: {formatDateTime(task.updatedAt)}
                {task.lastUpdatedBy && task.lastUpdatedBy.username && (
                  <span> by <b>{task.lastUpdatedBy.username}</b></span>
                )}
              </div>
            )}
          </div>
          
          {showActions && (
            <div className="task-actions">
              <button 
                className="action-btn edit-btn"
                onClick={() => onEdit(task)}
              >
                Edit
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => onDelete(task._id)}
              >
                Delete
              </button>
              {onSmartAssign && (
                <button
                  className="action-btn smart-assign-btn"
                  onClick={() => onSmartAssign(task)}
                >
                  Smart Assign
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard; 