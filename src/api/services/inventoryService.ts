import { BaseService } from '../baseService';
import { ApiResponse } from '../types';
import axiosClient from '../axiosClient';

export interface InventoryUpdateResponse {
  product_id: number;
  stock_actual: number;
  stock_minimo?: number;
}

class InventoryService extends BaseService<any> {
  constructor() {
    super('api/products/inventario/');
  }

  async increaseStock(productId: number | string, cantidad: number): Promise<ApiResponse<InventoryUpdateResponse>> {
    try {
      const response = await axiosClient.post(`${this.endpoint}${productId}/aumentar-stock/`, { cantidad });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async updateMinStock(productId: number | string, stock_minimo: number): Promise<ApiResponse<InventoryUpdateResponse>> {
    try {
      const response = await axiosClient.patch(`${this.endpoint}${productId}/`, { stock_minimo });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

export const inventoryService = new InventoryService();
