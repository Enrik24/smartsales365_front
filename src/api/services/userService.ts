// src/api/services/userService.ts

import { BaseService } from '../baseService';
import { User } from '@/types';
import axiosClient from '../axiosClient';

export interface UserRole {
  id: number;
  nombre: string;
  descripcion?: string;
}

export class UserService extends BaseService<User> {
  constructor() {
    super('api/auth/usuarios/');
  }

  async getUsers() {
    return this.getAll();
  }

  async createUser(userData: Partial<User>) {
    // Backend endpoint for registration
    try {
      const response = await axiosClient.post(`/api/auth/registro/`, userData);
      return { data: response.data, status: response.status } as const;
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 } as const;
    }
  }

  async updateUser(id: string, userData: Partial<User>) {
    // Use PATCH to update partial fields as per backend view
    try {
      const response = await axiosClient.patch(`/api/auth/usuarios/${id}/`, userData);
      return { data: response.data, status: response.status } as const;
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 } as const;
    }
  }

  async deleteUser(id: string) {
    // Soft-delete by deactivation endpoint
    try {
      const response = await axiosClient.post(`${this.endpoint}${id}/desactivar/`);
      return { status: response.status } as const;
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 } as const;
    }
  }

  async activateUser(id: string) {
    try {
      console.log(id);
      const response = await axiosClient.post(`/api/auth/usuarios/${id}/activar/`);
      return { data: response.data, status: response.status } as const;
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 } as const;
    }
  }

  async deactivateUser(id: string) {
    try {
      const response = await axiosClient.post(`${this.endpoint}${id}/desactivar/`);
      return { data: response.data, status: response.status } as const;
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 } as const;
    }
  }

  async getUserRoles(userId: number) {
    try {
      const response = await axiosClient.get<UserRole[]>(`${this.endpoint}${userId}/roles/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
    }
  }

  // ===== Roles Management =====
  async getRoles() {
    try {
      const response = await axiosClient.get<{ id: number; nombre_rol: string }[]>(`/api/auth/roles/`);
      return { data: response.data, status: response.status } as const;
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 } as const;
    }
  }

  async assignRole(userId: string | number, roleId: number) {
    try {
      const response = await axiosClient.post(`/api/auth/asignar-rol/`, { usuario_id: Number(userId), rol_id: roleId });
      return { data: response.data, status: response.status } as const;
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 } as const;
    }
  }

  async revokeRole(userId: string | number, roleId: number) {
    try {
      const response = await axiosClient.post(`/api/auth/revocar-rol/`, { usuario_id: Number(userId), rol_id: roleId });
      return { data: response.data, status: response.status } as const;
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 } as const;
    }
  }

  /**
   * Assign the provided role name to the user (best-effort). It does NOT revoke other roles to keep the call fast.
   */
  async setSingleRoleByName(userId: string | number, roleName: string) {
    const roles = await this.getRoles();
    if ('error' in roles && roles.error) return roles;
    const raw: any = (roles as any).data;
    const list: any[] = Array.isArray(raw) ? raw : (raw?.results ?? raw?.data ?? []);
    const desired = list.find((r: any) => r?.nombre_rol === roleName || r?.nombre === roleName);
    if (!desired) {
      return { error: { message: `Rol no encontrado: ${roleName}` }, status: 400 } as const;
    }
    return await this.assignRole(userId, desired.id);
  }
}

export const userService = new UserService();