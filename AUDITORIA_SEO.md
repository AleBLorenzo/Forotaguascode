# Auditoría SEO Técnica - Forotaguascode

## Estado Actual del Proyecto

- **Backend**: Spring Boot 4.0.3 (Java 21) en puerto 8081
- **Frontend**: React + Vite (SPA)
- **Dominio**: https://foro.taguascode.cloud
- **Base de datos**: PostgreSQL

---

## Problemas Detectados y Soluciones

### 1. SPA sin SSR - Google NO puede indexar correctamente

**Problema**: React + Vite genera un HTML vacío que se llena con JavaScript. Google crawlea pero ve una página casi vacía.

**Solución**: Implementar Prerendering con `react-snap` o `vite-plugin-ssr` (más rápido y menos intrusivo).

**Implementación recomendada**:

```bash
# En el proyecto frontend (fuera del alcance actual)
npm install vite-plugin-ssr prerender
```

O mejor opción, mudar a Next.js para verdadero SSR.

---

### 2. Sitemap sin lastmod - No indica cuándo cambió cada página

**Problema**: El sitemap actual no incluye fechas de modificación, Google no sabe qué actualizar.

**Solución**: Agregar `lastmod` con la fecha de última modificación.

**Código corregido**:

```java
// SitemapController.java - VERSIÓN CORREGIDA
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

@RestController
public class SitemapController {

    private static final String BASE_URL = "https://foro.taguascode.cloud";
    private static final DateTimeFormatter ISO_FORMATTER = 
        DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ThreadRepository threadRepository;
    @Autowired private TagRepository tagRepository;
    
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String generateSitemap() {
        StringBuilder sb = new StringBuilder();
        
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" ");
        sb.append("xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n");
        
        // 1. Página principal - siempre incluir
        sb.append(createUrlEntry("/", "1.0", "hourly", getCurrentDate()));
        
        // 2. Lista de categorías
        sb.append(createUrlEntry("/categories", "0.9", "daily", getCurrentDate()));
        
        // 3. Categorías individuales
        categoryRepository.findAll().forEach(cat -> {
            String slug = toSlug(cat.getName());
            LocalDateTime updated = cat.getUpdatedAt() != null ? cat.getUpdatedAt() : cat.getCreatedAt();
            sb.append(createUrlEntry("/category/" + slug, "0.8", "weekly", 
                updated != null ? formatDate(updated) : getCurrentDate()));
        });
        
        // 4. Hilos (últimos 500 - sitemap de 50k URLs máximo)
        threadRepository.findTop500ByOrderByCreatedAtDesc().forEach(thread -> {
            String slug = toSlug(thread.getTitle());
            LocalDateTime updated = thread.getUpdatedAt() != null ? thread.getUpdatedAt() : thread.getCreatedAt();
            sb.append(createUrlEntry("/thread/" + thread.getId() + "-" + slug, "0.7", "monthly",
                updated != null ? formatDate(updated) : getCurrentDate()));
        });
        
        // 5. Lista de etiquetas
        sb.append(createUrlEntry("/tags", "0.6", "weekly", getCurrentDate()));
        
        // 6. Etiquetas principales
        tagRepository.findTop50ByOrderByThreadCount().forEach(tag -> {
            sb.append(createUrlEntry("/tag/" + tag.getName().toLowerCase(), "0.5", "weekly", getCurrentDate()));
        });
        
        sb.append("</urlset>");
        return sb.toString();
    }
    
    private String createUrlEntry(String path, String priority, String changefreq, String lastmod) {
        return "  <url>\n" +
               "    <loc>" + BASE_URL + path + "</loc>\n" +
               "    <lastmod>" + lastmod + "</lastmod>\n" +
               "    <changefreq>" + changefreq + "</changefreq>\n" +
               "    <priority>" + priority + "</priority>\n" +
               "  </url>\n";
    }
    
    private String formatDate(LocalDateTime dateTime) {
        return dateTime.format(ISO_FORMATTER);
    }
    
    private String getCurrentDate() {
        return LocalDateTime.now().format(ISO_FORMATTER);
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

**ThreadRepository - agregar método actualizado**:

```java
// ThreadRepository.java
List<Thread> findTop500ByOrderByCreatedAtDesc();
```

**TagRepository - método actualizado**:

```java
// TagRepository.java
@Query("SELECT t FROM Tag t WHERE SIZE(t.threads) > 0 ORDER BY SIZE(t.threads) DESC")
List<Tag> findTop50ByOrderByThreadCount();
```

---

### 3. robots.txt - configuración que puede bloquear sin querer

**Problema**: Allow: / al inicio, pero Disallow: /api/ bloquea el sitemap si se sirve desde /api (no es el caso) pero hay redundancias.

**Solución**: robots.txt optimizado:

```
# robots.txt - VERSIÓN OPTIMIZADA
User-agent: *
Allow: /

