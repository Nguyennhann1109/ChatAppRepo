import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import friendApi from '../../api/friendApi';
import { 
  HiUserAdd, 
  HiCheck, 
  HiX, 
  HiUserRemove,
  HiSearch,
  HiUser,
  HiUserGroup
} from 'react-icons/hi';
import { Button, Avatar, Badge, Modal, TextInput, Alert } from 'flowbite-react';
import { toast } from 'react-hot-toast';

const ModernFriendList = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadFriendsData();
    }
  }, [user?.userId]);

  const loadFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsResponse, pendingResponse] = await Promise.all([
        friendApi.getFriends(user.userId),
        friendApi.getRequests(user.userId)
      ]);
      
      setFriends(friendsResponse.data || []);
      setPendingRequests(pendingResponse.data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách bạn bè:', error);
      toast.error('Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!newFriendUsername.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập');
      return;
    }

    setAddingFriend(true);
    try {
      await friendApi.sendRequest(user.userId, newFriendUsername);
      toast.success('Đã gửi lời mời kết bạn');
      setNewFriendUsername('');
      setShowAddFriendModal(false);
      loadFriendsData();
    } catch (error) {
      console.error('Lỗi gửi lời mời:', error);
      toast.error(error.response?.data || 'Không thể gửi lời mời kết bạn');
    } finally {
      setAddingFriend(false);
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      await friendApi.acceptRequest(user.userId, friendId);
      toast.success('Đã chấp nhận lời mời kết bạn');
      loadFriendsData();
    } catch (error) {
      console.error('Lỗi chấp nhận lời mời:', error);
      toast.error('Không thể chấp nhận lời mời');
    }
  };

  const handleRejectRequest = async (friendId) => {
    try {
      await friendApi.rejectRequest(user.userId, friendId);
      toast.success('Đã từ chối lời mời kết bạn');
      loadFriendsData();
    } catch (error) {
      console.error('Lỗi từ chối lời mời:', error);
      toast.error('Không thể từ chối lời mời');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Bạn có chắc muốn xóa bạn này?')) {
      try {
        await friendApi.deleteFriend(user.userId, friendId);
        toast.success('Đã xóa bạn');
        loadFriendsData();
      } catch (error) {
        console.error('Lỗi xóa bạn:', error);
        toast.error('Không thể xóa bạn');
      }
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách bạn bè...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bạn bè</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {friends.length} người bạn
            </p>
          </div>
          <Button
            color="primary"
            onClick={() => setShowAddFriendModal(true)}
          >
            <HiUserAdd className="w-4 h-4 mr-2" />
            Thêm bạn
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <TextInput
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Lời mời kết bạn ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.friendId}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    img={request.avatarUrl}
                    alt={request.username}
                    size="md"
                    rounded
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Muốn kết bạn với bạn
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    color="success"
                    onClick={() => handleAcceptRequest(request.friendId)}
                  >
                    <HiCheck className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    color="failure"
                    onClick={() => handleRejectRequest(request.friendId)}
                  >
                    <HiX className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiUserGroup className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Hãy thêm bạn bè để bắt đầu trò chuyện'
              }
            </p>
            {!searchTerm && (
              <Button
                color="primary"
                onClick={() => setShowAddFriendModal(true)}
              >
                <HiUserAdd className="w-4 h-4 mr-2" />
                Thêm bạn bè
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((friend) => (
              <div
                key={friend.friendId}
                className="bg-white dark:bg-dark-700 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-dark-600 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      img={friend.avatarUrl}
                      alt={friend.username}
                      size="md"
                      rounded
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {friend.username}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Đang hoạt động
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="gray"
                    variant="ghost"
                    onClick={() => handleRemoveFriend(friend.friendId)}
                  >
                    <HiUserRemove className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    color="primary"
                    className="flex-1"
                  >
                    <HiUser className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      <Modal show={showAddFriendModal} onClose={() => setShowAddFriendModal(false)}>
        <Modal.Header>Thêm bạn bè</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên đăng nhập
              </label>
              <TextInput
                type="text"
                placeholder="Nhập tên đăng nhập của bạn"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="primary"
            onClick={handleAddFriend}
            disabled={addingFriend}
          >
            {addingFriend ? 'Đang gửi...' : 'Gửi lời mời'}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowAddFriendModal(false)}
          >
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ModernFriendList;
