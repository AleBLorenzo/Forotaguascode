package com.taguascode.forum.dto.tag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class TagResponseDTO {

    private Long id;
    private String name;
    private String color;

}
