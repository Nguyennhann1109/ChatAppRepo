import { useState, useEffect } from 'react';
import { X, Save, XCircle } from 'lucide-react';
import './EditMessageModal.css';

function EditMessageModal({ 
  isOpen, 
  onClose, 
  message, 
  onSave, 
  onCancel 
}) {
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (isOpen && message) {
      setEditContent(message.content || '');
    }
  }, [isOpen, message]);

  const handleSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      onSave(editContent.trim());
    }
    onClose();
  };

  const handleCancel = () => {
    setEditContent(message.content || '');
    onCancel();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>Chỉnh sửa tin nhắn</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="edit-modal-content">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Nhập nội dung mới..."
            className="edit-textarea"
            autoFocus
            rows={4}
          />
          
          <div className="edit-modal-actions">
            <button 
              className="cancel-button"
              onClick={handleCancel}
            >
              <XCircle size={16} />
              Hủy
            </button>
            <button 
              className="save-button"
              onClick={handleSave}
              disabled={!editContent.trim() || editContent === message.content}
            >
              <Save size={16} />
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditMessageModal;
