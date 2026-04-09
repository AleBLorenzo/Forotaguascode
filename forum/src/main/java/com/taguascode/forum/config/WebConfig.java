package com.taguascode.forum.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Autowired
    private SEOHeaderInterceptor seoHeaderInterceptor;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convertir la ruta relativa a absoluta
        String absolutePath = uploadDir.startsWith(".") 
            ? uploadDir 
            : "./" + uploadDir;
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(seoHeaderInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/api/**", "/uploads/**", "/static/**");
    }
}