package com.taguascode.forum.config;

import com.taguascode.forum.model.Category;
import com.taguascode.forum.model.Tag;
import com.taguascode.forum.repository.CategoryRepository;
import com.taguascode.forum.repository.TagRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public DatabaseInitializer(CategoryRepository categoryRepository, TagRepository tagRepository) {
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Inicializar categorías si no existen
        if (categoryRepository.count() == 0) {
            System.out.println("Inicializando categorías por defecto...");

            Category[] defaultCategories = {
                new Category("General", "Discusiones generales del foro", null, 1),
                new Category("Tecnología", "Programación, hardware y software", null, 2),
                new Category("Ayuda", "Pide ayuda con problemas técnicos", null, 3),
                new Category("Off-Topic", "Charlas informales y variedades", null, 4),
                new Category("Anuncios", "Anuncios oficiales del foro", null, 5)
            };

            categoryRepository.saveAll(Arrays.asList(defaultCategories));
            System.out.println("Categorías inicializadas correctamente");
        }

        // Inicializar etiquetas si no existen
        if (tagRepository.count() == 0) {
            System.out.println("Inicializando etiquetas por defecto...");

            Tag[] defaultTags = {
                new Tag("Pregunta", "#3498DB"),
                new Tag("Respuesta", "#27AE60"),
                new Tag("Tutorial", "#9B59B6"),
                new Tag("Duda", "#E74C3C"),
                new Tag("Error", "#E67E22"),
                new Tag("Discusión", "#1ABC9C"),
                new Tag("Novato", "#F39C12"),
                new Tag("Avanzado", "#34495E")
            };

            tagRepository.saveAll(Arrays.asList(defaultTags));
            System.out.println("Etiquetas inicializadas correctamente");
        }
    }
}