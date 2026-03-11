package com.taguascode.forum.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.taguascode.forum.model.Category;
import com.taguascode.forum.model.Thread;
import com.taguascode.forum.model.User;

public interface ThreadRepository  extends JpaRepository<Thread, Long>  {

    List<Thread> findByCategory(Category category);
    List<Thread> findByAuthor(User author);
    List<Thread> findByPinnedTrue();
    List<Thread> findByLockedFalse();

    List<Thread> findByCategoryAndLockedFalse(Category category);

    Page<Thread> findByCategory(Category category, Pageable pageable);
    Page<Thread> findByPinnedTrue(Pageable pageable);
    Page<Thread> findByLockedFalse(Pageable pageable);
    Page<Thread> findAll(Pageable pageable);

}
