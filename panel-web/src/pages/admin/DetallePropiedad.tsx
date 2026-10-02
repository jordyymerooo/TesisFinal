import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInmueble } from '../../services/api';
import { ArrowLeft, MapPin, Building2, User, Loader2, DollarSign } from 'lucide-react';

const WINE = '#8C1515';

export default function DetallePropiedad() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [inmueble, setInmueble] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        if (!id) return;
        const data = await getInmueble(id);
        setInmueble(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Error al cargar la propiedad.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetalles();
  }, [id]);

  return (
    <div style={{ padding: '24px 32px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          color: '#4B5563',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#6B7280' }}>
          <Loader2 size={32} className="animate-spin" color={WINE} />
        </div>
      ) : error ? (
        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: 16, borderRadius: 8, textAlign: 'center' }}>
          {error}
        </div>
      ) : inmueble ? (
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* Imágenes */}
            <div style={{ flex: '1 1 300px' }}>
              {inmueble.fotografias && inmueble.fotografias.length > 0 ? (
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                  {inmueble.fotografias.map((foto: any, idx: number) => (
                    <img 
                      key={foto.id_fotografia || idx} 
                      src={foto.url} 
                      alt="Propiedad" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E7EB' }} 
                    />
                  ))}
                </div>
              ) : (
                <div style={{ height: 200, background: '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                  Sin fotografías
                </div>
              )}
            </div>

            {/* Detalles */}
            <div style={{ flex: '2 1 400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 style={{ margin: '0 0 12px 0', fontSize: 24, fontWeight: 800, color: '#111827' }}>
                  {inmueble.titulo}
                </h1>
                <span style={{ background: '#ECFDF5', color: '#047857', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 700 }}>
                  {inmueble.estado}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563', fontSize: 14 }}>
                  <MapPin size={16} /> {inmueble.ubicacion?.direccion_referencial || 'Dirección no especificada'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563', fontSize: 14 }}>
                  <Building2 size={16} /> {inmueble.tipo?.replace('_', ' ')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#111827', fontSize: 16, fontWeight: 700 }}>
                  <DollarSign size={16} color={WINE} /> {inmueble.precio}
                </span>
              </div>

              <h3 style={{ margin: '24px 0 8px 0', fontSize: 14, color: '#374151', fontWeight: 700 }}>Descripción</h3>
              <p style={{ margin: 0, color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
                {inmueble.descripcion || 'Sin descripción detallada.'}
              </p>

              <div style={{ marginTop: 24, padding: 16, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 13, color: '#4B5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Datos del Arrendador
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    <User size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                      {inmueble.arrendador?.nombres || 'Desconocido'}
                    </p>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>
                      {inmueble.arrendador?.correo || `ID: ${inmueble.id_arrendador}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
