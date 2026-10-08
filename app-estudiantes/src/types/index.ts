import type { LandlordProperty } from '../../services/api';

export interface Inmueble {
  id_inmueble: number;
  id?: number;
  titulo: string;
  descripcion?: string;
  normas?: string;
  precio: number | string;
  precio_mensual?: number | string;
  tipo?: string;
  estado?: string;
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
  arrendador?: any;
  id_arrendador?: number;
  servicios?: Array<{
    id_servicio?: number;
    clave?: string;
    nombre?: string;
    icono?: string;
  }> | string[];
}

export type Property = Inmueble;

export * from '../../services/api';
