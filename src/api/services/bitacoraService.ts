import axiosClient from '@/api/axiosClient';

export type EstadoBitacora = 'exitoso' | 'fallido' | 'advertencia';

export interface BitacoraItemDTO {
  id_bitacora: number;
  usuario: number | null;
  usuario_email?: string | null;
  usuario_nombre?: string | null; // nombre completo provisto por el backend
  fecha_accion: string; // ISO datetime
  accion: string;
  estado: EstadoBitacora;
  estado_display?: string;
  ip?: string | null;
}

export interface BitacoraFilters {
  usuario_search?: string;
  accion?: string;
  estado?: EstadoBitacora | 'todos';
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
}

export class BitacoraService {
  private base = '/api/system/bitacora/';

  async list(filters: BitacoraFilters = {}) {
    const params: Record<string, string> = {};
    if (filters.usuario_search) params['usuario_search'] = filters.usuario_search;
    if (filters.accion) params['accion'] = filters.accion;
    if (filters.estado && filters.estado !== 'todos') params['estado'] = filters.estado;
    if (filters.fecha_desde) params['fecha_desde'] = filters.fecha_desde;
    if (filters.fecha_hasta) params['fecha_hasta'] = filters.fecha_hasta;

    const res = await axiosClient.get<BitacoraItemDTO[] | { results: BitacoraItemDTO[] }>(this.base, { params });
    const data = Array.isArray(res.data)
      ? res.data
      : (res.data as any)?.results ?? [];
    return data as BitacoraItemDTO[];
  }
}

export const bitacoraService = new BitacoraService();
