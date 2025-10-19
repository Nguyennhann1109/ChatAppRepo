package QuanLy.Chat.Service;

import java.util.List;
import java.util.Optional;

import QuanLy.Chat.Entity.User;

public interface UserService {
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
    User saveUser(User user);            // create
    User updateUser(Long id, User user); // update
    void deleteUser(Long id);
}
