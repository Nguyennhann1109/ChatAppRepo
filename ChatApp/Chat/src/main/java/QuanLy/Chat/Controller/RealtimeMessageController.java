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
		// Lưu tin nhắn qua service, dùng senderId + content từ payload
		Message saved = messageService.sendMessage(roomId, payload.getSenderId(), payload.getContent());
        MessageDTO dto = new MessageDTO(saved.getMessageId(), saved.getChatRoom().getChatRoomId(), saved.getSender().getUserId(), saved.getContent(), saved.getSentAt(), saved.getDeleted(), saved.getEditedAt());
		// Phát tới topic phòng: /topic/rooms/{roomId}
		messagingTemplate.convertAndSend("/topic/rooms/" + roomId, dto);
	}
}


