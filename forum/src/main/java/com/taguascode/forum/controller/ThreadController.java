package com.taguascode.forum.controller;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taguascode.forum.dto.thread.ThreadCreateDTO;
import com.taguascode.forum.dto.thread.ThreadResponseDTO;
import com.taguascode.forum.model.Category;
import com.taguascode.forum.model.Post;
import com.taguascode.forum.model.Tag;
import com.taguascode.forum.model.Thread;
import com.taguascode.forum.model.ThreadView;
import com.taguascode.forum.model.User;
import com.taguascode.forum.repository.CategoryRepository;
import com.taguascode.forum.repository.PostRepository;
import com.taguascode.forum.repository.TagRepository;
import com.taguascode.forum.repository.ThreadRepository;
import com.taguascode.forum.repository.ThreadViewRepository;
import com.taguascode.forum.repository.UserRepository;

@RestController
@RequestMapping("/api/threads")
public class ThreadController {

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private ThreadViewRepository threadViewRepository;

    @GetMapping
    public ResponseEntity<Page<ThreadResponseDTO>> getAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean pinned,
            @RequestParam(required = false) Boolean locked,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Thread> threadsPage;
        
        if (categoryId != null) {
            Category cat = categoryRepository.findById(categoryId).orElse(null);
            if (cat != null) {
                threadsPage = threadRepository.findByCategory(cat, pageable);
            } else {
                threadsPage = threadRepository.findAll(pageable);
            }
        } else if (Boolean.TRUE.equals(pinned)) {
            threadsPage = threadRepository.findByPinnedTrue(pageable);
        } else if (Boolean.TRUE.equals(locked)) {
            threadsPage = threadRepository.findAll(pageable);
        } else {
            threadsPage = threadRepository.findByLockedFalse(pageable);
        }

        Page<ThreadResponseDTO> dtoPage = threadsPage.map(this::toDTO);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThreadResponseDTO> getById(@PathVariable Long id, Principal principal) {
        return threadRepository.findById(id)
                .map(thread -> {
                    // Solo incrementar vistas si el usuario no ha visto este hilo antes
                    if (principal != null) {
                        User currentUser = userRepository.findByEmail(principal.getName()).orElse(null);
                        if (currentUser != null && !threadViewRepository.existsByThreadAndUser(thread, currentUser)) {
                            // Registrar la vista
                            ThreadView threadView = new ThreadView();
                            threadView.setThread(thread);
                            threadView.setUser(currentUser);
                            threadViewRepository.save(threadView);
                            
                            // Incrementar contador de vistas
                            thread.setViews(thread.getViews() + 1);
                            threadRepository.save(thread);
                        }
                    }
                    return ResponseEntity.ok(toDTO(thread));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ThreadResponseDTO> create(@RequestBody ThreadCreateDTO dto, Principal principal) {
        String email = principal.getName();
        User author = userRepository.findByEmail(email).orElse(null);
        
        if (author == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Category category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        if (category == null) {
            return ResponseEntity.badRequest().build();
        }

        Thread thread = new Thread();
        thread.setTitle(dto.getTitle());
        thread.setAuthor(author);
        thread.setCategory(category);

        Thread saved = threadRepository.save(thread);

        if (dto.getTagsIds() != null && !dto.getTagsIds().isEmpty()) {
            List<Tag> tags = tagRepository.findAllById(dto.getTagsIds());
            thread.setTags(tags);
            saved = threadRepository.save(thread);
        }

        if (dto.getContent() != null && !dto.getContent().isBlank()) {
            Post firstPost = new Post();
            firstPost.setContent(dto.getContent());
            firstPost.setAuthor(author);
            firstPost.setThread(saved);
            firstPost.setFirstPost(true);
            postRepository.save(firstPost);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @PutMapping("/{id}/pin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ThreadResponseDTO> togglePin(@PathVariable Long id) {
        return threadRepository.findById(id)
                .map(thread -> {
                    thread.setPinned(!thread.isPinned());
                    return ResponseEntity.ok(toDTO(threadRepository.save(thread)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ThreadResponseDTO> toggleLock(@PathVariable Long id) {
        return threadRepository.findById(id)
                .map(thread -> {
                    thread.setLocked(!thread.isLocked());
                    return ResponseEntity.ok(toDTO(threadRepository.save(thread)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!threadRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        threadRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ThreadResponseDTO toDTO(Thread thread) {
        long postCount = postRepository.countByThread(thread);
        
        String firstPostContent = postRepository.findFirstByThreadOrderByCreatedAtAsc(thread)
                .map(Post::getContent)
                .orElse(null);

        List<String> tagNames = thread.getTags() != null 
                ? thread.getTags().stream().map(Tag::getName).collect(Collectors.toList())
                : null;

        return new ThreadResponseDTO(
                thread.getId(),
                thread.getTitle(),
                thread.isPinned(),
                thread.isLocked(),
                thread.getViews(),
                thread.getCreatedAt(),
                thread.getAuthor().getUsername(),
                thread.getCategory().getName(),
                tagNames,
                postCount,
                firstPostContent
        );
    }
}
