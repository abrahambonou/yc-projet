import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async register(userData) {
    try {
      const response = await this.api.post('/api/auth/register', userData);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      return { user, token: access_token };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/api/auth/login', credentials);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      return { user, token: access_token };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  async googleAuth(token) {
    try {
      const response = await this.api.post('/api/auth/google', { token });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      return { user, token: access_token };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Google authentication failed');
    }
  }

  async getUserProfile() {
    try {
      const response = await this.api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch profile');
    }
  }

  async generateLearningPath(preferences) {
    try {
      const response = await this.api.post('/api/learning/generate-path', preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to generate learning path');
    }
  }

  async getLearningPaths() {
    try {
      const response = await this.api.get('/api/learning/paths');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch learning paths');
    }
  }

  async generateQuiz(topic, difficulty = 'intermediate', numQuestions = 5) {
    try {
      const response = await this.api.post('/api/assessment/generate-quiz', {
        topic,
        difficulty,
        num_questions: numQuestions
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to generate quiz');
    }
  }

  async chatWithMentor(message, context = null) {
    try {
      const response = await this.api.post('/api/chat/mentor', {
        message,
        context
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to chat with mentor');
    }
  }

  async getDashboardStats() {
    try {
      const response = await this.api.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch dashboard stats');
    }
  }

  async createForumPost(postData) {
    try {
      const response = await this.api.post('/api/forum/posts', postData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create forum post');
    }
  }

  async getForumPosts(category = null, limit = 20) {
    try {
      const params = { limit };
      if (category) params.category = category;
      
      const response = await this.api.get('/api/forum/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch forum posts');
    }
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}

export const authService = new AuthService();