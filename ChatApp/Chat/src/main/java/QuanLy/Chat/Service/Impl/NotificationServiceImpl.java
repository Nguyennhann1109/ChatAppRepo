package QuanLy.Chat.Service.Impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import QuanLy.Chat.Entity.Notification;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.NotificationRepository;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.NotificationService;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
		this.notificationRepository = notificationRepository;
		this.userRepository = userRepository;
	}

	@Override
	public List<Notification> listByUser(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
		return notificationRepository.findByUser(user);
	}

	@Override
	public List<Notification> listUnreadByUser(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
		return notificationRepository.findByUserAndIsReadFalse(user);
	}

	@Override
	public Notification create(Long userId, String message) {
		if (message == null || message.isBlank()) {
			throw new IllegalArgumentException("Nội dung thông báo trống");
		}
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
		Notification noti = new Notification(user, message);
		return notificationRepository.save(noti);
	}

	@Override
	public void markAllRead(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
		notificationRepository.findByUser(user).forEach(n -> {
			n.setRead(true);
			notificationRepository.save(n);
		});
	}

	@Override
	public void clearAll(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
		notificationRepository.deleteByUser(user);
	}
}


