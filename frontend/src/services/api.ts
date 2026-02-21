import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.post('/auth/me'),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
};

// Quiz API
export const quizAPI = {
  getAll: (params?: any) => api.get('/quiz', { params }),
  getById: (id: string) => api.get(`/quiz/${id}`),
  create: (data: any) => api.post('/quiz', data),
  update: (id: string, data: any) => api.patch(`/quiz/${id}`, data),
  delete: (id: string) => api.delete(`/quiz/${id}`),
  joinByCode: (code: string) => api.post('/quiz/join', { code }),
  getStats: (id: string) => api.get(`/quiz/${id}/stats`),
  resetQuiz: (id: string) => api.post(`/quiz/${id}/reset`),
  
  // Quiz History
  getActiveQuiz: () => api.get('/quiz/organizer/active'),
  getRecentQuizzes: (page = 1, limit = 10) => api.get('/quiz/organizer/recent', { params: { page, limit } }),
  getQuizResults: (id: string) => api.get(`/quiz/${id}/results`),
  
  // Bulk Operations
  bulkOperation: (quizIds: string[], operation: 'DELETE' | 'ARCHIVE' | 'UNARCHIVE' | 'ACTIVATE' | 'DEACTIVATE') =>
    api.post('/quiz/bulk/operation', { quizIds, operation }),
  
  // Archive Operations
  archive: (id: string) => api.post(`/quiz/${id}/archive`),
  unarchive: (id: string) => api.post(`/quiz/${id}/unarchive`),
  
  // Export/Import
  export: (quizIds?: string[]) => api.post('/quiz/export', { quizIds }),
  import: (backupData: any) => api.post('/quiz/import', { backupData }),
};

// Question API
export const questionAPI = {
  getByQuiz: (quizId: string) => api.get('/question', { params: { quizId } }),
  create: (data: any) => api.post('/question', data),
  bulkCreate: (quizId: string, questions: any[]) => 
    api.post('/question/bulk', { quizId, questions }),
  update: (id: string, data: any) => api.patch(`/question/${id}`, data),
  delete: (id: string) => api.delete(`/question/${id}`),
};

// Session API
export const sessionAPI = {
  start: (quizId: string) => api.post('/session/start', { quizId }),
  getSession: (sessionId: string) => api.get(`/session/${sessionId}`),
  submitAnswer: (sessionId: string, data: any) => 
    api.post(`/session/${sessionId}/answer`, data),
  complete: (sessionId: string) => api.post(`/session/${sessionId}/complete`),
  getMyResults: () => api.get('/session/my/results'),
};

// Admin API
export const adminAPI = {
  getSystemStats: () => api.get('/admin/stats'),
  getAllUsers: (page = 1, limit = 20, search?: string, role?: string, isActive?: boolean) => {
    const params: any = { page, limit };
    if (search && search.trim()) params.search = search.trim();
    if (role && role.trim()) params.role = role.trim();
    if (isActive !== undefined) params.isActive = isActive;
    return api.get('/admin/users', { params });
  },
  getUserDetails: (id: string) => api.get(`/admin/users/${id}`),
  createUser: (userData: any) => api.post('/admin/users', userData),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id: string, isActive: boolean) => api.patch(`/admin/users/${id}/status`, { isActive }),
  bulkUpdateUserRole: (userIds: string[], role: string) => api.post('/admin/users/bulk/role', { userIds, role }),
  bulkUpdateUserStatus: (userIds: string[], isActive: boolean) => api.post('/admin/users/bulk/status', { userIds, isActive }),
  getAllQuizzes: (page = 1, limit = 20) => api.get('/admin/quizzes', { params: { page, limit } }),
  deleteQuiz: (id: string, adminId: string) => api.delete(`/admin/quizzes/${id}`, { data: { adminId } }),
  transferQuizOwnership: (quizId: string, newOrganizerId: string, adminId: string) => 
    api.post(`/admin/quizzes/${quizId}/transfer`, { newOrganizerId, adminId }),
  getRecentActivity: (limit = 50) => api.get('/admin/recent-activity', { params: { limit } }),
  getAdvancedAnalytics: () => api.get('/admin/analytics'),
  getAuditLogs: (page = 1, limit = 50) => api.get('/admin/audit-logs', { params: { page, limit } }),
};
