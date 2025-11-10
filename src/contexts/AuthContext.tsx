import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { logExitoso, logFallido } from '@/lib/bitacora';
import { authService } from '@/api/services/authService';
import { userService } from '@/api/services/userService';
import { AuthState, User, RegisterData, UserRole } from '@/types/auth';
import axiosClient from '@/api/axiosClient';

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
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  authState: initialAuthState,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  updateUser: () => {},
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

      const { data: userData, error } = await authService.getCurrentUser();
      
      if (error || !userData) {
        throw error || new Error('Failed to load user data');
      }

      // OBTENER ROLES DEL USUARIO - NUEVO CÓDIGO
      let userRoles: any[] = [];
      try {
        const rolesResponse = await axiosClient.get(`/api/auth/usuarios/${userData.id}/roles/`);
        userRoles = rolesResponse.data;
      } catch (rolesError) {
        console.warn('Could not fetch user roles:', rolesError);
      }
      // Check if user is admin based on role or roles array
      //const roles = userData.roles || [];
      //const isAdmin = userData.rol === 'Administrador' || 
      //               roles.some((role: any) => role.nombre_rol === 'Administrador');
      
      
      // Check if user is admin based on roles
      const isAdmin = userRoles.some(role => role.nombre_rol === 'Administrador');
      
      // Map roles
      const mappedRoles: UserRole[] = userRoles.map(role => ({
        id: role.id,
        nombre_rol: role.nombre_rol,
        nombre: role.nombre_rol,
        descripcion: role.descripcion
      }));
    
      const user: User = {
        id: userData.id.toString(),
        id_usuario: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
        estado: userData.estado || 'activo',
        fecha_registro: userData.fecha_registro || new Date().toISOString(),
        ultimo_login: userData.ultimo_login || new Date().toISOString(),
        rol: userRoles[0]?.nombre_rol || '', // Usar el primer rol
        roles: mappedRoles,
        isAdmin
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
          // NUEVO: Obtener roles del usuario después del login
          let userRoles: any[] = [];
          try {
            const rolesResponse = await axiosClient.get(`/api/auth/usuarios/me/roles/`);
            userRoles = rolesResponse.data;
          } catch (rolesError) {
            console.warn('Could not fetch user roles after login:', rolesError);
          }

          // Check if user is admin based on roles
      const isAdmin = userRoles.some((role: any) => role.nombre_rol === 'Administrador');

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
            ultimo_login: userData.ultimo_login || new Date().toISOString(),
            rol: userRoles[0]?.nombre_rol || userData.rol || '',
            isAdmin,
            roles: userRoles.map((role: any) => ({
              id: role.id,
              nombre_rol: role.nombre_rol,
              nombre: role.nombre_rol,
              descripcion: role.descripcion
            }))
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
      // Bitácora
      void logExitoso('INICIO_SESION');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      // Bitácora
      void logFallido('INICIO_SESION_FALLIDO');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Log bitácora ANTES de limpiar tokens (para que incluya Authorization)
      await logExitoso('CIERRE_SESION');

      const success = await authService.logout();
      if (!success) {
        console.warn('Logout may not have completed successfully on the server');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, we still want to clear the local state
    } finally {
      // Clear all auth-related data
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      // Reset the auth state
      setAuthState({
        ...initialAuthState,
        loading: false,
        error: null
      });
    }
  };
  
  const register = async (data: { email: string; password: string; confirm_password: string; nombre: string; apellido: string }): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: authData, error } = await authService.register({
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: 'Cliente' // El backend manejará la asignación del rol
      });
      
      if (error || !authData) {
        throw error || new Error('Registration failed');
      }

      const { usuario: userData, access: token } = authData;
      
      // New users are not admins by default
      const isAdmin = false;
      
      const user: User = {
        id: userData.id.toString(),
        id_usuario: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
        estado: userData.estado || 'activo',
        fecha_registro: userData.fecha_registro || new Date().toISOString(),
        ultimo_login: userData.ultimo_login || new Date().toISOString(),
        rol: userData.rol || 'Usuario',
        roles: [],
        isAdmin
      };

      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', authData.refresh);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null,
      });
      // Bitácora (cliente creado)
      void logExitoso('REGISTRO_CLIENTE');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      // Bitácora
      void logFallido('REGISTRO_CLIENTE_FALLIDO');
      return false;
    }
  };

  // Función para actualizar los datos del usuario
  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user!,
          ...userData,
        },
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
