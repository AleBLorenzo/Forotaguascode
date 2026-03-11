package com.taguascode.forum.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.taguascode.forum.model.Post;
import com.taguascode.forum.model.Thread;
import com.taguascode.forum.model.User;

public interface PostRepository  extends JpaRepository<Post, Long>{

    List<Post> findByThread(Thread thread);
    List<Post> findByAuthor(User author);
    long countByThread(Thread thread);
    Optional<Post> findFirstByThreadOrderByCreatedAtAsc(Thread thread);

    Page<Post> findByThread(Thread thread, Pageable pageable);

}
