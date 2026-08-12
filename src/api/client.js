const API_BASE = '';

async function request(method, path, body = null) {
  const token = localStorage.getItem('qa_assistant_token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP ${response.status} error`;
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  return data;
}

export const api = {
  // Auth API
  register: (email, name, password) => request('POST', '/api/auth/register', { email, name, password }),
  login: (email, password) => request('POST', '/api/auth/login', { email, password }),
  getMe: () => request('GET', '/api/auth/me'),

  // Projects API
  getProjects: () => request('GET', '/api/projects'),
  createProject: (data) => request('POST', '/api/projects', data),
  getProject: (id) => request('GET', `/api/projects/${id}`),
  deleteProject: (id) => request('DELETE', `/api/projects/${id}`),

  // Plans & Test Cases API
  generatePlan: (projectId) => request('POST', `/api/projects/${projectId}/generate`),
  getPlan: (id) => request('GET', `/api/plans/${id}`),
  getPlanVersions: (projectId) => request('GET', `/api/projects/${projectId}/plans`),
  updateTestCase: (planId, testId, updates) => request('PATCH', `/api/plans/${planId}/tests/${testId}`, updates),
  savePlan: (id) => request('POST', `/api/plans/${id}/save`),
  getPlanUpdates: (id) => request('GET', `/api/plans/${id}/updates`),

  // Logs API
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/api/logs?${query}`);
  },
};

export default api;
