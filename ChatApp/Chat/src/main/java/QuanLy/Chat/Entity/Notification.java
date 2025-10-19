package QuanLy.Chat.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    private Boolean isRead = false;

    private LocalDateTime createdAt;

    // Thêm các trường mới cho thông báo
    @Column(name = "notification_type")
    private String type; // FRIEND_REQUEST, FRIEND_ACCEPT, MESSAGE_UNREAD, GROUP_ADD, GROUP_REMOVE, GROUP_RENAME

    @Column(name = "related_user_id")
    private Long relatedUserId; // ID của user liên quan (người gửi lời mời, etc.)

    @Column(name = "related_room_id")
    private Long relatedRoomId; // ID của room liên quan (cho thông báo nhóm)

    @Column(name = "navigation_data")
    private String navigationData; // JSON string chứa thông tin chuyển hướng

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(User user, String message) {
        this.user = user;
        this.message = message;
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