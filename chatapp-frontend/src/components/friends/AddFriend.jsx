import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import friendApi from '../../api/friendApi';
import axios from '../../api/axios';
import './Friends.css';

export default function AddFriend() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(new Set());
  const [friends, setFriends] = useState(new Set());
  const [pendingRequests, setPendingRequests] = useState(new Map()); // Map<senderId, username>

  useEffect(() => {
    if (!user?.userId) return;

    const loadUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data || []);
      } catch (e) {
        console.error('Lỗi load users:', e);
      }
    };

    const loadFriends = async () => {
      try {
        const res = await friendApi.getFriends(user.userId);
        const friendIds = new Set(res.data.map(f => f.friendId));
        setFriends(friendIds);
      } catch (e) {
        console.error('Lỗi load friends:', e);
      }
    };

    const loadPending = async () => {
      try {
        const res = await friendApi.getRequests(user.userId);
        const pendingMap = new Map(res.data.map(f => [f.userId, f.username])); // senderId → username
        setPendingRequests(pendingMap);
      } catch (e) {
        console.error('Lỗi load pending:', e);
      }
    };

    loadUsers();
    loadFriends();
    loadPending();
  }, [user?.userId]);

  const filtered = users
    .filter(u => u.username && u.userId !== user.userId && !friends.has(u.userId))
    .filter(u => u.username.toLowerCase().includes(query.toLowerCase()));

  const sendRequest = async (friendId) => {
    if (!user?.userId || !friendId) return alert('Dữ liệu không hợp lệ');
    setSending(true);
    try {
      // Thứ tự: userId = current user, friendId = người nhận
      await friendApi.sendRequest(user.userId, friendId);
      setSent(prev => new Set(prev).add(friendId));
      alert('Đã gửi lời mời');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data || 'Gửi thất bại');
    } finally {
      setSending(false);
    }
  };

  const acceptRequest = async (senderId) => {
    if (!user?.userId || !senderId) return alert('Dữ liệu không hợp lệ');
    try {
      // Thứ tự: friendId = người gửi, userId = current user
      await friendApi.acceptRequest(senderId, user.userId);

      setFriends(prev => new Set(prev).add(senderId));
      setPendingRequests(prev => {
        const newMap = new Map(prev);
        newMap.delete(senderId);
        return newMap;
      });
      alert('Đã chấp nhận lời mời');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data || 'Chấp nhận thất bại');
    }
  };

  return (
    <div className="friends-panel">
      <div className="friends-header">
        <h3>Tìm bạn</h3>
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <ul className="user-list">
        {filtered.map((u) => (
          <li key={u.userId} className="user-item">
            <div className="user-left">
              <div className="avatar">{u.username?.[0]?.toUpperCase()}</div>
              <div>
                <div className="username">{u.username}</div>
                
              </div>
            </div>
            <div>
              {pendingRequests.has(u.userId) ? (
                <button className="btn-primary" onClick={() => acceptRequest(u.userId)}>
                  Chấp nhận
                </button>
              ) : sent.has(u.userId) ? (
                <button className="btn-muted" disabled>Đã gửi</button>
              ) : (
                <button className="btn-primary" onClick={() => sendRequest(u.userId)} disabled={sending}>
                  Kết bạn
                </button>
              )}
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="empty">Không tìm thấy người dùng</li>}
      </ul>
    </div>
  );
}
