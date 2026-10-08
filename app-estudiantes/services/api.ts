import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Configuración de Axios para ULEAM Alojamiento Estudiantil
 * Detectada automáticamente desde las variables de entorno de Expo (.env).
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const API_BASE_URL = BASE_URL;
export const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP || '127.0.0.1';
export const BACKEND_PORT = process.env.EXPO_PUBLIC_BACKEND_PORT || '8000';

let authToken: string | null = null;
let currentUser: any = null;
let currentUserRole: 'estudiante' | 'arrendador' | 'administrador' | null = null;
let currentUserIdRol: number | null = null;

type AuthListener = (token: string | null) => void;
const authListeners: Set<AuthListener> = new Set();

type RoleListener = (
  role: 'estudiante' | 'arrendador' | 'administrador' | null,
  idRol: number | null,
  user: any
) => void;
const roleListeners: Set<RoleListener> = new Set();

export const onAuthStateChange = (listener: AuthListener) => {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
};

export const onUserRoleChange = (listener: RoleListener) => {
  roleListeners.add(listener);
  return () => {
    roleListeners.delete(listener);
  };
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    AsyncStorage.setItem('auth_token', token).catch(() => {});
  } else {
    AsyncStorage.removeItem('auth_token').catch(() => {});
  }
  authListeners.forEach((fn) => fn(token));
};

export const getAuthToken = () => authToken;

export const setCurrentUser = (user: any) => {
  currentUser = user;
  if (user) {
    AsyncStorage.setItem('user', JSON.stringify(user)).catch(() => {});
    currentUserIdRol = user.id_rol ?? (user.rol?.id_rol ?? null);
    if (user.rol?.nombre) {
      currentUserRole = user.rol.nombre.toLowerCase();
    } else if (currentUserIdRol === 2) {
      currentUserRole = 'arrendador';
    } else if (currentUserIdRol === 1) {
      currentUserRole = 'estudiante';
    }
  } else {
    AsyncStorage.removeItem('user').catch(() => {});
    currentUser = null;
    currentUserRole = null;
    currentUserIdRol = null;
  }
  roleListeners.forEach((fn) => fn(currentUserRole, currentUserIdRol, currentUser));
};

export const getCurrentUser = () => currentUser;
export const getCurrentUserRole = () => currentUserRole;
export const getCurrentUserIdRol = () => currentUserIdRol;

export const clearSession = () => {
  setAuthToken(null);
  setCurrentUser(null);
  AsyncStorage.multiRemove(['auth_token', 'user']).catch(() => {});
};

/**
 * Restaura la sesión desde AsyncStorage al iniciar la aplicación móvil
 */
export const restoreSessionFromStorage = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const userStr = await AsyncStorage.getItem('user');
    if (token) {
      authToken = token;
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          currentUser = userObj;
          currentUserIdRol = userObj.id_rol ?? (userObj.rol?.id_rol ?? null);
          if (userObj.rol?.nombre) {
            currentUserRole = userObj.rol.nombre.toLowerCase();
          } else if (currentUserIdRol === 2) {
            currentUserRole = 'arrendador';
          } else if (currentUserIdRol === 1) {
            currentUserRole = 'estudiante';
          }
        } catch {}
      }
      authListeners.forEach((fn) => fn(token));
      roleListeners.forEach((fn) => fn(currentUserRole, currentUserIdRol, currentUser));
      return token;
    }
  } catch (e) {
    console.warn('[restoreSessionFromStorage] Error:', e);
  }
  return null;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export const api = apiClient;

