import axiosClient from '../axiosClient';

export interface ApiResponse<T> {
  data?: T;
  error?: { message: string; code?: string | number; status?: number; errors?: any };
  status: number;
}

export interface CartItemDTO {
  producto_id: number;
  cantidad: number;
  product?: any;
}

export interface CartDTO {
  items: CartItemDTO[];
}

class CartService {
  private base = '/api/orders/carrito/';

  async getCart(): Promise<ApiResponse<CartDTO>> {
    try {
      const res = await axiosClient.get(this.base);
      return { data: res.data, status: res.status };
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

  async add(producto_id: number, cantidad: number): Promise<ApiResponse<any>> {
    try {
      const res = await axiosClient.post(`${this.base}agregar/`, { producto_id, cantidad });
      return { data: res.data, status: res.status };
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

  async updateQuantity(producto_id: number, cantidad: number): Promise<ApiResponse<any>> {
    try {
      const res = await axiosClient.put(`${this.base}actualizar/${producto_id}/`, { cantidad });
      return { data: res.data, status: res.status };
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

  async remove(producto_id: number): Promise<ApiResponse<any>> {
    try {
      const res = await axiosClient.delete(`${this.base}quitar/${producto_id}/`);
      return { data: res.data, status: res.status };
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

  async clear(): Promise<ApiResponse<any>> {
    try {
      const res = await axiosClient.post(`${this.base}vaciar/`);
      return { data: res.data, status: res.status };
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

export const cartService = new CartService();
