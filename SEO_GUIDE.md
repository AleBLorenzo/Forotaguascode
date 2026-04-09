# SEO Técnico para Forotaguascode

## 📋 Archivos Creados

### 1. robots.txt
Ubicación: `/forum/src/main/resources/static/robots.txt`

### 2. Sitemap Estático (ejemplo)
Ubicación: `/forum/src/main/resources/static/sitemap.xml`

### 3. Generador Dinámico de Sitemap (Spring Boot)
Ubicación: `/forum/src/main/java/com/taguascode/forum/controller/SitemapController.java`

---

## 🔍 Estado Actual del Proyecto

- **Backend**: Spring Boot 4.0.3 (Java 21) - API REST
- **Frontend**: No encontrado en el proyecto (¿separado?)
- **Dominio**: https://foro.taguascode.cloud
- **Puerto**: 8081

---

## 📝 Archivos SEO Generados

### 1. robots.txt

```txt
User-agent: *
Allow: /

# Rutas administrativas y API - NO indexar
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /uploads/

# Páginas de usuario (opcional - permitir o bloquear según política)
Allow: /users/
Allow: /profile/

# Archivos estáticos
Allow: /css/
Allow: /js/
Allow: /images/

# Evitar contenido duplicado
Clean-param: ?page&
Clean-param: ?sort&

# Sitemap
Sitemap: https://foro.taguascode.cloud/sitemap.xml

# Crawl-delay (si el servidor tiene limitaciones)
Crawl-delay: 1
```

### 2. sitemap.xml (ejemplo estático)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <!-- Página principal -->
  <url>
    <loc>https://foro.taguascode.cloud/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Categorías -->
  <url>
    <loc>https://foro.taguascode.cloud/categories</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Ejemplo de categoría específica -->
  <url>
    <loc>https://foro.taguascode.cloud/category/general</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Temas (ejemplos) -->
  <url>
    <loc>https://foro.taguascode.cloud/thread/1-bienvenido-al-foro</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://foro.taguascode.cloud/thread/2-normas-del-foro</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Etiquetas -->
  <url>
    <loc>https://foro.taguascode.cloud/tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Página de búsqueda -->
  <url>
    <loc>https://foro.taguascode.cloud/search</loc>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
  
</urlset>
```

---

## 🚀 Generador Dinámico de Sitemap (Spring Boot)

### SitemapController.java

```java
package com.taguascode.forum.controller;

import com.taguascode.forum.model.Category;
import com.taguascode.forum.model.Thread;
import com.taguascode.forum.model.Tag;
import com.taguascode.forum.repository.CategoryRepository;
import com.taguascode.forum.repository.ThreadRepository;
import com.taguascode.forum.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
public class SitemapController {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ThreadRepository threadRepository;
    
    @Autowired
    private TagRepository tagRepository;
    
    private static final String BASE_URL = "https://foro.taguascode.cloud";
    
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String generateSitemap(HttpServletRequest request) {
        StringBuilder sitemap = new StringBuilder();
        sitemap.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sitemap.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        
        // Página principal
        sitemap.append(createUrlEntry("/", "1.0", "hourly"));
        
        // Categorías
        List<Category> categories = categoryRepository.findAll();
        for (Category category : categories) {
            sitemap.append(createUrlEntry(
                "/category/" + category.getSlug(),
                "0.8",
                "weekly"
            ));
        }
        
        // Temas (últimos 1000)
        List<Thread> threads = threadRepository.findTop1000ByOrderByCreatedAtDesc();
        for (Thread thread : threads) {
            sitemap.append(createUrlEntry(
                "/thread/" + thread.getId() + "-" + thread.getSlug(),
                "0.6",
                "monthly"
            ));
        }
        
        // Etiquetas (top 100)
        List<Tag> tags = tagRepository.findTop100ByOrderByThreadCountDesc();
        for (Tag tag : tags) {
            sitemap.append(createUrlEntry(
                "/tag/" + tag.getName(),
                "0.5",
                "weekly"
            ));
        }
        
        sitemap.append("</urlset>");
        
        return sitemap.toString();
    }
    
    private String createUrlEntry(String path, String priority, String changefreq) {
        return "  <url>\n" +
               "    <loc>" + BASE_URL + path + "</loc>\n" +
               "    <changefreq>" + changefreq + "</changefreq>\n" +
               "    <priority>" + priority + "</priority>\n" +
               "  </url>\n";
    }
}
```

### Repositorios necesarios

```java
// En ThreadRepository.java
List<Thread> findTop1000ByOrderByCreatedAtDesc();

