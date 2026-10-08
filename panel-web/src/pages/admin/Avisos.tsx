import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Megaphone,
  Send,
  Loader2,
  CheckCircle2,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  AlertCircle,
  Sparkles,
  Search,
  Target,
  ShieldCheck,
} from 'lucide-react';

const WINE = '#8C1515';

type DestinatarioTipo = 'todos_verificados' | 'estudiantes_verificados' | 'arrendadores_verificados' | 'especificos';

interface UsuarioVerificado {
  id_usuario: number;
  nombres: string;
  apellidos?: string;
  email: string;
  id_rol: number;
}

interface ComunicadoItem {
  id_comunicado: number;
  titulo: string;
  mensaje: string;
  destinatarios: DestinatarioTipo | string;
  usuarios_ids?: number[] | null;
  usuarios_especificos?: { id_usuario: number; nombres: string; correo: string }[];
  created_at: string;
  admin?: {
    id_usuario: number;
    nombres: string;
    correo?: string;
  };
}

export function Avisos() {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [destinatarios, setDestinatarios] = useState<DestinatarioTipo>('todos_verificados');
  const [usuariosVerificados, setUsuariosVerificados] = useState<UsuarioVerificado[]>([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtrado en tiempo real por nombres, apellidos o correo
  const usuariosFiltrados = usuariosVerificados.filter((user) =>
    (user.nombres || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.apellidos || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Historial de comunicados
  const [comunicados, setComunicados] = useState<ComunicadoItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);

  // Paginación del historial
  const avisosPorPagina = 5;
  const indiceUltimoAviso = paginaActual * avisosPorPagina;
  const indicePrimerAviso = indiceUltimoAviso - avisosPorPagina;
  const avisosPaginados = comunicados.slice(indicePrimerAviso, indiceUltimoAviso);
  const totalPaginas = Math.ceil(comunicados.length / avisosPorPagina);

  // Cargar usuarios verificados al montar
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await api.get('/admin/usuarios-verificados');
        if (res.data?.data) {
          setUsuariosVerificados(res.data.data);
        }
      } catch (err) {
        console.warn('[Avisos] Error al cargar usuarios verificados:', err);
      }
    };
    fetchUsuarios();
  }, []);

  const fetchComunicados = async () => {
    try {
      const res = await api.get('/admin/comunicados');
      if (res.data?.data) {
        setComunicados(res.data.data);
      } else if (Array.isArray(res.data)) {
        setComunicados(res.data);
      }
    } catch (err) {
      console.warn('[Avisos] Error cargando historial:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchComunicados();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !mensaje.trim()) {
      setAlert({ type: 'error', message: 'Por favor completa el título y el mensaje del comunicado.' });
      return;
    }

    if (destinatarios === 'especificos' && usuariosSeleccionados.length === 0) {
      setAlert({ type: 'error', message: 'Debes seleccionar al menos un usuario destinatario.' });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const res = await api.post('/admin/comunicados', {
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
        destinatarios,
        usuarios_ids: destinatarios === 'especificos' ? usuariosSeleccionados : [],
      });

      if (res.data?.success || res.status === 201 || res.status === 200) {
        // Limpiar formulario y búsqueda
        setTitulo('');
        setMensaje('');
        setDestinatarios('todos_verificados');
        setUsuariosSeleccionados([]);
        setSearchTerm('');
        setAlert({
          type: 'success',
          message: res.data?.message || '¡Comunicado oficial enviado exitosamente a la app móvil!',
        });

        // Refrescar el historial y volver a la primera página
        fetchComunicados();
        setPaginaActual(1);

        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error: any) {
      console.error('[Avisos] Error al enviar:', error);
      const msg = error.response?.data?.message || 'Ocurrió un error al enviar el comunicado.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDestinatarioBadge = (tipo: string) => {
    switch (tipo) {
      case 'todos_verificados':
      case 'usuarios_verificados':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <Users size={13} className="text-emerald-600" />
            ✅ Todos Verificados
          </span>
        );
      case 'estudiantes_verificados':
      case 'estudiantes':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap size={13} />
            ✅ Estudiantes Verificados
          </span>
        );
      case 'arrendadores_verificados':
      case 'arrendadores':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Building2 size={13} className="text-amber-600" />
            ✅ Arrendadores Verificados
          </span>
        );
      case 'especificos':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Users size={13} />
            🎯 Usuarios Específicos
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <Users size={13} />
            {tipo}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
            <Megaphone size={24} color={WINE} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight m-0">
              Comunicados Oficiales
            </h1>
            <p className="text-sm text-gray-500 font-medium m-0 mt-1">
              Publica anuncios oficiales para usuarios verificados o destinatarios específicos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
          <Sparkles size={14} className="text-amber-500" />
          <span>Canal Oficial ULEAM Rental</span>
        </div>
      </div>

      {/* ── Alertas de Éxito / Error ── */}
      {alert && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      {/* ── Formulario de Envío ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-base font-bold text-gray-900 m-0">Redactar Nuevo Comunicado</h2>
          <p className="text-xs text-gray-500 mt-1 m-0">
            Define el título, la audiencia destinataria verificada y el mensaje oficial.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Título del Comunicado <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={255}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Mantenimiento programado de la plataforma estudiantil"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Selector de Destinatarios */}
            <div>
              <label htmlFor="destinatarios" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Destinatarios <span className="text-red-600">*</span>
              </label>
              <select
                id="destinatarios"
                value={destinatarios}
                onChange={(e) => {
                  setDestinatarios(e.target.value as any);
                  if (e.target.value !== 'especificos') {
                    setUsuariosSeleccionados([]);
                    setSearchTerm('');
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200 text-sm font-semibold cursor-pointer"
              >
                <option value="todos_verificados">✅ Todos los Usuarios (Solo Verificados)</option>
                <option value="estudiantes_verificados">✅ Solo Estudiantes Verificados</option>
                <option value="arrendadores_verificados">✅ Solo Arrendadores Verificados</option>
                <option value="especificos">🎯 Usuarios Específicos...</option>
              </select>
            </div>
          </div>

          {/* Panel de Selección Múltiple Condicional con Búsqueda Integrada */}
          {destinatarios === 'especificos' && (
            <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 w-full shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-bold text-gray-800 m-0">Selecciona los destinatarios</p>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">{usuariosSeleccionados.length} usuario(s) seleccionado(s)</p>
                </div>

                {/* Barra de Búsqueda */}
                <div className="relative w-full sm:w-72">
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o correo..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors bg-white"
                  />
                  <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              {/* Lista de Usuarios Expandida en Grid de 2 Columnas */}
              <div className="max-h-64 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((user) => (
                    <label key={user.id_usuario} className="flex items-start gap-3 p-3 bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50/30 rounded-lg cursor-pointer transition-all shadow-sm">
                      <input 
                        type="checkbox" 
                        value={user.id_usuario}
                        checked={usuariosSeleccionados.includes(user.id_usuario)}
                        onChange={(e) => {
                          if (e.target.checked) setUsuariosSeleccionados([...usuariosSeleccionados, user.id_usuario]);
                          else setUsuariosSeleccionados(usuariosSeleccionados.filter((id) => id !== user.id_usuario));
                        }}
                        className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600 cursor-pointer"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-gray-700 truncate">{user.nombres} {user.apellidos || ''}</span>
                        <span className="text-xs text-gray-500 truncate">{user.email}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic col-span-full text-center py-6 bg-white rounded-lg border border-dashed border-gray-300 m-0">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mensaje Amplio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mensaje Oficial <span className="text-red-600">*</span>
              </label>
              <span className="text-xs font-medium text-gray-400">
                {mensaje.length} caracteres
              </span>
            </div>
            <textarea
              required
              rows={6}
              style={{ resize: 'none' }}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe detalladamente la información del comunicado oficial..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Barra de Envío */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100 bg-white">
            <span className="text-xs text-gray-400">
              * Se enviará notificación push automática a los dispositivos vinculados.
            </span>

            <button
              type="submit"
              disabled={!titulo.trim() || !mensaje.trim() || isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-red-800 text-white font-bold text-sm rounded-xl hover:bg-red-900 transition-all duration-200 shadow-md shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 border-0 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Enviando Comunicado...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar Comunicado</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Historial de Comunicados Emitidos ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900 m-0">Historial de Comunicados</h2>
            <p className="text-xs text-gray-500 mt-1 m-0">Registro cronológico de anuncios emitidos.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600">
            {comunicados.length} emitidos
          </span>
        </div>

        {loadingHistory ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-red-700" />
            <span className="text-sm">Cargando comunicados...</span>
          </div>
        ) : comunicados.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Megaphone size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium m-0">Aún no se han emitido comunicados oficiales.</p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50/50">
            {avisosPaginados.map((aviso) => (
              <div key={aviso.id_comunicado} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow mb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <Megaphone size={18} className="text-red-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 m-0">{aviso.titulo}</h4>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 flex items-center gap-1 w-max">
                          <Target size={12} />
                          {aviso.destinatarios === 'especificos'
                            ? `Específicos (${aviso.usuarios_especificos?.length ?? aviso.usuarios_ids?.length ?? 0})`
                            : String(aviso.destinatarios).replace(/_/g, ' ').toUpperCase()}
                        </span>

                        {aviso.destinatarios === 'especificos' &&
                          aviso.usuarios_especificos &&
                          aviso.usuarios_especificos.length > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
                              <span className="font-semibold text-gray-700">Enviado a:</span>{' '}
                              {aviso.usuarios_especificos.map((u) => u.nombres).join(', ')}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(aviso.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-3 pl-12 whitespace-pre-line m-0">{aviso.mensaje}</p>
                <div className="mt-3 pl-12 flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck size={14} className="text-green-600" />
                  Emitido por: <span className="font-semibold">{aviso.admin?.nombres || 'Administrador'}</span>
                </div>
              </div>
            ))}

            {/* Controles de paginación */}
            {comunicados.length > 0 && (
              <div className="flex items-center justify-end px-6 py-4 bg-white border-t border-gray-100 rounded-b-xl mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Anterior
                  </button>
                  <div className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg border border-gray-100">
                    {paginaActual} / {totalPaginas || 1}
                  </div>
                  <button
                    onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas || totalPaginas === 0}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Avisos;
