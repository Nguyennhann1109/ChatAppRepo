package QuanLy.Chat.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import QuanLy.Chat.Entity.Notification;
import QuanLy.Chat.Entity.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy tất cả thông báo của một user
    List<Notification> findByUser(User user);

    // Lấy các thông báo chưa đọc của user
    List<Notification> findByUserAndIsReadFalse(User user);

    // Đánh dấu tất cả thông báo của user thành đã đọc
    void deleteByUser(User user); // (hoặc viết custom @Query update)
}
