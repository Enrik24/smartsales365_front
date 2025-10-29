import { BaseService } from '../baseService';
import { ApiResponse, ListQueryParams } from '../types';

export interface Report {
  id: number;
  title: string;
  description?: string;
  report_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  parameters: Record<string, any>;
  created_by: number; // User ID
  created_at: string;
  completed_at?: string;
}

export interface SalesMetrics {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  conversion_rate: number;
  sales_trend: {
    date: string;
    sales: number;
    orders: number;
  }[];
  top_products: Array<{
    product_id: number;
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  sales_by_category: Array<{
    category_id: number;
    category_name: string;
    sales: number;
    percentage: number;
  }>;
}

export interface InventoryMetrics {
  total_products: number;
  total_inventory_value: number;
  out_of_stock: number;
  low_stock: number;
  stock_movements: Array<{
    date: string;
    in: number;
    out: number;
  }>;
  slow_moving: Array<{
    product_id: number;
    name: string;
    sku: string;
    current_stock: number;
    days_in_stock: number;
  }>;
}

class ReportService extends BaseService<Report> {
  constructor() {
    super('api/analytics/reportes/');
  }

  async generateReport(
    reportType: string, 
    parameters: Record<string, any> = {},
    format: 'pdf' | 'csv' | 'xlsx' = 'pdf'
  ): Promise<ApiResponse<Report>> {
    try {
      const response = await this.apiClient.post('generar/', {
        report_type: reportType,
        parameters,
        format,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getUserReports(userId?: number): Promise<ApiResponse<Report[]>> {
    try {
      const endpoint = userId 
        ? `usuario/${userId}/` 
        : 'mis-reportes/';
      const response = await this.apiClient.get(endpoint);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getReportFile(reportId: number): Promise<ApiResponse<{ file_url: string }>> {
    try {
      const response = await this.apiClient.get(`${reportId}/`);
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }
}

class AnalyticsService {
  private endpoint = 'api/analytics/';

  async getSalesMetrics(dateRange: { start: string; end: string }): Promise<ApiResponse<SalesMetrics>> {
    try {
      const response = await this.apiClient.get('metricas/ventas/', { params: dateRange });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getInventoryMetrics(): Promise<ApiResponse<InventoryMetrics>> {
    try {
      const response = await this.apiClient.get('metricas/inventario/');
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  async getCustomerMetrics(dateRange: { start: string; end: string }) {
    try {
      const response = await this.apiClient.get('metricas/clientes/', { params: dateRange });
      return { data: response.data, status: response.status };
    } catch (error) {
      return { error: this.handleError(error), status: (error as any)?.response?.status || 500 };
    }
  }

  private handleError(error: any): { message: string; code?: string } {
    if (error.response) {
      return {
        message: error.response.data?.detail || 'Error fetching analytics data',
        code: error.response.data?.code,
      };
    }
    return { message: 'Network error fetching analytics data' };
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

export const reportService = new ReportService();
export const analyticsService = new AnalyticsService();
