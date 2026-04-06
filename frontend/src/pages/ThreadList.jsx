import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ThreadList() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const { user } = useAuth();
  const size = 10;

  useEffect(() => {
    loadThreads();
  }, [categoryId, page, sortBy]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      let orderBy = 'createdAt';
      if (sortBy === 'popular') orderBy = 'views';
      if (sortBy === 'activity') orderBy = 'lastActivity';
      
      const data = await api.getThreads(page, size, categoryId ? parseInt(categoryId) : null, orderBy);
      setThreads(data);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryTitle = () => {
    if (categoryId) return `Hilos de Categoría`;
    return 'Todos los Hilos';
  };

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Cargando hilos…</p>
      </div>
    );
  }

  return (
    <div className="thread-list-page">
      <header className="page-header">
        <div className="page-header-content">
          <h1>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {getCategoryTitle()}
          </h1>
          <p className="page-subtitle">
            {formatNumber(threads.totalElements || 0)} hilos disponibles
          </p>
        </div>
        
        {user && (
          <Link to="/thread/new" className="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Hilo
          </Link>
        )}
      </header>

      <div className="filters-bar">
        <div className="sort-options" role="group" aria-label="Ordenar hilos">
          <button
            className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
            onClick={() => setSortBy('recent')}
            aria-pressed={sortBy === 'recent'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Recientes
          </button>
          <button
            className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
            onClick={() => setSortBy('popular')}
            aria-pressed={sortBy === 'popular'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Populares
          </button>
          <button
            className={`sort-btn ${sortBy === 'activity' ? 'active' : ''}`}
            onClick={() => setSortBy('activity')}
            aria-pressed={sortBy === 'activity'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Activos
          </button>
        </div>
      </div>

      {threads.content.length === 0 ? (
        <div className="empty-state" role="status">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>No hay hilos todavía</h3>
          <p>¡Sé el primero en iniciar una conversación!</p>
          {user && (
            <Link to="/thread/new" className="btn btn-primary">
              Crear primer hilo
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="threads-list" role="list" aria-label="Lista de hilos">
            {threads.content.map(thread => (
              <Link 
                to={`/thread/${thread.id}`} 
                key={thread.id}
                className="thread-item"
                role="listitem"
              >
                <div className="thread-info">
                  <h3>
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
                      {formatNumber(thread.postCount)} respuestas
                    </span>
                    <span className="meta-separator" aria-hidden="true">•</span>
                    <span className="meta-item">
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

          {threads.totalPages > 1 && (
            <nav className="pagination" aria-label="Paginación">
              <button 
                className="pagination-btn"
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
                aria-label="Página anterior"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Anterior
              </button>
              
              <div className="pagination-info">
                <span className="pagination-current">{page + 1}</span>
                <span className="pagination-separator">de</span>
                <span className="pagination-total">{threads.totalPages}</span>
              </div>
              
              <button 
                className="pagination-btn"
                disabled={page >= threads.totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
                aria-label="Página siguiente"
              >
                Siguiente
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}