import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { messageApi } from '../../api/messageApi';
import { roomApi } from '../../api/roomApi';
import { useSearchParams } from 'react-router-dom';
import { 
  HiPaperAirplane, 
  HiEmojiHappy, 
  HiPaperClip, 
  HiDotsVertical,
  HiCheck,
  HiCheckCircle,
  HiEye,
  HiTrash,
  HiPencil,
  HiUserGroup,
  HiUsers
} from 'react-icons/hi';
import { Button, Avatar, Badge, Dropdown } from 'flowbite-react';
import { toast } from 'react-hot-toast';

const ModernChatRoom = ({ roomId }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [friendOnline, setFriendOnline] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(roomId || searchParams.get('roomId'));
  const [roomInfo, setRoomInfo] = useState(null);
  const [friendInfo, setFriendInfo] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Auto mark messages as seen
    markMessagesAsSeen();
  }, [messages]);

  const markMessagesAsSeen = async () => {
    if (!currentRoomId || !user?.userId || messages.length === 0) return;
    
    // Tìm tin nhắn cuối cùng chưa seen của người khác
    const lastUnseenMessage = messages
      .filter(m => m.senderId !== user.userId && !m.seen)
      .pop();
    
    if (lastUnseenMessage) {
      try {
        await messageApi.markSeen(currentRoomId, lastUnseenMessage.messageId, user.userId);
      } catch (error) {
        console.error('Lỗi mark seen:', error);
      }
    }
  };

  // Cập nhật currentRoomId khi roomId prop thay đổi
  useEffect(() => {
    if (roomId) {
      setCurrentRoomId(roomId);
    }
  }, [roomId]);

  const loadRoomData = async () => {
    if (!currentRoomId || !user?.userId) return;
    
    try {
      // Load song song để nhanh hơn
      const [msgs, roomData] = await Promise.all([
        messageApi.getByRoom(currentRoomId),
        roomApi.getById(currentRoomId)
      ]);
      
      setMessages(msgs);
      setRoomInfo(roomData);
      
      // Nếu là phòng riêng tư (2 người), load thông tin bạn bè
      if (roomData.members?.length === 2) {
        const friendId = roomData.members.find(m => m.userId !== user.userId)?.userId;
        if (friendId) {
          const friendData = roomData.members.find(m => m.userId === friendId);
          setFriendInfo(friendData);
          // Set initial online status (giả sử offline, sẽ được update qua WebSocket)
          setFriendOnline(false);
          console.log('👤 Loaded friend info:', friendData);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Lỗi load dữ liệu phòng:', error);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoomId || !user?.userId) return;

    try {
      await messageApi.send(currentRoomId, user.userId, newMessage.trim());
      // Không add vào state ngay, chờ WebSocket broadcast
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    // Implement typing indicator
  };

  const handleEditMessage = async (messageId, currentContent) => {
    const newContent = window.prompt('Sửa tin nhắn:', currentContent);
    if (!newContent || newContent === currentContent) return;

    try {
      await messageApi.edit(messageId, user.userId, newContent);
      toast.success('Đã sửa tin nhắn');
      // Tin nhắn sẽ được cập nhật qua WebSocket
      loadRoomData();
    } catch (error) {
      console.error('Lỗi sửa tin nhắn:', error);
      toast.error('Không thể sửa tin nhắn');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;

    try {
      await messageApi.softDelete(messageId, user.userId);
      toast.success('Đã xóa tin nhắn');
      loadRoomData();
    } catch (error) {
      console.error('Lỗi xóa tin nhắn:', error);
      toast.error('Không thể xóa tin nhắn');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ Không có file được chọn');
      return;
    }

    console.log('📎 File được chọn:', file.name, 'Size:', file.size);

    // Kiểm tra kích thước file (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn! Tối đa 10MB');
      return;
    }

    setUploading(true);
    try {
      console.log('⬆️ Đang upload file...');
      const result = await messageApi.uploadMedia(currentRoomId, user.userId, file);
      console.log('✅ Upload thành công:', result);
      toast.success('Đã gửi file');
      // Tin nhắn sẽ được broadcast qua WebSocket
      loadRoomData();
    } catch (error) {
      console.error('❌ Lỗi upload file:', error);
      console.error('❌ Error response:', error.response);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Lỗi không xác định';
      toast.error('Không thể gửi file: ' + errorMsg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng chat này? Tất cả tin nhắn sẽ bị xóa.')) return;
    
    try {
      await roomApi.delete(currentRoomId);
      toast.success('Đã xóa phòng chat');
      // Chuyển về trang chat chính
      window.location.href = '/chat';
    } catch (error) {
      console.error('Lỗi xóa phòng:', error);
      toast.error('Không thể xóa phòng chat');
    }
  };

  const handleRenameRoom = async () => {
    const newName = window.prompt('Nhập tên mới cho phòng:', roomInfo?.roomName);
    if (!newName || newName === roomInfo?.roomName) return;

    try {
      await roomApi.update(currentRoomId, newName);
      toast.success('Đã đổi tên phòng');
      loadRoomData();
    } catch (error) {
      console.error('Lỗi đổi tên phòng:', error);
      toast.error('Không thể đổi tên phòng');
    }
  };

  const handleViewInfo = () => {
    toast.info('Tính năng xem thông tin phòng đang phát triển');
  };

  const onMessage = (message) => {
    setMessages(prev => {
      // Kiểm tra xem message đã tồn tại chưa (dựa vào messageId)
      const exists = prev.some(m => m.messageId === message.messageId);
      if (exists) {
        // Nếu đã tồn tại, update message đó (cho trường hợp edit/seen)
        return prev.map(m => m.messageId === message.messageId ? message : m);
      }
      // Nếu chưa tồn tại, thêm vào cuối
      return [...prev, message];
    });
  };

  const onPresenceUpdate = (presence) => {
    console.log('👤 Presence update:', presence, 'friendInfo:', friendInfo);
    if (friendInfo && presence.userId === friendInfo.userId) {
      console.log('✅ Updating friend online status:', presence.online);
      setFriendOnline(presence.online);
    }
  };

  useWebSocket(currentRoomId, onMessage, onPresenceUpdate, user?.userId);

  useEffect(() => {
    if (currentRoomId && user?.userId) {
      loadRoomData();
    }
  }, [currentRoomId, user?.userId]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatus = (message) => {
    if (message.deleted) return 'deleted';
    if (message.seen) return 'seen';
    if (message.delivered) return 'delivered';
    return 'sent';
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-dark-800">
        {/* Skeleton Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-dark-600 rounded-full"></div>
            <div>
              <div className="h-4 w-24 bg-gray-300 dark:bg-dark-600 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-300 dark:bg-dark-600 rounded"></div>
            </div>
          </div>
        </div>
        {/* Skeleton Messages */}
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
              <div className="max-w-xs">
                <div className="h-16 w-48 bg-gray-300 dark:bg-dark-600 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không có phòng chat
  if (!currentRoomId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiUserGroup className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Chưa có cuộc trò chuyện nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Để bắt đầu chat, hãy kết bạn với ai đó hoặc tạo phòng chat nhóm mới.
          </p>
          <div className="space-y-3">
            <Button 
              color="primary" 
              className="w-full"
              onClick={() => window.location.href = '/friends'}
            >
              <HiUsers className="w-4 h-4 mr-2" />
              Kết bạn để chat
            </Button>
            <Button 
              color="gray" 
              variant="outline" 
              className="w-full"
            >
              <HiUserGroup className="w-4 h-4 mr-2" />
              Tạo phòng chat nhóm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiPaperAirplane className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Không tìm thấy phòng chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-800">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
        <div className="flex items-center space-x-3">
          <Avatar
            img={friendInfo?.avatarUrl}
            alt={friendInfo?.username || roomInfo.roomName}
            size="md"
            rounded
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {friendInfo?.username || roomInfo.roomName}
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${friendOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {friendOnline ? 'Đang hoạt động' : 'Không hoạt động'}
          </span>
            </div>
          </div>
        </div>
        <Dropdown label="" renderTrigger={() => <Button size="sm" color="gray" variant="ghost"><HiDotsVertical className="w-5 h-5" /></Button>}>
          <Dropdown.Item icon={HiEye} onClick={handleViewInfo}>Xem thông tin</Dropdown.Item>
          <Dropdown.Item icon={HiPencil} onClick={handleRenameRoom}>Đổi tên phòng</Dropdown.Item>
          <Dropdown.Item icon={HiTrash} className="text-red-600" onClick={handleDeleteRoom}>Xóa phòng</Dropdown.Item>
        </Dropdown>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === user?.userId;
          const messageStatus = getMessageStatus(message);
          
          // Debug log cho tất cả messages
          console.log('💬 Message:', {
            messageId: message.messageId,
            hasMediaUrl: !!message.mediaUrl,
            mediaUrl: message.mediaUrl,
            mediaContentType: message.mediaContentType,
            mediaFileName: message.mediaFileName,
            contentPreview: message.content?.substring(0, 30)
          });
          
          return (
            <div
              key={message.messageId}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in group`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''} relative`}>
                {!isOwn && (
                  <Avatar
                    img={friendInfo?.avatarUrl}
                    alt={friendInfo?.username}
                    size="sm"
                    rounded
                  />
                )}
                <div className="flex items-start space-x-2">
                  <div className={`
                    px-4 py-2 rounded-2xl shadow-sm
                    ${isOwn 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white'
                    }
                  `}>
                    {message.deleted ? (
                      <p className="text-sm italic opacity-70">Tin nhắn đã bị xóa</p>
                    ) : (message.mediaUrl && message.mediaUrl.trim()) ? (
                      <>
                        {/* Hiển thị file/ảnh */}
                        {message.mediaContentType?.startsWith('image/') ? (
                          <img 
                            src={`http://localhost:8080${message.mediaUrl}`} 
                            alt={message.mediaFileName}
                            className="max-w-xs rounded-lg cursor-pointer"
                            onClick={() => window.open(`http://localhost:8080${message.mediaUrl}`, '_blank')}
                          />
                        ) : (
                          <a 
                            href={`http://localhost:8080${message.mediaUrl}`}
                            download={message.mediaFileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 p-2 bg-white/10 rounded hover:bg-white/20 transition"
                          >
                            <HiPaperClip className="w-5 h-5" />
                            <div className="text-left">
                              <p className="text-sm font-medium">{message.mediaFileName || 'File đính kèm'}</p>
                              <p className="text-xs opacity-75">Bấm để tải về</p>
                            </div>
                          </a>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatTime(message.sentAt)}
                            {message.editedAt && ' (đã sửa)'}
                          </span>
                          {isOwn && (
                            <div className="flex items-center space-x-1">
                              {messageStatus === 'sent' && <HiCheck className="w-3 h-3" />}
                              {messageStatus === 'delivered' && <HiCheckCircle className="w-3 h-3" />}
                              {messageStatus === 'seen' && <HiCheckCircle className="w-3 h-3 text-blue-500" />}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Chỉ hiển thị content nếu không phải base64 hoặc placeholder */}
                        {message.content && 
                         !message.content.startsWith('data:image') && 
                         message.content !== '[File đính kèm]' && (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatTime(message.sentAt)}
                            {message.editedAt && ' (đã sửa)'}
                          </span>
                          {isOwn && (
                            <div className="flex items-center space-x-1">
                              {messageStatus === 'sent' && <HiCheck className="w-3 h-3" />}
                              {messageStatus === 'delivered' && <HiCheckCircle className="w-3 h-3" />}
                              {messageStatus === 'seen' && <HiCheckCircle className="w-3 h-3 text-blue-500" />}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Nút 3 chấm dropdown (chỉ hiện cho tin nhắn của mình và chưa bị xóa) */}
                  {isOwn && !message.deleted && (
                    <Dropdown
                      label=""
                      dismissOnClick={true}
                      renderTrigger={() => (
                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full">
                          <HiDotsVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      )}
                    >
                      <Dropdown.Item icon={HiPencil} onClick={() => handleEditMessage(message.messageId, message.content)}>
                        Sửa tin nhắn
                      </Dropdown.Item>
                      <Dropdown.Item icon={HiTrash} className="text-red-600" onClick={() => handleDeleteMessage(message.messageId)}>
                        Xóa tin nhắn
                      </Dropdown.Item>
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{typingUsers.join(', ')} đang nhập...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
        <div className="flex items-end space-x-2">
          <input 
            ref={fileInputRef}
            type="file"
            accept="*/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            size="sm" 
            color="gray" 
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            ) : (
              <HiPaperClip className="w-5 h-5" />
            )}
          </Button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onInput={handleTyping}
          placeholder="Nhập tin nhắn..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-2xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <Button size="sm" color="gray" variant="ghost">
            <HiEmojiHappy className="w-5 h-5" />
          </Button>
          <Button 
            size="sm" 
            color="primary" 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            <HiPaperAirplane className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernChatRoom;
