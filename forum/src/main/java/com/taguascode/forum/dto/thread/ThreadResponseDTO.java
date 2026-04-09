package com.taguascode.forum.dto.thread;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ThreadResponseDTO {

    private Long id;
    private String title;
    private boolean pinned;
    private boolean locked;
    private int views;
    private LocalDateTime createdAt;
    private String authorUsername;
    private String authorAvatarUrl;  // Avatar del autor
    private String categoryName;
    private List<String> tags;
    private long postCount;
    private String firstPostContent;
}
