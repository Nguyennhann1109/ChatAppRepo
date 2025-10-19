package QuanLy.Chat.Service;

import java.util.List;

import QuanLy.Chat.Entity.Notification;

public interface NotificationService {
	List<Notification> listByUser(Long userId);
	List<Notification> listUnreadByUser(Long userId);
	Notification create(Long userId, String message);
	void markAllRead(Long userId);
	void clearAll(Long userId);
}


