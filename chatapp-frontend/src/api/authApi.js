import axiosInstance from './axios';

// Object chứa tất cả API liên quan đến auth
export const authApi = {
  // API đăng ký
  register: async (data) => {
    const response = await axiosInstance.post('/api/auth/register', data);
    return response.data; // Trả về UserDTO
  },

  // API đăng nhập
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data; // Trả về UserDTO (không có tokens)
  },

  // API đăng xuất
  logout: async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Lỗi logout API:', error);
      // Vẫn clear localStorage dù API fail
    }
    localStorage.clear(); // Xóa toàn bộ localStorage
  },

   // === Thêm API getAll() ===
  getAll: async () => {
    const response = await axiosInstance.get('/api/users'); // endpoint trả về danh sách tất cả user
    return response.data; 
  }
};