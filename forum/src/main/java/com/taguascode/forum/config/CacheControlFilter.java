package com.taguascode.forum.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter para agregar headers de cache a respuestas públicas
 */
@Component
public class CacheControlFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        
        String uri = request.getRequestURI();
        
        // Rutas públicas que podemos cachear
        if (isPublicCacheable(uri)) {
            // Cache por 5 minutos para contenido público
            response.setHeader("Cache-Control", "public, max-age=300");
            response.setHeader("Vary", "Accept-Encoding");
        }
        
        chain.doFilter(request, response);
    }
    
    private boolean isPublicCacheable(String uri) {
        return uri.startsWith("/api/categories") ||
               uri.startsWith("/api/tags") ||
               uri.equals("/api/threads") ||
               uri.startsWith("/api/threads?") ||
               uri.equals("/sitemap.xml") ||
               uri.equals("/robots.txt");
    }
}