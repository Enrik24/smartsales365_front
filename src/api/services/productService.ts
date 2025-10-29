import { BaseService } from '../baseService';
import { ApiResponse, ListQueryParams } from '../types';

export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  is_active: boolean;
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

class BrandService extends BaseService<Brand> {
  constructor() {
    super('api/products/marcas/');
  }
}

class ProductService extends BaseService<Product> {
  constructor() {
    super('api/products/productos/');
  }

  async activateProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}${id}/activar/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async deactivateProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}${id}/desactivar/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getLowStockProducts(threshold?: number): Promise<ApiResponse<Product[]>> {
    try {
      const params = threshold ? { threshold } : {};
      const response = await this.apiClient.get(`${this.endpoint}bajo-stock/`, { params });
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
      const response = await this.apiClient.post(`${this.endpoint}${productId}/ajustar-stock/`, {
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
      const response = await this.apiClient.post(`${this.endpoint}${productId}/aumentar-stock/`, {
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
      const response = await this.apiClient.get(`${this.endpoint}alertas-bajo-stock/`, { params });
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
      const response = await this.apiClient.get(`${this.endpoint}verificar/${productId}/`);
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
