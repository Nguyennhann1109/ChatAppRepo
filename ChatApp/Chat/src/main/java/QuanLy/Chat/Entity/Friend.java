package QuanLy.Chat.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "friends")
@IdClass(FriendID.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Friend {
    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "friend_id")
    private User friend;

    @Column(nullable = false)
    private String status; // pending, accepted
}