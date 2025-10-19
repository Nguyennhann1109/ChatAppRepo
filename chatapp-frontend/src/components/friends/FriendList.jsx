import { Avatar, Button, Modal, TextInput } from 'flowbite-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    HiCheck,
    HiSearch,
    HiUser,
    HiUserAdd,
    HiUserGroup,
    HiUserRemove,
    HiX
} from 'react-icons/hi';
import friendApi from '../../api/friendApi';
import { roomApi } from '../../api/roomApi';
import { useAuth } from '../../context/AuthContext';

const ModernFriendList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const friendInputRef = useRef(null);
  const [addingFriend, setAddingFriend] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);
  // server-side search result when local friends don't match
  const [userSearchResult, setUserSearchResult] = useState(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadFriendsData();
    }
  }, [user?.userId]);

  const loadFriendsData = async () => {
    try {
      // keep loading flag for the list areas only so the page chrome renders immediately
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
    const username = friendInputRef.current?.value?.trim() || '';
    if (!username) {
      toast.error('Vui lòng nhập tên đăng nhập');
      return;
    }

    setAddingFriend(true);
    setSearchingUser(true);
    try {
      // Tìm kiếm user theo username trước
      const searchResponse = await friendApi.searchUser(username);
      const foundUser = searchResponse.data;

      if (!foundUser || !foundUser.userId) {
        toast.error('Không tìm thấy người dùng với tên đăng nhập này');
        setAddingFriend(false);
        setSearchingUser(false);
        return;
      }

      // Kiểm tra không tự kết bạn với chính mình
      if (foundUser.userId === user.userId) {
        toast.error('Không thể kết bạn với chính mình');
        setAddingFriend(false);
        setSearchingUser(false);
        return;
      }

      // Gửi lời mời kết bạn với userId tìm được
      await friendApi.sendRequest(user.userId, foundUser.userId);
      toast.success('Đã gửi lời mời kết bạn');
      if (friendInputRef.current) friendInputRef.current.value = '';
      setShowAddFriendModal(false);
      loadFriendsData();
    } catch (error) {
      console.error('Lỗi gửi lời mời:', error);
      console.error('Error details:', error.response);
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy người dùng với tên đăng nhập này');
      } else if (error.response?.data) {
        // Nếu BE trả về message string
        const errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || 'Không thể gửi lời mời kết bạn';
        toast.error(errorMsg);
      } else {
        toast.error('Không thể gửi lời mời kết bạn. Vui lòng thử lại.');
      }
    } finally {
      setAddingFriend(false);
      setSearchingUser(false);
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      await friendApi.acceptRequest(user.userId, friendId);
      toast.success('Đã chấp nhận lời mời kết bạn');
      loadFriendsData();
    } catch (error) {
      console.error('Lỗi chấp nhận lời mời:', error);
      const msg = error.response?.data || error.message || 'Không thể chấp nhận lời mời';
      toast.error(msg);
    }
  };

  const handleRejectRequest = async (friendId) => {
    try {
      await friendApi.rejectRequest(user.userId, friendId);
      toast.success('Đã từ chối lời mời kết bạn');
      loadFriendsData();
    } catch (error) {
      console.error('Lỗi từ chối lời mời:', error);
      const msg = error.response?.data || error.message || 'Không thể từ chối lời mời';
      toast.error(msg);
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

  const handleStartChat = async (friend) => {
    try {
      // Lấy tất cả phòng của user
      const rooms = await roomApi.getUserRooms(user.userId);
      
      // Tìm phòng chat riêng tư với bạn này
      const existingRoom = rooms.find(room =>
        !room.isGroup && room.otherUserId === friend.friendId
      );

      if (existingRoom) {
        // Chuyển sang trang chat và mở phòng
        navigate(`/chat?roomId=${existingRoom.chatRoomId}`);
      } else {
        // Nếu chưa có phòng (lý thuyết không xảy ra vì accept friend đã tạo phòng)
        toast.error('Chưa có phòng chat với bạn này. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi mở phòng chat:', error);
      toast.error('Không thể mở phòng chat');
    }
  };


  // Tối ưu performance với useMemo
  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    return friends.filter(friend =>
      friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  // Debounced server search when local friends don't match
  useEffect(() => {
    let t;
    const q = searchTerm.trim();
    if (!q || filteredFriends.some(f => f.username?.toLowerCase().includes(q.toLowerCase()))) {
      setUserSearchResult(null);
      setUserSearchLoading(false);
      return;
    }

    if (q.length < 2) {
      setUserSearchResult(null);
      setUserSearchLoading(false);
      return;
    }

    setUserSearchLoading(true);
    t = setTimeout(async () => {
      try {
        const res = await friendApi.searchUser(q);
        setUserSearchResult(res.data || null);
      } catch (err) {
        setUserSearchResult(null);
      } finally {
        setUserSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [searchTerm, filteredFriends]);

  // Render page chrome immediately to improve perceived load time.
  // Lists will show local spinners while `loading` is true.

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

  {/* Pending Requests (consolidated below) */}
        {loading ? (
          <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Đang tải lời mời...</p>
            </div>
          </div>
        ) : pendingRequests.length > 0 ? (
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Lời mời kết bạn ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.userId}
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
                        {request.displayName || request.username || 'Unknown'}
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
                      onClick={() => handleAcceptRequest(request.userId)}
                    >
                      <HiCheck className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      color="failure"
                      onClick={() => handleRejectRequest(request.userId)}
                    >
                      <HiX className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

      {/* Server-side search result (when top search doesn't match local friends) */}
      {userSearchLoading ? (
        <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-1"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Tìm người dùng...</p>
          </div>
        </div>
      ) : userSearchResult ? (
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
            <div className="flex items-center space-x-3">
              <Avatar img={userSearchResult.avatarUrl} alt={userSearchResult.username} size="md" rounded />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{userSearchResult.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Người dùng</p>
              </div>
            </div>
            <div>
              <Button size="sm" color="primary" onClick={async () => {
                try {
                  await friendApi.sendRequest(user.userId, userSearchResult.userId);
                  toast.success('Đã gửi lời mời kết bạn');
                  loadFriendsData();
                } catch (err) {
                  console.error(err);
                  toast.error('Không thể gửi lời mời');
                }
              }}>Thêm bạn</Button>
            </div>
          </div>
        </div>
      ) : null}

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
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Hãy thêm bạn bè để bắt đầu trò chuyện'
              }
            </p>
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
                        {friend.displayName || friend.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{friend.username || 'unknown'}
                      </p>
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
                    onClick={() => handleStartChat(friend)}
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
      <Modal show={showAddFriendModal} onClose={() => {
        setShowAddFriendModal(false);
        if (friendInputRef.current) friendInputRef.current.value = '';
      }}>
        <Modal.Header>Thêm bạn bè</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập của bạn"
                ref={friendInputRef}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="primary"
            onClick={handleAddFriend}
            disabled={addingFriend || searchingUser}
          >
            {searchingUser ? 'Đang tìm kiếm...' : addingFriend ? 'Đang gửi...' : 'Gửi lời mời'}
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
