package com.taguascode.forum.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taguascode.forum.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long>{

     Optional<Category> findByName(String name);
    boolean existsByName(String name);
    List<Category> findAllByOrderByDisplayOrderAsc();  // categorías ordenadas

}
