import React, { useState } from 'react';
import './FileAttachment.css';

const FileAttachment = ({ taskId, attachments = [], onAttachmentAdd, onAttachmentRemove }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);

      try {
        const response = await fetch('/api/tasks/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const attachment = await response.json();
          onAttachmentAdd(attachment);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setUploading(false);
  };

  const handleRemove = async (attachmentId) => {
    try {
      const response = await fetch(`/api/tasks/attachment/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        onAttachmentRemove(attachmentId);
      }
    } catch (error) {
      console.error('Remove failed:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄', doc: '📝', docx: '📝', txt: '📄',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
      zip: '📦', rar: '📦', '7z': '📦',
      mp4: '🎥', avi: '🎥', mov: '🎥',
      mp3: '🎵', wav: '🎵', flac: '🎵'
    };
    return icons[ext] || '📎';
  };

  return (
    <div className="file-attachment">
      <div 
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input"
          id={`file-${taskId}`}
        />
        <label htmlFor={`file-${taskId}`} className="file-label">
          {uploading ? (
            <div className="uploading">📤 Uploading...</div>
          ) : (
            <>
              <div className="drop-icon">📎</div>
              <div>Drop files here or click to select</div>
              <div className="file-limit">Max 10MB per file</div>
            </>
          )}
        </label>
      </div>

      {attachments.length > 0 && (
        <div className="attachments-list">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-item">
              <span className="file-icon">{getFileIcon(attachment.filename)}</span>
              <div className="file-info">
                <div className="filename">{attachment.filename}</div>
                <div className="file-size">{formatFileSize(attachment.size)}</div>
              </div>
              <a 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="download-btn"
              >
                ⬇️
              </a>
              <button 
                onClick={() => handleRemove(attachment.id)}
                className="remove-btn"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileAttachment;