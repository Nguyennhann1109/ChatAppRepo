package QuanLy.Chat.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import QuanLy.Chat.Entity.ChatRoom;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    // Có thể thêm query tùy chỉnh sau này, ví dụ:
    // List<ChatRoom> findByRoomNameContaining(String keyword);
}
