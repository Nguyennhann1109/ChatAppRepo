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
import DetailsPanel from "../layout/DetailsPanel";

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
    <div className="min-h-screen h-screen w-full bg-gray-50 flex">
      {/* Left sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-semibold flex items-center justify-center">{(user.username || user.email || 'U')[0].toUpperCase()}</div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{user.username || user.email || 'User'}</div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('notifications')} className="text-gray-600 hover:text-gray-800">🔔 {unreadCount > 0 && <span className="ml-1 text-xs text-red-600">{unreadCount}</span>}</button>
            <button onClick={handleLogout} className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded">Đăng xuất</button>
          </div>
        </div>

        <div className="px-3 py-2 flex gap-2">
          <button onClick={() => setView('rooms')} className={`flex-1 py-2 text-sm font-medium rounded ${view === 'rooms' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>💬 Phòng</button>
          <button onClick={() => setView('friends')} className={`flex-1 py-2 text-sm font-medium rounded ${view === 'friends' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>👥 Bạn</button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {view === 'rooms' && <RoomList onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId} />}
          {view === 'friends' && (
            <div className="space-y-3">
              <AddFriend />
              <FriendRequests />
              <FriendList onSelectFriend={handleSelectFriend} />
            </div>
          )}
          {view === 'notifications' && <NotificationList onNotificationClick={handleNotificationClick} />}
        </div>

        <div className="px-3 py-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Cài đặt</div>
            <button onClick={() => setShowSettings(!showSettings)} className="text-gray-600">⚙️</button>
          </div>
          {showSettings && (
            <div ref={settingsRef} className="mt-2 bg-white border rounded shadow-sm p-3 text-sm">
              <ul className="space-y-1">
                <li className="hover:bg-gray-50 p-1 rounded">Chỉnh sửa hồ sơ</li>
                <li className="hover:bg-gray-50 p-1 rounded">Thông báo</li>
                <li className="hover:bg-gray-50 p-1 rounded">Chế độ tối</li>
                <li className="hover:bg-gray-50 p-1 rounded">Bảo mật</li>
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Center chat */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedRoomId ? (
            <ChatRoom roomId={selectedRoomId} key={selectedRoomId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">💬 Chọn phòng hoặc bạn để bắt đầu hội thoại</div>
          )}
        </div>
      </main>

      {/* Right details panel */}
      <aside className="w-80 bg-white border-l border-gray-200 hidden xl:block">
        <DetailsPanel roomId={selectedRoomId} />
      </aside>
    </div>
  );
}

export default ChatLayout;
