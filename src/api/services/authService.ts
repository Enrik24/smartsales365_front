import { ApiResponse } from '../types';
import { BaseService } from '../baseService';
import axiosClient from '../axiosClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;  // Changed from username to email
  password: string;
  nombre: string;  // Changed from first_name
  apellido: string;  // Changed from last_name
  telefono?: string;
  direccion?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  usuario: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    direccion: string;
    estado: string;
    fecha_registro: string;
    ultimo_login: string;
    is_active: boolean;
    is_staff: boolean;
  };
}

export interface UserProfile {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  estado: string;
  fecha_registro: string;
  ultimo_login: string;
}

class AuthService extends BaseService<AuthResponse> {
  private readonly basePath = 'api/auth/';
  
  constructor() {
    super('api/auth/');
  }
  
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosClient.post<AuthResponse>(`${this.basePath}login/`, credentials);
      const { access: token, refresh } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('authToken', token);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      }
      
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
  
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosClient.post<AuthResponse>(`${this.basePath}register/`, userData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async logout(): Promise<void> {
    try {
      await axiosClient.post(`${this.basePath}logout/`);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<ApiResponse<{ access: string }>> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosClient.post<{ access: string }>(
        `${this.basePath}token/refresh/`,
        { refresh: refreshToken }
      );

      if (response.data.access) {
        localStorage.setItem('authToken', response.data.access);
      }

      return { data: response.data, status: response.status };
    } catch (error) {
      this.clearAuth();
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  async getCurrentUser() {
    try {
      const response = await axiosClient.get<AuthResponse['usuario']>(`${this.basePath}user/`);
      return { 
        data: response.data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 401 
      };
    }
  }
}

export const authService = new AuthService();
