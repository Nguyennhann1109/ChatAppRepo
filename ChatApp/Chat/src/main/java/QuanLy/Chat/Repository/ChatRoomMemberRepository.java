package QuanLy.Chat.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import QuanLy.Chat.Entity.ChatRoomMember;
import QuanLy.Chat.Entity.ChatRoomMemberID;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, ChatRoomMemberID> {
    // Lấy tất cả thành viên trong 1 phòng
    List<ChatRoomMember> findByChatRoom_ChatRoomId(Long chatRoomId);

    // Lấy tất cả phòng mà user đang tham gia
    List<ChatRoomMember> findByUser_UserId(Long userId);

    // Lấy 1 thành viên cụ thể trong phòng
    ChatRoomMember findByChatRoom_ChatRoomIdAndUser_UserId(Long chatRoomId, Long userId);
}
