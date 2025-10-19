package QuanLy.Chat.Service.Impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import QuanLy.Chat.Entity.ChatRoom;
import QuanLy.Chat.Entity.ChatRoomMember;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.ChatRoomMemberRepository;
import QuanLy.Chat.Repository.ChatRoomRepository;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.ChatRoomService;
import QuanLy.Chat.Service.NotificationService;

@Service
@Transactional
public class ChatRoomServiceImpl implements ChatRoomService {

	private final ChatRoomRepository chatRoomRepository;
	private final ChatRoomMemberRepository chatRoomMemberRepository;
	private final UserRepository userRepository;
	private final NotificationService notificationService;

	public ChatRoomServiceImpl(ChatRoomRepository chatRoomRepository, ChatRoomMemberRepository chatRoomMemberRepository, UserRepository userRepository, NotificationService notificationService) {
		this.chatRoomRepository = chatRoomRepository;
		this.chatRoomMemberRepository = chatRoomMemberRepository;
		this.userRepository = userRepository;
		this.notificationService = notificationService;
	}

	@Override
	public ChatRoom createRoom(String roomName, boolean isGroup) {
		if (roomName == null || roomName.isBlank()) {
			throw new IllegalArgumentException("Tên phòng không hợp lệ");
		}
		ChatRoom room = new ChatRoom(roomName, isGroup);
		return chatRoomRepository.save(room);
	}

	@Override
	public ChatRoom updateRoom(Long roomId, String roomName) {
		ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
		if (roomName != null && !roomName.isBlank() && !roomName.equals(room.getRoomName())) {
			String oldName = room.getRoomName();
			room.setRoomName(roomName);
			ChatRoom updatedRoom = chatRoomRepository.save(room);
			
			// Tạo thông báo đổi tên nhóm cho tất cả thành viên (trừ admin)
			if (room.getIsGroup()) {
				try {
					List<ChatRoomMember> members = chatRoomMemberRepository.findByChatRoom_ChatRoomId(roomId);
					for (ChatRoomMember member : members) {
						if (!"admin".equals(member.getRole())) {
							notificationService.createGroupRenameNotification(member.getUser().getUserId(), roomId, oldName, roomName);
						}
					}
				} catch (Exception e) {
					System.err.println("Lỗi khi tạo thông báo đổi tên nhóm: " + e.getMessage());
				}
			}
			
			return updatedRoom;
		}
		return chatRoomRepository.save(room);
	}

	@Override
	public void deleteRoom(Long roomId) {
		chatRoomRepository.deleteById(roomId);
	}

	@Override
	public ChatRoom getRoom(Long roomId) {
		return chatRoomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
	}

	@Override
	public List<ChatRoom> getAllRooms() {
		return chatRoomRepository.findAll();
	}

	@Override
	public ChatRoomMember addMember(Long roomId, Long userId, String role) {
		ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
		ChatRoomMember member = new ChatRoomMember(room, user, role == null ? "member" : role);
		ChatRoomMember savedMember = chatRoomMemberRepository.save(member);
		
		// Tạo thông báo thêm vào nhóm (chỉ cho nhóm, không cho chat riêng)
		if (room.getIsGroup()) {
			try {
				notificationService.createGroupAddNotification(userId, roomId, room.getRoomName());
			} catch (Exception e) {
				System.err.println("Lỗi khi tạo thông báo thêm vào nhóm: " + e.getMessage());
			}
		}
		
		return savedMember;
	}

	@Override
	public void removeMember(Long roomId, Long userId) {
		ChatRoomMember member = chatRoomMemberRepository.findByChatRoom_ChatRoomIdAndUser_UserId(roomId, userId);
		if (member == null) {
			throw new RuntimeException("Không tìm thấy thành viên trong phòng");
		}
		
		// Lưu thông tin nhóm trước khi xóa để tạo thông báo
		ChatRoom room = member.getChatRoom();
		String roomName = room.getRoomName();
		
		chatRoomMemberRepository.delete(member);
		
		// Tạo thông báo xóa khỏi nhóm (chỉ cho nhóm, không cho chat riêng)
		if (room.getIsGroup()) {
			try {
				notificationService.createGroupRemoveNotification(userId, roomId, roomName);
			} catch (Exception e) {
				System.err.println("Lỗi khi tạo thông báo xóa khỏi nhóm: " + e.getMessage());
			}
		}
	}

	@Override
	public List<ChatRoomMember> listMembers(Long roomId) {
		return chatRoomMemberRepository.findByChatRoom_ChatRoomId(roomId);
	}

	@Override
	public boolean existsPrivateRoomBetweenUsers(Long userId1, Long userId2) {
		// Tìm tất cả room mà cả 2 user đều là member
		List<ChatRoomMember> user1Rooms = chatRoomMemberRepository.findByUser_UserId(userId1);
		List<ChatRoomMember> user2Rooms = chatRoomMemberRepository.findByUser_UserId(userId2);
		
		// Kiểm tra xem có room nào mà cả 2 user đều tham gia và không phải group
		for (ChatRoomMember member1 : user1Rooms) {
			ChatRoom room = member1.getChatRoom();
			if (!room.getIsGroup()) { // Chỉ kiểm tra room riêng tư
				for (ChatRoomMember member2 : user2Rooms) {
					if (member2.getChatRoom().getChatRoomId().equals(room.getChatRoomId())) {
						return true; // Đã tồn tại room riêng tư giữa 2 user
					}
				}
			}
		}
		return false;
	}
}


