import { useState, useEffect } from 'react';
import { roomApi } from '../../api/roomApi';
import friendApi from '../../api/friendApi';
import { useAuth } from '../../context/AuthContext';
import './EditRoomModal.css';

function EditRoomModal({ room, users = [], onClose, onUpdated }) {
  const [name, setName] = useState(room?.roomName || '');
  const [members, setMembers] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [friendsSet, setFriendsSet] = useState(new Set());
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const m = await roomApi.getMembers(room.chatRoomId);
        setMembers(m || []);
        // determine owner: if DTO contains role with 'owner' or the first member is creator
        const owner = (m || []).find(x => x.role === 'owner' || x.role === 'admin');
        setIsOwner(!!owner && owner.userId === user?.userId);
      } catch (e) {
        console.error('❌ Lỗi load members', e);
      }
    };
    load();
  }, [room]);

  const toggleAdd = (userId) => {
    setSelectedToAdd(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleAdd = async () => {
    if (selectedToAdd.length === 0) return;
    setLoading(true);
    try {
      for (const uid of selectedToAdd) {
        await roomApi.addMember(room.chatRoomId, uid);
      }
      const m = await roomApi.getMembers(room.chatRoomId);
      setMembers(m || []);
      setSelectedToAdd([]);
    } catch (e) {
      console.error('❌ Lỗi thêm thành viên', e);
      setError('Không thể thêm thành viên');
    } finally { setLoading(false); }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa thành viên này khỏi phòng?')) return;
    setLoading(true);
    try {
      await roomApi.removeMember(room.chatRoomId, userId);
      const m = await roomApi.getMembers(room.chatRoomId);
      setMembers(m || []);
    } catch (e) {
      console.error('❌ Lỗi xóa thành viên', e);
      setError('Không thể xóa thành viên');
    } finally { setLoading(false); }
  };

  const handleRename = async () => {
    if (!name.trim()) { setError('Tên phòng không được để trống'); return; }
    setLoading(true);
    try {
      await roomApi.update(room.chatRoomId, name.trim());
      onUpdated && onUpdated();
    } catch (e) {
      console.error('❌ Lỗi đổi tên phòng', e);
      setError('Không thể đổi tên phòng');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Xóa phòng sẽ xóa toàn bộ nội dung. Bạn có chắc?')) return;
    setLoading(true);
    try {
      await roomApi.delete(room.chatRoomId);
      onUpdated && onUpdated();
    } catch (e) {
      console.error('❌ Lỗi xóa phòng', e);
      setError('Không thể xóa phòng');
    } finally { setLoading(false); }
  };

  // users available to add = users - members
  // Load current user's friends and only allow adding friends
  useEffect(() => {
    (async () => {
      if (!user?.userId) return;
      try {
        const res = await friendApi.getFriends(user.userId);
        const set = new Set((res.data || []).map(f => f.friendId));
        setFriendsSet(set);
      } catch (e) { console.error('❌ Lỗi load friends', e); }
    })();
  }, [user?.userId]);

  const available = users.filter(u => !members.some(m => m.userId === u.userId) && friendsSet.has(u.userId))
    .filter(u => u.username?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="modal-backdrop">
      <div className="modal modal-edit-room">
        <h3>Quản lý phòng</h3>
        {!isOwner && (
          <div className="modal-error">Chỉ có chủ phòng mới được thay đổi tùy chỉnh</div>
        )}

        <label>Tên phòng</label>
        <input value={name} onChange={(e) => setName(e.target.value)} disabled={!isOwner || loading} />
        <div className="actions-row">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Đóng</button>
          <button className="btn btn-primary" onClick={handleRename} disabled={loading || !isOwner}>Lưu tên</button>
        </div>

        <hr />
        <h4>Thành viên</h4>
        <div className="members-list">
          {members.map(m => (
            <div className="member-item" key={m.userId}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div className="friend-avatar">{(m.username||m.email||'U')[0].toUpperCase()}</div>
                <div>
                  <div className="friend-name">{m.username || m.email || `User ${m.userId}`}</div>
                  <div className="friend-id">{m.role ? m.role : ''}</div>
                </div>
              </div>
              <div className="member-actions">
                <button className="btn-small" onClick={() => handleRemove(m.userId)} disabled={loading || !isOwner}>Xóa</button>
              </div>
            </div>
          ))}
        </div>

        <label>Thêm thành viên</label>
        <input className="search-input" placeholder="Tìm bạn bè..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="user-list small">
          {available.map(u => (
            <label key={u.userId} className={`user-item ${selectedToAdd.includes(u.userId) ? 'selected' : ''}`}>
              <div className="user-left">
                <div className="friend-avatar">{(u.username || u.email || 'U')[0]?.toUpperCase()}</div>
                <div className="friend-meta">
                  <div className="friend-name">{u.username || u.email || `User ${u.userId}`}</div>
                  <div className="friend-id">{u.userId}</div>
                </div>
              </div>
              <div className="friend-action">
                <button type="button" className={`select-btn ${selectedToAdd.includes(u.userId) ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); toggleAdd(u.userId); }}>{selectedToAdd.includes(u.userId) ? '✓' : '+'}</button>
              </div>
            </label>
          ))}
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleAdd} disabled={loading || selectedToAdd.length===0 || !isOwner}>Thêm</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <hr />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading || !isOwner}>Xóa phòng</button>
        </div>
      </div>
    </div>
  );
}

export default EditRoomModal;
