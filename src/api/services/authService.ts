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
  confirm_password: string;  // Added confirm_password field
  nombre: string;  // Changed from first_name
  apellido: string;  // Changed from last_name
  telefono?: string;
  direccion?: string;
  rol?: string;
  roles?: number[];
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
    rol?: string;
    roles?: Array<{
      id: number;
      nombre: string;
      descripcion?: string;
    }>;
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
      const response = await axiosClient.post<AuthResponse>(`${this.basePath}registro/`, userData);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async logout(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('authToken');
    
    // Clear local auth state first to ensure the user is logged out on the client side
    this.clearAuth();
    
    if (!refreshToken) {
      console.warn('No refresh token available for server-side logout');
      return true; // Still return true since we cleared local state
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add Authorization header if access token is available
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      await axiosClient.post(
        `${this.basePath}logout/`, 
        { refresh: refreshToken },
        {
          headers,
          // Don't throw on 400/500 errors since we've already cleared local state
          //validateStatus: () => true
          validateStatus: (status) => status < 500 // Aceptar 400 como "éxito" para logout
        }
      );
      console.log('✅ Logout exitoso en el servidor');
      return true;
    } catch (error) {
      // Even if there's an error, we've already cleared local state
      console.warn('Error during server-side logout (non-critical):', error);
      
      return true;
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
      // Get user data
      const userResponse = await axiosClient.get<AuthResponse['usuario']>(`${this.basePath}usuarios/me/`);
      
      // Get user roles if user ID is available
      let roles = [];
      if (userResponse.data?.id) {
        try {
          const rolesResponse = await axiosClient.get(`${this.basePath}usuarios/me/roles/`);
          roles = rolesResponse.data || [];
        } catch (roleError) {
          console.error('Error fetching user roles:', roleError);
          // Continue without roles if there's an error
        }
      }

      // Combine user data with roles
      const userWithRoles = {
        ...userResponse.data,
        roles: roles,
        rol: roles.length > 0 ? roles[0].nombre_rol : null
      };

      return { 
        data: userWithRoles, 
        status: userResponse.status 
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
