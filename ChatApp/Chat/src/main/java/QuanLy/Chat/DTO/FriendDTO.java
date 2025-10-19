package QuanLy.Chat.DTO;

public class FriendDTO {
    private Long userId;
    private Long friendId;
    private String status;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String email;

    public FriendDTO() {}

    public FriendDTO(Long userId, Long friendId, String status) {
        this.userId = userId;
        this.friendId = friendId;
        this.status = status;
    }

    public FriendDTO(Long userId, Long friendId, String status, String username) {
        this.userId = userId;
        this.friendId = friendId;
        this.status = status;
        this.username = username;
    }

    public FriendDTO(Long userId, Long friendId, String status, String username, String displayName, String avatarUrl, String email) {
        this.userId = userId;
        this.friendId = friendId;
        this.status = status;
        this.username = username;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.email = email;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getFriendId() { return friendId; }
    public void setFriendId(Long friendId) { this.friendId = friendId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
