import { apiRequest, setToken, clearToken, setStoredUser, getStoredUser } from './client';

export interface User {
  id_usuario: number;
  id_rol: number;
  nombres: string;
  correo: string;
  estado: string;
  rol?: {
    id_rol: number;
    nombre: string;
  };
  perfil?: {
    id_perfil: number;
    telefono?: string;
    foto_perfil_url?: string;
    ciudad_origen?: string;
    documento_verificado?: boolean;
  };
}

export interface Inmueble {
  id_inmueble: number;
  id_arrendador: number;
  titulo: string;
  descripcion: string;
  precio: number | string;
  tipo: 'cuarto' | 'mini_departamento' | 'departamento_compartido' | 'suite';
  estado: 'borrador' | 'publicado' | 'reservado' | 'inactivo';
  capacidad?: number;
  servicios_incluidos: boolean;
  ubicacion?: {
    id_ubicacion: number;
    latitud: number | string;
    longitud: number | string;
    direccion_referencial?: string;
    sector?: string;
    distancia_uleam_km?: number | string;
  };
  fotografias?: Array<{
    id_foto: number;
    url: string;
    orden: number;
    es_portada: boolean;
  }>;
  arrendador?: User;
}

export const authService = {
  async ping() {
    return apiRequest<{ status: string; app: string; version: string }>('/ping');
  },

  async getRoles() {
    return apiRequest<Array<{ id_rol: number; nombre: string }>>('/roles');
  },

  async login(correo: string, clave: string) {
    const res = await apiRequest<{ message: string; user: User; token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, clave }),
    });

    if (res.token) {
      setToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async register(data: { nombres: string; correo: string; clave: string; clave_confirmation: string; id_rol: number }) {
    const res = await apiRequest<{ message: string; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.token) {
      setToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      clearToken();
    }
  },

  async getMe() {
    const user = await apiRequest<User>('/auth/me');
    setStoredUser(user);
    return user;
  },

  getCurrentUser(): User | null {
    return getStoredUser();
  }
};

export const inmuebleService = {
  async getInmuebles(page = 1) {
    return apiRequest<{ data: Inmueble[]; total: number; current_page: number; last_page: number }>(`/inmuebles?page=${page}`);
  },

  async getInmueble(id: number) {
    return apiRequest<Inmueble>(`/inmuebles/${id}`);
  },

  async createInmueble(data: {
    titulo: string;
    descripcion?: string;
    precio: number;
    tipo: string;
    capacidad?: number;
    servicios_incluidos?: boolean;
  }) {
    return apiRequest<{ message: string; inmueble: Inmueble }>('/inmuebles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateInmueble(id: number, data: Partial<Inmueble>) {
    return apiRequest<{ message: string; inmueble: Inmueble }>(`/inmuebles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteInmueble(id: number) {
    return apiRequest<{ message: string }>(`/inmuebles/${id}`, {
      method: 'DELETE',
    });
  },
};

export const solicitudService = {
  async getSolicitudes() {
    return apiRequest<any>('/solicitudes');
  },

  async createSolicitud(data: { id_inmueble: number; fecha_ingreso_deseada?: string; mensaje?: string }) {
    return apiRequest<{ message: string; solicitud: any }>('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEstado(id: number, estado: 'aceptada' | 'rechazada' | 'cancelada') {
    return apiRequest<{ message: string; solicitud: any }>(`/solicitudes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }
};

export const mensajeService = {
  async getMensajes() {
    return apiRequest<any>('/mensajes');
  },

  async getHilo(idInmueble: number, idUsuario: number) {
    return apiRequest<any>(`/mensajes/hilo/${idInmueble}/${idUsuario}`);
  },

  async enviar(data: { id_destinatario: number; id_inmueble: number; contenido: string }) {
    return apiRequest<{ message: string; mensaje: any }>('/mensajes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const perfilService = {
  async getPerfil() {
    return apiRequest<any>('/perfil');
  },

  async updatePerfil(data: { telefono?: string; ciudad_origen?: string; biografia?: string }) {
    return apiRequest<{ message: string; perfil: any }>('/perfil', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};
