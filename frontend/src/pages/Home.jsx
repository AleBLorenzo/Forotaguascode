import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState({ content: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catsData, threadsData] = await Promise.all([
        api.getCategories(),
        api.getThreads(0, 5)
      ]);
      setCategories(catsData);
      setThreads(threadsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const getCategoryIcon = (name) => {
    const icons = {
      'General': '💬',
      'Ayuda': '❓',
      'Proyectos': '🚀',
      'Tutoriales': '📚',
      'Discusión': '💭',
      'Noticias': '📰',
      'Eventos': '📅',
      'Showcase': '🎨',
    };
    return icons[name] || '📁';
  };

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Cargando contenido…</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Foro de Programación"
        description="Comunidad de desarrolladores. Comparte conocimientos, resuelve dudas y conecta con otros programadores."
      />
      <div className="home-layout">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
      
      <div className="main-column" id="main-content">
        <div className="hero" role="banner">
          <div className="hero-content">
            <h1>🌴 Bienvenido a Forotaguas</h1>
            <p>La comunidad donde desarrolladores y entusiastas comparten conocimiento</p>
            {!user ? (
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Únete gratis
                </Link>
                <Link to="/threads" className="btn btn-outline">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  Explorar hilos
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                <Link to="/thread/new" className="btn btn-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Crear hilo
                </Link>
                <Link to="/threads" className="btn btn-outline">
                  Explorar hilos
                </Link>
              </div>
            )}
          </div>
          <div className="hero-pattern" aria-hidden="true"></div>
        </div>

        <section className="section" aria-labelledby="categories-heading">
          <div className="section-header">
            <h2 id="categories-heading">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Categorías
            </h2>
            <Link to="/threads" className="see-all-link">
              Ver todas →
            </Link>
          </div>
          
          {categories.length === 0 ? (
            <div className="empty-state" role="status">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>No hay categorías</h3>
              <p>Las categorías aparecerán aquí cuando estén disponibles</p>
            </div>
          ) : (
            <div className="categories-grid" role="list">
              {categories.map(category => (
                <Link 
                  to={`/category/${category.id}`} 
                  key={category.id}
                  className="category-card"
                  role="listitem"
                >
                  <div className="category-icon-placeholder" aria-hidden="true">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div className="category-content">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                  <span className="thread-count">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {formatNumber(category.totalThreads || 0)} hilos
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="section" aria-labelledby="recent-threads-heading">
          <div className="section-header">
            <h2 id="recent-threads-heading">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Hilos Recientes
            </h2>
            <Link to="/threads" className="see-all-link">
              Ver todos →
            </Link>
          </div>
          
          {threads.content.length === 0 ? (
            <div className="empty-state" role="status">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>¡Sé el primero en crear un hilo!</h3>
              <p>No hay hilos todavía. Comparte tu conocimiento con la comunidad.</p>
              {user && (
                <Link to="/thread/new" className="btn btn-primary">
                  Crear hilo
                </Link>
              )}
            </div>
          ) : (
            <div className="threads-list" role="list">
              {threads.content.slice(0, 5).map(thread => (
                <Link 
                  to={`/thread/${thread.id}`} 
                  key={thread.id}
                  className="thread-item"
                  role="listitem"
                >
                  <div className="thread-info">
                    <h3>
                      {thread.pinned && (
                        <span className="badge badge-pinned" aria-label="Hilo fijadp">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                          </svg>
                          Fijado
                        </span>
                      )}
                      {thread.locked && (
                        <span className="badge badge-locked" aria-label="Hilo bloqueado">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          Bloqueado
                        </span>
                      )}
                      {thread.title}
                    </h3>
                    <div className="thread-meta">
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {thread.authorUsername}
                      </span>
                      <span className="meta-separator" aria-hidden="true">•</span>
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        {formatNumber(thread.postCount)} respuestas
                      </span>
                      <span className="meta-separator" aria-hidden="true">•</span>
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {formatNumber(thread.views)} vistas
                      </span>
                    </div>
                  </div>
                  <div className="thread-category-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    {thread.categoryName}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {threads.content.length > 0 && (
            <div className="section-footer">
              <Link to="/threads" className="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Ver todos los hilos
              </Link>
            </div>
          )}
        </section>
      </div>

      <aside className="sidebar" aria-label="Información adicional">
        <div className="sidebar-card">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            ¿Tienes dudas?
          </h3>
          <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)', lineHeight: '1.6' }}>
            Explora nuestras categorías y encuentra respuestas a tus preguntas.
          </p>
          <Link to="/register" className="btn btn-primary btn-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Únete a la comunidad
          </Link>
        </div>

        <div className="sidebar-card">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Estadísticas
          </h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{formatNumber(categories.length)}</span>
              <span className="stat-label">Categorías</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatNumber(threads.totalElements || 0)}</span>
              <span className="stat-label">Hilos</span>
            </div>
          </div>
        </div>

        <div className="sidebar-card">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Categorías Populares
          </h3>
          <ul className="trending-list">
            {categories.slice(0, 5).map((cat, index) => (
              <li key={cat.id}>
                <Link 
                  to={`/category/${cat.id}`} 
                  className="trending-item"
                >
                  <span className="trending-rank">{index + 1}</span>
                  <span className="trending-name">{cat.name}</span>
                  <span className="trending-count">{formatNumber(cat.totalThreads || 0)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}