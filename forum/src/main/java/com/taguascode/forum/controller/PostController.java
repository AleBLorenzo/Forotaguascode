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

import com.taguascode.forum.dto.post.PostCreateDTO;
import com.taguascode.forum.dto.post.PostResponseDTO;
import com.taguascode.forum.dto.post.PostUpdateDTO;
import com.taguascode.forum.model.Post;
import com.taguascode.forum.model.PostLike;
import com.taguascode.forum.model.Thread;
import com.taguascode.forum.model.User;
import com.taguascode.forum.repository.PostLikeRepository;
import com.taguascode.forum.repository.PostRepository;
import com.taguascode.forum.repository.ThreadRepository;
import com.taguascode.forum.repository.UserRepository;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @GetMapping("/thread/{threadId}")
    public ResponseEntity<Page<PostResponseDTO>> getByThread(
            @PathVariable Long threadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Thread thread = threadRepository.findById(threadId).orElse(null);
        if (thread == null) {
            return ResponseEntity.notFound().build();
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<Post> postsPage = postRepository.findByThread(thread, pageable);
        Page<PostResponseDTO> dtoPage = postsPage.map(this::toDTO);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDTO> getById(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(post -> ResponseEntity.ok(toDTO(post)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PostResponseDTO> create(@RequestBody PostCreateDTO dto, Principal principal) {
        String email = principal.getName();
        User author = userRepository.findByEmail(email).orElse(null);
        
        if (author == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Thread thread = threadRepository.findById(dto.getThreadId()).orElse(null);
        if (thread == null) {
            return ResponseEntity.badRequest().build();
        }

        if (thread.isLocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Post post = new Post();
        post.setContent(dto.getContent());
        post.setAuthor(author);
        post.setThread(thread);
        post.setFirstPost(false);

        Post saved = postRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponseDTO> update(@PathVariable Long id, 
            @RequestBody PostUpdateDTO dto, Principal principal) {
        return postRepository.findById(id)
                .map(post -> {
                    String email = principal.getName();
                    if (!post.getAuthor().getEmail().equals(email)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<PostResponseDTO>build();
                    }
                    post.setContent(dto.getContent());
                    return ResponseEntity.ok(toDTO(postRepository.save(post)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<PostResponseDTO> like(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return postRepository.findById(id)
                .map(post -> {
                    // Obtener el usuario actual
                    User user = userRepository.findByEmail(principal.getName()).orElse(null);
                    if (user == null) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<PostResponseDTO>build();
                    }

                    // Verificar si el usuario ya dio like
                    boolean alreadyLiked = postLikeRepository.existsByPostAndUser(post, user);

                    if (alreadyLiked) {
                        // Quitar like
                        postLikeRepository.deleteByPostAndUser(post, user);
                    } else {
                        // Agregar like
                        PostLike postLike = new PostLike();
                        postLike.setPost(post);
                        postLike.setUser(user);
                        postLikeRepository.save(postLike);
                    }

                    // Actualizar contador de likes
                    long likesCount = postLikeRepository.countByPost(post);
                    post.setLikes((int) likesCount);
                    postRepository.save(post);

                    return ResponseEntity.ok(toDTO(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        var postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Post post = postOpt.get();
        String email = principal.getName();
        if (!post.getAuthor().getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    private PostResponseDTO toDTO(Post post) {
        // Contar likes desde la tabla de likes
        long likesCount = postLikeRepository.countByPost(post);
        
        return new PostResponseDTO(
                post.getId(),
                post.getContent(),
                (int) likesCount,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getAuthor().getUsername(),
                post.getAuthor().getAvatarUrl()
        );
    }
}