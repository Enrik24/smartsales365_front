import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse, ErrorResponse } from './types';
import axiosClient from './axiosClient';

export abstract class BaseService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected handleError(error: unknown): ErrorResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return {
        message: axiosError.response?.data?.message || 'An error occurred',
        code: axiosError.response?.data?.code,
        status: axiosError.response?.status,
        errors: axiosError.response?.data?.errors,
      };
    }
    return {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }

  async getAll(params?: any): Promise<ApiResponse<T[]>> {
    try {
      const response: AxiosResponse<T[]> = await axiosClient.get<T[]>(this.endpoint, { params });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as AxiosError)?.response?.status || 500 };
    }
  }

  async getById(id: string | number): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axiosClient.get<T>(`${this.endpoint}${id}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as AxiosError)?.response?.status || 500 };
    }
  }

  async create(data: CreateDto): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axiosClient.post<T>(this.endpoint, data);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as AxiosError)?.response?.status || 500 };
    }
  }

  async update(id: string | number, data: UpdateDto): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axiosClient.put<T>(`${this.endpoint}${id}/`, data);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as AxiosError)?.response?.status || 500 };
    }
  }

  async delete(id: string | number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosClient.delete(`${this.endpoint}${id}/`);
      return { status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as AxiosError)?.response?.status || 500 };
    }
  }
}
