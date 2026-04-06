import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', iconUrl: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Solo admins pueden acceder
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await api.createCategory(
        newCategory.name,
        newCategory.description,
        newCategory.iconUrl || null,
        0
      );
      
      setSuccess('Categoría creada correctamente');
      setNewCategory({ name: '', description: '', iconUrl: '' });
      setShowForm(false);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Error al crear la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Cargando categorías…</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div className="page-header-content">
          <h1>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Gestión de Categorías
          </h1>
          <p className="page-subtitle">Administra las categorías del foro</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Categoría
        </button>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {success}
        </div>
      )}

      {showForm && (
        <div className="admin-form-card">
          <h2>Crear Nueva Categoría</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="category-name">Nombre <span className="required">*</span></label>
              <input
                id="category-name"
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
                placeholder="Nombre de la categoría"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category-description">Descripción <span className="required">*</span></label>
              <textarea
                id="category-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                required
                placeholder="Descripción de la categoría"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category-icon">Icono (URL) <span className="optional">(opcional)</span></label>
              <input
                id="category-icon"
                type="url"
                value={newCategory.iconUrl}
                onChange={(e) => setNewCategory({ ...newCategory, iconUrl: e.target.value })}
                placeholder="https://ejemplo.com/icono.png"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    Creando…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Crear Categoría
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-list">
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>No hay categorías</h3>
            <p>Crea la primera categoría para el foro</p>
          </div>
        ) : (
          <div className="admin-table">
            <div className="table-header">
              <span>Nombre</span>
              <span>Descripción</span>
              <span>Hilos</span>
              <span>Acciones</span>
            </div>
            {categories.map(category => (
              <div key={category.id} className="table-row">
                <div className="category-name">
                  {category.iconUrl ? (
                    <img src={category.iconUrl} alt="" className="category-icon-sm" />
                  ) : (
                    <span className="category-icon-placeholder-sm">📁</span>
                  )}
                  {category.name}
                </div>
                <div className="category-description">{category.description}</div>
                <div className="category-count">{category.totalThreads || 0}</div>
                <div className="category-actions">
                  <button className="btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="btn-icon btn-icon-danger" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}