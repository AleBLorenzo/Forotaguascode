import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';

export default function NewThread() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catsData, tagsData] = await Promise.all([
        api.getCategories(),
        api.getTags()
      ]);
      setCategories(catsData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('No se pudieron cargar las categorías o etiquetas');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      const id = parseInt(tagId);
      if (prev.includes(id)) {
        return prev.filter(t => t !== id);
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (title.trim().length < 5) {
      setError('El título debe tener al menos 5 caracteres');
      return;
    }
    if (!content.trim()) {
      setError('El contenido es obligatorio');
      return;
    }
    if (!categoryId) {
      setError('Debes seleccionar una categoría');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await api.createThread(title, parseInt(categoryId), content, selectedTags);
      if (result.id) {
        navigate(`/thread/${result.id}`, { 
          state: { message: '¡Hilo creado correctamente!' } 
        });
      } else {
        setError(result.message || 'Error al crear el hilo');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-required">
        <div className="auth-required-content">
          <div className="auth-required-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2>Acceso requerido</h2>
          <p>Debes iniciar sesión para crear un hilo.</p>
          <div className="auth-required-actions">
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
              </svg>
              Iniciar sesión
            </button>
            <button onClick={() => navigate('/register')} className="btn btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Cargando formulario…</p>
      </div>
    );
  }

  return (
    <div className="new-thread-page">
      <SEOHead 
        title="Crear Nuevo Hilo"
        description="Crea un nuevo hilo en Forotaguascode"
        noIndex={true}
      />
      <div className="new-thread-card">
        <header className="form-header">
          <h1>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Crear Nuevo Hilo
          </h1>
          <p>Comparte tu pregunta o conocimiento con la comunidad</p>
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

        <form onSubmit={handleSubmit} noValidate className="thread-form">
          <div className="form-group">
            <label htmlFor="thread-title">
              Título <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <input
                id="thread-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="¿Cuál es tu pregunta o tema?"
                minLength={5}
                maxLength={200}
                disabled={isSubmitting}
                aria-describedby="title-hint"
              />
            </div>
            <span id="title-hint" className="input-hint">
              Sé específico y claro ({title.length}/200 caracteres)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="thread-category">
              Categoría <span className="required">*</span>
            </label>
            <div className="select-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <select
                id="thread-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="thread-tags">
              Etiquetas <span className="optional">(opcional)</span>
            </label>
            <div className="tags-selector" role="group" aria-label="Seleccionar etiquetas">
              {tags.length === 0 ? (
                <p className="no-tags">No hay etiquetas disponibles</p>
              ) : (
                <div className="tags-grid">
                  {tags.map(tag => (
                    <label 
                      key={tag.id} 
                      className={`tag-option ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        disabled={isSubmitting}
                      />
                      <span className="tag-name">{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <span className="input-hint">
              Selecciona hasta 5 etiquetas relevantes para tu hilo
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="thread-content">
              Contenido <span className="required">*</span>
            </label>
            <div className="textarea-wrapper">
              <textarea
                id="thread-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Describe tu pregunta o tema en detalle. Incluye toda la información relevante que pueda ayudar a otros a responder mejor…"
                rows={10}
                disabled={isSubmitting}
                aria-describedby="content-hint"
              />
            </div>
            <span id="content-hint" className="input-hint">
              Incluye código, errores o contexto relevante
            </span>
          </div>

          <div className="form-tips">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Consejos para una buena publicación
            </h3>
            <ul>
              <li>Selecciona una categoría adecuada para tu hilo</li>
              <li>Usa un título claro y descriptivo</li>
              <li>Proporciona contexto y detalles relevantes</li>
              <li>Si es un error, incluye el código o mensaje de error</li>
            </ul>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
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
                  Creando hilo…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Publicar Hilo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}