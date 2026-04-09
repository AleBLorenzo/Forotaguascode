import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Forotaguascode';
const DEFAULT_DESCRIPTION = 'Foro de programación y desarrollo. Comparte conocimientos, resuelve dudas y conecta con desarrolladores.';
const BASE_URL = 'https://foro.taguascode.cloud';

/**
 * Componente para meta tags dinámicos SEO
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

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      <link rel="canonical" href={canonical} />

      {/* Open Graph - Facebook/Meta */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
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
      <meta name="twitter:site" content="@forotaguascode" />

      {/* Schema.org - WebSite con SearchAction */}
      <script type="application/ld+json">
        {JSON.stringify({
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
        })}
      </script>
    </Helmet>
  );
}

/**
 * Schema.org para páginas de hilo/foro
 */
export function ForumPostingSchema({ thread, author, datePublished, replyCount }) {
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

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export default SEOHead;