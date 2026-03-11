import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NewThread() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');
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

  const handleTagChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(parseInt(options[i].value));
      }
    }
    setSelectedTags(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio');
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

    try {
      const result = await api.createThread(title, parseInt(categoryId), content, selectedTags);
      if (result.id) {
        navigate(`/thread/${result.id}`);
      } else {
        setError(result.message || 'Error al crear el hilo');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      setError('Error de conexión o servidor');
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Acceso requerido</h2>
          <p>Debes iniciar sesión para crear un hilo.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="new-thread-container">
      <div className="new-thread-card">
        <h2>Crear Nuevo Hilo</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Título del hilo"
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Etiquetas (opcional)</label>
            <select
              multiple
              value={selectedTags}
              onChange={handleTagChange}
              className="tag-select"
            >
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <small>Mantén Ctrl (Cmd en Mac) pulsado para seleccionar múltiples etiquetas</small>
          </div>

          <div className="form-group">
            <label>Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Escribe el contenido de tu hilo..."
              rows={10}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Crear Hilo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}