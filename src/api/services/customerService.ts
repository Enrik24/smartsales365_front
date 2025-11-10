import axiosClient from '../axiosClient';

export interface CustomerDTO {
  id: number | string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  estado?: 'Activo' | 'Inactivo';
  is_active?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: { message: string; code?: string | number; status?: number; errors?: any };
  status: number;
}

class CustomerService {
  private base = '/api/auth/clientes/';

  async list(): Promise<ApiResponse<CustomerDTO[]>> {
    try {
      const res = await axiosClient.get(this.base);
      const payload = res.data as any;
      const data: CustomerDTO[] = Array.isArray(payload)
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

export const customerService = new CustomerService();
