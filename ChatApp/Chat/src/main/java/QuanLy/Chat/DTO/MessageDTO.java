package QuanLy.Chat.DTO;

import java.time.LocalDateTime;

public class MessageDTO {
	private Long messageId;
	private Long roomId;
	private Long senderId;
	private String content;
	private LocalDateTime sentAt;
    private Boolean deleted;
    private LocalDateTime editedAt;
    
    // Media fields
    private String mediaUrl;
    private String mediaFileName;
    private String mediaContentType;

	public MessageDTO() {}

	public MessageDTO(Long messageId, Long roomId, Long senderId, String content, LocalDateTime sentAt, Boolean deleted, LocalDateTime editedAt) {
		this.messageId = messageId;
		this.roomId = roomId;
		this.senderId = senderId;
		this.content = content;
		this.sentAt = sentAt;
        this.deleted = deleted;
        this.editedAt = editedAt;
	}

	// Constructor với media fields
	public MessageDTO(Long messageId, Long roomId, Long senderId, String content, LocalDateTime sentAt, Boolean deleted, LocalDateTime editedAt, String mediaUrl, String mediaFileName, String mediaContentType) {
		this.messageId = messageId;
		this.roomId = roomId;
		this.senderId = senderId;
		this.content = content;
		this.sentAt = sentAt;
        this.deleted = deleted;
        this.editedAt = editedAt;
        this.mediaUrl = mediaUrl;
        this.mediaFileName = mediaFileName;
        this.mediaContentType = mediaContentType;
	}

	public Long getMessageId() { return messageId; }
	public void setMessageId(Long messageId) { this.messageId = messageId; }
	public Long getRoomId() { return roomId; }
	public void setRoomId(Long roomId) { this.roomId = roomId; }
	public Long getSenderId() { return senderId; }
	public void setSenderId(Long senderId) { this.senderId = senderId; }
	public String getContent() { return content; }
	public void setContent(String content) { this.content = content; }
	public LocalDateTime getSentAt() { return sentAt; }
	public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }
    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
    
    // Media getters and setters
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public String getMediaFileName() { return mediaFileName; }
    public void setMediaFileName(String mediaFileName) { this.mediaFileName = mediaFileName; }
    public String getMediaContentType() { return mediaContentType; }
    public void setMediaContentType(String mediaContentType) { this.mediaContentType = mediaContentType; }
}


