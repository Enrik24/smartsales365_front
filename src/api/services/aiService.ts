import { BaseService } from '../baseService';
import { ApiResponse } from '../types';
import { AIModel as DBAIModel } from '../types/models';

export interface AIModel extends Omit<DBAIModel, 'parametros' | 'ruta_modelo' | 'fecha_entrenamiento'> {
  // Inherits all fields from DBAIModel except 'parametros', 'ruta_modelo', and 'fecha_entrenamiento'
  // and adds any additional fields specific to the service
  last_trained: string; // Maps to fecha_entrenamiento
  model_path?: string;  // Maps to ruta_modelo
}

export interface TrainingResult {
  model_id: number;
  status: 'success' | 'failed' | 'training';
  metrics: {
    mae?: number;    // Mean Absolute Error
    mse?: number;    // Mean Squared Error
    r2?: number;     // R-squared
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
  };
  training_time_seconds: number;
  created_at: string;
  // Add any additional fields from your database that might be relevant
  training_samples?: number;
  validation_samples?: number;
  test_accuracy?: number;
}

export interface PredictionInput {
  // Define specific input fields based on your model's requirements
  // Example:
  date_range?: {
    start: string;
    end: string;
  };
  filters?: {
    product_ids?: number[];
    category_ids?: number[];
    brand_ids?: number[];
  };
  options?: {
    include_promotions?: boolean;
    include_seasonality?: boolean;
    confidence_level?: number;
  };
}

export interface PredictionOutput {
  // Define specific output fields based on your model's response
  // Example:
  prediction_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    date: string;
    values: Array<{
      product_id: number;
      predicted_quantity: number;
      confidence_interval: {
        lower: number;
        upper: number;
      };
    }>;
  };
  metrics?: {
    mae?: number;
    mse?: number;
    r2?: number;
    confidence: number;
  };
  generated_at: string;
}

export interface Prediction extends PredictionOutput {
  id: number;
  model_id: number;
  model_name: string;
  input_data: PredictionInput;
  output_data: Omit<PredictionOutput, 'generated_at'>;
  confidence?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface SalesPredictionInput {
  product_ids?: number[];
  category_ids?: number[];
  start_date: string;
  end_date: string;
  include_promotions?: boolean;
  include_seasonality?: boolean;
  confidence_level?: number;
  prediction_horizon_days?: number;
}

export interface SalesPredictionResult {
  prediction_id: string;
  model_used: string;
  generated_at: string;
  predictions: Array<{
    date: string;
    product_id: number;
    product_name: string;
    category_id: number;
    category_name: string;
    predicted_quantity: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
    confidence: number;
  }>;
  metrics: {
    overall_confidence: number;
    total_predictions: number;
    average_confidence: number;
    min_confidence: number;
    max_confidence: number;
  };
  metadata: {
    prediction_duration_ms: number;
    model_version: string;
    parameters: {
      include_promotions: boolean;
      include_seasonality: boolean;
      confidence_level: number;
    };
  };
}

interface ModelTrainingOptions {
  epochs?: number;
  batch_size?: number;
  validation_split?: number;
  test_split?: number;
  random_seed?: number;
}

class AIModelService extends BaseService<AIModel> {
  constructor() {
    super('api/ai/modelos/');
  }

  async trainSalesModel(
    trainingData: {
      start_date: string;
      end_date: string;
      target_variable: string;
      features: string[];
    },
    options?: ModelTrainingOptions
  ): Promise<ApiResponse<TrainingResult>> {
    try {
      const payload = {
        ...trainingData,
        options: {
          epochs: 50,
          batch_size: 32,
          validation_split: 0.2,
          test_split: 0.1,
          random_seed: 42,
          ...options,
        },
      };
      
      const response = await this.apiClient.post('entrenar-ventas/', payload);
      return { 
        data: {
          ...response.data,
          // Ensure all required fields are present
          metrics: response.data.metrics || {},
          training_time_seconds: response.data.training_time_seconds || 0,
          created_at: response.data.created_at || new Date().toISOString(),
        }, 
        status: response.status 
      };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
    }
  }

