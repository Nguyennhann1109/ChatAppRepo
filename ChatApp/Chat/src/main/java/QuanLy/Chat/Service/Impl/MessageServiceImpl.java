package QuanLy.Chat.Service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import QuanLy.Chat.Entity.ChatRoom;
import QuanLy.Chat.Entity.ChatRoomMember;
import QuanLy.Chat.Entity.Message;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.ChatRoomMemberRepository;
import QuanLy.Chat.Repository.ChatRoomRepository;
import QuanLy.Chat.Repository.MessageRepository;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.MessageService;
import QuanLy.Chat.Service.NotificationService;

@Service
public class MessageServiceImpl implements MessageService {

	private final MessageRepository messageRepository;
	private final ChatRoomRepository chatRoomRepository;
	private final ChatRoomMemberRepository chatRoomMemberRepository;
	private final UserRepository userRepository;
	private final NotificationService notificationService;

	public MessageServiceImpl(MessageRepository messageRepository, ChatRoomRepository chatRoomRepository, ChatRoomMemberRepository chatRoomMemberRepository, UserRepository userRepository, NotificationService notificationService) {
		this.messageRepository = messageRepository;
		this.chatRoomRepository = chatRoomRepository;
		this.chatRoomMemberRepository = chatRoomMemberRepository;
		this.userRepository = userRepository;
		this.notificationService = notificationService;
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public Message sendMessage(Long roomId, Long senderId, String content) {
		if (content == null || content.isBlank()) {
			throw new IllegalArgumentException("Nội dung tin nhắn trống");
		}
		
		ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
		User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi"));
		
		Message msg = new Message(room, sender, content);
		Message savedMsg = messageRepository.save(msg);
		
		// Tạo thông báo tin nhắn chưa đọc cho các thành viên khác (ngoại trừ người gửi)
		createUnreadMessageNotifications(room, sender, savedMsg);
		
		return savedMsg;
	}

	@Override
	public List<Message> listMessagesByRoom(Long roomId) {
		ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
		return messageRepository.findByChatRoom(room);
	}

	@Override
	public List<Message> listMessagesByRoom(Long roomId, int page, int size) {
		ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
		List<Message> messages = messageRepository.findByChatRoom(room, PageRequest.of(page, size));
		System.out.println("📥 Loaded " + messages.size() + " messages from database for room " + roomId);
		return messages;
	}

	@Override
	public Message editMessage(Long messageId, Long editorUserId, String newContent) {
		if (newContent == null || newContent.isBlank()) {
			throw new IllegalArgumentException("Nội dung trống");
		}
		Message msg = messageRepository.findById(messageId).orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));
		if (!msg.getSender().getUserId().equals(editorUserId)) {
			throw new RuntimeException("Chỉ người gửi mới được sửa tin nhắn");
		}
		if (Boolean.TRUE.equals(msg.getDeleted())) {
			throw new RuntimeException("Tin nhắn đã bị xóa");
		}
		msg.setContent(newContent);
		msg.setEditedAt(LocalDateTime.now());
		return messageRepository.save(msg);
	}

	@Override
	public void softDeleteMessage(Long messageId, Long requesterUserId) {
		Message msg = messageRepository.findById(messageId).orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));
		if (!msg.getSender().getUserId().equals(requesterUserId)) {
			throw new RuntimeException("Chỉ người gửi mới được xóa tin nhắn");
		}
		msg.setDeleted(true);
		msg.setContent("(đã xóa)");
		messageRepository.save(msg);
	}

	@Override
	public Message markDelivered(Long messageId, Long userId) {
		Message m = messageRepository.findById(messageId).orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));
		m.setStatus("DELIVERED");
		return messageRepository.save(m);
	}

	@Override
	public Message markSeen(Long messageId, Long userId) {
		Message m = messageRepository.findById(messageId).orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));
		m.setStatus("SEEN");
		return messageRepository.save(m);
	}

	@Override
	public Message sendMedia(Long roomId, Long senderId, String fileName, String contentType, String url) {
		ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
		User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi"));
		// Đặt content là tên file để hiển thị
		Message msg = new Message(room, sender, fileName);
		msg.setMediaFileName(fileName);
		msg.setMediaContentType(contentType);
		msg.setMediaUrl(url);
		return messageRepository.save(msg);
	}

	// Phương thức riêng để tạo thông báo tin nhắn chưa đọc
	private void createUnreadMessageNotifications(ChatRoom room, User sender, Message message) {
		try {
			// Lấy danh sách thành viên trong phòng
			List<ChatRoomMember> members = chatRoomMemberRepository.findByChatRoom_ChatRoomId(room.getChatRoomId());
			
			for (ChatRoomMember member : members) {
				// Không tạo thông báo cho người gửi
				if (!member.getUser().getUserId().equals(sender.getUserId())) {
					try {
						// Tạo thông báo với tên người gửi
						String senderName = room.getIsGroup() ? sender.getUsername() : "bạn";
						notificationService.createUnreadMessageNotification(
							member.getUser().getUserId(), 
							room.getChatRoomId(), 
							senderName
						);
					} catch (Exception e) {
						System.err.println("Lỗi khi tạo thông báo tin nhắn cho user " + member.getUser().getUserId() + ": " + e.getMessage());
					}
				}
			}
		} catch (Exception e) {
			System.err.println("Lỗi khi tạo thông báo tin nhắn chưa đọc: " + e.getMessage());
		}
	}
}


