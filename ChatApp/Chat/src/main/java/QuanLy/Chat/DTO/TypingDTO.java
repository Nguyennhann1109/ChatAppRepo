package QuanLy.Chat.DTO;

public class TypingDTO {
	private Long roomId;
	private Long userId;
	private boolean typing;

	public TypingDTO() {}

	public TypingDTO(Long roomId, Long userId, boolean typing) {
		this.roomId = roomId;
		this.userId = userId;
		this.typing = typing;
	}

	public Long getRoomId() { return roomId; }
	public void setRoomId(Long roomId) { this.roomId = roomId; }
	public Long getUserId() { return userId; }
	public void setUserId(Long userId) { this.userId = userId; }
	public boolean isTyping() { return typing; }
	public void setTyping(boolean typing) { this.typing = typing; }
}


