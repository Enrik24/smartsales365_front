import { BaseService } from '../baseService';
import { ApiResponse } from '../types';
import axiosClient from '../axiosClient';

export interface Category {
  id: number;
  name: string;
  description?: string;

  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: number;
  id_marca: number;
  imagen_url: string;
  ficha_tecnica_url: string;
  estado: string;
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
  //images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
  created_at: string;
}

export interface Inventory {
  id: number;
  product: number; // Product ID
  quantity: number;
  last_checked: string;
  last_updated: string;
}

export interface FavoriteProduct {
  id: number;
  product: Product;
  created_at: string;
}

class CategoryService extends BaseService<Category> {
  constructor() {
    super('api/products/categorias/');
  }
}

class ShippingCategoryService {
  private base = '/api/products/categorias-envio/';

  async list(): Promise<ApiResponse<ShippingCategoryDTO[]>> {
    try {
      const res = await axiosClient.get(this.base);
      const payload = res.data as any;
      const data: ShippingCategoryDTO[] = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload?.data) ? payload.data : []));
      return { data, status: res.status };
    } catch (error: any) {
      return {
        error: {
          message: error?.response?.data?.message || error.message,
          status: error?.response?.status,
        },
        status: error?.response?.status || 500,
      };
    }
  }
}

class BrandService extends BaseService<Brand> {
  constructor() {
    super('api/products/marcas/');
  }
}

export interface ProductDTO {
  id: number | string;
  sku: string;
  nombre: string;
  descripcion?: string | null;
  precio: number | string;
  categoria: number | null;
  marca: number | null;
  categoria_envio?: number | null;
  imagen_url?: string | null;
  ficha_tecnica_url?: string | null;
  estado: 'activo' | 'inactivo' | 'agotado';
  fecha_creacion?: string;
}

export interface ShippingCategoryDTO {
  id: number | string;
  nombre: string;
}

class ProductService extends BaseService<Product> {
  constructor() {
    super('api/products/productos/');
  }

