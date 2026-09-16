/**
 * Cliente HTTP para el backend Laravel 11 (Sanctum)
 * Conexión a la API RESTful de la Tesis ULEAM
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export function getToken(): string | null {
  return localStorage.getItem('uleam_auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('uleam_auth_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('uleam_auth_token');
  localStorage.removeItem('uleam_auth_user');
}

export function getStoredUser(): any | null {
  const user = localStorage.getItem('uleam_auth_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  localStorage.setItem('uleam_auth_user', JSON.stringify(user));
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Solo agregar Content-Type si no es FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : `Error HTTP ${response.status}`);
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