  async updateModel(
    modelId: number, 
    updates: Partial<{
      name: string;
      description: string;
      is_active: boolean;
      version: string;
    }>
  ): Promise<ApiResponse<AIModel>> {
    try {
      const response = await this.apiClient.put(`${modelId}/`, updates);
      return { 
        data: response.data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
    }
  }

  async getModelPerformance(modelId: number): Promise<ApiResponse<{
    model_id: number;
    metrics: {
      mae: number;
      mse: number;
      r2: number;
      last_updated: string;
    };
    training_history: Array<{
      epoch: number;
      loss: number;
      val_loss: number;
      timestamp: string;
    }>;
  }>> {
    try {
      const response = await this.apiClient.get(`${modelId}/rendimiento/`);
      return { 
        data: response.data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
    }
  }
}

class PredictionService {
  private readonly baseUrl: string;
  
  constructor(baseUrl: string = 'api/ai/predicciones/') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  async generateSalesPrediction(
    input: SalesPredictionInput
  ): Promise<ApiResponse<SalesPredictionResult>> {
    try {
      // Validate required fields
      if (!input.start_date || !input.end_date) {
        throw new Error('start_date and end_date are required');
      }

      const response = await this.createApiClient().post('generar/', {
        ...input,
        // Ensure proper date formatting
        start_date: new Date(input.start_date).toISOString(),
        end_date: new Date(input.end_date).toISOString(),
      });

      return { 
        data: this.normalizePredictionResult(response.data), 
        status: response.status 
      };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
    }
  }

  async getPrediction(predictionId: string): Promise<ApiResponse<Prediction>> {
    try {
      const response = await this.createApiClient().get(`${predictionId}/`);
      return { 
        data: this.normalizePrediction(response.data), 
        status: response.status 
      };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
    }
  }

  async getPredictionStatus(predictionId: string): Promise<ApiResponse<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    estimated_completion_time?: string;
  }>> {
    try {
      const response = await this.createApiClient().get(`${predictionId}/estado/`);
      return { 
        data: response.data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
    }
  }

  async cancelPrediction(predictionId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.createApiClient().post(`${predictionId}/cancelar/`);
      return { 
        data: { success: response.data.success || false }, 
        status: response.status 
      };
    } catch (error) {
      return { 
        error: this.handleError(error), 
        status: (error as any)?.response?.status || 500 
      };
    }
  }

  private normalizePrediction(data: any): Prediction {
    return {
      id: data.id,
      model_id: data.model_id,
      model_name: data.model_name || 'Unknown Model',
      input_data: data.input_data || {},
      output_data: data.output_data || {},
      status: data.status || 'pending',
      confidence: data.confidence,
      created_at: data.created_at || new Date().toISOString(),
      started_at: data.started_at,
      completed_at: data.completed_at,
      error_message: data.error_message,
    };
  }

  private normalizePredictionResult(data: any): SalesPredictionResult {
    return {
      prediction_id: data.prediction_id,
      model_used: data.model_used || 'sales_prediction_model',
      generated_at: data.generated_at || new Date().toISOString(),
      predictions: Array.isArray(data.predictions) ? data.predictions.map((p: any) => ({
        date: p.date,
        product_id: p.product_id,
        product_name: p.product_name || `Product ${p.product_id}`,
        category_id: p.category_id,
        category_name: p.category_name || `Category ${p.category_id}`,
        predicted_quantity: p.predicted_quantity || 0,
        confidence_interval: p.confidence_interval || { lower: 0, upper: 0 },
        confidence: p.confidence || 0,
      })) : [],
      metrics: data.metrics || {
        overall_confidence: 0,
        total_predictions: 0,
        average_confidence: 0,
        min_confidence: 0,
        max_confidence: 0,
      },
      metadata: data.metadata || {
        prediction_duration_ms: 0,
        model_version: '1.0.0',
        parameters: {
          include_promotions: false,
          include_seasonality: false,
          confidence_level: 0.95,
        },
      },
    };
  }

  private handleError(error: any): { message: string; code?: string } {
    if (error.response) {
      return {
        message: error.response.data?.detail || 'Error processing AI request',
        code: error.response.data?.code || 'prediction_error',
      };
    }
    return { 
      message: error.message || 'Network error processing AI request',
      code: 'network_error',
    };
  }

  private createApiClient() {
    return axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}${this.baseUrl}`.replace(/([^:]\/)\/+/g, '$1'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      timeout: 30000, // 30 seconds timeout
    });
  }
}

export const aiModelService = new AIModelService();
export const predictionService = new PredictionService();
