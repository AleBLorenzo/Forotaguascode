# Guía Completa de SEO para Forotaguascode

## Resumen de Archivos Creados

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| robots.txt | `/forum/src/main/resources/static/robots.txt` | Control de rastreo |
| sitemap.xml | `/forum/src/main/resources/static/sitemap.xml` | Sitemap estático de ejemplo |
| SitemapController.java | `/forum/src/main/java/.../controller/SitemapController.java` | Generador dinámico |

---

## 1. Sitemap.xml Optimizado para Foros

### Sitemap Estático (ubicación: `/forum/src/main/resources/static/sitemap.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
         xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Página principal -->
  <url>
    <loc>https://foro.taguascode.cloud/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Categorías (alta prioridad) -->
  <url>
    <loc>https://foro.taguascode.cloud/categories</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Temas importantes (ejemplos) -->
  <url>
    <loc>https://foro.taguascode.cloud/thread/1-bienvenido</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Etiquetas -->
  <url>
    <loc>https://foro.taguascode.cloud/tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Página de búsqueda -->
  <url>
    <loc>https://foro.taguascode.cloud/search</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>

</urlset>
```

### Sitemap Dinámico (generado desde base de datos)

El `SitemapController.java` genera automáticamente el sitemap incluyendo:
- Página principal
- Todas las categorías
- Últimos 1000 hilos
- Top 100 etiquetas

---

## 2. robots.txt

```
User-agent: *
Allow: /

# Bloquear rutas no indexables
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /uploads/
Disallow: /static/

# Evitar duplicados en paginación
Clean-param: page
Clean-param: sort
Clean-param: filter

# Sitemap
Sitemap: https://foro.taguascode.cloud/sitemap.xml

# Delay opcional
Crawl-delay: 1
```

---

## 3. Código HTML SEO Optimizado

### Componente SEO Head para React

```jsx
// components/SEOHead.jsx
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Forotaguascode';
const DEFAULT_DESCRIPTION = 'Comunidad de programación y desarrollo. Comparte conocimientos, resuelve dudas y conecta con desarrolladores.';
const BASE_URL = 'https://foro.taguascode.cloud';