// Interceptor para inyectar token Sanctum
apiClient.interceptors.request.use(
  async (config) => {
    let token = authToken;
    if (!token) {
      try {
        token = await AsyncStorage.getItem('auth_token');
        if (token) authToken = token;
      } catch {}
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejo uniforme de errores y logout automático en 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API Mobile] Token expirado o no autorizado (401). Limpiando sesión...');
      clearSession();
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error de conexión con el servidor backend';
    const customError: any = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

export default apiClient;

// Servicios de API preparados para los componentes
export const authService = {
  async ping() {
    const res = await apiClient.get('/ping');
    return res.data;
  },
  async login(correo: string, clave: string, expoPushToken?: string | null) {
    const res = await apiClient.post('/auth/login', { correo, clave });
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    if (res.data?.user) {
      setCurrentUser(res.data.user);
    }
    // Si el celular ya generó un token de notificaciones, lo guardamos en el backend
    if (expoPushToken && res.data?.token) {
      try {
        await apiClient.post('/user/push-token', { expo_push_token: expoPushToken });
      } catch (e) {
        console.warn('[authService.login] No se pudo registrar push token:', e);
      }
    }
    return res.data;
  },
  async register(data: {
    nombres: string;
    correo: string;
    clave?: string;
    clave_confirmation?: string;
    password?: string;
    password_confirmation?: string;
    id_rol: number;
    identificacion?: string;
    cedula?: string;
    telefono?: string;
  }) {
    const res = await apiClient.post('/auth/register', data);
    // NOTA: No guardamos token ni iniciamos sesión automáticamente para requerir verificación de correo
    return res.data;
  },
  async resendEmailVerification(correo?: string) {
    const res = await apiClient.post('/email/verification-notification', { correo });
    return res.data;
  },
  async checkEmailVerificationStatus(correo?: string) {
    const res = await apiClient.post('/email/verify-status', { correo });
    return res.data;
  },
  async logout() {
    try {
      if (authToken) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      console.warn('[logout] Error en logout del servidor:', e);
    } finally {
      clearSession();
    }
  },
  async getMe() {
    const res = await apiClient.get('/auth/me');
    if (res.data) {
      setCurrentUser(res.data);
    }
    return res.data;
  },
  async getProfile() {
    return getProfile();
  },
};

export const logout = async () => {
  return authService.logout();
};

export const getProfile = async () => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  const res = await apiClient.get('/auth/user');
  if (res.data) {
    const user = res.data.user || res.data;
    setCurrentUser(user);
  }
  return res.data;
};

// ── Tipo de PIN para el mapa ──────────────────────────────────────────────────
export interface MapInmueblePin {
  id: number;
  titulo: string;
  precio: string;           // ej. "$180"
  precio_numero: number;
  precio_mensual?: number | string;
  tipo: string;
  latitud: number;
  longitud: number;
  distancia: string;        // ej. "350m de ULEAM"
  direccion: string;
  portada_url: string | null;
  capacidad?: number;
  tipo_raw?: string;
}

// Helper para asegurar token de arrendador si no hay sesión activa
export const ensureLandlordAuth = async () => {
  let token = getAuthToken();
  if (!token) {
    try {
      const loginRes = await apiClient.post('/auth/login', {
        correo: 'arrendador@uleam.edu.ec',
        clave: 'arrendador123',
      });
      if (loginRes.data?.token) {
        token = loginRes.data.token;
        setAuthToken(token);
        setCurrentUser(loginRes.data?.user);
      }
    } catch (e) {
      console.warn('[ensureLandlordAuth] No se pudo auto-autenticar:', e);
    }
  }
  return token;
};

export const createInmueble = async (formData: FormData) => {
  const token = await ensureLandlordAuth();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await apiClient.post('/inmuebles', formData, {
    headers,
  });
  return res.data;
};

export const getPropertyDetails = async (id: number) => {
  const res = await apiClient.get(`/inmuebles/${id}`);
  return res.data;
};

export const deleteProperty = async (id: number) => {
  const token = await ensureLandlordAuth();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await apiClient.delete(`/inmuebles/${id}`, { headers });
  return res.data;
};

export const updateProperty = async (id: number, data: any) => {
  const token = await ensureLandlordAuth();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si es FormData (para manejar subida de fotos si es necesario)
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data';
    try {
      (data as any).append?.('_method', 'PUT');
    } catch {
      // ya tiene _method
    }
    const res = await apiClient.post(`/inmuebles/${id}`, data, { headers });
    return res.data;
  }

  const res = await apiClient.put(`/inmuebles/${id}`, data, { headers });
  return res.data;
};

export const updatePropertyStatus = async (id: number, nuevoEstado: string) => {
  const token = await ensureLandlordAuth();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await apiClient.patch(`/inmuebles/${id}/estado`, { estado: nuevoEstado }, { headers });
  return res.data;
};

// ── Tipos del Módulo 3: Panel del Arrendador ──
export interface LandlordProperty {
  id_inmueble: number;
  titulo: string;
  descripcion?: string;
  normas?: string;
  precio: number | string;
  precio_mensual?: number | string;
  tipo?: string;
  estado: 'publicado' | 'en_revision' | 'ocupado' | 'rechazado' | 'pausado' | string;
  calificacion_promedio?: number;
  capacidad?: number;
  servicios_incluidos?: boolean;
  ubicacion?: {
    latitud?: number;
    longitud?: number;
    direccion_referencial?: string;
    sector?: string;
    distancia_uleam_km?: number;
  };
  fotografias?: Array<{
    id_fotografia: number;
    url: string;
    es_portada: boolean;
  }>;
}

