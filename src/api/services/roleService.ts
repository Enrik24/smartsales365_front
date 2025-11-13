// src/api/services/roleService.ts

import axiosClient from '../axiosClient';

export interface RoleDTO {
  id: number;
  nombre_rol: string;
  descripcion?: string | null;
  permisos?: number[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: { message: string; code?: string | number; status?: number; errors?: any };
  status: number;
}

class RoleService {
  private base = '/api/auth/roles/';

  async list(): Promise<ApiResponse<RoleDTO[] | any>> {
    try {
      const res = await axiosClient.get(this.base);
      return { data: res.data, status: res.status };
    } catch (error: any) {
      return { error: { message: error?.response?.data?.message || error.message, status: error?.response?.status }, status: error?.response?.status || 500 };
    }
  }

  async create(payload: Pick<RoleDTO, 'nombre_rol'> & Partial<RoleDTO>): Promise<ApiResponse<RoleDTO>> {
    try {
      const res = await axiosClient.post(this.base, payload);
      return { data: res.data, status: res.status };
    } catch (error: any) {
      return { error: { message: error?.response?.data?.message || error.message, status: error?.response?.status }, status: error?.response?.status || 500 };
    }
  }

  async update(id: number | string, payload: Partial<RoleDTO>): Promise<ApiResponse<RoleDTO>> {
    try {
      const res = await axiosClient.patch(`${this.base}${id}/`, payload);
      return { data: res.data, status: res.status };
    } catch (error: any) {
      return { error: { message: error?.response?.data?.message || error.message, status: error?.response?.status }, status: error?.response?.status || 500 };
    }
  }

  async replace(id: number | string, payload: RoleDTO): Promise<ApiResponse<RoleDTO>> {
    try {
      const res = await axiosClient.put(`${this.base}${id}/`, payload);
      return { data: res.data, status: res.status };
    } catch (error: any) {
      return { error: { message: error?.response?.data?.message || error.message, status: error?.response?.status }, status: error?.response?.status || 500 };
    }
  }

  async remove(id: number | string): Promise<ApiResponse<void>> {
    try {
      const res = await axiosClient.delete(`${this.base}${id}/`);
      return { status: res.status } as ApiResponse<void>;
    } catch (error: any) {
      return { error: { message: error?.response?.data?.message || error.message, status: error?.response?.status }, status: error?.response?.status || 500 } as ApiResponse<void>;
    }
  }
}

export const roleService = new RoleService();
