export interface UserRole {
  id: number;
  nombre_rol: string;
  nombre?: string; // For backward compatibility
  descripcion?: string;
}

export interface User {
  id: string;
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  documento_identidad?: string;
  estado?: string;
  fecha_registro?: string;
  ultimo_login?: string;
  rol?: string;
  roles?: UserRole[];
  isAdmin?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  rol?: string;
  roles?: number[];
}
