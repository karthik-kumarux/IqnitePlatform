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
