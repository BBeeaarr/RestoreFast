const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

// Projects API
export const projectsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/projects`);
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    return handleResponse(response);
  },
  
  create: async (data) => {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  getDashboard: async (id) => {
    const response = await fetch(`${API_BASE}/projects/${id}/dashboard`);
    return handleResponse(response);
  },
  
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

// Punch Items API
export const itemsApi = {
  getAll: async (projectId) => {
    const url = projectId 
      ? `${API_BASE}/items?projectId=${projectId}`
      : `${API_BASE}/items`;
    const response = await fetch(url);
    return handleResponse(response);
  },
  
  create: async (data) => {
    const response = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};
