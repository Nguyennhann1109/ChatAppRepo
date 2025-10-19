package QuanLy.Chat.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import QuanLy.Chat.DTO.UserDTO;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.DTO.auth.RegisterRequest;
import QuanLy.Chat.DTO.auth.LoginRequest;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
	}

	@PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
		try {
            if (userRepository.existsByUsername(req.getUsername())) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username đã tồn tại");
			}
            User user = new User();
            user.setUsername(req.getUsername());
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            user.setEmail(req.getEmail());
            user.setPhoneNumber(req.getPhoneNumber());
            user.setRole("USER");
            User saved = userRepository.save(user);
            UserDTO dto = new UserDTO(saved.getUserId(), saved.getUsername(), saved.getEmail(), saved.getPhoneNumber(), saved.getAvatarUrl());
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + ex.getMessage());
		}
	}

	@PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpSession session) {
        return userRepository.findByUsername(req.getUsername())
                .map(u -> {
                    if (passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
                        // ✅ Đánh dấu user online
                        u.setIsOnline(true);
                        u.setLastSeen(LocalDateTime.now());
                        userRepository.save(u);
                        
                        // ✅ Lưu user vào session để các API khác có thể xác thực
                        session.setAttribute("user", u);
                        session.setAttribute("userId", u.getUserId());
                        return ResponseEntity.ok(new UserDTO(u.getUserId(), u.getUsername(), u.getEmail(), u.getPhoneNumber(), u.getAvatarUrl()));
                    }
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai username hoặc password");
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai username hoặc password"));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpSession session) {
		// Đánh dấu user offline
		Long userId = (Long) session.getAttribute("userId");
		if (userId != null) {
			userRepository.findById(userId).ifPresent(u -> {
				u.setIsOnline(false);
				u.setLastSeen(LocalDateTime.now());
				userRepository.save(u);
			});
		}
		session.invalidate();
		return ResponseEntity.noContent().build();
	}
}


