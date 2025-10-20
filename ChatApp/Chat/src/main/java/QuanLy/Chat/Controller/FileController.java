package QuanLy.Chat.Controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("📥 Test endpoint called");
        return ResponseEntity.ok("FileController is working! Upload dir: " + uploadDir);
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            logger.info("📥 Request to serve file: {}", filename);
            logger.info("📁 Upload directory config: {}", uploadDir);
            
            // Tạo đường dẫn tới file - convert to absolute path first
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(filename).normalize();
            
            logger.info("📁 Upload base path: {}", uploadPath);
            logger.info("📁 Full file path: {}", filePath);
            
            // Security check: đảm bảo file nằm trong thư mục uploads
            if (!filePath.startsWith(uploadPath)) {
                logger.error("❌ Security violation: file path outside upload directory");
                return ResponseEntity.badRequest().build();
            }
            
            // Kiểm tra file có tồn tại không
            if (!Files.exists(filePath)) {
                logger.error("❌ File not found: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            // Kiểm tra có phải là file không (không phải thư mục)
            if (!Files.isRegularFile(filePath)) {
                logger.error("❌ Not a regular file: {}", filePath);
                return ResponseEntity.badRequest().build();
            }
            
            // Tạo Resource từ file
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                logger.error("❌ File not readable: {}", filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            
            // Xác định content type
            String contentType;
            try {
                contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            } catch (IOException e) {
                contentType = "application/octet-stream";
            }
            
            logger.info("✅ Serving file: {} with content-type: {}", filename, contentType);
            
            // Trả về file với headers phù hợp (CORS headers được xử lý bởi SecurityConfig)
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(resource);
                    
        } catch (MalformedURLException e) {
            logger.error("❌ Malformed URL for file: {}", filename, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("❌ Error serving file: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
