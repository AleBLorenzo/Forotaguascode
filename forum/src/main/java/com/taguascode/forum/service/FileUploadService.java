package com.taguascode.forum.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public String uploadFile(MultipartFile file, String subFolder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El archivo no puede superar los 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Tipo de archivo no permitido. Solo se permiten: jpg, jpeg, png, gif, webp");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo MIME no permitido");
        }

        String filename = UUID.randomUUID().toString() + extension;

        Path folderPath = Paths.get(uploadDir, subFolder).toAbsolutePath().normalize();
        Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        if (!folderPath.startsWith(basePath)) {
            throw new IllegalArgumentException("Ruta no permitida");
        }

        Files.createDirectories(folderPath);

        Path filePath = folderPath.resolve(filename).normalize();
        
        if (!filePath.startsWith(basePath)) {
            throw new IllegalArgumentException("Ruta no permitida");
        }

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/" + subFolder + "/" + filename;
    }

    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadDir, filePath.startsWith("/") ? filePath.substring(1) : filePath).toAbsolutePath().normalize();
            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            
            if (!path.startsWith(basePath)) {
                throw new IllegalArgumentException("Ruta no permitida");
            }
            
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Error deleting file: " + e.getMessage());
        }
    }
}
