import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { messageApi } from '../../api/messageApi';
import { roomApi } from '../../api/roomApi';
import { 
  HiPaperAirplane, 
  HiEmojiHappy, 
  HiPaperClip, 
  HiDotsVertical,
  HiCheck,
  HiCheckCircle,
  HiEye,
  HiTrash,
  HiPencil
} from 'react-icons/hi';
import { Button, Avatar, Badge, Dropdown } from 'flowbite-react';
import { toast } from 'react-hot-toast';

const ModernChatRoom = ({ roomId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  const [friendInfo, setFriendInfo] = useState(null);
  const [friendOnline, setFriendOnline] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    const loadRoomData = async () => {
    if (!user?.userId || !roomId) return;

    try {
      setLoading(true);
        const roomData = await roomApi.getById(roomId);
        setRoomInfo(roomData);

        const members = await roomApi.getMembers(roomId);
        const friend = members.find((m) => m.userId !== user.userId);
        if (friend) {
        setFriendInfo(friend);
        }

        const dataMsg = await messageApi.getByRoom(roomId);
      const msgs = (dataMsg.content || dataMsg) || [];
      
      // Decode base64 content if needed
        const decodedMsgs = msgs.map(m => ({
          ...m,
          content: m.content ? decodeBase64(m.content) : m.content
        }));

        setMessages(decodedMsgs);
      } catch (err) {
        console.error('❌ Lỗi load dữ liệu phòng:', err);
      toast.error('Không thể tải tin nhắn');
      } finally {
        setLoading(false);
      }
    };

    const decodeBase64 = (b64) => {
      try {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder().decode(bytes);
      } catch (e) {
        return b64;
      }
    };

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId || !user?.userId) return;

    try {
      const message = await messageApi.send(roomId, user.userId, newMessage.trim());
      setMessages(prev => [...prev, message]);
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

  const onMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const onPresenceUpdate = (presence) => {
    if (friendInfo && presence.userId === friendInfo.userId) {
      setFriendOnline(presence.online);
    }
  };

  useWebSocket(roomId, onMessage, onPresenceUpdate, user?.userId);

  useEffect(() => {
    loadRoomData();
  }, [roomId, user?.userId]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatus = (message) => {
    if (message.deleted) return 'deleted';
    if (message.editedAt) return 'edited';
    return 'sent';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <Dropdown.Item icon={HiEye}>Xem thông tin</Dropdown.Item>
          <Dropdown.Item icon={HiPencil}>Đổi tên phòng</Dropdown.Item>
          <Dropdown.Item icon={HiTrash} className="text-red-600">Xóa phòng</Dropdown.Item>
        </Dropdown>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === user?.userId;
          const messageStatus = getMessageStatus(message);
          
          return (
            <div
              key={message.messageId}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwn && (
                  <Avatar
                    img={friendInfo?.avatarUrl}
                    alt={friendInfo?.username}
                    size="sm"
                    rounded
                  />
                )}
                <div className={`
                  px-4 py-2 rounded-2xl shadow-sm
                  ${isOwn 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white'
                  }
                `}>
                  {message.deleted ? (
                    <p className="text-sm italic opacity-70">Tin nhắn đã bị xóa</p>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
          <Button size="sm" color="gray" variant="ghost">
            <HiPaperClip className="w-5 h-5" />
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
