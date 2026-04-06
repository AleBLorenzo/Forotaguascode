const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async register(username, email, password) {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return res.json();
  },

  async refreshToken() {
    const refresh = localStorage.getItem('refreshToken');
    const res = await fetch(`${API_URL}/api/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_URL}/api/categories`);
    return res.json();
  },

  async createCategory(name, description, iconUrl = null, order = 0) {
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name, description, iconUrl, order })
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error del servidor' }));
      throw new Error(error.message || `Error ${res.status}`);
    }
    
    return res.json();
  },

  // Tags
  async getTags() {
    const res = await fetch(`${API_URL}/api/tags`);
    return res.json();
  },

  // Threads
  async getThreads(page = 0, size = 10, categoryId = null, orderBy = 'createdAt') {
    let url = `${API_URL}/api/threads?page=${page}&size=${size}&sort=${orderBy},desc`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    const res = await fetch(url);
    return res.json();
  },

  async getThread(id) {
    const res = await fetch(`${API_URL}/api/threads/${id}`);
    return res.json();
  },

  async createThread(title, categoryId, content, tagsIds = []) {
    const res = await fetch(`${API_URL}/api/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ title, categoryId, content, tagsIds })
    });
    return res.json();
  },

  // Posts
  async getPosts(threadId, page = 0, size = 20) {
    const res = await fetch(`${API_URL}/api/posts/thread/${threadId}?page=${page}&size=${size}`);
    return res.json();
  },

  async createPost(threadId, content) {
    const res = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ threadId, content })
    });
    return res.json();
  },

  async updatePost(id, content) {
    const res = await fetch(`${API_URL}/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ content })
    });
    return res.json();
  },

  async likePost(id) {
    const res = await fetch(`${API_URL}/api/posts/${id}/like`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Upload
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/api/upload/avatar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Error ${res.status}: No se pudo subir el avatar`);
    }
    
    return res.json();
  },

  // User
  async getCurrentUser() {
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export default api;
