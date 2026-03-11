import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="home">
      <div className="hero">
        <h1>Bienvenido al Foro</h1>
        <p>Únete a la comunidad, comparte y aprende</p>
      </div>

      <div className="categories-section">
        <h2>Categorías</h2>
        
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
    </div>
  );
}
