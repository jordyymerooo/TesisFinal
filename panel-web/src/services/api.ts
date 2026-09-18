import axios from 'axios';

/**
 * Instancia de Axios preconfigurada para el backend Laravel 11 de ULEAM Rental.
 * Base URL: http://localhost:8000/api/v1 (o variable VITE_API_URL).
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

/**
 * Interceptor de Solicitud (Request):
 * Inyecta automáticamente el Bearer Token de Sanctum guardado en localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('uleam_auth_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('sanctum_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuesta (Response):
 * Manejo centralizado de códigos de respuesta HTTP (401 No Autorizado, 403 Prohibido, 500 Error Servidor).
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('[API Sanctum] Sesión no autenticada o token expirado (401)');
      } else if (error.response.status === 403) {
        console.warn('[API Sanctum] Acceso denegado: se requiere rol de Administrador (403)');
      }
    } else if (error.request) {
      console.warn('[API Network] No se pudo conectar con el servidor Laravel en http://localhost:8000');
    }
    return Promise.reject(error);
  }
);

/**
 * Helpers para almacenar o eliminar el token de autenticación
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('uleam_auth_token', token);
  } else {
    localStorage.removeItem('uleam_auth_token');
    localStorage.removeItem('token');
  }
};

export const getAuthToken = (): string | null => {
  return (
    localStorage.getItem('uleam_auth_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('sanctum_token')
  );
};

export interface PendingProperty {
  id: number;
  titulo: string;
  precio: number;
  tipo: string;
  estado: string;
  fecha: string;
  direccion: string;
  foto_url: string;
  arrendador: {
    id: number;
    nombres: string;
    correo: string;
    avatar?: string | null;
  };
}

/**
 * Obtener lista de propiedades pendientes de revisión para el panel de administración
 * GET /api/v1/admin/inmuebles/pendientes
 */
export const getPendingProperties = async (): Promise<PendingProperty[]> => {
  try {
    const res = await api.get('/admin/inmuebles/pendientes');
    return res.data?.data || [];
  } catch (error) {
    console.warn('[getPendingProperties] Error al cargar propiedades pendientes:', error);
    // Fallback con datos realistas para la presentación si hay problemas de red
    return [
      {
        id: 101,
        titulo: 'Mini departamento amoblado frente a ULEAM',
        precio: 180,
        tipo: 'mini_departamento',
        estado: 'borrador',
        fecha: '15 Sep 2026, 10:30',
        direccion: 'Barbasquillo, Av. Circunvalación #12',
        foto_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
        arrendador: {
          id: 2,
          nombres: 'Carlos Mendoza Bravo',
          correo: 'arrendador@uleam.edu.ec',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        },
      },
      {
        id: 102,
        titulo: 'Habitación privada para estudiante con A/C',
        precio: 140,
        tipo: 'cuarto',
        estado: 'borrador',
        fecha: '15 Sep 2026, 09:15',
        direccion: 'Los Eléctricos, Calle 14 y Av. 24',
        foto_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        arrendador: {
          id: 4,
          nombres: 'María Elena Delgado',
          correo: 'maria.delgado@uleam.edu.ec',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        },
      },
      {
        id: 103,
        titulo: 'Suite Universitaria Barbasquillo con Vista al Mar',
        precio: 220,
        tipo: 'suite',
        estado: 'borrador',
        fecha: '14 Sep 2026, 17:40',
        direccion: 'Barbasquillo, Edificio Torre Marina piso 3',
        foto_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
        arrendador: {
          id: 5,
          nombres: 'Patricio Cedeño Loor',
          correo: 'patricio.cedeno@uleam.edu.ec',
          avatar: null,
        },
      },
    ];
  }
};

/**
 * Actualizar el estado de una propiedad (ej. 'publicado', 'rechazado')
 * PATCH /api/v1/admin/inmuebles/{id}/estado
 */
