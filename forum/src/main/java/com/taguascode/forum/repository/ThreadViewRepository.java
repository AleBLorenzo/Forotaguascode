package com.taguascode.forum.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taguascode.forum.model.Thread;
import com.taguascode.forum.model.ThreadView;
import com.taguascode.forum.model.User;

@Repository
public interface ThreadViewRepository extends JpaRepository<ThreadView, Long> {
    
    Optional<ThreadView> findByThreadAndUser(Thread thread, User user);
    
    boolean existsByThreadAndUser(Thread thread, User user);
    
    // Para usuarios anónimos (por IP)
    Optional<ThreadView> findByThreadAndIpAddress(Thread thread, String ipAddress);
    
    boolean existsByThreadAndIpAddress(Thread thread, String ipAddress);
}