// En TagRepository.java
@Query("SELECT t FROM Tag t ORDER BY SIZE(t.threads) DESC")
List<Tag> findTop100ByOrderByThreadCountDesc();
```

---

## 🌐 Configuración de Rutas (React/Vite)

### Estructura de rutas recomendada (frontend)

```jsx
// App.jsx - React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/thread/:id/:slug" element={<ThreadPage />} />
        <Route path="/tag/:name" element={<TagPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/user/:username" element={<UserProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🎯 Meta Tags para SEO (Componente React)

```jsx
// SEOHead.jsx - Componente reusable para meta tags
import { useLocation } from 'react-router-dom';

function SEOHead({ title, description, image, type = 'website' }) {
  const location = useLocation();
  const baseUrl = 'https://foro.taguascode.cloud';
  const url = `${baseUrl}${location.pathname}`;
  
  // Metadatos por defecto
  const defaultTitle = 'Forotaguascode - Comunidad de programación';
  const defaultDesc = 'Foro de programación y desarrollo. Comparte conocimientos, resuelve dudas y conecta con otros desarrolladores.';
  const defaultImage = `${baseUrl}/og-image.png`;
  
  return (
    <head>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      
      <!-- Open Graph -->
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Forotaguascode" />
      
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      <!-- Canonical URL -->
      <link rel="canonical" href={url} />
    </head>
  );
}

// Uso en página de tema
function ThreadPage({ thread }) {
  return (
    <>
      <SEOHead 
        title={`${thread.title} - Forotaguascode`}
        description={thread.excerpt || thread.content.substring(0, 160)}
        type="article"
      />
      <h1>{thread.title}</h1>
      {/* contenido del tema */}
    </>
  );
}
```

---

## 📋 Pasos para Google Search Console

### 1. Crear propiedad
1. Ve a https://search.google.com/search-console
2. Añade tu dominio: `foro.taguascode.cloud`
3. Verifica propiedad mediante registro DNS (recomendado)

### 2. Verificar propiedad
- Añade el registro TXT en tu proveedor de DNS
- Tiempo de propagación: 24-48 horas

### 3. Enviar sitemap
1. En Search Console: Sitemaps
2. Añade: `sitemap.xml`
3. Click en "Enviar"

### 4. Monitorear
- Errores de rastreo
- Indexación de páginas
- Rendimiento en búsquedas

---

## ⚡ Recomendaciones Técnicas

### Velocidad (Core Web Vitals)

```javascript
// vite.config.js - Optimizaciones
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', 'date-fns'],
        },
      },
    },
  },
  css: {
    devSourcemap: true,
  },
});
```

### Headers HTTP recomendados

```java
// En SecurityConfig.java - agregar headers SEO
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .headers(headers -> headers
            .xssProtection()
            .contentSecurityPolicy(csp -> csp
                .policyDirectives("default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';")
            )
            .frameOptions(frame -> frame.deny())
            .referrerPolicy(referrer -> referrer.policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
        );
    return http.build();
}
```

### Estructura de URLs SEO-friendly

```
✅ Correcto                    ❌ Evitar
/category/java                /category?id=1
/thread/123-java-basics       /thread?id=123
/tag/spring-boot              /tag?id=42
/user/juanperez               /user?id=45
```

---

## 📊 Buenas Prácticas para Foros

### 1. Contenido Duplicado

```java
// Canonical URLs en respuestas API
@RestController
public class ThreadController {
    
    @GetMapping("/thread/{id}")
    public ResponseEntity<ThreadResponseDTO> getThread(@PathVariable Long id) {
        Thread thread = threadService.findById(id);
        
        // Agregar canonical en headers
        HttpHeaders headers = new HttpHeaders();
        headers.add("Link", 
            "<https://foro.taguascode.cloud/thread/" + id + "-" + thread.getSlug() + ">; rel=\"canonical\"");
        
        return ResponseEntity.ok().headers(headers).body(threadDTO);
    }
}
```

### 2. Pagination SEO

```jsx
// Componente de paginación con href alternativo
function Pagination({ currentPage, totalPages, baseUrl }) {
  return (
    <nav aria-label="Paginación">
      <link rel="prev" href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null} />
      <link rel="next" href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : null} />
      
      {/* Botones de paginación */}
    </nav>
  );
}
```

### 3. Schema.org para Foros

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Forotaguascode",
  "url": "https://foro.taguascode.cloud",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://foro.taguascode.cloud/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### 4. noindex para páginas internas

```java
// Para páginas que NO deben indexarse
@GetMapping("/user/settings")
public String userSettings(HttpServletResponse response) {
    response.setHeader("X-Robots-Tag", "noindex, nofollow");
    return "settings";
}
```

### 5. XML SitemapIndex (para foros grandes)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://foro.taguascode.cloud/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://foro.taguascode.cloud/sitemap-threads-1.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://foro.taguascode.cloud/sitemap-threads-2.xml</loc>
  </sitemap>
</sitemapindex>
```

---

## ✅ Checklist de SEO

- [ ] robots.txt configurado
- [ ] Sitemap.xml generado dinámicamente
- [ ] Meta tags en todas las páginas
- [ ] URLs amigables (slug)
- [ ] Canonical URLs implementadas
- [ ] Schema.org JSON-LD
- [ ] Open Graph tags
- [ ] Google Search Console verificado
- [ ] Velocidad < 3 segundos
- [ ] HTTPS funcionando
- [ ] SSL证书
- [ ] DNS configured

---

¿Quieres que cree los archivos físicos en el proyecto?