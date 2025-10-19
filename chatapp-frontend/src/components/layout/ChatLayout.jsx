// src/components/layout/ChatLayout.jsx
import { useState, useEffect, useRef } from "react";
import RoomList from "../rooms/RoomList";
import ChatRoom from "../chat/ChatRoom";
import { useAuth } from "../../context/AuthContext";
import FriendList from "../friends/FriendList";
import AddFriend from "../friends/AddFriend";
import FriendRequests from "../friends/FriendRequests";
import NotificationList from "../notifications/NotificationList";
import { useNotifications } from "../../hooks/useNotifications";
import { roomApi } from "../../api/roomApi";
import "./ChatLayout.css";

function ChatLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [view, setView] = useState("rooms"); // "rooms" | "friends" | "chat" | "notifications"
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  // Đóng popup nếu bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      await logout();
      window.location.href = "/login";
    }
  };

  // ✅ Sửa hàm này để tìm đúng phòng giữa 2 người (hoặc tạo mới nếu chưa có)
  const handleSelectFriend = async (friendId) => {
    try {
      const rooms = await roomApi.getAll();

      // Lọc ra các phòng private (1-1)
      for (const room of rooms) {
        if (room.isGroup) continue;
        const members = await roomApi.getMembers(room.chatRoomId);
        const hasCurrent = members.some(m => m.userId === user.userId);
        const hasFriend = members.some(m => m.userId === friendId);
        if (hasCurrent && hasFriend) {
          setSelectedRoomId(room.chatRoomId);
          setView("chat");
          return;
        }
      }

      // Nếu không tìm thấy phòng thì tạo mới
      console.log("⚠️ Không tìm thấy phòng -> tạo mới");
      const newRoomName = `private_${user.userId}_${friendId}`;
      const newRoom = await roomApi.create(newRoomName, false);

      // Thêm 2 thành viên vào phòng
      await roomApi.addMember(newRoom.chatRoomId, user.userId);
      await roomApi.addMember(newRoom.chatRoomId, friendId);

      setSelectedRoomId(newRoom.chatRoomId);
      setView("chat");
    } catch (error) {
      console.error("❌ Lỗi khi chọn bạn bè:", error);
      alert("Không thể mở phòng chat với người này.");
    }
  };

  // Xử lý chuyển hướng từ thông báo
  const handleNotificationClick = (navigationData) => {
    switch (navigationData.type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPT':
        setView('friends');
        break;
      case 'MESSAGE_UNREAD':
        if (navigationData.roomId) {
          setSelectedRoomId(navigationData.roomId);
          setView('chat');
        }
        break;
      case 'GROUP_ADD':
        if (navigationData.roomId) {
          setSelectedRoomId(navigationData.roomId);
          setView('chat');
        }
        break;
      case 'GROUP_REMOVE':
        setView('rooms');
        break;
      case 'GROUP_RENAME':
        if (navigationData.roomId) {
          setSelectedRoomId(navigationData.roomId);
          setView('chat');
        }
        break;
      default:
        console.log('Unknown notification type:', navigationData.type);
    }
  };

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {(user.username || user.email || "U")[0].toUpperCase()}
            </div>
            <div className="user-name">{user.username || user.email || "User"}</div>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>

        {/* Tabs */}
        <div className="sidebar-tabs">
          <button
            className={view === "rooms" ? "active" : ""}
            onClick={() => setView("rooms")}
          >
            💬 Phòng chat
          </button>
          <button
            className={view === "friends" ? "active" : ""}
            onClick={() => setView("friends")}
          >
            👥 Bạn bè
          </button>
          <button
            className={view === "notifications" ? "active" : ""}
            onClick={() => setView("notifications")}
          >
            🔔 Thông báo {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Sidebar content */}
        <div className="sidebar-content">
          {view === "rooms" && (
            <RoomList onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId} />
          )}
          {view === "friends" && (
            <div className="friends-section">
              <AddFriend />
              <FriendRequests />
              <FriendList onSelectFriend={handleSelectFriend} />
            </div>
          )}
          {view === "notifications" && (
            <NotificationList onNotificationClick={handleNotificationClick} />
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="btn-settings"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
          </button>

          {showSettings && (
  <div className="settings-popup" ref={settingsRef}>
    <h4>⚙️ Cài đặt</h4>
    <ul>
      <li>Chỉnh sửa hồ sơ</li>
      <li>Thông báo</li>
      <li>Chế độ tối</li>
      <li>Bảo mật</li>
    </ul>
  </div>
)}
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {selectedRoomId ? (
          <ChatRoom roomId={selectedRoomId} key={selectedRoomId} />
        ) : (
          <div className="empty-chat">💬 ChatApp xin chào!</div>
        )}
      </main>
    </div>
  );
}

export default ChatLayout;
