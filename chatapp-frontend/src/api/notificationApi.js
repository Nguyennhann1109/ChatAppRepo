import axios from './axios';

const notificationApi = {
  // Lấy tất cả thông báo của user
  getAllNotifications: (userId) => {
    return axios.get(`/api/notifications/user/${userId}`);
  },

  // Lấy thông báo chưa đọc của user
  getUnreadNotifications: (userId) => {
    return axios.get(`/api/notifications/user/${userId}/unread`);
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: (userId) => {
    return axios.post(`/api/notifications/user/${userId}/mark-all-read`);
  },

  // Đánh dấu một thông báo đã đọc
  markAsRead: (notificationId) => {
    return axios.post(`/api/notifications/${notificationId}/mark-read`);
  },

  // Xóa tất cả thông báo đã đọc
  deleteReadNotifications: (userId) => {
    return axios.delete(`/api/notifications/user/${userId}/delete-read`);
  }
};

export default notificationApi;

