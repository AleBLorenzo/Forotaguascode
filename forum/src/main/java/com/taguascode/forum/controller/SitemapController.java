package com.taguascode.forum.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taguascode.forum.model.Category;
import com.taguascode.forum.model.Tag;
import com.taguascode.forum.model.Thread;
import com.taguascode.forum.repository.CategoryRepository;
import com.taguascode.forum.repository.TagRepository;
import com.taguascode.forum.repository.ThreadRepository;

/**
 * Controlador para generar sitemap.xml dinámicamente
 * Accesible en: https://foro.taguascode.cloud/sitemap.xml
 * 
 * Incluye lastmod para que Google sepa qué páginas actualizar
 */
@RestController
public class SitemapController {

    private static final String BASE_URL = "https://foro.taguascode.cloud";
    private static final DateTimeFormatter ISO_FORMATTER = 
        DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ThreadRepository threadRepository;
    
    @Autowired
    private TagRepository tagRepository;
    
    /**
     * Genera el sitemap.xml dinámicamente con lastmod
     * Incluye: página principal, categorías, hilos y etiquetas
     */
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String generateSitemap() {
        StringBuilder sb = new StringBuilder();
        
        // Header del sitemap
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        
        // 1. Página principal
        sb.append(createUrlEntry("/", "1.0", "hourly", getCurrentDate()));
        
        // 2. Página de categorías
        sb.append(createUrlEntry("/categories", "0.9", "daily", getCurrentDate()));
        
        // 3. Categorías
        List<Category> categories = categoryRepository.findAll();
        for (Category category : categories) {
            String slug = toSlug(category.getName());
            LocalDateTime updated = getCategoryUpdateDate(category);
            sb.append(createUrlEntry("/category/" + slug, "0.8", "weekly", formatDate(updated)));
        }
        
        // 4. Hilos (últimos 500 para no exceder límite de 50k URLs)
        List<Thread> threads = threadRepository.findTop500ByOrderByCreatedAtDesc();
        for (Thread thread : threads) {
            String slug = toSlug(thread.getTitle());
            LocalDateTime updated = getThreadUpdateDate(thread);
            sb.append(createUrlEntry("/thread/" + thread.getId() + "-" + slug, "0.7", "monthly", formatDate(updated)));
        }
        
        // 5. Página de etiquetas
        sb.append(createUrlEntry("/tags", "0.6", "weekly", getCurrentDate()));
        
        // 6. Etiquetas (top 50)
        List<Tag> tags = tagRepository.findTop50ByOrderByThreadCount();
        for (Tag tag : tags) {
            sb.append(createUrlEntry("/tag/" + tag.getName().toLowerCase(), "0.5", "weekly", getCurrentDate()));
        }
        
        sb.append("</urlset>");
        
        return sb.toString();
    }
    
    /**
     * Crea una entrada de URL para el sitemap con lastmod
     */
    private String createUrlEntry(String path, String priority, String changefreq, String lastmod) {
        return "  <url>\n" +
               "    <loc>" + BASE_URL + path + "</loc>\n" +
               "    <lastmod>" + lastmod + "</lastmod>\n" +
               "    <changefreq>" + changefreq + "</changefreq>\n" +
               "    <priority>" + priority + "</priority>\n" +
               "  </url>\n";
    }
    
    /**
     * Obtiene la fecha de actualización de una categoría
     */
    private LocalDateTime getCategoryUpdateDate(Category category) {
        if (category.getUpdatedAt() != null) {
            return category.getUpdatedAt();
        }
        if (category.getCreatedAt() != null) {
            return category.getCreatedAt();
        }
        return LocalDateTime.now();
    }
    
    /**
     * Obtiene la fecha de actualización de un hilo
     */
    private LocalDateTime getThreadUpdateDate(Thread thread) {
        if (thread.getUpdatedAt() != null) {
            return thread.getUpdatedAt();
        }
        if (thread.getCreatedAt() != null) {
            return thread.getCreatedAt();
        }
        return LocalDateTime.now();
    }
    
    /**
     * Formatea fecha a ISO 8601
     */
    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return getCurrentDate();
        }
        return dateTime.format(ISO_FORMATTER);
    }
    
    /**
     * Obtiene la fecha actual en formato ISO
     */
    private String getCurrentDate() {
        return LocalDateTime.now().format(ISO_FORMATTER);
    }
    
    /**
     * Convierte un texto a slug URL-friendly
     */
    private String toSlug(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replace("á", "a").replace("é", "e").replace("í", "i")
                .replace("ó", "o").replace("ú", "u").replace("ñ", "n")
                .replace(" ", "-")
                .replaceAll("[^a-z0-9-]", "");
    }
}