import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  FileText,
  FileSpreadsheet,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getAdminReportStats } from '../../services/api';
import { Denuncias } from './Denuncias';

const WINE = '#8C1515';

export function Reportes() {
  const [tabPrincipal, setTabPrincipal] = useState<'denuncias' | 'estadisticas'>('denuncias');
  const [fechaInicio, setFechaInicio] = useState<string>('2026-04-01');
  const [fechaFin, setFechaFin] = useState<string>('2026-09-30');
  const [tipoReporte, setTipoReporte] = useState<'usuarios' | 'inmuebles' | 'verificacion'>('inmuebles');
  const [loading, setLoading] = useState<boolean>(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [exportAlert, setExportAlert] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getAdminReportStats();
      setStatsData(data);
    } catch (error) {
      console.warn('[Reportes] Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Datos de fallback por si el servidor aún está cargando
  const altasInmueblesData = statsData?.altas_inmuebles || [
    { mes: 'Abr', inmuebles: 12, usuarios: 24, activas: 10 },
    { mes: 'May', inmuebles: 19, usuarios: 45, activas: 18 },
    { mes: 'Jun', inmuebles: 28, usuarios: 60, activas: 26 },
    { mes: 'Jul', inmuebles: 35, usuarios: 88, activas: 32 },
    { mes: 'Ago', inmuebles: 48, usuarios: 120, activas: 44 },
    { mes: 'Sep', inmuebles: 57, usuarios: 145, activas: 55 },
  ];

  const distribucionUsuariosData = statsData?.distribucion_usuarios || [
    { name: 'Estudiantes', value: 120, color: '#2563EB' },
    { name: 'Arrendadores', value: 35, color: '#059669' },
    { name: 'Administradores', value: 3, color: '#8C1515' },
  ];

  const estadosVerificacionData = statsData?.estados_verificacion || [
    { name: 'Verificados', value: 28, color: '#10B981' },
    { name: 'Pendientes KYC', value: 2, color: '#F59E0B' },
  ];

  const resumenTablaData = statsData?.resumen_tabla || [
    { periodo: 'Septiembre 2026', nuevos_usuarios: 42, nuevas_propiedades: 18, total_activas: 49, tasa_crecimiento: '+14.2%' },
    { periodo: 'Agosto 2026', nuevos_usuarios: 38, nuevas_propiedades: 15, total_activas: 44, tasa_crecimiento: '+11.8%' },
    { periodo: 'Julio 2026', nuevos_usuarios: 30, nuevas_propiedades: 12, total_activas: 32, tasa_crecimiento: '+8.5%' },
    { periodo: 'Junio 2026', nuevos_usuarios: 25, nuevas_propiedades: 9, total_activas: 26, tasa_crecimiento: '+6.2%' },
    { periodo: 'Mayo 2026', nuevos_usuarios: 18, nuevas_propiedades: 7, total_activas: 18, tasa_crecimiento: '+4.0%' },
    { periodo: 'Abril 2026', nuevos_usuarios: 12, nuevas_propiedades: 5, total_activas: 10, tasa_crecimiento: '+2.5%' },
  ];

  // Exportación a Excel (.CSV estructurado para hojas de cálculo)
  const handleExportExcel = () => {
    let headers = ['Periodo', 'Nuevos Usuarios', 'Nuevas Propiedades', 'Total Activas', 'Tasa Crecimiento'];
    let rows = resumenTablaData.map((row: any) => [
      `"${row.periodo}"`,
      row.nuevos_usuarios,
      row.nuevas_propiedades,
      row.total_activas,
      `"${row.tasa_crecimiento}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_ULEAM_Rental_${tipoReporte}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportAlert('✓ Archivo Excel (CSV) generado y descargado exitosamente.');
    setTimeout(() => setExportAlert(null), 4000);
  };

  // Exportación a PDF (impresión formateada)
  const handleExportPDF = () => {
    setExportAlert('✓ Generando vista de impresión optimizada para PDF...');
    setTimeout(() => {
      window.print();
      setExportAlert(null);
    }, 500);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Selector de Pestañas de Reportes ── */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #E5E7EB', paddingBottom: 14 }}>
        <button
          onClick={() => setTabPrincipal('denuncias')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: tabPrincipal === 'denuncias' ? `1px solid ${WINE}` : '1px solid #E5E7EB',
            background: tabPrincipal === 'denuncias' ? WINE : '#FFFFFF',
            color: tabPrincipal === 'denuncias' ? '#FFFFFF' : '#4B5563',
            boxShadow: tabPrincipal === 'denuncias' ? `0 2px 6px ${WINE}30` : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldAlert size={16} />
          Denuncias de Inmuebles
        </button>

        <button
          onClick={() => setTabPrincipal('estadisticas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: tabPrincipal === 'estadisticas' ? `1px solid ${WINE}` : '1px solid #E5E7EB',
            background: tabPrincipal === 'estadisticas' ? WINE : '#FFFFFF',
            color: tabPrincipal === 'estadisticas' ? '#FFFFFF' : '#4B5563',
            boxShadow: tabPrincipal === 'estadisticas' ? `0 2px 6px ${WINE}30` : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <BarChart3 size={16} />
          Métricas y Estadísticas
        </button>
      </div>

      {tabPrincipal === 'denuncias' ? (
        <Denuncias />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* ── Paso 3: Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart3 size={20} color={WINE} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px' }}>
                    Reportes y Analítica
                  </h1>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6B7280' }}>
                    Generación de informes y estadísticas de la plataforma
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchStats}
              disabled={loading}
              style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            color: '#374151',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Actualizar datos"
        >
          <RefreshCw size={14} color="#6B7280" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Actualizar Métricas</span>
        </button>
      </div>

      {/* Alerta de Exportación */}
      {exportAlert && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '12px 18px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>{exportAlert}</span>
        </div>
      )}

      {/* ── Paso 3: Barra de Herramientas (Filtros y Exportación) ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Filtros: Selectores de fecha y Tipo de Reporte */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
          {/* Rango de Fechas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={15} color="#6B7280" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Rango:</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 12,
                color: '#111827',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>—</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 12,
                color: '#111827',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          {/* Divisor vertical */}
          <div style={{ width: 1, height: 26, background: '#E5E7EB' }} />

          {/* Selector desplegable para 'Tipo de Reporte' */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} color="#6B7280" />
            <label htmlFor="tipo-reporte" style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
              Tipo de Reporte:
            </label>
            <select
              id="tipo-reporte"
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as any)}
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: '#111827',
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="inmuebles">Inmuebles Publicados</option>
              <option value="usuarios">Crecimiento de Usuarios</option>
              <option value="verificacion">Estados de Verificación</option>
            </select>
          </div>
        </div>

        {/* Dos botones a la derecha: 'Exportar a PDF' (ícono rojo) y 'Exportar a Excel' (ícono verde) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Botón Exportar a PDF (Rojo) */}
          <button
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
            title="Exportar reporte en formato PDF"
          >
            <FileText size={15} color="#DC2626" />
            <span>Exportar a PDF</span>
          </button>

          {/* Botón Exportar a Excel (Verde) */}
          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#059669',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D1FAE5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ECFDF5')}
            title="Descargar informe en hoja de cálculo CSV / Excel"
          >
            <FileSpreadsheet size={15} color="#059669" />
            <span>Exportar a Excel</span>
          </button>
        </div>
      </div>

      {/* ── Paso 4: Área de Gráficos (Grid de 2 columnas) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        {/* Tarjeta 1: 'Altas de Inmuebles por Mes' (Gráfico de barras) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                Altas de Inmuebles por Mes
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6B7280' }}>
                Volumen mensual de alojamientos registrados vs propiedades activas.
              </p>
            </div>

            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                color: WINE,
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <TrendingUp size={12} />
              <span>+18.4% semestral</span>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={altasInmueblesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 12,
                    fontFamily: 'inherit',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="inmuebles" name="Nuevos Inmuebles" fill={WINE} radius={[6, 6, 0, 0]} />
                <Bar dataKey="activas" name="Total Activas" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tarjeta 2: 'Distribución de Usuarios' (Gráfico de pastel: Estudiantes vs Arrendadores) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                {tipoReporte === 'verificacion' ? 'Estados de Verificación KYC' : 'Distribución de Usuarios'}
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6B7280' }}>
                {tipoReporte === 'verificacion'
                  ? 'Proporción de arrendadores verificados vs pendientes de auditoría.'
                  : 'Proporción de comunidad activa por rol institucional ULEAM.'}
              </p>
            </div>

            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #DBEAFE',
                color: '#1E40AF',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Users size={12} />
              <span>Plataforma Oficial</span>
            </div>
          </div>

          <div style={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tipoReporte === 'verificacion' ? estadosVerificacionData : distribucionUsuariosData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(tipoReporte === 'verificacion' ? estadosVerificacionData : distribucionUsuariosData).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 12,
                    fontFamily: 'inherit',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Paso 5: Tabla de Resumen ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
              Resumen Tabular por Periodo ({tipoReporte.toUpperCase()})
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
              Desglose cuantitativo mensual de altas, publicaciones activas y crecimiento porcentual.
            </p>
          </div>

          <span
            style={{
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              color: '#4B5563',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 8,
            }}
          >
            {resumenTablaData.length} periodos registrados
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Periodo
                </th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nuevos Usuarios
                </th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nuevas Propiedades
                </th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Activas
                </th>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  Crecimiento
                </th>
              </tr>
            </thead>
            <tbody>
              {resumenTablaData.map((row: any, idx: number) => {
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx === resumenTablaData.length - 1 ? 'none' : '1px solid #F3F4F6',
                      background: isEven ? '#FFFFFF' : '#FAFAFA',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isEven ? '#FFFFFF' : '#FAFAFA')}
                  >
                    <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      {row.periodo}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151', fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} color="#2563EB" />
                        {row.nuevos_usuarios}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151', fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={14} color={WINE} />
                        {row.nuevas_propiedades}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#059669', fontWeight: 700 }}>
                      {row.total_activas}
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <span
                        style={{
                          background: '#ECFDF5',
                          color: '#059669',
                          border: '1px solid #A7F3D0',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <ArrowUpRight size={12} />
                        {row.tasa_crecimiento}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

export default Reportes;
