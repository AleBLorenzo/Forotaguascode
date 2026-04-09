package com.taguascode.forum.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taguascode.forum.dto.thread.ThreadCreateDTO;
import com.taguascode.forum.dto.thread.ThreadResponseDTO;
import com.taguascode.forum.model.Category;
import com.taguascode.forum.model.Post;
import com.taguascode.forum.model.Tag;
import com.taguascode.forum.model.Thread;
import com.taguascode.forum.model.User;
import com.taguascode.forum.repository.CategoryRepository;
import com.taguascode.forum.repository.PostRepository;
import com.taguascode.forum.repository.TagRepository;
import com.taguascode.forum.repository.ThreadRepository;
import com.taguascode.forum.repository.UserRepository;

@Service
@Transactional
public class ThreadService {

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

    public List<Thread> findAll() {
        return threadRepository.findAll();
    }

    public List<Thread> findByCategory(Category category) {
        return threadRepository.findByCategory(category);
    }

    public List<Thread> findByPinned() {
        return threadRepository.findByPinnedTrue();
    }

    public List<Thread> findUnlocked() {
        return threadRepository.findByLockedFalse();
    }

    public Optional<Thread> findById(Long id) {
        return threadRepository.findById(id);
    }

    public Thread incrementViews(Thread thread) {
        thread.setViews(thread.getViews() + 1);
        return threadRepository.save(thread);
    }

    public Thread create(ThreadCreateDTO dto, User author) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

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

        return saved;
    }

    public Thread togglePin(Thread thread) {
        thread.setPinned(!thread.isPinned());
        return threadRepository.save(thread);
    }

    public Thread toggleLock(Thread thread) {
        thread.setLocked(!thread.isLocked());
        return threadRepository.save(thread);
    }

    public void delete(Thread thread) {
        threadRepository.delete(thread);
    }

    public ThreadResponseDTO toDTO(Thread thread) {
        long postCount = postRepository.countByThread(thread);
        
        String firstPostContent = postRepository.findFirstByThreadOrderByCreatedAtAsc(thread)
                .map(Post::getContent)
                .orElse(null);

        List<String> tagNames = thread.getTags() != null 
                ? thread.getTags().stream().map(Tag::getName).toList()
                : null;

        return new ThreadResponseDTO(
                thread.getId(),
                thread.getTitle(),
                thread.isPinned(),
                thread.isLocked(),
                thread.getViews(),
                thread.getCreatedAt(),
                thread.getAuthor().getUsername(),
                thread.getAuthor().getAvatarUrl(),
                thread.getCategory().getName(),
                tagNames,
                postCount,
                firstPostContent
        );
    }
}
