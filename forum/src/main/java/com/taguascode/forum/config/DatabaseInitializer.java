package com.taguascode.forum.config;

import com.taguascode.forum.model.Category;
import com.taguascode.forum.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DatabaseInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Verificar si ya existen categorías
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
    }
}