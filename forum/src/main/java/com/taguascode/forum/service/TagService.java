package com.taguascode.forum.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taguascode.forum.dto.tag.TagCreateDTO;
import com.taguascode.forum.dto.tag.TagResponseDTO;
import com.taguascode.forum.model.Tag;
import com.taguascode.forum.repository.TagRepository;

@Service
@Transactional
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    public List<Tag> findAll() {
        return tagRepository.findAll();
    }

    public List<Tag> search(String query) {
        return tagRepository.findByNameContainingIgnoreCase(query);
    }

    public Optional<Tag> findById(Long id) {
        return tagRepository.findById(id);
    }

    public Optional<Tag> findByName(String name) {
        return tagRepository.findByName(name);
    }

    public Tag create(TagCreateDTO dto) {
        if (tagRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Tag ya existe");
        }

        Tag tag = new Tag();
        tag.setName(dto.getName());
        tag.setColor(dto.getColor());

        return tagRepository.save(tag);
    }

    public void delete(Tag tag) {
        tagRepository.delete(tag);
    }

    public TagResponseDTO toDTO(Tag tag) {
        return new TagResponseDTO(
                tag.getId(),
                tag.getName(),
                tag.getColor()
        );
    }
}
