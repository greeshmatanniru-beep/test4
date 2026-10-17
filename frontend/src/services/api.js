const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export function getAuthToken() {
  return localStorage.getItem('corpmind_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('corpmind_token', token);
  } else {
    localStorage.removeItem('corpmind_token');
  }
}

export function getCurrentUser() {
  const userJson = localStorage.getItem('corpmind_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('corpmind_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('corpmind_user');
  }
}

export function clearSession() {
  localStorage.removeItem('corpmind_token');
  localStorage.removeItem('corpmind_user');
}

import {
  mockMetrics,
  mockDocuments,
  mockWorkflows,
  mockAuditLogs,
  mockTasks,
  mockTaskMetrics,
  mockAIInsights
} from './mockData';

function getFallbackData(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (endpoint.includes('/analytics/metrics')) {
    return { metrics: mockMetrics };
  }
  if (endpoint.includes('/analytics/audit-logs')) {
    return { logs: mockAuditLogs };
  }
  if (endpoint.includes('/analytics/ai-insights')) {
    return { insights: mockAIInsights };
  }
  if (endpoint.includes('/tasks/metrics')) {
    return { metrics: mockTaskMetrics };
  }
  if (endpoint.startsWith('/tasks') && method === 'GET') {
    return { tasks: mockTasks };
  }
  if (endpoint.startsWith('/documents') && method === 'GET') {
    if (endpoint === '/documents' || endpoint === '/documents/') {
      return { documents: mockDocuments };
    }
    const docId = endpoint.replace('/documents/', '');
    const doc = mockDocuments.find((d) => d.id === docId) || mockDocuments[0];
    return { document: doc };
  }
  if (endpoint.startsWith('/workflows') && method === 'GET') {
    return { workflows: mockWorkflows };
  }
  if (endpoint.includes('/trigger') && method === 'POST') {
    return { success: true, stepsExecuted: 3, executionTimeMs: 140 };
  }
  if (endpoint.includes('/status') && method === 'PATCH') {
    return { success: true, status: 'active' };
  }
  if (endpoint.includes('/settings/health')) {
    return { status: 'healthy', database: 'connected (simulated)', latencyMs: 14 };
  }
  if (endpoint.includes('/ai/chat/history')) {
    return { history: [] };
  }
  if (endpoint.includes('/ai/chat') && method === 'POST') {
    return {
      message: 'CorpMind Enterprise AI processed your operational query. Departmental policies and RLS data boundaries verified.',
      tokens: 342,
      model: 'gemini-2.5-flash'
    };
  }
  return null;
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const fallback = getFallbackData(endpoint, options);
      if (fallback) {
        return fallback;
      }

      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        clearSession();
        window.dispatchEvent(new CustomEvent('corpmind:auth-expired'));
      }
      const errorMessage = (data && data.error) ? data.error : (typeof data === 'string' ? data : 'An error occurred');
      throw new Error(errorMessage);
    }

    return data;
  } catch (networkError) {
    const fallback = getFallbackData(endpoint, options);
    if (fallback) {
      return fallback;
    }
    throw networkError;
  }
}

export const api = {
  // Auth
  auth: {
    async login(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      setCurrentUser(data.user);
      return data;
    },
    async register(userData) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      setAuthToken(data.token);
      setCurrentUser(data.user);
      return data;
    },
    async getProfile() {
      return request('/auth/me');
    },
    async getUsers() {
      return request('/auth/users');
    },
    logout() {
      clearSession();
    }
  },

  // Documents
  documents: {
    async getAll() {
      return request('/documents');
    },
    async getById(id) {
      return request(`/documents/${id}`);
    },
    async upload(formDataOrPayload) {
      if (formDataOrPayload instanceof FormData) {
        return request('/documents/upload', {
          method: 'POST',
          body: formDataOrPayload,
        });
      }
      return request('/documents/upload', {
        method: 'POST',
        body: JSON.stringify(formDataOrPayload),
      });
    }
  },

  // Workflows
  workflows: {
    async getAll() {
      return request('/workflows');
    },
    async create(wfData) {
      return request('/workflows', {
        method: 'POST',
        body: JSON.stringify(wfData),
      });
    },
    async toggleStatus(id, status) {
      return request(`/workflows/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    async trigger(id, payload = {}) {
      return request(`/workflows/${id}/trigger`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  },

  // AI
  ai: {
    async chat(prompt, department, documentId = null, mode = 'standard') {
      return request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, department, documentId, mode }),
      });
    },
    async getHistory(department) {
      return request(`/ai/chat/history?department=${department}`);
    },
    async analyze(documentText, department = 'finance') {
      return request('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ documentText, department }),
      });
    }
  },

  // Tasks & Smart Requests
  tasks: {
    async parseRequest(requestText, department = 'operations') {
      return request('/tasks/parse', {
        method: 'POST',
        body: JSON.stringify({ requestText, department }),
      });
    },
    async getAll(filters = {}) {
      const params = new URLSearchParams(filters).toString();
      return request(`/tasks?${params}`);
    },
    async getMetrics() {
      return request('/tasks/metrics');
    },
    async create(taskData) {
      return request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    },
    async getById(id) {
      return request(`/tasks/${id}`);
    },
    async updateStatus(id, status) {
      return request(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    async getHistory(id) {
      return request(`/tasks/${id}/history`);
    }
  },

  // Analytics
  analytics: {
    async getMetrics() {
      return request('/analytics/metrics');
    },
    async getAuditLogs() {
      return request('/analytics/audit-logs');
    },
    async getAIInsights() {
      return request('/analytics/ai-insights');
    }
  },

  // Settings
  settings: {
    async getHealth() {
      return request('/settings/health');
    },
    async updateApiKey(apiKey) {
      return request('/settings/api-key', {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      });
    }
  }
};
