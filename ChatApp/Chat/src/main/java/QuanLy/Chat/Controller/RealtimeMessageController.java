package QuanLy.Chat.Controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import QuanLy.Chat.DTO.MessageDTO;
import QuanLy.Chat.Entity.Message;
import QuanLy.Chat.Service.MessageService;

@Controller
public class RealtimeMessageController {

	private final MessageService messageService;
	private final SimpMessagingTemplate messagingTemplate;

	public RealtimeMessageController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
		this.messageService = messageService;
		this.messagingTemplate = messagingTemplate;
	}

	// Client gửi tới /app/rooms/{roomId}/send
    @MessageMapping("/rooms/{roomId}/send")
	public void sendMessage(@DestinationVariable Long roomId, @Payload MessageDTO payload) {
		System.out.println("📨 Received WebSocket message for room " + roomId + " from user " + payload.getSenderId());
		// Lưu tin nhắn qua service, dùng senderId + content từ payload
		Message saved = messageService.sendMessage(roomId, payload.getSenderId(), payload.getContent());
        // Tạo DTO với đầy đủ fields bao gồm media
        MessageDTO dto = new MessageDTO(
			saved.getMessageId(), 
			saved.getChatRoom().getChatRoomId(), 
			saved.getSender().getUserId(), 
			saved.getContent(), 
			saved.getSentAt(), 
			saved.getDeleted(), 
			saved.getEditedAt(),
			saved.getMediaUrl(),
			saved.getMediaFileName(),
			saved.getMediaContentType()
		);
		// Set status
		dto.setStatus(saved.getStatus());
		dto.setSeen("SEEN".equals(saved.getStatus()));
		dto.setDelivered("DELIVERED".equals(saved.getStatus()) || "SEEN".equals(saved.getStatus()));
		
		// Phát tới topic phòng: /topic/rooms/{roomId}
		messagingTemplate.convertAndSend("/topic/rooms/" + roomId, dto);
		System.out.println("✅ Broadcasted message to /topic/rooms/" + roomId);
	}
}


