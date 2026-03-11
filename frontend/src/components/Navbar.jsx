import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Forotaguas
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Inicio</Link>
          
          {user ? (
            <>
              <span className="nav-user">Hola, {user.username}</span>
              <button onClick={logout} className="btn-logout">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-register">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
