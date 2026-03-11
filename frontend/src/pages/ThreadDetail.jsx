import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ThreadDetail() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState({ content: [] });
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadThread();
    loadPosts();
  }, [id]);

  const loadThread = async () => {
    try {
      const data = await api.getThread(parseInt(id));
      setThread(data);
    } catch (error) {
      console.error('Error loading thread:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await api.getPosts(parseInt(id), 0, 20);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await api.createPost(parseInt(id), newPost);
      setNewPost('');
      loadPosts();
      loadThread();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.likePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!thread) {
    return <div className="error">Hilo no encontrado</div>;
  }

  return (
    <div className="thread-detail">
      <div className="thread-header">
        <h1>{thread.title}</h1>
        <div className="thread-meta">
          <span>Por {thread.authorUsername}</span>
          <span>•</span>
          <span>{thread.views} vistas</span>
          <span>•</span>
          <span>{thread.categoryName}</span>
        </div>
        {thread.tags && thread.tags.length > 0 && (
          <div className="thread-tags">
            {thread.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="posts">
        {posts.content.map((post, index) => (
          <div key={post.id} className="post">
            <div className="post-author">
              <div className="avatar">
                {post.authorUsername?.charAt(0).toUpperCase()}
              </div>
              <span className="username">{post.authorUsername}</span>
            </div>
            <div className="post-content">
              {index === 0 && thread.firstPostContent ? (
                <div className="first-post">{thread.firstPostContent}</div>
              ) : (
                <div>{post.content}</div>
              )}
              <div className="post-footer">
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
                <button onClick={() => handleLike(post.id)} className="btn-like">
                  ❤️ {post.likes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {user && !thread.locked ? (
        <form onSubmit={handleSubmitPost} className="post-form">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows={4}
          />
          <button type="submit" className="btn-primary">
            Publicar Respuesta
          </button>
        </form>
      ) : thread.locked ? (
        <div className="locked-message">Este hilo está bloqueado</div>
      ) : (
        <div className="login-prompt">
          <a href="/login">Inicia sesión</a> para responder
        </div>
      )}
    </div>
  );
}
