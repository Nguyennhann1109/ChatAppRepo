package QuanLy.Chat.Service;

import java.util.List;

import QuanLy.Chat.Entity.Notification;

public interface NotificationService {
	List<Notification> listByUser(Long userId);
	List<Notification> listUnreadByUser(Long userId);
	Notification create(Long userId, String message);
	Notification create(Long userId, String message, String type);
	Notification create(Long userId, String message, String type, Long relatedUserId, Long relatedRoomId, String navigationData);
	void markAllRead(Long userId);
	void markRead(Long notificationId);
	void clearAll(Long userId);
	void deleteReadNotifications(Long userId);
	
	// Các phương thức tạo thông báo cụ thể
	Notification createFriendRequestNotification(Long userId, Long senderId);
	Notification createFriendAcceptNotification(Long userId, Long friendId);
	Notification createUnreadMessageNotification(Long userId, Long roomId, String senderName);
	Notification createGroupAddNotification(Long userId, Long roomId, String groupName);
	Notification createGroupRemoveNotification(Long userId, Long roomId, String groupName);
	Notification createGroupRenameNotification(Long userId, Long roomId, String oldName, String newName);
}


