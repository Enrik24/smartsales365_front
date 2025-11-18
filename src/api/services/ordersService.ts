import axiosClient from '../axiosClient';

export interface ApiResponse<T> {
  data?: T;
  error?: { message: string; code?: string | number; status?: number; errors?: any };
  status: number;
}

export interface OrderCreateResponse {
  id: number | string;
  total?: number;
  items?: Array<{ producto_id: number; cantidad: number; precio?: number; product?: any }>;
}

export interface Order {
  id: number;
  numero_seguimiento: string;
  monto_total: number;
  [key: string]: any;
}

export interface StripeCheckoutResponse {
  checkout_url?: string;
  session_id?: string;
  [key: string]: any;
}

class OrdersService {
  private base = '/api/orders/pedidos/';

  async create(payload?: { direccion_envio: string; direccion_facturacion?: string; usar_misma?: boolean }): Promise<ApiResponse<OrderCreateResponse>> {
    try {
      const res = await axiosClient.post(`${this.base}crear/`, payload ?? {});
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

  async getTracking(pedidoId: number | string): Promise<ApiResponse<any>> {
    try {
      const res = await axiosClient.get(`${this.base}${pedidoId}/seguimiento/`);
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

  async getById(pedidoId: number | string): Promise<ApiResponse<Order>> {
    try {
      const res = await axiosClient.get(`${this.base}${pedidoId}/`);
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

  async createStripeCheckout(pedidoId: number | string): Promise<ApiResponse<StripeCheckoutResponse>> {
    try {
      const res = await axiosClient.post(`${this.base}${pedidoId}/checkout-stripe/`);
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

  async getOrderBySessionId(sessionId: string): Promise<ApiResponse<Order>> {
    try {
      const res = await axiosClient.get(`${this.base}stripe/session/${sessionId}/`);
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

export const ordersService = new OrdersService();
