package QuanLy.Chat.DTO;

import java.time.LocalDateTime;
import java.util.List;

public class ChatRoomDTO {
    private Long chatRoomId;
    private String roomName;
    private Boolean isGroup;
    private LocalDateTime createdAt;
    private List<ChatRoomMemberDTO> members;
    
    // Thông tin tin nhắn cuối cùng
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long lastMessageSenderId;
    
    // Thông tin người chat (cho chat riêng tư)
    private Long otherUserId;
    private String otherUsername;
    private String otherDisplayName;
    private String otherAvatarUrl;
    private Boolean otherUserOnline;

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

    // Constructor đầy đủ cho FE
    public ChatRoomDTO(Long chatRoomId, String roomName, Boolean isGroup, LocalDateTime createdAt,
                       String lastMessage, LocalDateTime lastMessageTime, Long lastMessageSenderId,
                       Long otherUserId, String otherUsername, String otherDisplayName, 
                       String otherAvatarUrl, Boolean otherUserOnline) {
        this.chatRoomId = chatRoomId;
        this.roomName = roomName;
        this.isGroup = isGroup;
        this.createdAt = createdAt;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.lastMessageSenderId = lastMessageSenderId;
        this.otherUserId = otherUserId;
        this.otherUsername = otherUsername;
        this.otherDisplayName = otherDisplayName;
        this.otherAvatarUrl = otherAvatarUrl;
        this.otherUserOnline = otherUserOnline;
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

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public LocalDateTime getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(LocalDateTime lastMessageTime) { this.lastMessageTime = lastMessageTime; }

    public Long getLastMessageSenderId() { return lastMessageSenderId; }
    public void setLastMessageSenderId(Long lastMessageSenderId) { this.lastMessageSenderId = lastMessageSenderId; }

    public Long getOtherUserId() { return otherUserId; }
    public void setOtherUserId(Long otherUserId) { this.otherUserId = otherUserId; }

    public String getOtherUsername() { return otherUsername; }
    public void setOtherUsername(String otherUsername) { this.otherUsername = otherUsername; }

    public String getOtherDisplayName() { return otherDisplayName; }
    public void setOtherDisplayName(String otherDisplayName) { this.otherDisplayName = otherDisplayName; }

    public String getOtherAvatarUrl() { return otherAvatarUrl; }
    public void setOtherAvatarUrl(String avatarUrl) { this.otherAvatarUrl = avatarUrl; }

    public Boolean getOtherUserOnline() { return otherUserOnline; }
    public void setOtherUserOnline(Boolean otherUserOnline) { this.otherUserOnline = otherUserOnline; }
}