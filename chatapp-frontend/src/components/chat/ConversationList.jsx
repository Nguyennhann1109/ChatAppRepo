import React, { useState, useEffect } from 'react';
import { roomApi } from '../../api/roomApi';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge, Button } from 'flowbite-react';
import { HiUserGroup, HiSearch, HiPlus } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import CreateGroupModal from './CreateGroupModal';
import { useWebSocket } from '../../hooks/useWebSocket';

const ConversationList = ({ onSelectRoom, selectedRoomId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    loadConversations();
  }, [user?.userId]);

  // Handle presence updates
  const handlePresenceUpdate = (presence) => {
    console.log('👥 Presence update in ConversationList:', {
      userId: presence.userId,
      online: presence.online,
      currentOnlineUsers: Array.from(onlineUsers)
    });
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (presence.online) {
        newSet.add(presence.userId);
        console.log('✅ Added user to online:', presence.userId);
      } else {
        newSet.delete(presence.userId);
        console.log('❌ Removed user from online:', presence.userId);
      }
      console.log('📊 Online users now:', Array.from(newSet));
      return newSet;
    });
  };

  // Subscribe to WebSocket for presence updates
  useWebSocket(null, null, handlePresenceUpdate, user?.userId);

  const loadConversations = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const rooms = await roomApi.getUserRooms(user.userId);
      
      // Sắp xếp theo thời gian tin nhắn cuối
      const sortedRooms = rooms.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });
      
      setConversations(sortedRooms);
      
      // Load initial online status từ backend
      const initialOnlineUsers = new Set();
      sortedRooms.forEach(room => {
        if (!room.isGroup && room.otherUserId && room.otherUserOnline) {
          initialOnlineUsers.add(room.otherUserId);
        }
      });
      setOnlineUsers(initialOnlineUsers);
      console.log('🟢 Initial online users:', Array.from(initialOnlineUsers));
      
      // Tự động chọn phòng đầu tiên nếu chưa có phòng nào được chọn
      if (!selectedRoomId && sortedRooms.length > 0) {
        onSelectRoom(sortedRooms[0].chatRoomId);
      }
    } catch (error) {
      console.error('❌ Lỗi load danh sách cuộc trò chuyện:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Nếu là lỗi 404 hoặc không có data, không hiển thị toast error
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('Chưa có cuộc trò chuyện nào hoặc API chưa sẵn sàng');
      } else {
        toast.error('Không thể tải danh sách cuộc trò chuyện');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Nếu trong ngày hôm nay
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Nếu trong tuần
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    }
    
    // Ngày tháng
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return 'Chưa có tin nhắn';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const handleGroupCreated = async (newRoomId) => {
    // Reload danh sách và chọn nhóm mới
    await loadConversations();
    onSelectRoom(newRoomId);
  };

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchQuery.toLowerCase();
    if (conv.isGroup) {
      return conv.roomName.toLowerCase().includes(searchLower);
    } else {
      return (conv.otherUsername?.toLowerCase().includes(searchLower) ||
              conv.otherDisplayName?.toLowerCase().includes(searchLower));
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tin nhắn
          </h2>
          <Button 
            size="sm" 
            color="primary"
            onClick={() => setShowCreateGroupModal(true)}
          >
            <HiPlus className="w-4 h-4 mr-1" />
            Tạo nhóm
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4">
              <HiUserGroup className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Kết bạn để bắt đầu chat
              </p>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = conv.chatRoomId === selectedRoomId;
            const displayName = conv.isGroup 
              ? conv.roomName 
              : (conv.otherDisplayName || conv.otherUsername);
            const avatarUrl = conv.isGroup ? null : conv.otherAvatarUrl;
            const isOnline = !conv.isGroup && conv.otherUserId && onlineUsers.has(conv.otherUserId);
            
            // Debug log
            if (!conv.isGroup) {
              console.log('🔍 Conversation:', {
                roomId: conv.chatRoomId,
                otherUserId: conv.otherUserId,
                otherUsername: conv.otherUsername,
                isOnline,
                onlineUsersHas: onlineUsers.has(conv.otherUserId),
                allOnlineUsers: Array.from(onlineUsers)
              });
            }

            return (
              <div
                key={conv.chatRoomId}
                onClick={() => onSelectRoom(conv.chatRoomId)}
                className={`
                  flex items-center p-4 cursor-pointer transition-colors
                  hover:bg-gray-50 dark:hover:bg-dark-700
                  ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' : ''}
                `}
              >
                {/* Avatar */}
                <div className="relative mr-3">
                  {conv.isGroup ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <HiUserGroup className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <Avatar
                      img={avatarUrl}
                      alt={displayName}
                      size="md"
                      rounded
                    />
                  )}
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-800 rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {displayName}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {truncateMessage(conv.lastMessage)}
                  </p>
                </div>

                {/* Unread Badge (placeholder) */}
                {/* {conv.unreadCount > 0 && (
                  <Badge color="primary" size="sm" className="ml-2">
                    {conv.unreadCount}
                  </Badge>
                )} */}
              </div>
            );
          })
        )}
      </div>

      {/* Modal tạo nhóm */}
      <CreateGroupModal
        show={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        userId={user?.userId}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default ConversationList;
