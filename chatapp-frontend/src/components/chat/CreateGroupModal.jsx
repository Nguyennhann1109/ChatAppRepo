import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { roomApi } from '../../api/roomApi';
import { HiX } from 'react-icons/hi';

const CreateGroupModal = ({ show, onClose, userId, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [show]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }

    try {
      setCreatingGroup(true);
      const newRoom = await roomApi.create(groupName.trim(), true);
      
      // Thêm user hiện tại vào nhóm (tự add, không cần notification)
      await roomApi.addMember(newRoom.chatRoomId, userId, 'admin', userId);
      
      toast.success('Đã tạo nhóm thành công!');
      setGroupName('');
      
      // Callback để parent component xử lý TRƯỚC khi đóng modal
      try {
        if (onGroupCreated) {
          await onGroupCreated(newRoom.chatRoomId);
        }
      } catch (callbackError) {
        console.error('Error in onGroupCreated callback:', callbackError);
        // Vẫn đóng modal ngay cả khi callback lỗi
      }
      
      onClose();
    } catch (error) {
      console.error('Lỗi tạo nhóm:', error);
      // Xử lý error message từ backend
      let errorMsg = 'Không thể tạo nhóm';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tạo nhóm chat mới</h3>
          <button
            onClick={handleClose}
            disabled={creatingGroup}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên nhóm
            </label>
            <input
              ref={inputRef}
              id="groupName"
              type="text"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !creatingGroup && handleCreateGroup()}
              disabled={creatingGroup}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sau khi tạo nhóm, bạn có thể thêm thành viên vào nhóm.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={creatingGroup}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={creatingGroup || !groupName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingGroup ? 'Đang tạo...' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
