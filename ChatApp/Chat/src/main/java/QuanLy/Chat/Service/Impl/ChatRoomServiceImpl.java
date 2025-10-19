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

@Service
@Transactional
public class ChatRoomServiceImpl implements ChatRoomService {

	private final ChatRoomRepository chatRoomRepository;
	private final ChatRoomMemberRepository chatRoomMemberRepository;
	private final UserRepository userRepository;

	public ChatRoomServiceImpl(ChatRoomRepository chatRoomRepository, ChatRoomMemberRepository chatRoomMemberRepository, UserRepository userRepository) {
		this.chatRoomRepository = chatRoomRepository;
		this.chatRoomMemberRepository = chatRoomMemberRepository;
		this.userRepository = userRepository;
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
		if (roomName != null && !roomName.isBlank()) {
			room.setRoomName(roomName);
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
		return chatRoomMemberRepository.save(member);
	}

	@Override
	public void removeMember(Long roomId, Long userId) {
		ChatRoomMember member = chatRoomMemberRepository.findByChatRoom_ChatRoomIdAndUser_UserId(roomId, userId);
		if (member == null) {
			throw new RuntimeException("Không tìm thấy thành viên trong phòng");
		}
		chatRoomMemberRepository.delete(member);
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


