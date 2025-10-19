package QuanLy.Chat.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.UserRepository;

import java.util.Optional;

@Service
public class OAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    public User processOAuth2User(OAuth2User oauth2User, String provider) {
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String externalId = oauth2User.getAttribute("id");

        // Tìm user theo email
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Cập nhật thông tin từ OAuth2
            user.setDisplayName(name);
            user.setExternalId(externalId);
            user.setProvider(provider);
            return userRepository.save(user);
        } else {
            // Tạo user mới
            User newUser = new User();
            newUser.setUsername(email); // Sử dụng email làm username
            newUser.setEmail(email);
            newUser.setDisplayName(name);
            newUser.setExternalId(externalId);
            newUser.setProvider(provider);
            newUser.setPasswordHash(""); // OAuth2 users không cần password
            return userRepository.save(newUser);
        }
    }
}
