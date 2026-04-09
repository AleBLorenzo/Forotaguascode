package com.taguascode.forum.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor para agregar headers SEO a las respuestas HTTP
 * - X-Robots-Tag para controlar indexación
 * - Link para canonical URLs
 */
@Component
public class SEOHeaderInterceptor implements HandlerInterceptor {

    private static final String BASE_URL = "https://foro.taguascode.cloud";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String uri = request.getRequestURI();
        
        // Páginas públicas que SÍ deben indexarse
        if (isPublicPage(uri)) {
            response.setHeader("X-Robots-Tag", "index, follow");
            
            // Agregar canonical URL
            String canonicalUrl = BASE_URL + uri;
            response.setHeader("Link", "<" + canonicalUrl + ">; rel=\"canonical\"");
        }
        
        // Páginas que NO deben indexarse
        if (isPrivatePage(uri)) {
            response.setHeader("X-Robots-Tag", "noindex, nofollow");
        }
        
        return true;
    }
    
    /**
     * Determina si una ruta es pública y debe indexarse
     */
    private boolean isPublicPage(String uri) {
        return uri.equals("/") ||
               uri.equals("/index.html") ||
               uri.equals("/categories") ||
               uri.equals("/tags") ||
               uri.equals("/search") ||
               uri.startsWith("/category/") ||
               uri.startsWith("/thread/") ||
               uri.startsWith("/tag/") ||
               uri.equals("/sitemap.xml") ||
               uri.equals("/robots.txt");
    }
    
    /**
     * Determina si una ruta es privada y no debe indexarse
     */
    private boolean isPrivatePage(String uri) {
        return uri.startsWith("/api/") ||
               uri.startsWith("/auth/") ||
               uri.startsWith("/admin/") ||
               uri.startsWith("/uploads/") ||
               uri.contains("/profile") ||
               uri.contains("/settings") ||
               uri.contains("/messages") ||
               uri.startsWith("/static/");
    }
}