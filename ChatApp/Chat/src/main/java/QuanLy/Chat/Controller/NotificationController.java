package QuanLy.Chat.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import QuanLy.Chat.Entity.Notification;
import QuanLy.Chat.DTO.NotificationDTO;
import QuanLy.Chat.Service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> list(@PathVariable Long userId) {
        List<NotificationDTO> dtos = notificationService.listByUser(userId).stream()
            .map(n -> new NotificationDTO(n.getNotificationId(), n.getUser().getUserId(), n.getMessage(), n.getRead(), n.getCreatedAt(),
            		n.getType(), n.getRelatedUserId(), n.getRelatedRoomId(), n.getNavigationData()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
	}

	@GetMapping("/user/{userId}/unread")
	public ResponseEntity<List<NotificationDTO>> getUnread(@PathVariable Long userId) {
		List<NotificationDTO> dtos = notificationService.listUnreadByUser(userId).stream()
			.map(n -> new NotificationDTO(n.getNotificationId(), n.getUser().getUserId(), n.getMessage(), n.getRead(), n.getCreatedAt(),
				n.getType(), n.getRelatedUserId(), n.getRelatedRoomId(), n.getNavigationData()))
			.collect(Collectors.toList());
		return ResponseEntity.ok(dtos);
	}

	@PostMapping("/user/{userId}/mark-all-read")
	public ResponseEntity<Void> markAllRead(@PathVariable Long userId) {
		notificationService.markAllRead(userId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{notificationId}/mark-read")
	public ResponseEntity<Void> markRead(@PathVariable Long notificationId) {
		notificationService.markRead(notificationId);
		return ResponseEntity.noContent().build();
	}
}


