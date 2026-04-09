import { useEffect } from 'react';

const SITE_NAME = 'Forotaguascode';
const DEFAULT_DESCRIPTION = 'Foro de programación y desarrollo. Comparte conocimientos, resuelve dudas y conecta con desarrolladores.';
const BASE_URL = 'https://foro.taguascode.cloud';

/**
 * Componente SEO sin dependencias externas - funciona con React 19
 * Uso: <SEOHead title="Título" description="Descripción" />
 */
export function SEOHead({ 
  title, 
  description, 
  image, 
  type = 'website',
  articleDate,
  canonicalUrl,
  noIndex = false
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const metaDesc = description || DEFAULT_DESCRIPTION;
  const ogImage = image || `${BASE_URL}/og-default.png`;
  const canonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : BASE_URL);

  useEffect(() => {
    // Title
    document.title = fullTitle;
    
    // Meta tags
    setMetaTag('name', 'description', metaDesc);
    if (noIndex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      const robots = document.querySelector('meta[name="robots"]');
      if (robots) robots.remove();
    }
    
    // Canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
    
    // Open Graph
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:locale', 'es_ES');
    
    if (articleDate) {
      setMetaTag('property', 'article:published_time', articleDate);
    }
    
    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDesc);
    setMetaTag('name', 'twitter:image', ogImage);
    
    // Schema.org
    updateSchema({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE_NAME,
      "url": BASE_URL,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BASE_URL}/threads?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    });
    
    // Cleanup function
    return () => {
      // No hacemos cleanup para mantener los tags en todas las páginas
    };
  }, [fullTitle, metaDesc, ogImage, canonical, type, articleDate, noIndex]);

  return null; // Este componente no renderiza nada
}

/**
 * Schema.org para páginas de hilo/foro
 */
export function ForumPostingSchema({ thread, author, datePublished, replyCount }) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
      "headline": thread?.title || '',
      "text": thread?.content?.substring(0, 300) || '',
      "datePublished": datePublished,
      "author": {
        "@type": "Person",
        "name": author?.username || 'Usuario'
      },
      "interactionStatistic": replyCount ? [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/CommentAction",
          "userInteractionCount": replyCount
        }
      ] : []
    };
    
    updateSchema(schema);
  }, [thread, author, datePublished, replyCount]);

  return null;
}

// Helper function para设置 meta tags
function setMetaTag(attrName, attrValue, content) {
  let meta;
  if (attrName === 'name') {
    meta = document.querySelector(`meta[name="${attrValue}"]`);
  } else if (attrName === 'property') {
    meta = document.querySelector(`meta[property="${attrValue}"]`);
  }
  
  if (!meta) {
    meta = document.createElement('meta');
    if (attrName === 'name') {
      meta.name = attrValue;
    } else if (attrName === 'property') {
      meta.setAttribute('property', attrValue);
    }
    document.head.appendChild(meta);
  }
  meta.content = content;
}

// Helper function para actualizar JSON-LD
function updateSchema(data) {
  let script = document.querySelector('script[type="application/ld+json"]');
  
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(data);
}

export default SEOHead;