package QuanLy.Chat.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // ⭐ Cho phép frontend gửi cookie/session
        config.setAllowCredentials(true);
        
        // ⭐ Cho phép frontend origin
        config.addAllowedOrigin("http://localhost:5173"); // Vite
        config.addAllowedOrigin("http://localhost:3000"); // Create React App
        
        // Cho phép tất cả headers và methods
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}