package com.taguascode.forum;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class ForumApplication implements WebMvcConfigurer {

	public static void main(String[] args) {
		SpringApplication.run(ForumApplication.class, args);
	}

	@Value("${app.upload.dir:./uploads}")
	private String uploadDir;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/avatars/**")
				.addResourceLocations("file:" + uploadDir + "/avatars/");
	}
}
