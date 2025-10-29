import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '@/api/services/authService';
import { AuthState, User, RegisterData } from '@/types/auth';

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id_usuario: number;
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
    estado?: string;
    fecha_registro?: string;
    ultimo_login?: string;
  };
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  authState: initialAuthState,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const loadUser = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        }));
        return;
      }

      const { data, error } = await authService.getCurrentUser();
      
      if (error || !data) {
        throw error || new Error('Failed to load user data');
      }

      const user: User = {
        id: data.id.toString(),
        id_usuario: data.id,
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        estado: data.estado || 'activo',
        fecha_registro: data.fecha_registro || new Date().toISOString(),
        ultimo_login: data.ultimo_login || new Date().toISOString()
      };

      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      authService.clearAuth();
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load user',
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await authService.login({ email, password });
      
      if (error || !data) {
        throw error || new Error('Login failed');
      }

      const { usuario: userData, access: token } = data;
      const user: User = {
        id: userData.id.toString(),
        id_usuario: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
        estado: userData.estado || '',
        fecha_registro: userData.fecha_registro || new Date().toISOString(),
        ultimo_login: userData.ultimo_login || new Date().toISOString()
      };

      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', data.refresh);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setAuthState(initialAuthState);
    }
  };
  
  const register = async (data: { email: string; password: string; nombre: string; apellido: string }): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: authData, error } = await authService.register({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
      });
      
      if (error || !authData) {
        throw error || new Error('Registration failed');
      }

      const { user: userData, access: token } = authData;
      const user: User = {
        id: userData.id_usuario.toString(),
        id_usuario: userData.id_usuario,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
      };

      localStorage.setItem('authToken', token);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, register }}>
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};
