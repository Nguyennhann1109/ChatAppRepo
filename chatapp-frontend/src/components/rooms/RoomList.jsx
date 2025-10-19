// src/components/friends/RoomList.jsx
import { useState, useEffect } from 'react';
import { roomApi } from '../../api/roomApi';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import './RoomList.css';
import CreateRoomModal from './CreateRoomModal';
import EditRoomModal from './EditRoomModal';

function RoomList({ onSelectRoom, selectedRoomId }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]); // danh sách tất cả user
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Map userId sang username
  const getRealName = (userId) => {
    const u = users.find(u => u.userId === userId);
    return u ? u.username : `User ${userId}`;
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await authApi.getAll();
        setUsers(allUsers || []);
      } catch (err) {
        console.error('❌ Lỗi load danh sách user:', err);
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (users.length === 0) return;
    // refreshKey allows forcing a reload when rooms were created/updated
    
    const loadRooms = async () => {
      setLoading(true);
      try {
        const data = await roomApi.getAll();

        const roomsWithDisplayName = await Promise.all(
          data.map(async (room) => {
            try {
              // Lấy danh sách thành viên cho từng phòng
              const members = await roomApi.getMembers(room.chatRoomId);

              // Nếu user hiện tại không thuộc về phòng này -> bỏ qua
              const isMember = members.some(m => m.userId === user.userId);
              if (!isMember) return null; // sẽ lọc sau Promise.all

              if (!room.isGroup) {
                const friend = members.find(m => m.userId !== user.userId);

                return {
                  ...room,
                  displayName: friend ? getRealName(friend.userId) : room.roomName
                };
              }

              // Group room (nếu là member thì hiển thị)
              return {
                ...room,
                displayName: room.roomName
              };
            } catch (err) {
              console.error(`❌ Lỗi load members cho room ${room.chatRoomId}:`, err);
              // Nếu lỗi khi lấy members thì bỏ qua phòng đó (an toàn hơn là hiển thị sai)
              return null;
            }
          })
        );

        // Loại bỏ các phần tử null (những phòng không có user làm thành viên)
        setRooms(roomsWithDisplayName.filter(Boolean));
      } catch (err) {
        console.error('❌ Lỗi load danh sách phòng:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadRooms();
  }, [users, user.userId, refreshKey]);

  if (loading) return <div className="room-list-loading">Đang tải...</div>;

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Phòng chat</h3>
        <button className="btn-new-room" onClick={() => setShowCreateModal(true)}>+</button>
      </div>

      <ul className="rooms">
        {rooms.map(room => (
          <li
            key={room.chatRoomId}
            className={`room-item ${selectedRoomId === room.chatRoomId ? 'active' : ''}`}
            onClick={() => onSelectRoom(room.chatRoomId)}
          >
            <div className="room-avatar">{room.isGroup ? '👥' : '👤'}</div>
            <div className="room-info">
              <strong>{room.displayName}</strong>
            </div>
            <div className="room-actions">
              <button className="btn-manage" onClick={(e) => { e.stopPropagation(); setEditingRoom(room); }}>⋯</button>
            </div>
          </li>
        ))}
      </ul>

      {showCreateModal && (
        <CreateRoomModal
          users={users}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            setRefreshKey(k => k + 1);
          }}
        />
      )}

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          users={users}
          onClose={() => setEditingRoom(null)}
          onUpdated={() => {
            setEditingRoom(null);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}

export default RoomList;
