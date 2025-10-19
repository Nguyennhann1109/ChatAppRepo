package QuanLy.Chat.DTO;

import java.time.LocalDateTime;

public class NotificationDTO {
	private Long notificationId;
	private Long userId;
	private String message;
	private Boolean isRead;
	private LocalDateTime createdAt;

	public NotificationDTO() {}

	public NotificationDTO(Long notificationId, Long userId, String message, Boolean isRead, LocalDateTime createdAt) {
		this.notificationId = notificationId;
		this.userId = userId;
		this.message = message;
		this.isRead = isRead;
		this.createdAt = createdAt;
	}

	public Long getNotificationId() { return notificationId; }
	public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
	public Long getUserId() { return userId; }
	public void setUserId(Long userId) { this.userId = userId; }
	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }
	public Boolean getIsRead() { return isRead; }
	public void setIsRead(Boolean isRead) { this.isRead = isRead; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}


