// Tipos de Autenticación y Usuario
export type UserRole = 'Administrador' | 'Cliente';

export interface User {
  // Campos principales
  id: string;
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  documento_identidad: string;
  telefono: string;
  direccion: string;
  rol: UserRole;
  estado: 'Activo' | 'Inactivo';
  fecha_registro: string;
  ultimo_login: string | null;
  
  // Campos de autenticación
  is_active: boolean;
  is_staff: boolean;
  
  // Campos opcionales
  [key: string]: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error?: string | null;
}

// Tipos de Roles y Permisos
export interface Role {
  id: string;
  nombre_rol: string;
  descripcion: string;
  permissionIds?: string[];
}

export interface Permission {
  id: string;
  nombre: string;
  descripcion: string;
}

// Tipos de Producto
export interface Category {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Brand {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Product {
  id: string;
  numericId?: number;
  nombre: string;
  modelo: string;
  descripcion: string;
  precioRegular: number;
  precioActual: number;
  stock: number;
  imagenes: string[];
  categoria: Category;
  marca: Brand;
  rating: number;
}

// Tipos de Carrito
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
