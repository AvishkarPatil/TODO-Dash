import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import '../styles/KanbanBoard.css';

const KanbanBoard = ({ tasks, onTasksUpdate }) => {
  const columns = [
    { id: 'Todo', title: 'Todo', color: '#ff6b6b' },
    { id: 'In Progress', title: 'In Progress', color: '#4ecdc4' },
    { id: 'Done', title: 'Done', color: '#45b7d1' }
  ];

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!Array.isArray(tasks)) return;
    
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;

    try {
      const response = await fetch(`/api/tasks/${draggableId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        onTasksUpdate(prev => prev.map(t => 
          t._id === draggableId ? updatedTask : t
        ));
      }
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const getTasksForColumn = (columnId) => {
    if (!Array.isArray(tasks)) {
      console.log('Tasks is not an array:', tasks);
      return [];
    }
    const columnTasks = tasks.filter(task => task.status === columnId);
    console.log(`Tasks for column ${columnId}:`, columnTasks);
    return columnTasks;
  };

  console.log('Rendering KanbanBoard with tasks:', tasks);
  console.log('Columns:', columns);

  // Ensure we have valid data before rendering
  if (!Array.isArray(tasks)) {
    return (
      <div className="kanban-board">
        <div className="kanban-columns">
          <div>Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksForColumn(column.id)}
              onTasksUpdate={onTasksUpdate}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard; 