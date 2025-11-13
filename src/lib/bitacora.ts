import axiosClient from '@/api/axiosClient';
export type EstadoBitacora = 'exitoso' | 'fallido' | 'advertencia';

export interface BitacoraPayload {
  accion: string;
  estado?: EstadoBitacora;
  ip?: string;
}

// Build absolute endpoint using env base URL, falling back to axiosClient baseURL or window origin
const ENV_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || '';
const CLIENT_BASE = (axiosClient as any)?.defaults?.baseURL || '';
const RUNTIME_BASE = (typeof window !== 'undefined' ? window.location.origin : '');
const RAW_BASE = (typeof ENV_BASE === 'string' && ENV_BASE)
  ? ENV_BASE
  : ((typeof CLIENT_BASE === 'string' && CLIENT_BASE) ? CLIENT_BASE : RUNTIME_BASE);
const BITACORA_ENDPOINT = new URL('/api/system/bitacora/accion/', RAW_BASE).toString();

export async function logBitacora(payload: BitacoraPayload, useBeacon: boolean = false): Promise<void> {
  const { accion, estado = 'exitoso', ip } = payload;

  if (!accion || typeof accion !== 'string') {
    console.error('bitacora: "accion" es requerido y debe ser string');
    return;
  }

  const data: { accion: string; estado: EstadoBitacora; ip?: string } = {
    accion,
    estado,
    ...(ip ? { ip } : {}),
  };

  try {
    // NOTE: sendBeacon no permite establecer cabeceras personalizadas como Authorization.
    // Solo funcionará si tu backend autentica por cookie/sesión same-site.
    if (useBeacon && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(BITACORA_ENDPOINT, blob);
      return;
    }

    // Incluir token JWT si existe, además de las cookies
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp('(^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    const csrfToken = getCookie('csrftoken') || getCookie('csrf_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    await fetch(BITACORA_ENDPOINT, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error('bitacora: error al registrar acción', err);
  }
}

export function logExitoso(accion: string, extraData: { ip?: string } = {}): Promise<void> {
  return logBitacora({ accion, estado: 'exitoso', ...extraData });
}

export function logFallido(accion: string, extraData: { ip?: string } = {}): Promise<void> {
  return logBitacora({ accion, estado: 'fallido', ...extraData });
}

export function logAdvertencia(accion: string, extraData: { ip?: string } = {}): Promise<void> {
  return logBitacora({ accion, estado: 'advertencia', ...extraData });
}
