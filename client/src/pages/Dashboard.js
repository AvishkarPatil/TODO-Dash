import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import TaskColumn from '../components/TaskColumn';
import TaskForm from '../components/TaskForm';
import ActivityPanel from '../components/ActivityPanel';
import ConflictModal from '../components/ConflictModal';
import '../styles/Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [conflictData, setConflictData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { user, logout } = useAuth();
  const { socket, joinRoom, emitTaskUpdate, emitTaskCreate, emitTaskDelete } = useSocket();

  useEffect(() => {
    fetchTasks();
    fetchActivities();
    joinRoom('board');
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('task-updated', handleTaskUpdate);
      socket.on('task-created', handleTaskCreate);
      socket.on('task-deleted', handleTaskDelete);
      socket.on('activity-created', handleActivityCreated);

      return () => {
        socket.off('task-updated', handleTaskUpdate);
        socket.off('task-created', handleTaskCreate);
        socket.off('task-deleted', handleTaskDelete);
        socket.off('activity-created', handleActivityCreated);
      };
    }
  }, [socket]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
  };

  const handleTaskCreate = (newTask) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task._id !== taskId));
  };

  const handleActivityCreated = (newActivity) => {
    setActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Keep only last 20
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) {
      setIsDragging(false);
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      setIsDragging(false);
      return;
    }

    setIsDragging(true);

    try {
      const response = await axios.patch(`${API_BASE_URL}/api/tasks/${draggableId}/move`, {
        status: destination.droppableId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const updatedTask = response.data;
      setTasks(prev => prev.map(task => 
        task._id === draggableId ? updatedTask : task
      ));

      emitTaskUpdate({
        roomId: 'board',
        task: updatedTask
      });

      // Show success animation
      const taskElement = document.querySelector(`[data-task-id="${draggableId}"]`);
      if (taskElement) {
        taskElement.classList.add('success-move');
        setTimeout(() => {
          taskElement.classList.remove('success-move');
        }, 600);
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsDragging(false);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleCreateTask = async (taskData, setLocalError) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tasks`, taskData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const newTask = response.data;
      
      setTasks(prev => [...prev, newTask]);
      setShowTaskForm(false);
      setFormError('');

      emitTaskCreate({
        roomId: 'board',
        task: newTask
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create task.';
      if (setLocalError) setLocalError(msg);
      setFormError(msg);
    }
  };

  const handleEditTask = async (taskData, setLocalError) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/tasks/${taskData._id}`, taskData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedTask = response.data;
      
      setTasks(prev => prev.map(task => 
        task._id === taskData._id ? updatedTask : task
      ));
      setEditingTask(null);
      setFormError('');

      emitTaskUpdate({
        roomId: 'board',
        task: updatedTask
      });
    } catch (error) {
      if (error.response?.status === 409) {
        // Conflict detected
        const conflictData = error.response.data;
        setConflictData({
          currentVersion: conflictData.serverTask,
          incomingVersion: conflictData.clientTask
        });
      } else {
        const msg = error.response?.data?.message || 'Failed to update task.';
        if (setLocalError) setLocalError(msg);
        setFormError(msg);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));

      emitTaskDelete({
        roomId: 'board',
        taskId
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleSubmitTask = (taskData, setLocalError) => {
    if (editingTask) {
      handleEditTask(taskData, setLocalError);
    } else {
      handleCreateTask(taskData, setLocalError);
    }
  };

  const handleSmartAssign = async (task) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tasks/${task._id}/smart-assign`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedTask = response.data;
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      emitTaskUpdate({ roomId: 'board', task: updatedTask });
    } catch (error) {
      alert('Smart Assign failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Dashboard</h1>
        <div className="header-user">
          {user && <span>Logged in as: <b>{user.username}</b></span>}
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowTaskForm(true)}
          >
            Add Task
          </button>
          <button 
            className="btn-secondary"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {isDragging && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            <TaskColumn
              title="To Do"
              tasks={getTasksByStatus('todo')}
              status="todo"
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onSmartAssign={handleSmartAssign}
            />
            <TaskColumn
              title="In Progress"
              tasks={getTasksByStatus('in-progress')}
              status="in-progress"
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onSmartAssign={handleSmartAssign}
            />
            <TaskColumn
              title="Done"
              tasks={getTasksByStatus('done')}
              status="done"
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onSmartAssign={handleSmartAssign}
            />
          </div>
        </DragDropContext>
        
        <ActivityPanel activities={activities} />
      </div>

      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmitTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
            setFormError('');
          }}
          error={formError}
        />
      )}

      {conflictData && (
        <ConflictModal
          conflictData={conflictData}
          onResolved={() => {
            setConflictData(null);
            setEditingTask(null);
            fetchTasks(); // Refresh tasks after conflict resolution
          }}
        />
      )}
    </div>
  );
};

export default Dashboard; 
