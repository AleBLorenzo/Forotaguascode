package com.taguascode.forum.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taguascode.forum.model.Tag;

public interface TagRepository  extends JpaRepository<Tag, Long> {

      Optional<Tag> findByName(String name);
    boolean existsByName(String name);
    List<Tag> findByNameContainingIgnoreCase(String name);  // buscar tags por nombre parcial

}
