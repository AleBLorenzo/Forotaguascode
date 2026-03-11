package com.taguascode.forum.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taguascode.forum.dto.post.PostCreateDTO;
import com.taguascode.forum.dto.post.PostResponseDTO;
import com.taguascode.forum.dto.post.PostUpdateDTO;
import com.taguascode.forum.model.Post;
import com.taguascode.forum.model.Thread;
import com.taguascode.forum.model.User;
import com.taguascode.forum.repository.PostRepository;
import com.taguascode.forum.repository.ThreadRepository;
import com.taguascode.forum.repository.UserRepository;

@Service
@Transactional
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Post> findByThread(Thread thread) {
        return postRepository.findByThread(thread);
    }

    public List<Post> findByAuthor(User author) {
        return postRepository.findByAuthor(author);
    }

    public Optional<Post> findById(Long id) {
        return postRepository.findById(id);
    }

    public Post create(PostCreateDTO dto, User author) {
        Thread thread = threadRepository.findById(dto.getThreadId())
                .orElseThrow(() -> new IllegalArgumentException("Thread no encontrado"));

        if (thread.isLocked()) {
            throw new IllegalStateException("El hilo está bloqueado");
        }

        Post post = new Post();
        post.setContent(dto.getContent());
        post.setAuthor(author);
        post.setThread(thread);
        post.setFirstPost(false);

        return postRepository.save(post);
    }

    public Post update(Post post, PostUpdateDTO dto) {
        post.setContent(dto.getContent());
        return postRepository.save(post);
    }

    public Post like(Post post) {
        post.setLikes(post.getLikes() + 1);
        return postRepository.save(post);
    }

    public void delete(Post post) {
        postRepository.delete(post);
    }

    public PostResponseDTO toDTO(Post post) {
        return new PostResponseDTO(
                post.getId(),
                post.getContent(),
                post.getLikes(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getAuthor().getUsername(),
                post.getAuthor().getAvatarUrl()
        );
    }
}
