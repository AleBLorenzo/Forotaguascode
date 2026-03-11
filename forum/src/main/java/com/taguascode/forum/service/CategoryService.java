package com.taguascode.forum.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taguascode.forum.dto.category.CategoryCreateDTO;
import com.taguascode.forum.dto.category.CategoryResponseDTO;
import com.taguascode.forum.model.Category;
import com.taguascode.forum.repository.CategoryRepository;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    public Optional<Category> findByName(String name) {
        return categoryRepository.findByName(name);
    }

    public Category create(CategoryCreateDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Categoría ya existe");
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setIconUrl(dto.getIconUrl());
        category.setDisplayOrder(dto.getOrder());

        return categoryRepository.save(category);
    }

    public void delete(Category category) {
        categoryRepository.delete(category);
    }

    public CategoryResponseDTO toDTO(Category category) {
        long totalThreads = category.getThreads() != null ? category.getThreads().size() : 0;
        
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getIconUrl(),
                totalThreads
        );
    }
}
