import { Button, Badge } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiCheck, HiTrash, HiX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import notificationApi from '../api/notificationApi';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await notificationApi.getAllNotifications(user.userId);
      setNotifications(res.data || []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line
  }, [user?.userId]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead(user.userId);
      toast.success('Đã đánh dấu tất cả đã đọc');
      loadNotifications();
    } catch (err) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      // Cập nhật state local để notification mờ đi ngay lập tức
      setNotifications(prev => prev.map(n => 
        n.notificationId === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      toast.success('Đã xóa thông báo');
      loadNotifications();
    } catch (err) {
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleDeleteRead = async () => {
    try {
      await notificationApi.deleteReadNotifications(user.userId);
      toast.success('Đã xóa thông báo đã đọc');
      loadNotifications();
    } catch (err) {
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return;
    try {
      await notificationApi.clearAll(user.userId);
      toast.success('Đã xóa tất cả thông báo');
      loadNotifications();
    } catch (err) {
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.read) {
      await handleMarkRead(notification.notificationId);
    }
    
    // Chuyển hướng dựa vào loại thông báo
    if (notification.message.includes('lời mời kết bạn') || notification.message.includes('chấp nhận')) {
      navigate('/friends');
    } else if (notification.message.includes('tin nhắn')) {
      navigate('/chat');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <HiBell className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thông báo</h2>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button size="sm" color="primary" onClick={handleMarkAllRead}>
              <HiCheck className="w-4 h-4 mr-1" />
              Đánh dấu tất cả
            </Button>
          )}
          {notifications.length > 0 && (
            <>
              <Button size="sm" color="gray" onClick={handleDeleteRead}>
                <HiTrash className="w-4 h-4 mr-1" />
                Xóa đã đọc
              </Button>
              <Button size="sm" color="failure" onClick={handleClearAll}>
                <HiX className="w-4 h-4 mr-1" />
                Xóa tất cả
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiBell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không có thông báo nào</h3>
          <p className="text-gray-500 dark:text-gray-400">Bạn sẽ nhận được thông báo khi có hoạt động mới</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map(n => (
            <li 
              key={n.notificationId} 
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                n.read 
                  ? 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 opacity-60' 
                  : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {!n.read && (
                      <Badge color="primary" size="sm">Mới</Badge>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">{n.message}</div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!n.read && (
                    <Button 
                      size="xs" 
                      color="gray" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n.notificationId);
                      }}
                      title="Đánh dấu đã đọc"
                    >
                      <HiCheck className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    size="xs" 
                    color="failure" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(n.notificationId);
                    }}
                    title="Xóa"
                  >
                    <HiTrash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
