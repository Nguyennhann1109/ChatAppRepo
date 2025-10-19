import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authApi } from '../api/authApi';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { sendPresenceUpdate } = useWebSocket();
  const presenceSentRef = useRef(false); // Track if presence was sent

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []); // Chỉ chạy 1 lần khi mount

  // Gửi presence update sau khi user đã được set (chỉ 1 lần)
  useEffect(() => {
    if (user?.userId && sendPresenceUpdate && !presenceSentRef.current) {
      sendPresenceUpdate(user.userId, true);
      presenceSentRef.current = true;
    }
    
    // Reset flag khi user logout
    if (!user) {
      presenceSentRef.current = false;
    }
  }, [user?.userId]); // Không include sendPresenceUpdate để tránh loop

  // 🧩 Hàm đăng nhập
  const login = async (username, password) => {
    try {
      const userDTO = await authApi.login({ username, password });
      localStorage.setItem('user', JSON.stringify(userDTO));
      setUser(userDTO);
      // Presence update sẽ được gửi tự động qua useEffect

      toast.success('🎉 Đăng nhập thành công!', {
        duration: 4000,
        position: 'top-right',
      });

      return userDTO;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);

      // 🧠 Xử lý lỗi chi tiết
      if (error.response) {
        const { status } = error.response;
        if (status === 401) {
          toast.error('❌ Sai tên đăng nhập hoặc mật khẩu!', {
            duration: 4000,
            position: 'top-right',
          });
        } else if (status === 404) {
          toast.error('⚠️ Tài khoản không tồn tại!', {
            duration: 4000,
            position: 'top-right',
          });
        } else if (status === 429) {
          toast.error('🚫 Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau!', {
            duration: 5000,
            position: 'top-right',
          });
        } else {
          toast.error('Đăng nhập thất bại. Vui lòng thử lại!', {
            duration: 4000,
            position: 'top-right',
          });
        }
      } else if (error.message === 'Network Error') {
        toast.error('🌐 Lỗi kết nối mạng. Vui lòng kiểm tra Internet!', {
          duration: 4000,
          position: 'top-right',
        });
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại!', {
          duration: 4000,
          position: 'top-right',
        });
      }

      throw error;
    }
  };

  // 🧩 Hàm đăng ký
  const register = async (userData) => {
    try {
      const userDTO = await authApi.register(userData);
      await login(userData.username, userData.password);

      toast.success('🎉 Đăng ký thành công!');
      return userDTO;
    } catch (error) {
      toast.error(error.response?.data || 'Đăng ký thất bại');
      throw error;
    }
  };

  // 🧩 Hàm đăng xuất
  const logout = async () => {
    // Broadcast offline status
    if (user && sendPresenceUpdate) {
      sendPresenceUpdate(user.userId, false);
    }
    
    await authApi.logout();
    localStorage.removeItem('user');
    setUser(null);
    toast.success('👋 Đã đăng xuất');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
