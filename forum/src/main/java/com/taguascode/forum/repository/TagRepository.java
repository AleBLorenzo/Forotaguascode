package com.taguascode.forum.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.taguascode.forum.model.Tag;

public interface TagRepository  extends JpaRepository<Tag, Long> {

      Optional<Tag> findByName(String name);
    boolean existsByName(String name);
    List<Tag> findByNameContainingIgnoreCase(String name);  // buscar tags por nombre parcial

    // Para sitemap - top 50 tags por cantidad de hilos
    @Query("SELECT t FROM Tag t WHERE SIZE(t.threads) > 0 ORDER BY SIZE(t.threads) DESC")
    List<Tag> findTop50ByOrderByThreadCount();

}
