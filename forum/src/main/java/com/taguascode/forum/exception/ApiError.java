package com.taguascode.forum.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ApiError {
    private int status;
    private String message;
    private String path;
    private LocalDateTime timestamp;
}
