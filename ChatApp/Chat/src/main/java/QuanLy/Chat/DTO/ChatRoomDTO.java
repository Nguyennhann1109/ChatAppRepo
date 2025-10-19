package QuanLy.Chat.DTO;

import java.time.LocalDateTime;
import java.util.List;

public class ChatRoomDTO {
    private Long chatRoomId;
    private String roomName;
    private Boolean isGroup;
    private LocalDateTime createdAt;
    private List<ChatRoomMemberDTO> members;

    public ChatRoomDTO() {}

    public ChatRoomDTO(Long chatRoomId, String roomName, Boolean isGroup, LocalDateTime createdAt) {
        this.chatRoomId = chatRoomId;
        this.roomName = roomName;
        this.isGroup = isGroup;
        this.createdAt = createdAt;
    }

    public ChatRoomDTO(Long chatRoomId, String roomName, Boolean isGroup, LocalDateTime createdAt, List<ChatRoomMemberDTO> members) {
        this.chatRoomId = chatRoomId;
        this.roomName = roomName;
        this.isGroup = isGroup;
        this.createdAt = createdAt;
        this.members = members;
    }

    // Getters and Setters
    public Long getChatRoomId() { return chatRoomId; }
    public void setChatRoomId(Long chatRoomId) { this.chatRoomId = chatRoomId; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public Boolean getIsGroup() { return isGroup; }
    public void setIsGroup(Boolean isGroup) { this.isGroup = isGroup; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ChatRoomMemberDTO> getMembers() { return members; }
    public void setMembers(List<ChatRoomMemberDTO> members) { this.members = members; }
}