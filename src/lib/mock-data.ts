import { User, Role, Permission, Category, Brand, Product } from '@/types';

export const mockUsers: User[] = [
  { id: 'usr_1', nombre: 'Ana', apellido: 'García', email: 'ana.garcia@example.com', rol: 'Administrador', telefono: '555-1234' },
  { id: 'usr_2', nombre: 'Carlos', apellido: 'Rodriguez', email: 'carlos.r@example.com', rol: 'Cliente', telefono: '555-5678' },
  { id: 'usr_3', nombre: 'Beatriz', apellido: 'Lopez', email: 'beatriz.lopez@example.com', rol: 'Cliente' },
];

export const mockPermissions: Permission[] = [
  { id: 'perm_1', nombre: 'manage_users', descripcion: 'Permite crear, editar y eliminar usuarios.' },
  { id: 'perm_2', nombre: 'view_dashboard', descripcion: 'Permite ver el dashboard de analíticas.' },
  { id: 'perm_3', nombre: 'manage_products', descripcion: 'Permite gestionar el catálogo de productos.' },
  { id: 'perm_4', nombre: 'manage_roles', descripcion: 'Permite gestionar roles y permisos.' },
  { id: 'perm_5', nombre: 'view_reports', descripcion: 'Permite ver reportes de ventas.' },
];

export const mockRoles: Role[] = [
  { id: 'rol_1', nombre: 'Administrador', descripcion: 'Acceso total al sistema.', activo: true, permissionIds: ['perm_1', 'perm_2', 'perm_3', 'perm_4', 'perm_5'] },
  { id: 'rol_2', nombre: 'Cliente', descripcion: 'Acceso a la tienda y perfil.', activo: true, permissionIds: [] },
  { id: 'rol_3', nombre: 'Editor', descripcion: 'Puede gestionar productos y categorías.', activo: false, permissionIds: ['perm_3'] },
];

export const mockCategories: Category[] = [
  { id: 'cat_1', nombre: 'Refrigeradores', descripcion: 'Aparatos para la conservación de alimentos.', activo: true },
  { id: 'cat_2', nombre: 'Lavado', descripcion: 'Lavadoras y secadoras.', activo: true },
  { id: 'cat_3', nombre: 'Televisores', descripcion: 'Pantallas y sistemas de entretenimiento.', activo: true },
  { id: 'cat_4', nombre: 'Cocina', descripcion: 'Hornos, estufas y microondas.', activo: true },
  { id: 'cat_5', nombre: 'Audio', descripcion: 'Sistemas de sonido y audífonos.', activo: false },
];

export const mockBrands: Brand[] = [
  { id: 'brand_1', nombre: 'Samsung', descripcion: 'Marca líder en tecnología.', activo: true },
  { id: 'brand_2', nombre: 'LG', descripcion: 'Life\'s Good.', activo: true },
  { id: 'brand_3', nombre: 'Whirlpool', descripcion: 'Electrodomésticos para el hogar.', activo: true },
  { id: 'brand_4', nombre: 'Sony', descripcion: 'Electrónica de consumo y entretenimiento.', activo: true },
  { id: 'brand_5', nombre: 'Panasonic', descripcion: 'Tecnología para un futuro mejor.', activo: true },
];

const imgUrl = (text: string) => `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400/e2e8f0/334155?text=${encodeURIComponent(text)}`;

export const mockProducts: Product[] = [
    { id: '1', nombre: 'Refrigerador Inteligente 25 pies', modelo: 'RFG-2000', descripcion: '...', precioRegular: 1200, precioActual: 999, stock: 15, imagenes: [imgUrl('Refrigerador')], categoria: mockCategories[0], marca: mockBrands[0], rating: 4.5 },
    { id: '2', nombre: 'Lavadora Carga Frontal 22kg', modelo: 'LAV-850', descripcion: '...', precioRegular: 800, precioActual: 650, stock: 20, imagenes: [imgUrl('Lavadora')], categoria: mockCategories[1], marca: mockBrands[1], rating: 4.8 },
    { id: '3', nombre: 'TV OLED 4K 65"', modelo: 'OLED65-C1', descripcion: '...', precioRegular: 2500, precioActual: 2199, stock: 8, imagenes: [imgUrl('TV OLED')], categoria: mockCategories[2], marca: mockBrands[1], rating: 4.9 },
    { id: '4', nombre: 'Horno de Microondas Inverter', modelo: 'MW-300', descripcion: '...', precioRegular: 150, precioActual: 120, stock: 30, imagenes: [imgUrl('Microondas')], categoria: mockCategories[3], marca: mockBrands[4], rating: 4.2 },
    { id: '5', nombre: 'Barra de Sonido Dolby Atmos', modelo: 'SND-51', descripcion: '...', precioRegular: 450, precioActual: 399, stock: 12, imagenes: [imgUrl('Barra Sonido')], categoria: mockCategories[4], marca: mockBrands[3], rating: 4.7 },
    { id: '6', nombre: 'Estufa de Gas 6 Quemadores', modelo: 'STV-600', descripcion: '...', precioRegular: 600, precioActual: 499, stock: 18, imagenes: [imgUrl('Estufa')], categoria: mockCategories[3], marca: mockBrands[2], rating: 4.4 },
    { id: '7', nombre: 'Secadora de Ropa a Gas', modelo: 'DRY-G7', descripcion: '...', precioRegular: 750, precioActual: 700, stock: 10, imagenes: [imgUrl('Secadora')], categoria: mockCategories[1], marca: mockBrands[2], rating: 4.6 },
    { id: '8', nombre: 'Smart TV QLED 8K 75"', modelo: 'QN75-Q900', descripcion: '...', precioRegular: 4000, precioActual: 3499, stock: 5, imagenes: [imgUrl('TV QLED')], categoria: mockCategories[2], marca: mockBrands[0], rating: 5.0 },
];
