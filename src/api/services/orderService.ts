import { BaseService } from '../baseService';
import { ApiResponse, ListQueryParams } from '../types';

export interface CartItem {
  id: number;
  product: number; // Product ID
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  product_details?: {
    id: number;
    name: string;
    sku: string;
    price: number;
    image?: string;
  };
}

export interface Cart {
  id: number;
  user: number; // User ID
  items: CartItem[];
  total: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order: number; // Order ID
  product: number; // Product ID
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_details?: {
    id: number;
    name: string;
    sku: string;
  };
}

export type OrderStatus = 
  | 'pending_payment' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export interface Order {
  id: number;
  user: number; // User ID
  order_number: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface PaymentIntent {
  client_secret: string;
  amount: number;
  currency: string;
}

class CartService extends BaseService<Cart> {
  constructor() {
    super('api/orders/carrito/');
  }

  async addToCart(productId: number, quantity: number = 1): Promise<ApiResponse<Cart>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}agregar/`, {
        product_id: productId,
        quantity,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async updateCartItem(productId: number, quantity: number): Promise<ApiResponse<Cart>> {
    try {
      const response = await this.apiClient.put(`${this.endpoint}actualizar/${productId}/`, {
        quantity,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async removeFromCart(productId: number): Promise<ApiResponse<Cart>> {
    try {
      const response = await this.apiClient.delete(`${this.endpoint}quitar/${productId}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async clearCart(): Promise<ApiResponse<Cart>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}vaciar/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

class OrderService extends BaseService<Order> {
  constructor() {
    super('api/orders/pedidos/');
  }

  async createOrderFromCart(shippingAddress: any, billingAddress?: any): Promise<ApiResponse<Order>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}crear/`, {
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async confirmOrder(orderId: number): Promise<ApiResponse<Order>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}${orderId}/confirmar/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async cancelOrder(orderId: number, reason?: string): Promise<ApiResponse<Order>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}${orderId}/cancelar/`, { reason });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getOrderReceipt(orderId: number): Promise<ApiResponse<{ pdf_url: string }>> {
    try {
      const response = await this.apiClient.get(`${this.endpoint}${orderId}/comprobante/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

class PaymentService {
  private endpoint = 'api/orders/pagos/';

  async createPaymentIntent(orderId: number): Promise<ApiResponse<PaymentIntent>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}crear/`, { order_id: orderId });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}confirmar/`, { payment_intent_id: paymentIntentId });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async processRefund(paymentId: number, amount?: number): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.apiClient.post(`${this.endpoint}${paymentId}/reembolsar/`, { amount });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  private handleError(error: any): { message: string; code?: string } {
    if (error.response) {
      return {
        message: error.response.data?.detail || 'Error processing payment',
        code: error.response.data?.code,
      };
    }
    return { message: 'Network error processing payment' };
  }

  private get apiClient() {
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }
}

export const cartService = new CartService();
export const orderService = new OrderService();
export const paymentService = new PaymentService();
