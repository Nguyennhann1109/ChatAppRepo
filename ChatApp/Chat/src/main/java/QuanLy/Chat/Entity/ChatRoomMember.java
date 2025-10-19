package QuanLy.Chat.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chatroom_members")
@IdClass(ChatRoomMemberID.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomMember {
    @Id
    @ManyToOne
    @JoinColumn(name = "chatroom_id")
    @JsonIgnore
    private ChatRoom chatRoom;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String role; // admin, member
}