export interface LandlordRequest {
  id_solicitud: number;
  id_estudiante: number;
  id_inmueble: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
  fecha_deseada_ingreso?: string;
  mensaje_inicial?: string;
  created_at: string;
  estudiante?: {
    id_usuario: number;
    nombres: string;
    correo: string;
    perfil?: {
      id_perfil: number;
      telefono?: string;
      foto_perfil_url?: string;
      ciudad_origen?: string;
      documento_verificado?: boolean;
      carrera?: string;
    };
  };
  inmueble?: {
    id_inmueble: number;
    titulo: string;
    precio: number | string;
    ubicacion?: {
      direccion_referencial?: string;
      sector?: string;
    };
    fotografias?: Array<{
      id_fotografia: number;
      url: string;
      es_portada: boolean;
    }>;
  };
}

export const getMyProperties = async (): Promise<LandlordProperty[]> => {
  await ensureLandlordAuth();
  const res = await apiClient.get('/arrendador/inmuebles');
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return res.data?.data ?? [];
};

export const getLandlordRequests = async (): Promise<LandlordRequest[]> => {
  await ensureLandlordAuth();
  const res = await apiClient.get('/arrendador/solicitudes');
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return res.data?.data ?? [];
};

export const updateLandlordRequestStatus = async (
  idSolicitud: number,
  estado: 'aceptada' | 'rechazada'
) => {
  await ensureLandlordAuth();
  const res = await apiClient.patch(`/arrendador/solicitudes/${idSolicitud}`, { estado });
  return res.data;
};

/**
 * Obtener lista paginada de inmuebles
 * GET /inmuebles?page=${page}
 */
