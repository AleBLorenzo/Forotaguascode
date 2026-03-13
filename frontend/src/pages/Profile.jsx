import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [user, navigate]);

  const loadUserProfile = async () => {
    try {
      const data = await api.getCurrentUser();
      setUserData(data);
    } catch (err) {
      setError('No se pudo cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setError('Por favor, selecciona un archivo');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (avatarFile.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar los 5MB');
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(avatarFile.type)) {
      setError('Solo se permiten imágenes JPG, PNG, GIF o WebP');
      return;
    }

    try {
      const result = await api.uploadAvatar(avatarFile);
      setUserData(prev => ({ ...prev, avatarUrl: result.avatarUrl }));
      setSuccess('Avatar actualizado correctamente');
      setAvatarFile(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al subir el avatar');
    }
  };

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  if (!userData) {
    return <div className="error">No se pudo cargar el perfil</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Perfil de Usuario</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-large">
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt={userData.username} />
              ) : (
                userData.username?.charAt(0).toUpperCase()
              )}
            </div>
            <form onSubmit={handleAvatarUpload} className="avatar-upload-form">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
              <button type="submit" className="btn-secondary" disabled={!avatarFile}>
                Subir Avatar
              </button>
            </form>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <label>Nombre de usuario:</label>
              <span>{userData.username}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{userData.email}</span>
            </div>
            <div className="detail-item">
              <label>Rol:</label>
              <span>{userData.role}</span>
            </div>
            <div className="detail-item">
              <label>Miembro desde:</label>
              <span>{new Date(userData.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={logout} className="btn-danger">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}