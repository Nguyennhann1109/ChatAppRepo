import { useState, useEffect } from 'react';
import { roomApi } from '../../api/roomApi';
import friendApi from '../../api/friendApi';
import { useAuth } from '../../context/AuthContext';
import './CreateRoomModal.css';

function CreateRoomModal({ users = [], onClose, onCreated }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [friendsSet, setFriendsSet] = useState(new Set());
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleUser = (userId) => {
    setSelected(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  useEffect(() => {
    // Load current user's accepted friends to allow selection only from friends
    (async () => {
      if (!user?.userId) return;
      try {
        const res = await friendApi.getFriends(user.userId);
        // res.data expected array of { friendId }
        const set = new Set((res.data || []).map(f => f.friendId));
        setFriendsSet(set);
      } catch (e) {
        console.error('❌ Lỗi load friends:', e);
      }
    })();
  }, [user?.userId]);

  const handleCreate = async () => {
    setError(null);
    // Ensure the creator is counted as a member
    const uniqueSet = new Set(selected);
    if (user?.userId) uniqueSet.add(user.userId);
    if (uniqueSet.size < 3) {
      setError('Phòng nhóm cần ít nhất 3 thành viên.');
      return;
    }
    setLoading(true);
    try {
      const room = await roomApi.create(name || `Group_${Date.now()}`, true);
      // add creator as owner first
      if (user?.userId) {
        try {
          await roomApi.addMember(room.chatRoomId, user.userId, 'owner');
        } catch (e) {
          // log but continue
          console.warn('⚠️ Không thể thêm chủ phòng tự động:', e);
        }
      }

      // add selected members (skip creator if present)
      for (const uid of selected) {
        if (user?.userId && uid === user.userId) continue;
        try {
          await roomApi.addMember(room.chatRoomId, uid);
        } catch (e) {
          console.warn(`⚠️ Không thể thêm thành viên ${uid}:`, e);
        }
      }

      // wait briefly until backend reports the creator as member (so RoomList will include it)
      if (user?.userId) {
        const maxChecks = 6; // ~3s
        let checked = 0;
        while (checked < maxChecks) {
          try {
            const members = await roomApi.getMembers(room.chatRoomId);
            const isMember = (members || []).some(m => m.userId === user.userId);
            if (isMember) break;
          } catch (e) {
            // ignore
          }
          // wait 500ms
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 500));
          checked++;
        }
      }

      onCreated && onCreated(room);
    } catch (e) {
      console.error('❌ Lỗi tạo phòng:', e);
      setError('Không thể tạo phòng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal-create-room">
        <h3>Tạo phòng mới</h3>
        <label>Tên phòng (tùy chọn)</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên phòng..." />

        <label>Chọn thành viên (ít nhất 3)</label>
        <label>Tìm bạn bè</label>
        <input className="search-input" placeholder="Tìm theo tên bạn bè..." value={query} onChange={(e) => setQuery(e.target.value)} />

        <div className="user-list">
          {users
            .filter(u => friendsSet.has(u.userId))
            .filter(u => u.username?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase()))
            .map(u => (
              <label key={u.userId} className={`user-item nice ${selected.includes(u.userId) ? 'selected' : ''}`}>
                <div className="user-left">
                  <div className="friend-avatar">{(u.username || u.email || 'U')[0]?.toUpperCase()}</div>
                  <div className="friend-name">{u.username || u.email || `User ${u.userId}`}</div>
                </div>
                <div className="friend-action">
                  <button
                    type="button"
                    className={`select-btn ${selected.includes(u.userId) ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); toggleUser(u.userId); }}
                  >
                    {selected.includes(u.userId) ? '✓' : '+'}
                  </button>
                </div>
              </label>
            ))}
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Hủy</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo phòng'}</button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;
