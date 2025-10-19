package QuanLy.Chat.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from the chatapp-frontend/uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:C:/Users/ADMIN/Desktop/UDNT/ud/chatapp-frontend/uploads/");
    }
}
