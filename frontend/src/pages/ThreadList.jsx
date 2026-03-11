import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ThreadList() {
  const { categoryId } = useParams();
  const [threads, setThreads] = useState({ content: [], totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadThreads();
  }, [categoryId, page]);

  const loadThreads = async () => {
    try {
      const data = await api.getThreads(page, 10, categoryId ? parseInt(categoryId) : null);
      setThreads(data);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="thread-list">
      <div className="thread-list-header">
        <h2>Hilos</h2>
        {user && (
          <Link to="/thread/new" className="btn-primary">
            Nuevo Hilo
          </Link>
        )}
      </div>

      {threads.content.length === 0 ? (
        <p className="no-data">No hay hilos en esta categoría</p>
      ) : (
        <>
          <div className="threads">
            {threads.content.map(thread => (
              <Link 
                to={`/thread/${thread.id}`} 
                key={thread.id}
                className="thread-item"
              >
                <div className="thread-info">
                  <h3>
                    {thread.pinned && <span className="badge pinned">Fijado</span>}
                    {thread.locked && <span className="badge locked">Bloqueado</span>}
                    {thread.title}
                  </h3>
                  <div className="thread-meta">
                    <span>Por {thread.authorUsername}</span>
                    <span>•</span>
                    <span>{thread.postCount} respuestas</span>
                    <span>•</span>
                    <span>{thread.views} vistas</span>
                  </div>
                </div>
                <div className="thread-category">
                  {thread.categoryName}
                </div>
              </Link>
            ))}
          </div>

          {threads.totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </button>
              <span>Página {page + 1} de {threads.totalPages}</span>
              <button 
                disabled={page >= threads.totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
