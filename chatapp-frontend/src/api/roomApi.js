import axiosInstance from './axios';

export const roomApi = {
  // Tạo phòng mới
  create: async (roomName, isGroup) => {
    const response = await axiosInstance.post(
      `/api/rooms?roomName=${encodeURIComponent(roomName)}&isGroup=${isGroup}`
    );
    return response.data;
  },

  // Lấy tất cả phòng
  getAll: async () => {
    const response = await axiosInstance.get('/api/rooms');
    return response.data;
  },

  // Lấy thông tin 1 phòng
  getById: async (roomId) => {
    const response = await axiosInstance.get(`/api/rooms/${roomId}`);
    return response.data;
  },

  // Thêm thành viên vào phòng
  addMember: async (roomId, userId, role = 'member', addedBy = null) => {
    let url = `/api/rooms/${roomId}/members?userId=${userId}&role=${role}`;
    if (addedBy) {
      url += `&addedBy=${addedBy}`;
    }
    const response = await axiosInstance.post(url);
    return response.data;
  },

  // Lấy danh sách thành viên
  getMembers: async (roomId) => {
    const response = await axiosInstance.get(`/api/rooms/${roomId}/members`);
    return response.data;
  },
  // Cập nhật tên phòng
  update: async (roomId, roomName) => {
    const response = await axiosInstance.put(`/api/rooms/${roomId}?roomName=${encodeURIComponent(roomName)}`);
    return response.data;
  },

  // Xóa phòng
  delete: async (roomId) => {
    const response = await axiosInstance.delete(`/api/rooms/${roomId}`);
    return response.data;
  },

  // Xóa thành viên khỏi phòng
  removeMember: async (roomId, userId) => {
    const response = await axiosInstance.delete(`/api/rooms/${roomId}/members/${userId}`);
    return response.data;
  },

  // ✨ MỚI: Lấy tất cả phòng chat của user (giống Zalo)
  getUserRooms: async (userId) => {
    const response = await axiosInstance.get(`/api/rooms/user/${userId}`);
    return response.data;
  }
};