# NO indexar
Disallow: /api/
Disallow: /auth/
Disallow: /uploads/
Disallow: /admin/

# Evitar duplicados de paginación
Clean-param: page
Clean-param: sort

# Sitemap
Sitemap: https://foro.taguascode.cloud/sitemap.xml
```

---

### 4. No hay meta tags dinámicos en React

**Problema**: El frontend no tiene implementación de meta tags para SEO.

**Solución**: Instalar `react-helmet-async` (alternativa moderna a react-helmet):

```bash
npm install react-helmet-async
```

**Implementación - SEOHead.jsx**:

```jsx
// src/components/SEOHead.jsx
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Forotaguascode';
const DEFAULT_DESCRIPTION = 'Foro de programación y desarrollo. Comparte conocimientos, resuelve dudas y conecta con desarrolladores.';
const BASE_URL = 'https://foro.taguascode.cloud';

export function SEOHead({ 
  title, 
  description, 
  image, 
  type = 'website',
  articleDate,
  canonicalUrl
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const metaDesc = description || DEFAULT_DESCRIPTION;
  const ogImage = image || `${BASE_URL}/og-default.png`;
  const canonical = canonicalUrl || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {articleDate && (
        <meta property="article:published_time" content={articleDate} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org - WebSite */}
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
    </Helmet>
  );
}
```

**Uso en páginas**:

```jsx
// src/pages/HomePage.jsx
import { SEOHead } from '../components/SEOHead';

export function HomePage() {
  return (
    <>
      <SEOHead 
        title="Foro de Programación"
        description="Comunidad de desarrolladores. Comparte, aprende y conecta."
      />
      <h1>Forotaguascode</h1>
      {/* contenido */}
    </>
  );
}

// src/pages/ThreadPage.jsx
export function ThreadPage({ thread }) {
  const threadDate = thread.createdAt ? new Date(thread.createdAt).toISOString() : null;
  
  return (
    <>
      <SEOHead 
        title={thread.title}
        description={thread.excerpt || thread.content?.substring(0, 160)}
        type="article"
        articleDate={threadDate}
        canonicalUrl={`${BASE_URL}/thread/${thread.id}-${toSlug(thread.title)}`}
      />
      <article>
        <h1>{thread.title}</h1>
        {/* contenido */}
      </article>
    </>
  );
}
```

---

### 5. Headers HTTP faltantes para SEO

**Problema**: No hay headers de canonical, noindex, etc.

**Solución**: Crear un interceptor en Spring Boot:

```java
// SEOHeaderInterceptor.java
package com.taguascode.forum.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SEOHeaderInterceptor implements HandlerInterceptor {

    private static final String BASE_URL = "https://foro.taguascode.cloud";

    @Override
    public void handle(HttpServletResponse response, Object handler) {
        String uri = request.getRequestURI();
        
        // Páginas públicas que SÍ deben indexarse
        if (isPublicPage(uri)) {
            // Agregar header X-Robots-Tag para indexar
            response.setHeader("X-Robots-Tag", "index, follow");
            
            // Agregar canonical URL
            String canonicalUrl = BASE_URL + uri;
            response.setHeader("Link", "<" + canonicalUrl + ">; rel=\"canonical\"");
        }
        
        // Páginas que NO deben indexarse
        if (isPrivatePage(uri)) {
            response.setHeader("X-Robots-Tag", "noindex, nofollow");
        }
    }
    
    private boolean isPublicPage(String uri) {
        return uri.equals("/") ||
               uri.startsWith("/category/") ||
               uri.startsWith("/thread/") ||
               uri.startsWith("/tag/") ||
               uri.equals("/categories") ||
               uri.equals("/tags") ||
               uri.equals("/search") ||
               uri.equals("/sitemap.xml") ||
               uri.equals("/robots.txt");
    }
    
    private boolean isPrivatePage(String uri) {
        return uri.startsWith("/api/") ||
               uri.startsWith("/auth/") ||
               uri.startsWith("/admin/") ||
               uri.startsWith("/uploads/") ||
               uri.contains("/profile") ||
               uri.contains("/settings");
    }
}
```

**Registrar el interceptor - WebConfig.java**:

```java
package com.taguascode.forum.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private SEOHeaderInterceptor seoHeaderInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(seoHeaderInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/api/**"); // El API no necesita estos headers
    }
}
```

---

### 6. Recursos estáticos - Configuración

**Problema**: El sitemap dinámico funciona pero el sitemap estático en /static también debe existir como fallback.

**application.properties**:

```properties
# Recursos estáticos
spring.web.resources.static-locations=classpath:/static/
spring.mvc.static-path-pattern=/**
spring.web.resources.add-mappings=true
```

Esto permite servir:
- `/robots.txt` → classpath:/static/robots.txt
- `/sitemap.xml` → el controller `/sitemap.xml` tiene prioridad
- `/uploads/**` → archivos subidos

---

### 7. Estructura de URLs

**URLs actuales**: `/api/threads`, `/api/categories` (son API)

**URLs públicas (frontend)**: deberían ser:
- `/` → Home
- `/categories` → Lista de categorías
- `/category/{slug}` → Categoría específica
- `/thread/{id}-{slug}` → Tema específico
- `/tag/{name}` → Etiqueta
- `/search` → Búsqueda

**Problema**: El backend es solo API REST. Las URLs las maneja el frontend con React Router.

---

## Pasos Concretos en Google Search Console

### 1. Crear propiedad (si no existe)
1. Ir a https://search.google.com/search-console
2. Agregar propiedad: `foro.taguascode.cloud`
3. Verificar con **registro TXT en DNS**

### 2. Verificar propiedad
En el proveedor DNS (Cloudflare, Namecheap, etc.):
```
Tipo: TXT
Nombre: @ o foro
Valor: google-site-verification=XXXXXXXXXXXXXXXXXXXXXX
```
Esperar 24-48 horas.

### 3. Enviar sitemap
1. Search Console > Sitemaps
2. En "Sitemap nuevo": `sitemap.xml`
3. Click "Enviar"

### 4. Forzar indexación
1. Search Console > Inspección de URL
2. Pegar: `https://foro.taguascode.cloud/`
3. Click "Solicitar indexación"

### 5. Verificar errores
1. Search Console > Cobertura
2. Revisar errores tipo:
   - "Submitted URL blocked by robots.txt" → revisar robots.txt
   - "Submitted URL returns 404" → revisar rutas
   - "Server error (5xx)" → revisar backend

---

## Checklist de Correcciones

| # | Problema | Estado | Acción |
|---|----------|--------|--------|
| 1 | SPA sin SSR | ⚠️ CRÍTICO | Instalar react-helmet-async + prerendering |
| 2 | Sitemap sin lastmod | ✅ Corregido | Actualizar SitemapController |
| 3 | robots.txt | ✅ Optimizado | Actualizar archivo |
| 4 | Meta tags faltantes | ⚠️ CRÍTICO | Implementar SEOHead.jsx |
| 5 | Headers HTTP | ⚠️ CRÍTICO | Crear SEOHeaderInterceptor |
| 6 | Recursos estáticos | ✅ Configurado | Verificar application.properties |
| 7 | Search Console | 🔲 Pendiente | Enviar sitemap |

---

## Prioridad de Implementación

### URGENTE (hoy)
1. Instalar `react-helmet-async` en el frontend
2. Crear componente SEOHead.jsx
3. Actualizar SitemapController con lastmod
4. Actualizar robots.txt

### Importante (esta semana)
5. Crear SEOHeaderInterceptor
6. Configurar prerendering del frontend
7. Verificar en Search Console

### Posible solución a largo plazo
- Migrar frontend a Next.js para SSR real (más trabajo pero mejor SEO)

---

¿Quieres que cree los archivos físicos de las correcciones en el proyecto?