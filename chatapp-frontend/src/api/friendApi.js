import axios from './axios';

const BASE = '/api/friends';

// Hàm helper gửi POST JSON
const postJson = (url, userId, friendId) =>
  axios.post(
    url,
    { userId: Number(userId), friendId: Number(friendId) },
    { headers: { 'Content-Type': 'application/json' } }
  );

const friendApi = {
  // Lấy danh sách bạn bè
  getFriends: (userId) => axios.get(`${BASE}/${userId}`),

  // Gửi lời mời kết bạn
  sendRequest: (userId, friendId) => {
    console.log('POST /add payload:', { userId, friendId });
    return postJson(`${BASE}/add`, userId, friendId);
  },

// Chấp nhận lời mời
acceptRequest: (userId, friendId) => {
  console.log('POST /accept payload:', { userId, friendId });
  return postJson(`${BASE}/accept`, userId, friendId);
},

// Từ chối lời mời
rejectRequest: (userId, friendId) => {
  console.log('POST /reject payload:', { userId, friendId });
  return postJson(`${BASE}/reject`, userId, friendId);
},


  // Hủy lời mời
  cancelRequest: (userId, friendId) => {
    console.log('POST /cancel payload:', { userId, friendId });
    return postJson(`${BASE}/cancel`, userId, friendId);
  },

  // Xóa bạn
  deleteFriend: (userId, friendId) => {
    const payload = { userId: Number(userId), friendId: Number(friendId) };
    console.log('DELETE /delete payload:', payload);
    return axios.delete(`${BASE}/delete`, { data: payload });
  },

  // Lấy danh sách lời mời chờ
  getRequests: (userId) => axios.get(`${BASE}/pending/${userId}`),
};

export default friendApi;
