package QuanLy.Chat.DTO;

public class FriendDTO {
    private Long userId;
    private Long friendId;
    private String status;
    private String username; // 👈 thêm dòng này

    public FriendDTO() {}

    public FriendDTO(Long userId, Long friendId, String status) {
        this.userId = userId;
        this.friendId = friendId;
        this.status = status;
    }

    // 👇 Constructor mới để truyền luôn username
    public FriendDTO(Long userId, Long friendId, String status, String username) {
        this.userId = userId;
        this.friendId = friendId;
        this.status = status;
        this.username = username;
    }

    // Getter & Setter
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getFriendId() { return friendId; }
    public void setFriendId(Long friendId) { this.friendId = friendId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
