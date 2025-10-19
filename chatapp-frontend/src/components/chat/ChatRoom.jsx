import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { messageApi } from '../../api/messageApi';
import { roomApi } from '../../api/roomApi';
import { presenceApi } from '../../api/presenceApi';
import EmojiPicker from "emoji-picker-react";
import { Smile, MoreVertical, Edit, Trash2 } from "lucide-react";
import EditMessageModal from './EditMessageModal';

import './ChatRoom.css';

function ChatRoom({ roomId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  const [friendName, setFriendName] = useState(null);
  const [friendId, setFriendId] = useState(null);
  const [friendOnlineStatus, setFriendOnlineStatus] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const presencePollRef = useRef(null);

  // 🔹 Load dữ liệu phòng
  useEffect(() => {
    const loadRoomData = async () => {
      setLoading(true);
      console.log("🔍 Loading room data for roomId:", roomId);
      console.log("🔍 Room type:", typeof roomId, "Value:", roomId);
      try {
        const roomData = await roomApi.getById(roomId);
        console.log("🔍 Room data:", roomData);
        console.log("🔍 Room ID from API:", roomData?.chatRoomId);
        setRoomInfo(roomData);

        const members = await roomApi.getMembers(roomId);
        const friend = members.find((m) => m.userId !== user.userId);
        if (friend) {
          setFriendId(friend.userId);
          setFriendName(friend.username);
        }

        const dataMsg = await messageApi.getByRoom(roomId);
        // Nếu backend lưu base64 encoded content (workaround), decode trước khi set vào state
        const decodeBase64 = (b64) => {
          try {
            const binary = atob(b64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return new TextDecoder().decode(bytes);
          } catch (e) {
            // Nếu không phải base64 hoặc decode lỗi thì trả về nguyên bản
            return b64;
          }
        };

        const msgs = (dataMsg.content || dataMsg) || [];
        const decodedMsgs = msgs.map(m => ({
          ...m,
          content: m.content ? decodeBase64(m.content) : m.content
        }));

        console.log("📥 Loaded messages:", decodedMsgs);
        console.log("📥 Number of messages:", decodedMsgs.length);
        console.log("📥 First few messages:", decodedMsgs.slice(0, 3));
        setMessages(decodedMsgs);
        // Lấy trạng thái online ban đầu nếu có friend
        if (friend) {
          try {
            presenceApi.isUserOnline(friend.userId).then((online) => {
              setFriendOnlineStatus(!!online);
            }).catch((e) => console.warn('⚠️ error fetching presence:', e));
          } catch (e) {
            console.warn('⚠️ error initiating presence fetch:', e);
          }
        }
      } catch (err) {
        console.error('❌ Lỗi load dữ liệu phòng:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId && roomId) loadRoomData();
  }, [roomId, user?.userId]);

  // 🔹 Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔹 Nhận tin nhắn qua websocket (bao gồm cả new và updates)
  const handleWebSocketMessage = useCallback((msg) => {
    console.log("📨 Nhận tin nhắn từ WebSocket:", msg);
    // Nếu tin nhắn body được gửi ở dạng base64 thì decode
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

    if (msg.content) {
      msg = { ...msg, content: decodeBase64(msg.content) };
    }
    
    // Kiểm tra xem đây là tin nhắn mới hay update
    const existingMessage = messages.find(m => m.messageId === msg.messageId);
    
    if (existingMessage) {
      // Đây là update (edit/delete)
      console.log("📝 Cập nhật tin nhắn:", msg);
      setMessages((prev) => 
        prev.map(m => m.messageId === msg.messageId ? msg : m)
      );
    } else {
      // Đây là tin nhắn mới
      console.log("📨 Tin nhắn mới:", msg);
      setMessages((prev) => [...prev, msg]);
    }
  }, [messages]);

  // 🔹 Handle presence updates from websocket
  const handlePresenceUpdate = useCallback((presence) => {
    // expected presence shape: { userId, online } or { userId, status }
    try {
      console.log('🔔 presence event received in ChatRoom:', presence);
      const uid = presence.userId || presence.id || presence.user || null;
      const online = (typeof presence.online !== 'undefined') ? presence.online : (presence.status === 'ONLINE' || presence.status === 'online');
      if (friendId && uid === friendId) {
        setFriendOnlineStatus(!!online);
      }
    } catch (e) {
      console.warn('⚠️ Could not parse presence update:', presence, e);
    }
  }, [friendId]);

  const { connected, sendMessage } = useWebSocket(roomId, handleWebSocketMessage, handlePresenceUpdate, user?.userId);

  // When friendId changes, fetch initial presence and start polling fallback
  useEffect(() => {
    // clear previous poll
    if (presencePollRef.current) {
      clearInterval(presencePollRef.current);
      presencePollRef.current = null;
    }

    if (!friendId) return;

    let mounted = true;
    (async () => {
      try {
        const online = await presenceApi.isUserOnline(friendId);
        if (mounted) {
          console.log('🔍 initial presence fetch for', friendId, online);
          setFriendOnlineStatus(!!online);
        }
      } catch (e) {
        console.warn('⚠️ error fetching presence initial:', e);
      }
    })();

    // start polling every 5s as fallback
    presencePollRef.current = setInterval(async () => {
      try {
        const online = await presenceApi.isUserOnline(friendId);
        //console.log('🔁 presence poll', friendId, online);
        setFriendOnlineStatus(!!online);
      } catch (e) {
        console.warn('⚠️ presence poll error:', e);
      }
    }, 5000);

    return () => {
      mounted = false;
      if (presencePollRef.current) {
        clearInterval(presencePollRef.current);
        presencePollRef.current = null;
      }
    };
  }, [friendId]);

  // 🔹 Gửi tin nhắn text
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      console.log("📤 Đang gửi tin nhắn qua API - roomId:", roomId, "userId:", user.userId, "content:", inputMessage.trim());
      console.log("📤 RoomId type:", typeof roomId, "UserId type:", typeof user.userId);
      console.log("📤 Current room info:", roomInfo);
      // Gửi tin nhắn qua HTTP API để lưu vào database
      const response = await messageApi.send(roomId, user.userId, inputMessage.trim());
      console.log("📤 Gửi tin nhắn qua API thành công:", response);
      console.log("📤 Response messageId:", response?.messageId);
      setInputMessage('');
    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn:', err);
      console.error('❌ Chi tiết lỗi:', err.response?.data || err.message);
      console.error('❌ Error status:', err.response?.status);
    }
  };

  // 🔹 Upload file / ảnh
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await messageApi.uploadMedia(roomId, user.userId, file);
      console.log("✅ Upload thành công:", uploaded.mediaUrl);
    } catch (err) {
      console.error("❌ Upload thất bại:", err);
    } finally {
      e.target.value = "";
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  // 🔹 Chèn emoji vào input
  const handleEmojiClick = (emojiData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // 🔹 Xử lý edit tin nhắn
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setShowEditModal(true);
    setShowMessageMenu(null);
  };

  const handleSaveEdit = async (newContent) => {
    if (!editingMessage) return;
    
    try {
      await messageApi.edit(editingMessage.messageId, user.userId, newContent);
      console.log("✅ Sửa tin nhắn thành công");
    } catch (err) {
      console.error("❌ Lỗi sửa tin nhắn:", err);
      alert("Không thể sửa tin nhắn. Vui lòng thử lại.");
    }
  };

  // 🔹 Xử lý xóa tin nhắn
  const handleDeleteMessage = async (message) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) return;
    
    try {
      await messageApi.softDelete(message.messageId, user.userId);
      console.log("✅ Xóa tin nhắn thành công");
    } catch (err) {
      console.error("❌ Lỗi xóa tin nhắn:", err);
      alert("Không thể xóa tin nhắn. Vui lòng thử lại.");
    }
    setShowMessageMenu(null);
  };

  // 🔹 Toggle menu context
  const toggleMessageMenu = (messageId) => {
    console.log("🖱️ Click menu button for message:", messageId);
    console.log("🖱️ Current showMessageMenu:", showMessageMenu);
    const newValue = showMessageMenu === messageId ? null : messageId;
    console.log("🖱️ Setting showMessageMenu to:", newValue);
    setShowMessageMenu(newValue);
  };

  // 🔹 Đóng menu khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.message-menu') && !event.target.closest('.message-menu-button')) {
        setShowMessageMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 🔹 Render nội dung tin nhắn
  const renderMessageContent = (msg) => {
    if (!msg) return null;

    // Hiển thị tin nhắn đã bị xóa
    if (msg.deleted) {
      return <p className="deleted-message">Tin nhắn đã bị xóa</p>;
    }

    const getFileUrl = (url) => url.startsWith('/')
      ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}${url}`
      : url;

    if (msg.mediaUrl) {
      const fileUrl = getFileUrl(msg.mediaUrl);
      const isImage = msg.mediaContentType?.startsWith('image/') ||
        msg.mediaFileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

      if (isImage) return <img src={fileUrl} alt="Ảnh gửi" className="chat-image" />;
      const fileName = msg.mediaFileName || decodeURIComponent(fileUrl.split('/').pop());
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="chat-file">📎 {fileName}</a>;
    }

    if (msg.content && msg.content.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <img src={msg.content} alt="Ảnh" className="chat-image" />;
    }

    return <p>{msg.content}</p>;
  };

  if (loading) return <div className="loading">Đang tải tin nhắn...</div>;

  return (
    <div className="chat-room">
      {/* Header */}
      <div className="chat-header">
        <h3>{roomInfo?.isGroup ? roomInfo.roomName : friendName || `Phòng #${roomId}`}</h3>
        {friendId && (
          <span className={`status ${friendOnlineStatus ? 'online' : 'offline'}`}>
            {friendOnlineStatus ? '🟢 Online' : '🔴 Offline'}
          </span>
        )}
      </div>

      {/* Message List */}
      <div className="message-list">
        {messages.map(msg => (
          <div key={msg.messageId || Math.random()} className={`message ${msg.senderId === user.userId ? 'sent' : 'received'}`}>
            <div className="message-content">{renderMessageContent(msg)}</div>
            <div className="message-meta">
              <div className="message-time">
                {msg.sentAt && new Date(msg.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                {msg.editedAt && <span className="edited-indicator"> (đã sửa)</span>}
              </div>
              {msg.senderId === user.userId && !msg.deleted && (
                <div className={`message-actions ${showMessageMenu === msg.messageId ? 'show' : ''}`}>
                  <button 
                    className="message-menu-button"
                    onClick={() => toggleMessageMenu(msg.messageId)}
                    title="Tùy chọn"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {showMessageMenu === msg.messageId && (
                    <div className="message-menu">
                      {console.log("🔍 Rendering menu for message:", msg.messageId)}
                      <button 
                        className="menu-item"
                        onClick={() => handleEditMessage(msg)}
                      >
                        <Edit size={14} />
                        Sửa
                      </button>
                      <button 
                        className="menu-item delete"
                        onClick={() => handleDeleteMessage(msg)}
                        style={{ display: 'block' }}
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="message-input">
        {/* File upload */}
        <button type="button" onClick={triggerFileSelect} title="Gửi ảnh hoặc file">📎</button>
        <input
          type="file"
          accept="image/*,application/pdf,application/zip,.doc,.docx,.xls,.xlsx"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Emoji picker */}
        <button
          type="button"
          className="emoji-button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
        >
          <Smile size={22} />
        </button>
        {showEmojiPicker && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* Text input */}
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!connected}
        />

        <button type="submit" disabled={!connected || !inputMessage.trim()}>Gửi</button>
      </form>

      {/* Edit Message Modal */}
      <EditMessageModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        message={editingMessage}
        onSave={handleSaveEdit}
        onCancel={() => setEditingMessage(null)}
      />
    </div>
  );
}

export default ChatRoom;
