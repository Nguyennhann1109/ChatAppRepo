package QuanLy.Chat.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    @ManyToOne
    @JoinColumn(name = "chatroom_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private LocalDateTime sentAt;

    @Column(nullable = false)
    private Boolean deleted = false;

    private LocalDateTime editedAt;

    @Column(length = 20)
    private String status; // SENT, DELIVERED, SEEN

    // Media support (optional)
    private String mediaUrl;
    private String mediaContentType;
    private String mediaFileName;

    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }

    public Message(ChatRoom chatRoom, User sender, String content) {
        this.chatRoom = chatRoom;
        this.sender = sender;
        this.content = content;
    }

    public enum MessageStatus {
        SENT,       // đã gửi
        DELIVERED,  // đã nhận
        SEEN        // đã xem
    }
}