export function SEOHead({ 
  title, 
  description, 
  image, 
  type = 'website',
  articleDate 
}) {
  const location = useLocation();
  const canonicalUrl = `${BASE_URL}${location.pathname}`;
  
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const metaDesc = description || DEFAULT_DESCRIPTION;
  const ogImage = image || `${BASE_URL}/og-image.png`;

  return (
    <head>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {articleDate && (
        <meta property="article:published_time" content={articleDate} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org para foros */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": SITE_NAME,
          "url": BASE_URL,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${BASE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </head>
  );
}
```

### Uso en páginas

```jsx
// pages/ThreadPage.jsx
export function ThreadPage({ thread }) {
  return (
    <>
      <SEOHead 
        title={thread.title}
        description={thread.excerpt || thread.content?.substring(0, 160)}
        type="article"
        articleDate={thread.createdAt}
      />
      
      <article>
        <h1>{thread.title}</h1>
        <div className="thread-meta">
          <span>Por {thread.author}</span>
          <time>{formatDate(thread.createdAt)}</time>
        </div>
        
        <h2>Contenido</h2>
        <div className="thread-content">
          {thread.content}
        </div>
      </article>
    </>
  );
}
```

### Estructura de encabezados recomendada

```html
<!-- Estructura correcta para SEO -->
<body>
  <header>
    <h1>Forotaguascode</h1> <!-- Solo UN h1 por página -->
  </header>

  <main>
    <section>
      <h2>Categoría: General</h2>
      
      <article>
        <h3>Título del Tema</h3> <!-- h3 para títulos de hilos -->
        <p>Descripción breve...</p>
      </article>
      
      <article>
        <h3>Otro Tema</h3>
        <p>Descripción...</p>
      </article>
    </section>
  </main>
</body>
```

---

## 4. Recomendaciones Técnicas

### Velocidad y Core Web Vitals

```javascript
// vite.config.js - Optimizaciones de build
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', 'date-fns', 'lodash']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
```

### Headers de Seguridad SEO

```java
// ConfigSecurity.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .headers(headers -> headers
            .xssProtection()
            .contentSecurityPolicy(csp -> csp
                .policyDirectives("default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';")
            )
            .referrerPolicy(referrer -> 
                referrer.policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
        );
    return http.build();
}
```

### URLs Amigables

```
✓ Correcto                      ✗ Evitar
/category/java                 /category?id=1
/thread/123-java-basics        /thread?id=123
/tag/spring-boot               /tag?id=42
/user/juanperez                /user?id=45
```

Implementación en Spring Boot:

```java
// ThreadController.java
@GetMapping("/thread/{id}-{slug}")
public ResponseEntity<ThreadResponseDTO> getById(@PathVariable Long id) {
    // La URL incluye el slug para SEO pero solo el ID importa
    return threadRepository.findById(id)
            .map(thread -> ResponseEntity.ok(toDTO(thread)))
            .orElse(ResponseEntity.notFound().build());
}
```

---

## 5. Implementación Sitemap Dinámico

### Spring Boot - SitemapController.java

```java
package com.taguascode.forum.controller;

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

@RestController
public class SitemapController {

    private static final String BASE_URL = "https://foro.taguascode.cloud";
    
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ThreadRepository threadRepository;
    @Autowired private TagRepository tagRepository;
    
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String generateSitemap() {
        StringBuilder sb = new StringBuilder();
        
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        
        // Página principal
        sb.append(createUrlEntry("/", "1.0", "hourly"));
        
        // Categorías
        categoryRepository.findAll().forEach(cat -> 
            sb.append(createUrlEntry("/category/" + toSlug(cat.getName()), "0.9", "weekly"))
        );
        
        // Últimos 1000 hilos
        threadRepository.findTop1000ByOrderByCreatedAtDesc().forEach(thread ->
            sb.append(createUrlEntry("/thread/" + thread.getId() + "-" + toSlug(thread.getTitle()), "0.7", "monthly"))
        );
        
        // Top 100 etiquetas
        tagRepository.findTop100ByOrderByThreadCount().forEach(tag ->
            sb.append(createUrlEntry("/tag/" + tag.getName().toLowerCase(), "0.6", "weekly"))
        );
        
        sb.append("</urlset>");
        return sb.toString();
    }
    
    private String createUrlEntry(String path, String priority, String changefreq) {
        return "  <url>\n" +
               "    <loc>" + BASE_URL + path + "</loc>\n" +
               "    <changefreq>" + changefreq + "</changefreq>\n" +
               "    <priority>" + priority + "</priority>\n" +
               "  </url>\n";
    }
    
    private String toSlug(String text) {
        if (text == null) return "";
        return text.toLowerCase()
            .replace("á", "a").replace("é", "e").replace("í", "i")
            .replace("ó", "o").replace("ú", "u").replace("ñ", "n")
            .replace(" ", "-")
            .replaceAll("[^a-z0-9-]", "");
    }
}
```

### Repositorios necesarios

```java
// ThreadRepository.java
List<Thread> findTop1000ByOrderByCreatedAtDesc();

// TagRepository.java
@Query("SELECT t FROM Tag t WHERE SIZE(t.threads) > 0 ORDER BY SIZE(t.threads) DESC")
List<Tag> findTop100ByOrderByThreadCount();
```

---

## 6. Configuración Google Search Console

### Paso 1: Crear propiedad

1. Ir a https://search.google.com/search-console
2. Seleccionar "Dominio" e ingresar: `foro.taguascode.cloud`
3. Seleccionar método de verificación: **Registro DNS** (recomendado)

### Paso 2: Verificar propiedad

Añadir registro TXT en el DNS de tu proveedor:

```
Tipo: TXT
Nombre: @
Valor: google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXX
```

Tiempo de propagación: 24-48 horas

### Paso 3: Enviar sitemap

1. Search Console > Sitemaps
2. En "Agregar un nuevo sitemap": escribir `sitemap.xml`
3. Click en "Enviar"

### Paso 4: Monitorear

- **Cobertura**: Ver páginas indexadas y errores
- **Rendimiento**: Consultas y posicionamiento
- **Mejoras**: Core Web Vitals,AMP,facetas

---

## 7. Buenas Prácticas para Foros

### Evitar Contenido Duplicado

```java
// Canonical URLs en respuestas
@GetMapping("/thread/{id}")
public ResponseEntity<ThreadResponseDTO> getById(@PathVariable Long id, 
                                                  HttpServletResponse response) {
    Thread thread = threadService.findById(id);
    
    // Agregar header canonical
    String canonicalUrl = "https://foro.taguascode.cloud/thread/" + id + "-" + toSlug(thread.getTitle());
    response.setHeader("Link", "<" + canonicalUrl + ">; rel=\"canonical\"");
    
    return ResponseEntity.ok(toDTO(thread));
}
```

### Pagination SEO

```jsx
// Pagination con links prev/next
export function Pagination({ currentPage, totalPages, baseUrl }) {
  return (
    <nav>
      {currentPage > 1 && (
        <link rel="prev" href={`${baseUrl}?page=${currentPage - 1}`} />
      )}
      {currentPage < totalPages && (
        <link rel="next" href={`${baseUrl}?page=${currentPage + 1}`} />
      )}
      {/* Botones */}
    </nav>
  );
}
```

### Noindex para páginas internas

```java
// Páginas que no deben indexarse
@GetMapping("/user/settings")
public String userSettings(HttpServletResponse response) {
    response.setHeader("X-Robots-Tag", "noindex, nofollow");
    return "settings";
}
```

### Schema.org para Foros

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "DiscussionForumPosting",
  "headline": "Título del tema",
  "text": "Contenido del primer post...",
  "datePublished": "2024-01-15T10:30:00Z",
  "author": {
    "@type": "Person",
    "name": "Nombre de usuario"
  },
  "interactionStatistic": [
    {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/CommentAction",
      "userInteractionCount": 15
    },
    {
      "@type": "InteractionCounter", 
      "interactionType": "https://schema.org/LikeAction",
      "userInteractionCount": 42
    }
  ]
}
</script>
```

---

## Checklist SEO

- [x] robots.txt configurado
- [x] Sitemap.xml (estático + dinámico)
- [x] Meta tags en todas las páginas
- [x] URLs amigables (slug)
- [x] Canonical URLs
- [x] Open Graph tags
- [ ] Google Search Console verificado
- [ ] Schema.org JSON-LD
- [ ] HTTPS forzado
- [ ] Velocidad < 3 segundos
- [ ]sitemap.xml enviar a Google

---

## Siguiente paso recomendado

Una vez desplegado el proyecto en la VPS:
1. Verificar en Google Search Console
2. Enviar el sitemap
3. Monitorear errores de rastreo

¿Quieres que genere algún archivo adicional o profundice en algún aspecto?