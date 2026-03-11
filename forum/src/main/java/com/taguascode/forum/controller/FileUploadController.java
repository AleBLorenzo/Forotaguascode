package com.taguascode.forum.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taguascode.forum.dto.user.UserResponseDTO;
import com.taguascode.forum.model.User;
import com.taguascode.forum.repository.UserRepository;
import com.taguascode.forum.service.FileUploadService;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/avatar")
    public ResponseEntity<UserResponseDTO> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            String avatarUrl = fileUploadService.uploadFile(file, "avatars");
            user.setAvatarUrl(avatarUrl);
            user = userRepository.save(user);
            
            return ResponseEntity.ok(toDTO(user));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private UserResponseDTO toDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
