import { BaseService } from '../baseService';
import { ApiResponse, ListQueryParams } from '../types';

export interface Notification {
  id: number;
  user: number; // User ID
  title: string;
  message: string;
  is_read: boolean;
  notification_type: string;
  related_id?: number;
  related_type?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreference {
  id: number;
  user: number; // User ID
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  order_updates: boolean;
  promotions: boolean;
  stock_alerts: boolean;
  security_alerts: boolean;
  created_at: string;
  updated_at: string;
}

class NotificationService extends BaseService<Notification> {
  constructor() {
    super('api/notifications/notificaciones/');
  }

  async getUnreadNotifications(): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await this.apiClient.get('no-leidas/');
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async markAsRead(notificationId: number): Promise<ApiResponse<Notification>> {
    try {
      const response = await this.apiClient.post('marcar-leida/', { notification_id: notificationId });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await this.apiClient.post('marcar-todas-leidas/');
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getPreferences(): Promise<ApiResponse<NotificationPreference>> {
    try {
      const response = await this.apiClient.get('preferencias/');
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreference>): Promise<ApiResponse<NotificationPreference>> {
    try {
      const response = await this.apiClient.put('preferencias/', preferences);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async createSystemNotification(
    userId: number,
    title: string,
    message: string,
    notificationType: string,
    relatedId?: number
  ): Promise<ApiResponse<Notification>> {
    try {
      const response = await this.apiClient.post('sistema/crear/', {
        user_id: userId,
        title,
        message,
        notification_type: notificationType,
        related_id: relatedId,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

export const notificationService = new NotificationService();
