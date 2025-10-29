import { BaseService } from '../baseService';
import { ApiResponse, ListQueryParams } from '../types';

export interface SystemLog {
  id: number;
  user?: number; // User ID (if applicable)
  action: string;
  model: string;
  object_id?: string;
  changes?: Record<string, { old: any; new: any }>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed' | 'warning';
  created_at: string;
}

export interface SystemConfig {
  key: string;
  value: any;
  description?: string;
  is_public: boolean;
  data_type: 'string' | 'number' | 'boolean' | 'json' | 'date';
  created_at: string;
  updated_at: string;
}

class SystemLogService extends BaseService<SystemLog> {
  constructor() {
    super('api/system/bitacora/');
  }

  async logAction(
    action: string,
    model: string,
    objectId?: string | number,
    changes?: Record<string, { old: any; new: any }>,
    metadata: Record<string, any> = {}
  ): Promise<ApiResponse<SystemLog>> {
    try {
      const response = await this.apiClient.post('registrar/', {
        action,
        model,
        object_id: objectId,
        changes,
        ...metadata,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      console.error('Error logging system action:', error);
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async searchLogs(params: {
    action?: string;
    model?: string;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<{ count: number; results: SystemLog[] }>> {
    try {
      const response = await this.apiClient.get('', { params });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

class SystemConfigService {
  private endpoint = 'api/system/configuraciones/';

  async getConfig(key: string): Promise<ApiResponse<SystemConfig>> {
    try {
      const response = await this.apiClient.get(`${key}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getConfigValue(key: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.apiClient.get(`${key}/valor/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async setConfig(key: string, value: any): Promise<ApiResponse<SystemConfig>> {
    try {
      const response = await this.apiClient.post('establecer/', { key, value });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async listConfigs(params?: {
    is_public?: boolean;
    search?: string;
  }): Promise<ApiResponse<SystemConfig[]>> {
    try {
      const response = await this.apiClient.get('', { params });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  private handleError(error: any): { message: string; code?: string } {
    if (error.response) {
      return {
        message: error.response.data?.detail || 'Error in system operation',
        code: error.response.data?.code,
      };
    }
    return { message: 'Network error in system operation' };
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

export const systemLogService = new SystemLogService();
export const systemConfigService = new SystemConfigService();
