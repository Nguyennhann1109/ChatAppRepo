// src/components/friends/FriendList.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import friendApi from "../../api/friendApi";
import { authApi } from "../../api/authApi"; // Dùng authApi để lấy danh sách user
import './Friends.css';

function FriendList({ onSelectFriend }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]); // Danh sách tất cả user
  const [loading, setLoading] = useState(true);

  // Hàm map friendId sang username
  const getRealName = (friendId) => {
    const u = users.find(u => u.userId === friendId);
    return u ? u.username : `User ${friendId}`;
  };

  const loadFriends = async () => {
    setLoading(true);
    try {
      const res = await friendApi.getFriends(user.userId);
      setFriends(res.data || []);
    } catch (err) {
      console.error(err);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await authApi.getAll(); // Lấy tất cả user
      setUsers(allUsers || []);
    } catch (err) {
      console.error("Lỗi load users:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      loadFriends();
    }
  }, [users]);

  const removeFriend = async (friendId) => {
    if (!window.confirm('Xác nhận xóa bạn?')) return;
    try {
      await friendApi.deleteFriend(user.userId, friendId);
      alert('Đã xóa bạn');
      loadFriends();
    } catch (err) {
      console.error(err);
      alert('Xóa thất bại');
    }
  };

  if (loading) return <div className="small">Đang tải...</div>;

  return (
    <div className="friends-panel">
      <div className="friends-header">
        <h3>Bạn bè</h3>
      </div>

      <ul className="user-list">
        {friends.length === 0 && <li className="empty">Chưa có bạn nào</li>}
        {friends.map(f => (
          <li 
            key={f.friendId} 
            className="user-item" 
            onClick={() => onSelectFriend(f.friendId)}
          >
            <div className="user-left">
              <div className="avatar">{getRealName(f.friendId)[0]?.toUpperCase()}</div>
              <div>
                <div className="username">{getRealName(f.friendId)}</div>

              </div>
            </div>
            <div>
              <button 
                className="btn-danger" 
                onClick={(e) => { e.stopPropagation(); removeFriend(f.friendId); }}
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FriendList;
