package QuanLy.Chat.Service.Impl;

import QuanLy.Chat.Service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public String storeFile(MultipartFile file) throws IOException {
        // Debug: In ra đường dẫn upload
        System.out.println("🔍 Upload directory: " + uploadDir);
        
        // Tạo thư mục upload nếu chưa có
        Path uploadPath = Paths.get(uploadDir);
        System.out.println("🔍 Full upload path: " + uploadPath.toAbsolutePath());
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            System.out.println("✅ Created upload directory: " + uploadPath.toAbsolutePath());
        }

        // Tạo tên file unique
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        // Lưu file
        Path targetLocation = uploadPath.resolve(uniqueFileName);
        System.out.println("🔍 Saving file to: " + targetLocation.toAbsolutePath());
        
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("✅ File saved successfully: " + uniqueFileName);

        return uniqueFileName;
    }

    @Override
    public String getFileUrl(String fileName) {
        return "/uploads/" + fileName;
    }
}
