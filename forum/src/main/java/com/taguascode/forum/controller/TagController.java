package com.taguascode.forum.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taguascode.forum.dto.tag.TagCreateDTO;
import com.taguascode.forum.dto.tag.TagResponseDTO;
import com.taguascode.forum.model.Tag;
import com.taguascode.forum.repository.TagRepository;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagRepository tagRepository;

    @GetMapping
    public List<TagResponseDTO> getAll(@RequestParam(required = false) String search) {
        List<Tag> tags;
        
        if (search != null && !search.isBlank()) {
            tags = tagRepository.findByNameContainingIgnoreCase(search);
        } else {
            tags = tagRepository.findAll();
        }
        
        return tags.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponseDTO> getById(@PathVariable Long id) {
        return tagRepository.findById(id)
                .map(tag -> ResponseEntity.ok(toDTO(tag)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<TagResponseDTO> getByName(@PathVariable String name) {
        return tagRepository.findByName(name)
                .map(tag -> ResponseEntity.ok(toDTO(tag)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TagResponseDTO> create(@RequestBody TagCreateDTO dto) {
        if (tagRepository.existsByName(dto.getName())) {
            return ResponseEntity.badRequest().build();
        }

        Tag tag = new Tag();
        tag.setName(dto.getName());
        tag.setColor(dto.getColor());

        Tag saved = tagRepository.save(tag);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!tagRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        tagRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private TagResponseDTO toDTO(Tag tag) {
        return new TagResponseDTO(
                tag.getId(),
                tag.getName(),
                tag.getColor()
        );
    }
}
