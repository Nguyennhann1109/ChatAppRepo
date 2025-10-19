import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationApi from '../api/notificationApi';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const response = await notificationApi.getAllNotifications(user.userId);
      setNotifications(response.data);
      
      // Đếm số thông báo chưa đọc
      const unread = response.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.notificationId === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.userId) return;

    try {
      await notificationApi.markAllAsRead(user.userId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
    }
  }, [user?.userId]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Tải thông báo khi component mount hoặc user thay đổi
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification
  };
};
