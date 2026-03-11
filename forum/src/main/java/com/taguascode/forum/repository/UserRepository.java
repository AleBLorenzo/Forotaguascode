package com.taguascode.forum.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taguascode.forum.model.Role;
import com.taguascode.forum.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // Utilezamos Optional ya quepuede tener un valor o estar vacío, evitando el
    // temido NullPointerException
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByActiveTrue();

    List<User> findByRole(Role role);

}
