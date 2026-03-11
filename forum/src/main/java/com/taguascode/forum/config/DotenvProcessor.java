package com.taguascode.forum.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class DotenvProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path envPath = Paths.get(".env");
        
        if (!Files.exists(envPath)) {
            System.out.println(".env no encontrado, usando variables del sistema");
            return;
        }

        try {
            Map<String, Object> props = new HashMap<>();
            Files.lines(envPath).forEach(line -> {
                line = line.trim();
                if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                    String[] parts = line.split("=", 2);
                    String key = parts[0].trim();
                    String value = parts.length > 1 ? parts[1].trim() : "";
                    props.put(key, value);
                }
            });

            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", props));
            System.out.println(".env cargado correctamente");
        } catch (IOException e) {
            System.out.println("Error al cargar .env: " + e.getMessage());
        }
    }
}
