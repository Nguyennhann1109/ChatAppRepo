package QuanLy.Chat.Entity;

import java.io.Serializable;
import java.util.Objects;

public class FriendID implements Serializable {
    private Long user;
    private Long friend;

    public FriendID() {}

    public FriendID(Long user, Long friend) {
        this.user = user;
        this.friend = friend;
    }

    public Long getUser() { return user; }
    public void setUser(Long user) { this.user = user; }

    public Long getFriend() { return friend; }
    public void setFriend(Long friend) { this.friend = friend; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FriendID)) return false;
        FriendID that = (FriendID) o;
        return Objects.equals(user, that.user) && Objects.equals(friend, that.friend);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, friend);
    }
}