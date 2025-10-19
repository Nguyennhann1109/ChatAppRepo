package QuanLy.Chat.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import QuanLy.Chat.DTO.MessageDTO;
import QuanLy.Chat.Entity.Message;
import QuanLy.Chat.Service.MessageService;
import QuanLy.Chat.Service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

	private static final Logger logger = LoggerFactory.getLogger(MessageController.class);
	
	private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final FileStorageService fileStorageService;

	public MessageController(MessageService messageService, SimpMessagingTemplate messagingTemplate, FileStorageService fileStorageService) {
		this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.fileStorageService = fileStorageService;
	}

	@PostMapping
    public ResponseEntity<?> send(@RequestParam Long roomId, @RequestParam Long senderId, @RequestBody String content) {
        System.out.println("📤 Sending message to room: " + roomId + " from user: " + senderId + " content: " + content);
        System.out.println("📤 Request received at: " + java.time.LocalDateTime.now());
        System.out.println("📤 RoomId type: " + roomId.getClass().getSimpleName() + " Value: " + roomId);
        System.out.println("📤 SenderId type: " + senderId.getClass().getSimpleName() + " Value: " + senderId);
        logger.info("📤 Sending message to room: {} from user: {} content: {}", roomId, senderId, content);
        logger.info("📤 Request received at: {}", java.time.LocalDateTime.now());
        try {
            Message msg = messageService.sendMessage(roomId, senderId, content);
            MessageDTO dto = new MessageDTO(msg.getMessageId(), msg.getChatRoom().getChatRoomId(), msg.getSender().getUserId(), msg.getContent(), msg.getSentAt(), msg.getDeleted(), msg.getEditedAt(), msg.getMediaUrl(), msg.getMediaFileName(), msg.getMediaContentType());
            // Publish realtime to /topic/rooms/{roomId}
            messagingTemplate.convertAndSend("/topic/rooms/" + roomId, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		}
	}

	@GetMapping("/room/{roomId}")
    public ResponseEntity<List<MessageDTO>> listByRoom(@PathVariable Long roomId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        System.out.println("📥 Loading messages for room: " + roomId + " page: " + page + " size: " + size);
        logger.info("📥 Loading messages for room: {} page: {} size: {}", roomId, page, size);
        List<MessageDTO> dtos = messageService.listMessagesByRoom(roomId, page, size).stream()
            .map(m -> new MessageDTO(m.getMessageId(), m.getChatRoom().getChatRoomId(), m.getSender().getUserId(), m.getContent(), m.getSentAt(), m.getDeleted(), m.getEditedAt(), m.getMediaUrl(), m.getMediaFileName(), m.getMediaContentType()))
            .collect(Collectors.toList());
        System.out.println("📥 Found " + dtos.size() + " messages for room " + roomId);
        if (!dtos.isEmpty()) {
            System.out.println("📥 Latest message: " + dtos.get(0).getContent() + " at " + dtos.get(0).getSentAt());
        }
        return ResponseEntity.ok(dtos);
	}

	@PutMapping("/{messageId}")
	public ResponseEntity<?> edit(@PathVariable Long messageId, @RequestParam Long editorUserId, @RequestBody String newContent) {
		try {
			Message m = messageService.editMessage(messageId, editorUserId, newContent);
			MessageDTO dto = new MessageDTO(m.getMessageId(), m.getChatRoom().getChatRoomId(), m.getSender().getUserId(), m.getContent(), m.getSentAt(), m.getDeleted(), m.getEditedAt());
			messagingTemplate.convertAndSend("/topic/rooms/" + m.getChatRoom().getChatRoomId(), dto);
			return ResponseEntity.ok(dto);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		}
	}

	@DeleteMapping("/{messageId}")
	public ResponseEntity<?> softDelete(@PathVariable Long messageId, @RequestParam Long requesterUserId) {
		try {
			messageService.softDeleteMessage(messageId, requesterUserId);
			return ResponseEntity.noContent().build();
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		}
	}

	@PostMapping("/room/{roomId}/delivered/{messageId}")
	public ResponseEntity<MessageDTO> delivered(@PathVariable Long roomId, @PathVariable Long messageId, @RequestParam Long userId) {
		Message m = messageService.markDelivered(messageId, userId);
		MessageDTO dto = new MessageDTO(m.getMessageId(), m.getChatRoom().getChatRoomId(), m.getSender().getUserId(), m.getContent(), m.getSentAt(), m.getDeleted(), m.getEditedAt());
		messagingTemplate.convertAndSend("/topic/rooms/" + roomId, dto);
		return ResponseEntity.ok(dto);
	}

	@PostMapping("/room/{roomId}/seen/{messageId}")
	public ResponseEntity<MessageDTO> seen(@PathVariable Long roomId, @PathVariable Long messageId, @RequestParam Long userId) {
		Message m = messageService.markSeen(messageId, userId);
		MessageDTO dto = new MessageDTO(m.getMessageId(), m.getChatRoom().getChatRoomId(), m.getSender().getUserId(), m.getContent(), m.getSentAt(), m.getDeleted(), m.getEditedAt());
		messagingTemplate.convertAndSend("/topic/rooms/" + roomId, dto);
		return ResponseEntity.ok(dto);
	}

	@PostMapping(value = "/room/{roomId}/media", consumes = {"multipart/form-data"})
	public ResponseEntity<MessageDTO> uploadMedia(@PathVariable Long roomId, @RequestParam Long senderId, @RequestPart("file") MultipartFile file) throws Exception {
		String originalFileName = file.getOriginalFilename();
		String contentType = file.getContentType();
		
		// Lưu file thực tế
		String storedFileName = fileStorageService.storeFile(file);
		String url = fileStorageService.getFileUrl(storedFileName);
		
		Message m = messageService.sendMedia(roomId, senderId, originalFileName, contentType, url);
		MessageDTO dto = new MessageDTO(m.getMessageId(), m.getChatRoom().getChatRoomId(), m.getSender().getUserId(), m.getContent(), m.getSentAt(), m.getDeleted(), m.getEditedAt());
		// Set media fields
		dto.setMediaUrl(m.getMediaUrl());
		dto.setMediaFileName(m.getMediaFileName());
		dto.setMediaContentType(m.getMediaContentType());
		// Gửi tin nhắn qua WebSocket
		messagingTemplate.convertAndSend("/topic/rooms/" + roomId, dto);
		return ResponseEntity.status(HttpStatus.CREATED).body(dto);
	}
	
	// Test endpoint để kiểm tra controller có hoạt động không
	@GetMapping("/test")
	public ResponseEntity<String> test() {
		logger.info("🧪 Test endpoint called");
		return ResponseEntity.ok("MessageController is working!");
	}
}
