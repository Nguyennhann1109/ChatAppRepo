package QuanLy.Chat.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "userId")
@ToString(exclude = {"messages", "notifications"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(length = 255)
    private String passwordHash;

    @Column(unique = true, length = 100)
    private String email;
    
    @Column(length = 100)
    private String displayName;
    

    @Column(unique = true, length = 15)
    private String phoneNumber;

    private String avatarUrl;

    @Column(nullable = false, length = 30)
    private String role = "USER"; // USER, ADMIN

    private LocalDateTime createdAt;

    // Quan hệ với Message
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages;

    // Quan hệ với Notification
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}