package QuanLy.Chat.Service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import QuanLy.Chat.Entity.ChatRoom;
import QuanLy.Chat.Entity.Message;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.ChatRoomRepository;
import QuanLy.Chat.Repository.MessageRepository;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.MessageService;

@Service
public class MessageServiceImpl implements MessageService {

	private final MessageRepository messageRepository;
	private final ChatRoomRepository chatRoomRepository;
	private final UserRepository userRepository;

	public MessageServiceImpl(MessageRepository messageRepository, ChatRoomRepository chatRoomRepository, UserRepository userRepository) {
		this.messageRepository = messageRepository;
		this.chatRoomRepository = chatRoomRepository;
		this.userRepository = userRepository;
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public Message sendMessage(Long roomId, Long senderId, String content) {
		try {
			if (content == null || content.isBlank()) {
				throw new IllegalArgumentException("Nội dung tin nhắn trống");
			}
			System.out.println("🔍 Looking for room: " + roomId + " and sender: " + senderId);
			ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
			User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi"));
			System.out.println("✅ Found room: " + room.getChatRoomId() + " and sender: " + sender.getUserId());
			Message msg = new Message(room, sender, content);
			Message savedMsg = messageRepository.save(msg);
			messageRepository.flush(); // Force flush to database
			System.out.println("💾 Message saved to database: " + savedMsg.getMessageId() + " - " + savedMsg.getContent());
			System.out.println("💾 Message saved at: " + java.time.LocalDateTime.now());
			System.out.println("💾 Message flushed to database");
			
			// Verify the message was actually saved
			Message verifyMsg = messageRepository.findById(savedMsg.getMessageId()).orElse(null);
			if (verifyMsg == null) {
				System.out.println("❌ CRITICAL: Message not found after save!");
			} else {
				System.out.println("✅ Message verified in database: " + verifyMsg.getContent());
			}
			
			// Test database connection by counting messages
			long messageCount = messageRepository.count();
			System.out.println("📊 Total messages in database: " + messageCount);
			
			// Test database connection by listing messages for this room
			List<Message> roomMessages = messageRepository.findByChatRoom(room);
			System.out.println("📊 Messages in room " + roomId + ": " + roomMessages.size());
			
			return savedMsg;
		} catch (Exception e) {
			System.out.println("❌ Error in sendMessage: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
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
}


