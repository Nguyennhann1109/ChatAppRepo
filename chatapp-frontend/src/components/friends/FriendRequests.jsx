import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import friendApi from '../../api/friendApi';
import './Friends.css';

export default function FriendRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadRequests = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await friendApi.getRequests(user.userId);
      setRequests(res.data || []);
    } catch (err) {
      console.error('❌ Lỗi khi tải lời mời kết bạn:', err.response?.data || err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleAccept = async (senderId) => {
    if (processing) return;
    setProcessing(true);
    try {
      await friendApi.acceptRequest(senderId, user.userId);
      alert('✅ Đã chấp nhận lời mời!');
      await loadRequests();
    } catch (err) {
      console.error('❌ Lỗi khi chấp nhận:', err.response?.data || err.message);
      alert(err.response?.data || 'Không thể chấp nhận lời mời.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (senderId) => {
    if (processing) return;
    setProcessing(true);
    try {
      await friendApi.rejectRequest(senderId, user.userId);
      alert('🚫 Đã từ chối lời mời.');
      await loadRequests();
    } catch (err) {
      console.error('❌ Lỗi khi từ chối:', err.response?.data || err.message);
      alert(err.response?.data || 'Không thể từ chối lời mời.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="small">Đang tải danh sách lời mời...</div>;

  return (
    <div className="friends-panel">
      <div className="friends-header">
        <h3>📨 Lời mời kết bạn</h3>
      </div>

      <ul className="user-list">
        {requests.length === 0 && <li className="empty">Không có lời mời kết bạn nào</li>}

        {requests.map((req) => (
          <li key={req.userId} className="friend-request-item">
            <div className="friend-request-info">
              <div className="avatar">{req.username?.[0]?.toUpperCase() || 'U'}</div>
              <div className="friend-username">{req.username}</div>
            </div>

            <div className="friend-request-actions">
              <button
                className="btn-accept"
                onClick={() => handleAccept(req.userId)}
                disabled={processing}
              >
                ✅ Chấp nhận
              </button>
              <button
                className="btn-reject"
                onClick={() => handleReject(req.userId)}
                disabled={processing}
              >
                ❌ Từ chối
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
