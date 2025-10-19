package QuanLy.Chat.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/oauth2")
public class OAuth2Controller {

    @GetMapping("/login/google")
    public ResponseEntity<String> googleLogin() {
        return ResponseEntity.ok("Redirect to: /oauth2/authorization/google");
    }

    @GetMapping("/login/facebook")
    public ResponseEntity<String> facebookLogin() {
        return ResponseEntity.ok("Redirect to: /oauth2/authorization/facebook");
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            return ResponseEntity.ok(session.getAttribute("user"));
        }
        return ResponseEntity.ok().body("No user logged in");
    }

    @GetMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}
