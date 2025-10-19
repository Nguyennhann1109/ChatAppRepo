package QuanLy.Chat.Service.Impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import QuanLy.Chat.Entity.Notification;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.NotificationRepository;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;
	private final ObjectMapper objectMapper;

	public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
		this.notificationRepository = notificationRepository;
		this.userRepository = userRepository;
		this.objectMapper = new ObjectMapper();
	}

	// Helper method để tránh code trùng lặp
	private User findUserById(Long userId) {
		return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
	}

	@Override
	public List<Notification> listByUser(Long userId) {
		User user = findUserById(userId);
		return notificationRepository.findByUser(user);
	}

	@Override
	public List<Notification> listUnreadByUser(Long userId) {
		User user = findUserById(userId);
		return notificationRepository.findByUserAndIsReadFalse(user);
	}

	@Override
	public Notification create(Long userId, String message) {
		validateMessage(message);
		User user = findUserById(userId);
		Notification noti = new Notification(user, message);
		return notificationRepository.save(noti);
	}

	@Override
	public Notification create(Long userId, String message, String type) {
		validateMessage(message);
		User user = findUserById(userId);
		Notification noti = new Notification(user, message, type);
		return notificationRepository.save(noti);
	}

	@Override
	public Notification create(Long userId, String message, String type, Long relatedUserId, Long relatedRoomId, String navigationData) {
		validateMessage(message);
		User user = findUserById(userId);
		Notification noti = new Notification(user, message, type, relatedUserId, relatedRoomId, navigationData);
		return notificationRepository.save(noti);
	}

	private void validateMessage(String message) {
		if (message == null || message.isBlank()) {
			throw new IllegalArgumentException("Nội dung thông báo trống");
		}
	}

	@Override
	public void markAllRead(Long userId) {
		User user = findUserById(userId);
		notificationRepository.findByUser(user).forEach(n -> {
			n.setRead(true);
			notificationRepository.save(n);
		});
	}

	@Override
	public void markRead(Long notificationId) {
		Notification notification = notificationRepository.findById(notificationId)
			.orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
		notification.setRead(true);
		notificationRepository.save(notification);
	}

	@Override
	public void clearAll(Long userId) {
		User user = findUserById(userId);
		notificationRepository.deleteByUser(user);
	}

	@Override
	public void deleteReadNotifications(Long userId) {
		User user = findUserById(userId);
		notificationRepository.deleteByUserAndIsReadTrue(user);
	}

	@Override
	public Notification createFriendRequestNotification(Long userId, Long senderId) {
		try {
			User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi"));
			String message = sender.getUsername() + " sent you a friend request";
			
			Map<String, Object> navigationData = new HashMap<>();
			navigationData.put("type", "FRIEND_REQUEST");
			navigationData.put("senderId", senderId);
			navigationData.put("page", "friends");
			
			String navigationJson = objectMapper.writeValueAsString(navigationData);
			
			return create(userId, message, "FRIEND_REQUEST", senderId, null, navigationJson);
		} catch (Exception e) {
			throw new RuntimeException("Lỗi khi tạo thông báo lời mời kết bạn", e);
		}
	}

	@Override
	public Notification createFriendAcceptNotification(Long userId, Long friendId) {
		try {
			User friend = userRepository.findById(friendId).orElseThrow(() -> new RuntimeException("Không tìm thấy bạn bè"));
			String message = friend.getUsername() + " accepted your friend request";
			
			Map<String, Object> navigationData = new HashMap<>();
			navigationData.put("type", "FRIEND_ACCEPT");
			navigationData.put("friendId", friendId);
			navigationData.put("page", "friends");
			
			String navigationJson = objectMapper.writeValueAsString(navigationData);
			
			return create(userId, message, "FRIEND_ACCEPT", friendId, null, navigationJson);
		} catch (Exception e) {
			throw new RuntimeException("Lỗi khi tạo thông báo chấp nhận kết bạn", e);
		}
	}

	@Override
	public Notification createUnreadMessageNotification(Long userId, Long roomId, String senderName) {
		try {
			String message = "You have a new message from " + senderName;
			
			Map<String, Object> navigationData = new HashMap<>();
			navigationData.put("type", "MESSAGE_UNREAD");
			navigationData.put("roomId", roomId);
			navigationData.put("page", "chat");
			
			String navigationJson = objectMapper.writeValueAsString(navigationData);
			
			return create(userId, message, "MESSAGE_UNREAD", null, roomId, navigationJson);
		} catch (Exception e) {
			throw new RuntimeException("Lỗi khi tạo thông báo tin nhắn chưa đọc", e);
		}
	}

	@Override
	public Notification createGroupAddNotification(Long userId, Long roomId, String groupName) {
		try {
			String message = "Bạn đã được thêm vào nhóm " + groupName;
			
			Map<String, Object> navigationData = new HashMap<>();
			navigationData.put("type", "GROUP_ADD");
			navigationData.put("roomId", roomId);
			navigationData.put("page", "chat");
			
			String navigationJson = objectMapper.writeValueAsString(navigationData);
			
			return create(userId, message, "GROUP_ADD", null, roomId, navigationJson);
		} catch (Exception e) {
			throw new RuntimeException("Lỗi khi tạo thông báo thêm vào nhóm", e);
		}
	}

	@Override
	public Notification createGroupRemoveNotification(Long userId, Long roomId, String groupName) {
		try {
			String message = "Bạn đã bị xóa khỏi nhóm " + groupName;
			
			Map<String, Object> navigationData = new HashMap<>();
			navigationData.put("type", "GROUP_REMOVE");
			navigationData.put("roomId", roomId);
			navigationData.put("page", "rooms");
			
			String navigationJson = objectMapper.writeValueAsString(navigationData);
			
			return create(userId, message, "GROUP_REMOVE", null, roomId, navigationJson);
		} catch (Exception e) {
			throw new RuntimeException("Lỗi khi tạo thông báo xóa khỏi nhóm", e);
		}
	}

	@Override
	public Notification createGroupRenameNotification(Long userId, Long roomId, String oldName, String newName) {
		try {
			String message = "Nhóm " + oldName + " đã được đổi tên thành " + newName;
			
			Map<String, Object> navigationData = new HashMap<>();
			navigationData.put("type", "GROUP_RENAME");
			navigationData.put("roomId", roomId);
			navigationData.put("page", "chat");
			
			String navigationJson = objectMapper.writeValueAsString(navigationData);
			
			return create(userId, message, "GROUP_RENAME", null, roomId, navigationJson);
		} catch (Exception e) {
			throw new RuntimeException("Lỗi khi tạo thông báo đổi tên nhóm", e);
		}
	}
}


