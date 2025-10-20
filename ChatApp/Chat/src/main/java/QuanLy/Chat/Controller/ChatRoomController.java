package QuanLy.Chat.Controller;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import QuanLy.Chat.Entity.ChatRoom;
import QuanLy.Chat.Entity.ChatRoomMember;
import QuanLy.Chat.Entity.Message;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Service.ChatRoomService;
import QuanLy.Chat.Service.NotificationService;
import QuanLy.Chat.DTO.ChatRoomDTO;
import QuanLy.Chat.DTO.ChatRoomMemberDTO;
import QuanLy.Chat.Repository.MessageRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RestController
@RequestMapping("/api/rooms")
public class ChatRoomController {

	private final ChatRoomService chatRoomService;
	private final MessageRepository messageRepository;
	private final NotificationService notificationService;
	private final SimpMessagingTemplate messagingTemplate;

	public ChatRoomController(ChatRoomService chatRoomService, MessageRepository messageRepository,
			NotificationService notificationService, SimpMessagingTemplate messagingTemplate) {
		this.chatRoomService = chatRoomService;
		this.messageRepository = messageRepository;
		this.notificationService = notificationService;
		this.messagingTemplate = messagingTemplate;
	}

	@PostMapping
    public ResponseEntity<?> createRoom(@RequestParam String roomName, @RequestParam(defaultValue = "false") boolean isGroup) {
		try {
			ChatRoom room = chatRoomService.createRoom(roomName, isGroup);
            ChatRoomDTO dto = new ChatRoomDTO(room.getChatRoomId(), room.getRoomName(), room.getIsGroup(), room.getCreatedAt());
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}

	@PutMapping("/{roomId}")
    public ResponseEntity<ChatRoomDTO> updateRoom(@PathVariable Long roomId, @RequestParam String roomName) {
        ChatRoom room = chatRoomService.updateRoom(roomId, roomName);
        ChatRoomDTO dto = new ChatRoomDTO(room.getChatRoomId(), room.getRoomName(), room.getIsGroup(), room.getCreatedAt());
        return ResponseEntity.ok(dto);
	}

	@DeleteMapping("/{roomId}")
	public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
		chatRoomService.deleteRoom(roomId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable Long roomId) {
        try {
            ChatRoom room = chatRoomService.getRoom(roomId);
            ChatRoomDTO dto = new ChatRoomDTO(room.getChatRoomId(), room.getRoomName(), room.getIsGroup(), room.getCreatedAt());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
	}

	@GetMapping
    public ResponseEntity<List<ChatRoomDTO>> getAll() {
        List<ChatRoomDTO> dtos = chatRoomService.getAllRooms().stream()
            .map(r -> new ChatRoomDTO(r.getChatRoomId(), r.getRoomName(), r.getIsGroup(), r.getCreatedAt()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
	}

	@PostMapping("/{roomId}/members")
	public ResponseEntity<ChatRoomMemberDTO> addMember(@PathVariable Long roomId, @RequestParam Long userId, 
			@RequestParam(required = false) String role, @RequestParam(required = false) Long addedBy) {
		System.out.println("📥 addMember called: roomId=" + roomId + ", userId=" + userId + ", role=" + role + ", addedBy=" + addedBy);
		
		try {
			ChatRoomMember member = chatRoomService.addMember(roomId, userId, role);
			System.out.println("✅ Member added to database");
			
			ChatRoom room = chatRoomService.getRoom(roomId);
			System.out.println("✅ Got room: " + room.getRoomName());
			
			// LUÔN broadcast trước, để đảm bảo user nhận được update
			try {
				// Broadcast cho user được thêm vào
				messagingTemplate.convertAndSend("/topic/user/" + userId + "/rooms", "refresh");
				System.out.println("✅ Broadcasted room update to user " + userId + " (added user)");
				
				// Nếu có addedBy, cũng broadcast cho người thêm để họ thấy member list update
				if (addedBy != null && !addedBy.equals(userId)) {
					messagingTemplate.convertAndSend("/topic/user/" + addedBy + "/rooms", "refresh");
					System.out.println("✅ Broadcasted room update to user " + addedBy + " (adder)");
				}
			} catch (Exception wsError) {
				System.err.println("❌ Error broadcasting: " + wsError.getMessage());
				wsError.printStackTrace();
			}
			
			// Sau đó mới tạo notification (không quan trọng bằng broadcast)
			boolean isSelfAdding = (addedBy != null && addedBy.equals(userId));
			
			if (!isSelfAdding) {
				try {
					String message = "Bạn đã được thêm vào nhóm: " + room.getRoomName();
					notificationService.create(userId, message);
					System.out.println("✅ Created notification for user " + userId);
				} catch (Exception notifError) {
					System.err.println("❌ Error creating notification: " + notifError.getMessage());
					notifError.printStackTrace();
				}
			} else {
				System.out.println("ℹ️ Skipping notification - user is adding themselves");
			}
			
			ChatRoomMemberDTO dto = new ChatRoomMemberDTO(
				member.getUser().getUserId(),
				member.getUser().getUsername(),
				member.getUser().getEmail(),
				member.getRole()
			);
			System.out.println("✅ Returning success response");
			return ResponseEntity.status(HttpStatus.CREATED).body(dto);
		} catch (Exception e) {
			System.err.println("❌ Error in addMember: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@DeleteMapping("/{roomId}/members/{userId}")
	public ResponseEntity<Void> removeMember(@PathVariable Long roomId, @PathVariable Long userId) {
		try {
			ChatRoom room = chatRoomService.getRoom(roomId);
			
			// Tạo notification cho user bị xóa
			try {
				String message = "Bạn đã bị xóa khỏi nhóm: " + room.getRoomName();
				notificationService.create(userId, message);
				
				// Broadcast qua WebSocket
				messagingTemplate.convertAndSend("/topic/user/" + userId + "/rooms", "refresh");
			} catch (Exception notifError) {
				System.err.println("Error sending notification: " + notifError.getMessage());
			}
			
			chatRoomService.removeMember(roomId, userId);
			return ResponseEntity.noContent().build();
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@GetMapping("/{roomId}/members")
	public ResponseEntity<List<ChatRoomMemberDTO>> listMembers(@PathVariable Long roomId) {
		List<ChatRoomMemberDTO> memberDTOs = chatRoomService.listMembers(roomId).stream()
			.map(member -> new ChatRoomMemberDTO(
				member.getUser().getUserId(),
				member.getUser().getUsername(),
				member.getUser().getEmail(),
				member.getRole()
			))
			.collect(Collectors.toList());
		return ResponseEntity.ok(memberDTOs);
	}

	// Lấy tất cả phòng chat của user (giống Zalo - gộp Chats và Rooms)
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<ChatRoomDTO>> getUserRooms(@PathVariable Long userId) {
		List<ChatRoom> rooms = chatRoomService.getUserRooms(userId);
		
		// Loại bỏ phòng trùng bằng Set
		Set<Long> seenRoomIds = new HashSet<>();
		List<ChatRoomDTO> dtos = rooms.stream()
			.filter(room -> seenRoomIds.add(room.getChatRoomId())) // Chỉ giữ phòng chưa thấy
			.map(room -> {
			// Lấy tin nhắn cuối cùng
			Message lastMsg = messageRepository.findTopByChatRoomOrderBySentAtDesc(room);
			
			ChatRoomDTO dto = new ChatRoomDTO();
			dto.setChatRoomId(room.getChatRoomId());
			dto.setRoomName(room.getRoomName());
			dto.setIsGroup(room.getIsGroup());
			dto.setCreatedAt(room.getCreatedAt());
			
			// Thêm thông tin tin nhắn cuối
			if (lastMsg != null) {
				dto.setLastMessage(lastMsg.getContent());
				dto.setLastMessageTime(lastMsg.getSentAt());
				dto.setLastMessageSenderId(lastMsg.getSender().getUserId());
			}
			
			// Nếu là chat riêng tư, thêm thông tin người chat
			if (!room.getIsGroup()) {
				List<ChatRoomMember> members = chatRoomService.listMembers(room.getChatRoomId());
				System.out.println("🔍 Room " + room.getChatRoomId() + " has " + members.size() + " members");
				// Tìm người khác (không phải userId hiện tại)
				for (ChatRoomMember member : members) {
					System.out.println("  - Member userId: " + member.getUser().getUserId() + " vs current: " + userId);
					if (!member.getUser().getUserId().equals(userId)) {
						User otherUser = member.getUser();
						dto.setOtherUserId(otherUser.getUserId());
						dto.setOtherUsername(otherUser.getUsername());
						dto.setOtherDisplayName(otherUser.getDisplayName());
						dto.setOtherAvatarUrl(otherUser.getAvatarUrl());
						dto.setOtherUserOnline(otherUser.getIsOnline());
						System.out.println("✅ Set otherUserId: " + otherUser.getUserId() + " online: " + otherUser.getIsOnline());
						break;
					}
				}
			}
			
			return dto;
		}).collect(Collectors.toList());
		
		return ResponseEntity.ok(dtos);
	}
}


