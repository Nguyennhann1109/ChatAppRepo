package QuanLy.Chat.Service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

public interface FileStorageService {
    String storeFile(MultipartFile file) throws IOException;
    String getFileUrl(String fileName);
}
