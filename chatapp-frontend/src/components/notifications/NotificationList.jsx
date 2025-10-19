import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import './NotificationList.css';

const NotificationList = ({ onNotificationClick }) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = async (notification) => {
    try {
      // Đánh dấu thông báo đã đọc
      if (!notification.isRead) {
        await markAsRead(notification.notificationId);
      }

      // Chuyển hướng dựa trên navigationData
      if (notification.navigationData) {
        try {
          const navigationData = JSON.parse(notification.navigationData);
          onNotificationClick(navigationData);
        } catch (e) {
          console.error('Lỗi khi parse navigationData:', e);
        }
      }
    } catch (err) {
      console.error('Lỗi khi xử lý thông báo:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', err);
    }
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return '👤';
      case 'FRIEND_ACCEPT':
        return '✅';
      case 'MESSAGE_UNREAD':
        return '💬';
      case 'GROUP_ADD':
        return '➕';
      case 'GROUP_REMOVE':
        return '➖';
      case 'GROUP_RENAME':
        return '✏️';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="notification-list">
        <div className="notification-header">
          <h3>Thông báo</h3>
        </div>
        <div className="notification-loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h3>Thông báo</h3>
        {unreadCount > 0 && (
          <div className="unread-badge">{unreadCount}</div>
        )}
        {unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>Không có thông báo nào</p>
        </div>
      ) : (
        <div className="notification-items">
          {notifications.map(notification => (
            <div
              key={notification.notificationId}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {formatTime(notification.createdAt)}
                </div>
              </div>
              {!notification.isRead && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
