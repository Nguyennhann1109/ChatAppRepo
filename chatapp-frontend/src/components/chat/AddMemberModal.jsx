import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { roomApi } from '../../api/roomApi';
import friendApi from '../../api/friendApi';
import { useAuth } from '../../context/AuthContext';
import { HiX, HiUserAdd } from 'react-icons/hi';

const AddMemberModal = ({ show, onClose, roomId, currentMembers = [] }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (show) {
      console.log('🔵 AddMemberModal opened for room', roomId);
      loadFriends();
    }
  }, [show, roomId, user?.userId]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      console.log('📋 Loading friends for user', user.userId);
      const response = await friendApi.getFriends(user.userId);
      const friendsList = response.data || [];
      console.log('📋 Got', friendsList.length, 'friends');
      
      // Lọc ra những người chưa có trong nhóm
      const currentMemberIds = currentMembers.map(m => m.userId);
      console.log('📋 Current members:', currentMemberIds);
      
      // Lọc: không bao gồm members hiện tại VÀ không bao gồm chính mình
      // FriendDTO có friendId, không phải userId
      const availableFriends = friendsList.filter(f => 
        !currentMemberIds.includes(f.friendId) && f.friendId !== user.userId
      );
      console.log('📋 Available to add:', availableFriends.length, 'friends (excluded self:', user.userId, ')');
      setFriends(availableFriends);
    } catch (error) {
      console.error('Lỗi load danh sách bạn bè:', error);
      toast.error('Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFriend = (friendUserId) => {
    setSelectedFriends(prev => 
      prev.includes(friendUserId) 
        ? prev.filter(id => id !== friendUserId)
        : [...prev, friendUserId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người');
      return;
    }

    setAdding(true);
    try {
      console.log('➕ Adding members:', selectedFriends, 'to room', roomId, 'by user', user.userId);
      // Add từng member, truyền addedBy để backend biết ai đang thêm
      const results = await Promise.all(
        selectedFriends.map(userId => {
          console.log('➕ Adding user', userId, 'to room', roomId, 'by', user.userId);
          return roomApi.addMember(roomId, userId, 'member', user.userId);
        })
      );
      console.log('✅ Add members results:', results);
      
      toast.success(`Đã thêm ${selectedFriends.length} thành viên`);
      setSelectedFriends([]);
      onClose();
    } catch (error) {
      console.error('Lỗi thêm thành viên:', error);
      toast.error('Không thể thêm thành viên');
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedFriends([]);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm thành viên</h3>
          <button
            onClick={handleClose}
            disabled={adding}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Không có bạn bè nào để thêm
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map(friend => (
                <label
                  key={friend.friendId}
                  className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.friendId)}
                    onChange={() => handleToggleFriend(friend.friendId)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div className="ml-3 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold">
                        {friend.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {friend.displayName || friend.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{friend.username}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            {selectedFriends.length > 0 && `Đã chọn ${selectedFriends.length} người`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={adding}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              onClick={handleAddMembers}
              disabled={adding || selectedFriends.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <HiUserAdd className="w-4 h-4 mr-2" />
              {adding ? 'Đang thêm...' : 'Thêm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
