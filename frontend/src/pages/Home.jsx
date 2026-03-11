import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState({ content: [] });
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="home-layout">
      <div className="main-content-home">
        <div className="hero">
          <h1>🌴 Bienvenido a Forotaguas</h1>
          <p>Únete a la comunidad, comparte conocimientos y aprende</p>
        </div>

        <div className="categories-section">
          <h2>📂 Categorías</h2>
          
          {categories.length === 0 ? (
            <p className="no-data">No hay categorías disponibles</p>
          ) : (
            <div className="categories-grid">
              {categories.map(category => (
                <Link 
                  to={`/category/${category.id}`} 
                  key={category.id}
                  className="category-card"
                >
                  {category.iconUrl && (
                    <img src={category.iconUrl} alt={category.name} className="category-icon" />
                  )}
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className="thread-count">{category.totalThreads || 0} hilos</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="recent-threads">
          <h2>🔥 Hilos Recientes</h2>
          
          {threads.content.length === 0 ? (
            <p className="no-data">No hay hilos todavía</p>
          ) : (
            <div className="threads">
              {threads.content.slice(0, 5).map(thread => (
                <Link 
                  to={`/thread/${thread.id}`} 
                  key={thread.id}
                  className="thread-item"
                >
                  <div className="thread-info">
                    <h3>
                      {thread.pinned && <span className="badge pinned">📌</span>}
                      {thread.locked && <span className="badge locked">🔒</span>}
                      {thread.title}
                    </h3>
                    <div className="thread-meta">
                      <span>👤 {thread.authorUsername}</span>
                      <span>💬 {thread.postCount}</span>
                      <span>👁️ {thread.views}</span>
                    </div>
                  </div>
                  <div className="thread-category">
                    {thread.categoryName}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/threads" className="btn-primary">
              Ver todos los hilos →
            </Link>
          </div>
        </div>
      </div>

      <aside className="sidebar">
        <div className="sidebar-card">
          <h3>📢 ¿Tienes dudas?</h3>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Explora nuestras categorías y encuentra respuestas.
          </p>
          <Link to="/register" className="btn-register" style={{ display: 'block', textAlign: 'center' }}>
            Únete a la comunidad
          </Link>
        </div>

        <div className="sidebar-card">
          <h3>📊 Estadísticas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Categorías:</span>
              <strong>{categories.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Hilos:</span>
              <strong>{threads.totalElements || 0}</strong>
            </div>
          </div>
        </div>

        <div className="sidebar-card">
          <h3>🏆 Top Categorías</h3>
          {categories.slice(0, 5).map((cat, index) => (
            <Link 
              to={`/category/${cat.id}`} 
              key={cat.id}
              className="trending-item"
            >
              <span style={{ color: '#2E7D32', fontWeight: '600' }}>{index + 1}. </span>
              {cat.name}
              <span style={{ color: '#666', fontSize: '0.85rem' }}> ({cat.totalThreads || 0})</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
