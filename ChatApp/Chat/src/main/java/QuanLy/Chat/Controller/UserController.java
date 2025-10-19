package QuanLy.Chat.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import QuanLy.Chat.DTO.UserDTO;
import QuanLy.Chat.Service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // constructor injection
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(u -> new UserDTO(u.getUserId(), u.getUsername(), u.getEmail(), u.getPhoneNumber(), u.getAvatarUrl()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/users/search?username={username}
    @GetMapping("/search")
    public ResponseEntity<UserDTO> searchUserByUsername(@RequestParam String username) {
        return userService.getUserByUsername(username)
                .map(u -> new UserDTO(u.getUserId(), u.getUsername(), u.getEmail(), u.getPhoneNumber(), u.getAvatarUrl()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
