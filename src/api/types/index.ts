// Common types used across the application
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    status?: number;
  };
  status: number;
}

// Pagination interface for list responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Common query parameters for list endpoints
export interface ListQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: any; // For additional filters
}

// Common CRUD operations response
export interface CrudResponse<T> {
  data: T;
  message?: string;
}

// Error response type
export interface ErrorResponse {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
