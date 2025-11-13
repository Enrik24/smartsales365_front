import axiosClient from '../axiosClient';

export interface BrandDTO {
  id: number | string;
  nombre_marca: string;
  description?: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: { message: string; code?: string | number; status?: number; errors?: any };
  status: number;
}

class BrandService {
  private base = '/api/products/marcas/';

  async list(): Promise<ApiResponse<BrandDTO[]>> {
    try {
      const res = await axiosClient.get(this.base);
      const payload = res.data as any;
      const data: BrandDTO[] = Array.isArray(payload)
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

  async create(payload: { nombre_marca: string; description?: string | null }): Promise<ApiResponse<BrandDTO>> {
    try {
      const res = await axiosClient.post(this.base, payload);
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

  async get(id: number | string): Promise<ApiResponse<BrandDTO>> {
    try {
      const res = await axiosClient.get(`${this.base}${id}/`);
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

  async update(id: number | string, payload: { nombre_marca?: string; description?: string | null }): Promise<ApiResponse<BrandDTO>> {
    try {
      const res = await axiosClient.patch(`${this.base}${id}/`, payload);
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

  async remove(id: number | string): Promise<ApiResponse<void>> {
    try {
      const res = await axiosClient.delete(`${this.base}${id}/`);
      return { status: res.status } as ApiResponse<void>;
    } catch (error: any) {
      return {
        error: {
          message: error?.response?.data?.message || error.message,
          status: error?.response?.status,
        },
        status: error?.response?.status || 500,
      } as ApiResponse<void>;
    }
  }
}

export const brandService = new BrandService();
