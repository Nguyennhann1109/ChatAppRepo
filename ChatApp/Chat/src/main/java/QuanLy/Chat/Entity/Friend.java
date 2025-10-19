package QuanLy.Chat.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "friends")
@IdClass(FriendID.class)
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

    public Friend() {}

    public Friend(User user, User friend, String status) {
        this.user = user;
        this.friend = friend;
        this.status = status;
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getFriend() { return friend; }
    public void setFriend(User friend) { this.friend = friend; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}