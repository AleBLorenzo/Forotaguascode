package com.taguascode.forum.dto.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class CategoryResponseDTO {

     private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private long totalThreads;  // cuantos hilos tiene

}
