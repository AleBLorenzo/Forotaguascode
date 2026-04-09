import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEOHead, { ForumPostingSchema } from '../components/SEOHead';

export default function ThreadDetail() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState({ content: [] });
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const postsRef = useRef(null);

  useEffect(() => {
    loadThread();
    loadPosts();
  }, [id]);

  const loadThread = async () => {
    try {
      const data = await api.getThread(parseInt(id));
      setThread(data);
    } catch (error) {
      console.error('Error loading thread:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await api.getPosts(parseInt(id), 0, 50);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.createPost(parseInt(id), newPost);
      setNewPost('');
      await Promise.all([loadPosts(), loadThread()]);
      setTimeout(() => {
        postsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    
    // Optimistic update
    const isLiked = likedPosts.has(postId);
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
    
    // Update posts count locally
    setPosts(prev => ({
      ...prev,
      content: prev.content.map(post => 
        post.id === postId 
          ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    }));

    try {
      await api.likePost(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: thread?.title || 'Forotaguas',
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Cargando hilo…</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="error-state" role="alert">
        <SEOHead title="Hilo no encontrado" noIndex={true} />
        <div className="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2>Hilo no encontrado</h2>
        <p>El hilo que buscas no existe o ha sido eliminado.</p>
        <Link to="/threads" className="btn btn-primary">
          Volver a los hilos
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={thread.title}
        description={thread.firstPostContent?.substring(0, 160) || `Hilo en ${thread.categoryName}. ${thread.postCount} respuestas.`}
        type="article"
        articleDate={thread.createdAt}
        canonicalUrl={`https://foro.taguascode.cloud/thread/${thread.id}`}
      />
      <ForumPostingSchema 
        thread={thread}
        author={{ username: thread.authorUsername }}
        datePublished={thread.createdAt}
        replyCount={thread.postCount}
      />
      <div className="thread-detail">
      <article className="thread-header" aria-labelledby="thread-title">
        <div className="thread-header-main">
          <div className="thread-badges">
            {thread.pinned && (
              <span className="badge badge-pinned">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                </svg>
                Fijado
              </span>
            )}
            {thread.locked && (
              <span className="badge badge-locked">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Bloqueado
              </span>
            )}
          </div>
          
          <h1 id="thread-title">{thread.title}</h1>
          
          <div className="thread-meta">
            <div className="thread-author">
              <div className="avatar">
                {thread.authorUsername?.charAt(0).toUpperCase()}
              </div>
              <div className="author-info">
                <span className="author-name">{thread.authorUsername}</span>
                <span className="thread-date">{formatDate(thread.createdAt)}</span>
              </div>
            </div>
            <div className="thread-stats">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {formatNumber(thread.views)} vistas
              </span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {formatNumber(thread.postCount)} respuestas
              </span>
            </div>
          </div>

          <div className="thread-actions">
            <Link to={`/category/${thread.categoryId}`} className="thread-category-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {thread.categoryName}
            </Link>
            <button 
              onClick={handleShare}
              className="btn btn-secondary btn-sm"
              aria-label={copied ? 'Enlace copiado' : 'Compartir hilo'}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  ¡Copiado!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Compartir
                </>
              )}
            </button>
          </div>

          {thread.tags && thread.tags.length > 0 && (
            <div className="thread-tags" role="list" aria-label="Etiquetas">
              {thread.tags.map(tag => (
                <span key={tag} className="tag" role="listitem">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>

      <section className="posts-section" aria-labelledby="posts-heading" ref={postsRef}>
        <h2 id="posts-heading" className="section-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Respuestas ({formatNumber(thread.postCount)})
        </h2>

        <div className="posts-list" role="list">
          {posts.content.map((post, index) => (
            <article 
              key={post.id} 
              className={`post ${index === 0 ? 'post-first' : ''}`}
              role="listitem"
              aria-labelledby={`post-author-${post.id}`}
            >
              <div className="post-author">
                <div className="avatar" aria-hidden="true">
                  {post.authorUsername?.charAt(0).toUpperCase()}
                </div>
                <div className="author-details">
                  <span id={`post-author-${post.id}`} className="username">{post.authorUsername}</span>
                  <time className="post-date" dateTime={post.createdAt}>
                    {formatDate(post.createdAt)}
                  </time>
                </div>
              </div>
              
              <div className="post-content">
                {index === 0 && thread.firstPostContent ? (
                  <div className="first-post-content">
                    {thread.firstPostContent}
                  </div>
                ) : (
                  <div className="post-body">
                    {post.content}
                  </div>
                )}
                
                <div className="post-footer">
                  <div className="post-actions">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`btn-like ${likedPosts.has(post.id) ? 'liked' : ''}`}
                      disabled={!user}
                      aria-label={likedPosts.has(post.id) ? 'Quitar me gusta' : 'Me gusta'}
                      aria-pressed={likedPosts.has(post.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={likedPosts.has(post.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                      <span>{formatNumber(post.likes || 0)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {user && !thread.locked ? (
        <section className="reply-section" aria-labelledby="reply-heading">
          <h3 id="reply-heading">Publicar respuesta</h3>
          <form onSubmit={handleSubmitPost} className="post-form">
            <div className="form-group">
              <label htmlFor="reply-content" className="sr-only">Tu respuesta</label>
              <textarea
                id="reply-content"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Escribe tu respuesta… Comparte tu conocimiento o pregunta"
                rows={6}
                disabled={isSubmitting}
                aria-describedby="reply-hint"
              />
              <span id="reply-hint" className="input-hint">
                Sea respetuoso y constructivo
              </span>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!newPost.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    Publicando…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Publicar Respuesta
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      ) : thread.locked ? (
        <div className="locked-notice" role="alert">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Este hilo está bloqueado. No puedes publicar nuevas respuestas.
        </div>
      ) : (
        <div className="auth-required">
          <div className="auth-required-content">
            <div className="auth-required-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
              </svg>
            </div>
            <h2>Inicia sesión para responder</h2>
            <p>Únete a la comunidad para participar en las conversaciones</p>
            <div className="auth-required-actions">
              <Link to="/login" className="btn btn-primary">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}