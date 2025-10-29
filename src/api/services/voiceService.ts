import { BaseService } from '../baseService';
import { ApiResponse } from '../types';

export interface VoiceCommand {
  id: number;
  user: number; // User ID
  command_text: string;
  intent: string;
  confidence: number;
  parameters: Record<string, any>;
  is_executed: boolean;
  execution_result?: any;
  error_message?: string;
  created_at: string;
  executed_at?: string;
}

export interface TextCommand extends Omit<VoiceCommand, 'id' | 'created_at'> {
  id?: number;
  created_at?: string;
}

export interface CommandSuggestion {
  command: string;
  description: string;
  example: string;
  category: 'product' | 'order' | 'inventory' | 'report' | 'other';
  frequency: number;
}

class VoiceCommandService {
  private endpoint = 'api/voice-commands/';

  async processCommand(
    audioBlob?: Blob,
    textCommand?: string
  ): Promise<ApiResponse<{ command: VoiceCommand; response: any }>> {
    try {
      const formData = new FormData();
      
      if (audioBlob) {
        formData.append('audio', audioBlob, 'command.wav');
      } else if (textCommand) {
        formData.append('text', textCommand);
      } else {
        throw new Error('Either audioBlob or textCommand must be provided');
      }

      const response = await this.apiClient.post('procesar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getVoiceCommandHistory(params?: {
    limit?: number;
    offset?: number;
    intent?: string;
    is_executed?: boolean;
  }): Promise<ApiResponse<{ count: number; results: VoiceCommand[] }>> {
    try {
      const response = await this.apiClient.get('voz/historial/', { params });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getTextCommandHistory(params?: {
    limit?: number;
    offset?: number;
    intent?: string;
    is_executed?: boolean;
  }): Promise<ApiResponse<{ count: number; results: TextCommand[] }>> {
    try {
      const response = await this.apiClient.get('texto/historial/', { params });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getFrequentCommands(limit: number = 5): Promise<ApiResponse<CommandSuggestion[]>> {
    try {
      const response = await this.apiClient.get('sugerencias/', { params: { limit } });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async retryCommand(commandId: number): Promise<ApiResponse<{ command: VoiceCommand; response: any }>> {
    try {
      const response = await this.apiClient.post(`${commandId}/reintentar/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  private handleError(error: any): { message: string; code?: string } {
    if (error.response) {
      return {
        message: error.response.data?.detail || 'Error processing voice command',
        code: error.response.data?.code,
      };
    }
    return { message: 'Network error processing voice command' };
  }

  private get apiClient() {
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }
}

export const voiceCommandService = new VoiceCommandService();
