package QuanLy.Chat.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import QuanLy.Chat.Entity.Friend;
import QuanLy.Chat.Entity.FriendID;
import QuanLy.Chat.Entity.User;

public interface FriendRepository extends JpaRepository<Friend, FriendID> {
    List<Friend> findByUser_UserId(Long userId);
    List<Friend> findByFriend_UserId(Long friendId);

    boolean existsByUser_UserIdAndFriend_UserId(Long userId, Long friendId);

    Optional<Friend> findByUser_UserIdAndFriend_UserId(Long userId, Long friendId);

    List<Friend> findByUser(User user);
    Friend findByUserAndFriend(User user, User friend);
}
