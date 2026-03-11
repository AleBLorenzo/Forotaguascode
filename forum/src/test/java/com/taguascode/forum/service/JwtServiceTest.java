package com.taguascode.forum.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.taguascode.forum.config.JwtService;

@ExtendWith(MockitoExtension.class)
public class JwtServiceTest {

    @Mock
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        // Setup if needed
    }

    @Test
    void generateToken_ShouldReturnToken() {
        when(jwtService.generateToken(anyString())).thenReturn("mocked-token");
        
        String token = jwtService.generateToken("test@test.com");
        
        assertEquals("mocked-token", token);
    }

    @Test
    void extractEmail_ShouldExtractEmail() {
        when(jwtService.extractEmail("mocked-token")).thenReturn("test@test.com");
        
        String email = jwtService.extractEmail("mocked-token");
        
        assertEquals("test@test.com", email);
    }

    @Test
    void isTokenValid_ValidToken_ShouldReturnTrue() {
        when(jwtService.isTokenValid("valid-token", "test@test.com")).thenReturn(true);
        
        boolean isValid = jwtService.isTokenValid("valid-token", "test@test.com");
        
        assertTrue(isValid);
    }

    @Test
    void isTokenValid_InvalidToken_ShouldReturnFalse() {
        when(jwtService.isTokenValid("invalid-token", "test@test.com")).thenReturn(false);
        
        boolean isValid = jwtService.isTokenValid("invalid-token", "test@test.com");
        
        assertFalse(isValid);
    }

    @Test
    void generateRefreshToken_ShouldReturnToken() {
        when(jwtService.generateRefreshToken(anyString())).thenReturn("mocked-refresh-token");
        
        String token = jwtService.generateRefreshToken("test@test.com");
        
        assertEquals("mocked-refresh-token", token);
    }

    @Test
    void isRefreshTokenValid_ValidRefreshToken_ShouldReturnTrue() {
        when(jwtService.isRefreshTokenValid("valid-refresh-token")).thenReturn(true);
        
        boolean isValid = jwtService.isRefreshTokenValid("valid-refresh-token");
        
        assertTrue(isValid);
    }

    @Test
    void isRefreshTokenValid_InvalidRefreshToken_ShouldReturnFalse() {
        when(jwtService.isRefreshTokenValid("invalid-refresh-token")).thenReturn(false);
        
        boolean isValid = jwtService.isRefreshTokenValid("invalid-refresh-token");
        
        assertFalse(isValid);
    }
}