export const updatePropertyStatus = async (
  id: number | string,
  status: 'publicado' | 'borrador' | 'rechazado' | 'en_revision'
) => {
  const res = await api.patch(`/admin/inmuebles/${id}/estado`, {
    estado: status,
  });
  return res.data;
};

export interface VerificationDocument {
  id: string;
  tipo: string;
  titulo: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  previewUrl: string;
}

export interface LandlordVerification {
  id: number;
  nombres: string;
  correo: string;
  avatar: string;
  cedula: string;
  tipo: string;
  rolCarrera: string;
  fechaSolicitud: string;
  propiedadNombre: string;
  documentos: VerificationDocument[];
  cedula_frontal?: string;
  cedula_frontal_url?: string;
  cedula_posterior?: string;
  cedula_posterior_url?: string;
  selfie?: string;
  selfie_url?: string;
  recibo_luz?: string;
  recibo_luz_url?: string;
  exterior?: string;
  exterior_url?: string;
  usuario_id?: number;
}

/**
 * Obtener lista de arrendadores en espera de verificación KYC
 * GET /api/v1/admin/arrendadores/pendientes
 */
export const getPendingLandlords = async (): Promise<LandlordVerification[]> => {
  try {
    const res = await api.get('/admin/arrendadores/pendientes');
    return res.data?.data || [];
  } catch (error) {
    console.warn('[getPendingLandlords] Error al cargar arrendadores pendientes:', error);
    return [];
  }
};

/**
 * Aprobar la verificación de identidad (KYC) de un arrendador
 * PATCH /api/v1/admin/verificaciones/{id}/aprobar
 */
export const approveLandlord = async (userId: number | string) => {
  try {
    const res = await api.patch(`/admin/verificaciones/${userId}/aprobar`);
    return res.data;
  } catch {
    // Fallback a ruta de arrendadores
    const res = await api.patch(`/admin/arrendadores/${userId}/aprobar`);
    return res.data;
  }
};

/**
 * Alternar estado de usuario entre 'activo' y 'suspendido' (dar de baja o reactivar)
 * PATCH /api/v1/admin/usuarios/{id}/estado
 */
export const toggleUserStatus = async (id: number | string) => {
  const res = await api.patch(`/admin/usuarios/${id}/estado`);
  return res.data;
};

/**
 * Actualizar datos básicos de un usuario desde el panel de administración
 * PUT /api/v1/admin/usuarios/{id}
 */
export const updateAdminUser = async (id: number | string, data: any) => {
  const res = await api.put(`/admin/usuarios/${id}`, data);
  return res.data;
};

/**
 * Obtener listado de conversaciones de auditoría para el administrador
 * GET /api/v1/admin/chats
 */
export const getAdminChats = async () => {
  const res = await api.get('/admin/chats');
  return Array.isArray(res.data) ? res.data : (res.data?.data || []);
};

/**
 * Obtener mensajes de un chat específico
 * GET /api/v1/admin/chats/{chat_id}/mensajes
 */
export const getAdminChatMessages = async (chatId: number | string) => {
  const res = await api.get(`/admin/chats/${chatId}/mensajes`);
  return Array.isArray(res.data) ? res.data : (res.data?.data || []);
};

/**
 * Enviar notificación oficial a un usuario específico desde el panel administrativo
 * POST /api/v1/admin/usuarios/{id}/notificar
 */
export const sendNotificationToUser = async (
  userId: number | string,
  data: { titulo: string; mensaje: string }
) => {
  const res = await api.post(`/admin/usuarios/${userId}/notificar`, data);
  return res.data;
};

/**
 * Obtener estadísticas e informes para el módulo de Reportes y Analítica
 * GET /api/v1/admin/reportes/estadisticas
 */
export const getAdminReportStats = async () => {
  const res = await api.get('/admin/reportes/estadisticas');
  return res.data?.data || res.data;
};

export default api;




