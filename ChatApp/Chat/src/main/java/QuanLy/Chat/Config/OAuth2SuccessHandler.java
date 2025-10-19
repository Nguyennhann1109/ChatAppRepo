package QuanLy.Chat.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Service.OAuth2UserService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private OAuth2UserService oauth2UserService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        
        // Xác định provider (google hoặc facebook)
        String provider = authentication.getName().contains("google") ? "google" : "facebook";
        
        // Xử lý user từ OAuth2
        User user = oauth2UserService.processOAuth2User(oauth2User, provider);
        
        // Lưu thông tin user vào session
        request.getSession().setAttribute("user", user);
        request.getSession().setAttribute("userId", user.getUserId());
        
        // Redirect về frontend
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/?login=success");
    }
}
