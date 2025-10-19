import axios from 'axios';

// Lấy URL từ file .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ⭐ QUAN TRỌNG: Gửi cookie/session cùng request
});

// Interceptor: Xử lý lỗi 401 (chưa đăng nhập)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("🌐 Axios Response:", response.config.url, response.status);
    return response; // Response thành công, không làm gì
  },
  async (error) => {
    console.log("🌐 Axios Error:", error.config?.url, error.response?.status, error.message);
    // Nếu lỗi 401 (Unauthorized) → Chuyển về trang login
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interceptor: Log request
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("🌐 Axios Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.log("🌐 Axios Request Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;