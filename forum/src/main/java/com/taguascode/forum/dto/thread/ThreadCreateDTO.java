package com.taguascode.forum.dto.thread;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ThreadCreateDTO {

    @NotBlank(message = "El título no puede estar vacío")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String title;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;

    @NotBlank(message = "El contenido no puede estar vacío")
    @Size(min = 1, max = 50000, message = "El contenido debe tener entre 1 y 50000 caracteres")
    private String content;

    private List<Long> tagsIds;
}
