package QuanLy.Chat.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "chatroom_members")
@IdClass(ChatRoomMemberID.class)
public class ChatRoomMember {
    @Id
    @ManyToOne
    @JoinColumn(name = "chatroom_id")
    @JsonIgnore
    private ChatRoom chatRoom;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 50)
    private String role; // admin, member

    public ChatRoomMember() {}

    public ChatRoomMember(ChatRoom chatRoom, User user, String role) {
        this.chatRoom = chatRoom;
        this.user = user;
        this.role = role;
    }

    public ChatRoom getChatRoom() { return chatRoom; }
    public void setChatRoom(ChatRoom chatRoom) { this.chatRoom = chatRoom; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}