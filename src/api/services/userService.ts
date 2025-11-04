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
    return this.create(userData);
  }

  async updateUser(id: string, userData: Partial<User>) {
    return this.update(id, userData);
  }

  async deleteUser(id: string) {
    return this.delete(id);
  }

  async updateStatus(userId: string, isActive: boolean) {
    try {
      const response = await axiosClient.patch(`${this.endpoint}${userId}/`, {
        is_active: isActive,
        estado: isActive ? 'activo' : 'inactivo'
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
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
}

export const userService = new UserService();