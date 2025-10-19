package QuanLy.Chat.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import QuanLy.Chat.DTO.NotificationDTO;
import QuanLy.Chat.Service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping(value = "/user/{userId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<List<NotificationDTO>> list(@PathVariable Long userId) {
        List<NotificationDTO> dtos = notificationService.listByUser(userId).stream()
            .map(n -> new NotificationDTO(n.getNotificationId(), n.getUser().getUserId(), n.getMessage(), n.getRead(), n.getCreatedAt(),
            		n.getType(), n.getRelatedUserId(), n.getRelatedRoomId(), n.getNavigationData()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
	}

	@GetMapping(value = "/user/{userId}/unread", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
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

	@DeleteMapping("/user/{userId}/delete-read")
	public ResponseEntity<Void> deleteReadNotifications(@PathVariable Long userId) {
		notificationService.deleteReadNotifications(userId);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/user/{userId}/clear-all")
	public ResponseEntity<Void> clearAll(@PathVariable Long userId) {
		notificationService.clearAll(userId);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{notificationId}")
	public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
		notificationService.deleteNotification(notificationId);
		return ResponseEntity.noContent().build();
	}
}