export const getInmuebles = async (page = 1) => {
  try {
    const response = await apiClient.get(`/inmuebles?page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const inmuebleService = {
  /** Lista paginada completa (uso en pantallas de listado) */
  async getInmuebles(page = 1) {
    return getInmuebles(page);
  },
  /** Detalle de un inmueble */
  async getInmueble(id: number) {
    return getPropertyDetails(id);
  },
  /** Detalle completo de un inmueble */
  async getPropertyDetails(id: number) {
    return getPropertyDetails(id);
  },
  /** Inmuebles del arrendador logueado */
  async getMyProperties(): Promise<LandlordProperty[]> {
    return getMyProperties();
  },
  /** Solicitudes de estudiantes recibidas */
  async getLandlordRequests(): Promise<LandlordRequest[]> {
    return getLandlordRequests();
  },
  /** Cambiar estado de solicitud */
  async updateLandlordRequestStatus(id: number, estado: 'aceptada' | 'rechazada') {
    return updateLandlordRequestStatus(id, estado);
  },
  /**
   * Endpoint optimizado para el mapa móvil.
   * Devuelve el arreglo plano de pines con coordenadas y campos de previsualización.
   */
  async getInmueblesMapa(): Promise<MapInmueblePin[]> {
    const res = await apiClient.get('/inmuebles/mapa');
    return res.data?.data ?? [];
  },
  /** Registrar un nuevo inmueble con fotos y ubicación */
  async createInmueble(formData: FormData) {
    return createInmueble(formData);
  },
  /** Actualizar un inmueble existente */
  async updateProperty(id: number, data: any) {
    return updateProperty(id, data);
  },
  /** Eliminar un inmueble propio */
  async deleteProperty(id: number) {
    return deleteProperty(id);
  },
};

// ── Tipos e Integración del Módulo de Chat ──────────────────────────────────
export interface ChatUser {
  id_usuario: number;
  nombres: string;
  correo: string;
  id_rol?: number;
  rol?: string;
  foto_perfil_url?: string | null;
  telefono?: string | null;
  ciudad_origen?: string | null;
  carrera?: string | null;
  documento_verificado?: boolean;
}

export interface ChatMessage {
  id_mensaje: number;
  id_remitente: number;
  id_destinatario: number;
  id_inmueble?: number | null;
  contenido: string;
  leido: boolean;
  fecha?: string;
  created_at?: string;
  remitente?: ChatUser;
  destinatario?: ChatUser;
  inmueble?: {
    id_inmueble: number;
    titulo: string;
  } | null;
}

export interface ChatConversation {
  id_conversacion: number;
  otro_usuario: ChatUser;
  ultimo_mensaje: ChatMessage;
  unread_count: number;
}

/**
 * Obtener lista de conversaciones con último mensaje y contador de no leídos
 */
export const getConversations = async (): Promise<ChatConversation[]> => {
  const res = await apiClient.get('/mensajes/conversaciones');
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return res.data?.data ?? [];
};

/**
 * Obtener historial completo de mensajes entre el usuario autenticado y otro usuario
 */
export const getChatHistory = async (
  userId: number
): Promise<{ otro_usuario: ChatUser; mensajes: ChatMessage[] }> => {
  const res = await apiClient.get(`/mensajes/${userId}`);
  if (Array.isArray(res.data)) {
    return {
      otro_usuario: { id_usuario: userId, nombres: 'Usuario', correo: '' },
      mensajes: res.data,
    };
  }
  return {
    otro_usuario: res.data?.otro_usuario ?? { id_usuario: userId, nombres: 'Usuario', correo: '' },
    mensajes: res.data?.mensajes ?? [],
  };
};

/**
 * Enviar mensaje a un usuario
 */
export const sendMessage = async (
  userId: number,
  text: string,
  inmuebleId?: number
): Promise<ChatMessage> => {
  const res = await apiClient.post('/mensajes', {
    receptor_id: userId,
    contenido: text,
    id_inmueble: inmuebleId ?? null,
  });
  return res.data?.data ?? res.data?.mensaje ?? res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  if (!getAuthToken()) return 0;
  try {
    const res = await apiClient.get('/chats/unread-count');
    return res.data?.unread_count ?? res.data?.count ?? 0;
  } catch {
    return 0;
  }
};

export const chatService = {
  getConversations,
  getChatHistory,
  sendMessage,
  getUnreadCount,
};

/**
 * ─────────────────────────────────────────────────────────
 * Módulo de Favoritos (Estudiantes)
 * ─────────────────────────────────────────────────────────
 */
export const getFavorites = async (): Promise<any[]> => {
  const res = await apiClient.get('/estudiante/favoritos');
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return res.data?.data ?? [];
};

export const toggleFavorite = async (
  inmuebleId: number
): Promise<{ is_favorite: boolean; message: string }> => {
  const res = await apiClient.post('/estudiante/favoritos/toggle', {
    id_inmueble: inmuebleId,
  });
  return res.data;
};

/**
 * ─────────────────────────────────────────────────────────
 * Solicitudes de Reserva del Estudiante
 * ─────────────────────────────────────────────────────────
 */
export const getStudentRequests = async (): Promise<any[]> => {
  const res = await apiClient.get('/estudiante/solicitudes');
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return res.data?.data ?? [];
};

/**
 * ─────────────────────────────────────────────────────────
 * Notificaciones del Sistema
 * ─────────────────────────────────────────────────────────
 */
export interface SystemNotification {
  id_notificacion: number;
  id_usuario: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  datos?: any;
  leido_en: string | null;
  created_at: string;
}

export const getNotifications = async (): Promise<{ unread: number; data: SystemNotification[] }> => {
  try {
    const res = await apiClient.get('/mis-notificaciones');
    return {
      unread: res.data?.unread ?? 0,
      data: res.data?.data ?? (Array.isArray(res.data) ? res.data : []),
    };
  } catch {
    const res = await apiClient.get('/notificaciones');
    return {
      unread: res.data?.unread ?? 0,
      data: res.data?.data ?? (Array.isArray(res.data) ? res.data : []),
    };
  }
};

export const getMyNotifications = getNotifications;

export const markNotificationsRead = async (
  notificationId?: number
): Promise<{ status: string; message: string }> => {
  const payload = notificationId ? { id_notificacion: notificationId } : {};
  const res = await apiClient.patch('/notificaciones', payload);
  return res.data;
};

/**
 * ─────────────────────────────────────────────────────────
 * Notificaciones Push (Expo)
 * ─────────────────────────────────────────────────────────
 */



/**
 * ─────────────────────────────────────────────────────────
 * Sistema de Reportes / Denuncias
 * ─────────────────────────────────────────────────────────
 */
export interface ReportePayload {
  inmueble_id?: number | null;
  arrendador_id?: number | null;
  motivo: string;
  descripcion?: string;
}

export const enviarReporte = async (payload: ReportePayload): Promise<any> => {
  const res = await apiClient.post('/reportes', payload);
  return res.data;
};
/**
 * ─────────────────────────────────────────────────────────
 * Notificaciones Push
 * ─────────────────────────────────────────────────────────
 * Guarda o actualiza el Expo Push Token del usuario autenticado
 * en el backend (POST /api/v1/user/push-token).
 * Se llama desde el hook usePushNotifications una vez que el
 * usuario tiene sesión activa.
 */
export const registerExpoPushToken = async (token: string): Promise<void> => {
  if (!getAuthToken()) {
    console.warn('[registerExpoPushToken] Sin sesión activa, se omite el registro del token.');
    return;
  }
  try {
    await apiClient.post('/user/push-token', { expo_push_token: token });
    console.log('[registerExpoPushToken] Token registrado en backend.');
  } catch (err) {
    console.warn('[registerExpoPushToken] Error al registrar token push:', err);
  }
};

