import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/threads?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="palm-icon">🌴</span>
          Forotaguas
        </Link>
        
        <form onSubmit={handleSearch} className="nav-search">
          <input
            type="text"
            placeholder="Buscar hilos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/threads" className="nav-link">Hilos</Link>
          
          {user ? (
            <>
              <div className="nav-user">
                <div className="avatar">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span>{user.username}</span>
              </div>
              <button onClick={logout} className="btn-logout">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