  async activateProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await axiosClient.post(`${this.endpoint}${id}/activar/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async deactivateProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await axiosClient.post(`${this.endpoint}${id}/desactivar/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getLowStockProducts(threshold?: number): Promise<ApiResponse<Product[]>> {
    try {
      const params = threshold ? { threshold } : {};
      const response = await axiosClient.get(`${this.endpoint}bajo-stock/`, { params });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async createMultipart(payload: {
    sku: string;
    nombre: string;
    descripcion?: string;
    precio: number | string;
    precio_original?: number | string;
    categoria: number | null;
    marca: number | null;
    estado: 'activo' | 'inactivo' | 'agotado';
    stock_inicial?: number;
    stock_minimo?: number;
    modelo?: string;
    voltaje?: string;
    garantia_meses?: number;
    eficiencia_energetica?: string;
    color?: string;
    peso?: number | string;
    alto?: number | string;
    ancho?: number | string;
    profundidad?: number | string;
    costo?: number | string;
    envio_gratis?: boolean;
    destacado?: boolean;
    imagen_file?: File | null;
    ficha_tecnica_file?: File | null;
    categoria_envio?: number | null;
  }): Promise<ApiResponse<ProductDTO>> {
    console.log("IMAGEN QUE LLEGA:", payload.imagen_file);
console.log("FICHA QUE LLEGA:", payload.ficha_tecnica_file);
    try {
      const form = new FormData();
      form.append('sku', String(payload.sku));
      form.append('nombre', String(payload.nombre));
      if (payload.descripcion) form.append('descripcion', String(payload.descripcion));
      form.append('precio', String(payload.precio));
      if (payload.precio_original != null) form.append('precio_original', String(payload.precio_original));
      if (payload.categoria != null) form.append('categoria', String(payload.categoria));
      if (payload.marca != null) form.append('marca', String(payload.marca));
      form.append('estado', String(payload.estado));
      if (payload.stock_inicial != null) form.append('stock_inicial', String(payload.stock_inicial));
      if (payload.stock_minimo != null) form.append('stock_minimo', String(payload.stock_minimo));
      if (payload.modelo) form.append('modelo', String(payload.modelo));
      if (payload.voltaje) form.append('voltaje', String(payload.voltaje));
      if (payload.garantia_meses != null) form.append('garantia_meses', String(payload.garantia_meses));
      if (payload.eficiencia_energetica) form.append('eficiencia_energetica', String(payload.eficiencia_energetica));
      if (payload.color) form.append('color', String(payload.color));
      if (payload.peso != null) form.append('peso', String(payload.peso));
      if (payload.alto != null) form.append('alto', String(payload.alto));
      if (payload.ancho != null) form.append('ancho', String(payload.ancho));
      if (payload.profundidad != null) form.append('profundidad', String(payload.profundidad));
      if (payload.costo != null) form.append('costo', String(payload.costo));
      if (payload.envio_gratis != null) form.append('envio_gratis', String(payload.envio_gratis ? 1 : 0));
      if (payload.destacado != null) form.append('destacado', String(payload.destacado ? 1 : 0));
      if (payload.imagen_file) form.append('imagen_file', payload.imagen_file);
      if (payload.ficha_tecnica_file) form.append('ficha_tecnica_file', payload.ficha_tecnica_file);
      if (payload.categoria_envio != null) form.append('categoria_envio', String(payload.categoria_envio));
      const response = await axiosClient.post<ProductDTO>(this.endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
    
  }

  async updateMultipart(id: string | number, payload: {
    sku?: string;
    nombre?: string;
    descripcion?: string;
    precio?: number | string;
    precio_original?: number | string;
    categoria?: number | null;
    marca?: number | null;
    estado?: 'activo' | 'inactivo' | 'agotado';
    stock_inicial?: number;
    stock_minimo?: number;
    modelo?: string;
    voltaje?: string;
    garantia_meses?: number;
    eficiencia_energetica?: string;
    color?: string;
    peso?: number | string;
    alto?: number | string;
    ancho?: number | string;
    profundidad?: number | string;
    costo?: number | string;
    envio_gratis?: boolean;
    destacado?: boolean;
    imagen_file?: File | null;
    ficha_tecnica_file?: File | null;
    categoria_envio?: number | null;
  }): Promise<ApiResponse<ProductDTO>> {
    try {
      const form = new FormData();
      if (payload.sku != null) form.append('sku', String(payload.sku));
      if (payload.nombre != null) form.append('nombre', String(payload.nombre));
      if (payload.descripcion != null) form.append('descripcion', String(payload.descripcion));
      if (payload.precio != null) form.append('precio', String(payload.precio));
      if (payload.precio_original != null) form.append('precio_original', String(payload.precio_original));
      if (payload.categoria != null) form.append('categoria', String(payload.categoria));
      if (payload.marca != null) form.append('marca', String(payload.marca));
      if (payload.estado != null) form.append('estado', String(payload.estado));
      if (payload.stock_inicial != null) form.append('stock_inicial', String(payload.stock_inicial));
      if (payload.stock_minimo != null) form.append('stock_minimo', String(payload.stock_minimo));
      if (payload.modelo != null) form.append('modelo', String(payload.modelo));
      if (payload.voltaje != null) form.append('voltaje', String(payload.voltaje));
      if (payload.garantia_meses != null) form.append('garantia_meses', String(payload.garantia_meses));
      if (payload.eficiencia_energetica != null) form.append('eficiencia_energetica', String(payload.eficiencia_energetica));
      if (payload.color != null) form.append('color', String(payload.color));
      if (payload.peso != null) form.append('peso', String(payload.peso));
      if (payload.alto != null) form.append('alto', String(payload.alto));
      if (payload.ancho != null) form.append('ancho', String(payload.ancho));
      if (payload.profundidad != null) form.append('profundidad', String(payload.profundidad));
      if (payload.costo != null) form.append('costo', String(payload.costo));
      if (payload.envio_gratis != null) form.append('envio_gratis', String(payload.envio_gratis ? 1 : 0));
      if (payload.destacado != null) form.append('destacado', String(payload.destacado ? 1 : 0));
      if (payload.imagen_file) form.append('imagen_file', payload.imagen_file);
      if (payload.ficha_tecnica_file) form.append('ficha_tecnica_file', payload.ficha_tecnica_file);
      if (payload.categoria_envio != null) form.append('categoria_envio', String(payload.categoria_envio));
      const response = await axiosClient.patch<ProductDTO>(`${this.endpoint}${id}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

class InventoryService extends BaseService<Inventory> {
  constructor() {
    super('api/products/inventario/');
  }

  async adjustStock(productId: number, quantity: number, notes?: string): Promise<ApiResponse<Inventory>> {
    try {
      const response = await axiosClient.post(`${this.endpoint}${productId}/ajustar-stock/`, {
        quantity,
        notes,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async increaseStock(productId: number, quantity: number, notes?: string): Promise<ApiResponse<Inventory>> {
    try {
      const response = await axiosClient.post(`${this.endpoint}${productId}/aumentar-stock/`, {
        quantity,
        notes,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getLowStockAlerts(threshold?: number): Promise<ApiResponse<Product[]>> {
    try {
      const params = threshold ? { threshold } : {};
      const response = await axiosClient.get(`${this.endpoint}alertas-bajo-stock/`, { params });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async updateInventory(productId: number, payload: { stock_minimo?: number; stock_actual?: number }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.patch(`${this.endpoint}${productId}/`, payload);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

class FavoriteService extends BaseService<FavoriteProduct> {
  constructor() {
    super('api/products/favoritos/');
  }

  async checkFavorite(productId: number): Promise<ApiResponse<{ is_favorite: boolean; favorite_id?: number }>> {
    try {
      const response = await axiosClient.get(`${this.endpoint}verificar/${productId}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

export const categoryService = new CategoryService();
export const brandService = new BrandService();
export const productService = new ProductService();
export const inventoryService = new InventoryService();
export const favoriteService = new FavoriteService();
export const shippingCategoryService = new ShippingCategoryService();
