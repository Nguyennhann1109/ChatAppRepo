package QuanLy.Chat.Service;

import java.util.List;

import QuanLy.Chat.Entity.ChatRoom;
import QuanLy.Chat.Entity.ChatRoomMember;

public interface ChatRoomService {
	ChatRoom createRoom(String roomName, boolean isGroup);
	ChatRoom updateRoom(Long roomId, String roomName);
	void deleteRoom(Long roomId);
	ChatRoom getRoom(Long roomId);
	List<ChatRoom> getAllRooms();

	// Members
	ChatRoomMember addMember(Long roomId, Long userId, String role);
	void removeMember(Long roomId, Long userId);
	List<ChatRoomMember> listMembers(Long roomId);
	
	// Utility methods
	boolean existsPrivateRoomBetweenUsers(Long userId1, Long userId2);
}


