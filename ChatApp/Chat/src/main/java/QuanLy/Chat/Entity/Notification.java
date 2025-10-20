package QuanLy.Chat.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String message;

    private Boolean isRead = false;

    private LocalDateTime createdAt;

    @Column(name = "notification_type")
    private String type;

    @Column(name = "related_user_id")
    private Long relatedUserId;

    @Column(name = "related_room_id")
    private Long relatedRoomId;

    @Column(name = "navigation_data")
    private String navigationData;

    public Notification() {}

    public Notification(User user, String message) {
        this.user = user;
        this.message = message;
    }

    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getRelatedUserId() { return relatedUserId; }
    public void setRelatedUserId(Long relatedUserId) { this.relatedUserId = relatedUserId; }

    public Long getRelatedRoomId() { return relatedRoomId; }
    public void setRelatedRoomId(Long relatedRoomId) { this.relatedRoomId = relatedRoomId; }

    public String getNavigationData() { return navigationData; }
    public void setNavigationData(String navigationData) { this.navigationData = navigationData; }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(User user, String message, String type) {
        this.user = user;
        this.message = message;
        this.type = type;
    }

    public Notification(User user, String message, String type, Long relatedUserId, Long relatedRoomId, String navigationData) {
        this.user = user;
        this.message = message;
        this.type = type;
        this.relatedUserId = relatedUserId;
        this.relatedRoomId = relatedRoomId;
        this.navigationData = navigationData;
    }

    public Boolean getRead() {
        return isRead;
    }

    public void setRead(Boolean read) {
        isRead = read;
    }
}