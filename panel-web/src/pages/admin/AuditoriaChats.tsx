import React, { useState, useEffect, useRef } from 'react';
import api, { getAdminChats, getAdminChatMessages } from '../../services/api';
import {
  MessageSquare,
  ShieldCheck,
  Building2,
  User,
  Search,
  RefreshCw,
  Clock,
  CheckCheck,
  AlertCircle,
  FileText,
  Lock,
  ChevronRight,
  GraduationCap,
  Home,
  MessageCircle,
} from 'lucide-react';

const WINE = '#8C1515';

export interface ChatUser {
  id_usuario: number;
  id_rol: number;
  nombres: string;
  correo: string;
  estado?: string;
  perfil?: {
    telefono?: string;
    foto_perfil_url?: string;
    ciudad_origen?: string;
    carrera?: string;
  };
}

export interface InmueblePreview {
  id_inmueble: number;
  titulo: string;
  precio?: string | number;
  tipo?: string;
  estado?: string;
}

export interface ChatItem {
  id: number;
  id_estudiante: number;
  id_arrendador: number;
  id_inmueble?: number;
  ultimo_mensaje_texto?: string;
  ultimo_mensaje_at?: string;
  created_at?: string;
  updated_at?: string;
  estudiante?: ChatUser;
  arrendador?: ChatUser;
  inmueble?: InmueblePreview;
}

export interface ChatMessage {
  id: number;
  id_mensaje?: number;
  sender_id: number;
  receiver_id: number;
  id_remitente?: number;
  id_destinatario?: number;
  contenido: string;
  leido?: boolean;
  fecha?: string;
  created_at?: string;
  remitente?: ChatUser;
  destinatario?: ChatUser;
}

export function AuditoriaChats() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [chatSeleccionado, setChatSeleccionado] = useState<ChatItem | null>(null);
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [loadingMensajes, setLoadingMensajes] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar lista de conversaciones
  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const data = await getAdminChats();
      setChats(data);
      // Si no hay chat seleccionado y hay al menos uno, seleccionamos el primero opcionalmente
      if (!chatSeleccionado && data.length > 0) {
        handleSelectChat(data[0]);
      }
    } catch (error) {
      console.warn('[AuditoriaChats] Error al cargar chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Seleccionar chat y cargar su historial de mensajes
  const handleSelectChat = async (chat: ChatItem) => {
    setChatSeleccionado(chat);
    setLoadingMensajes(true);
    try {
      const msgs = await getAdminChatMessages(chat.id);
      setMensajes(msgs);
    } catch (error) {
      console.warn('[AuditoriaChats] Error al cargar mensajes del chat:', error);
      setMensajes([]);
    } finally {
      setLoadingMensajes(false);
    }
  };

  // Scroll al final del historial cuando se cargan mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Filtrado de chats por nombre de estudiante, arrendador o propiedad
  const chatsFiltrados = chats.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const estName = c.estudiante?.nombres?.toLowerCase() || '';
    const arrName = c.arrendador?.nombres?.toLowerCase() || '';
    const propTitle = c.inmueble?.titulo?.toLowerCase() || '';
    const lastMsg = c.ultimo_mensaje_texto?.toLowerCase() || '';
    return (
      estName.includes(query) ||
      arrName.includes(query) ||
      propTitle.includes(query) ||
      lastMsg.includes(query)
    );
  });

  const formatearFecha = (fechaStr?: string) => {
    if (!fechaStr) return '';
    try {
      const date = new Date(fechaStr);
      return date.toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* ── Encabezado de la Sección ── */}
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} color={WINE} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                Auditoría de Mensajes
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6B7280' }}>
                Supervisión institucional de comunicaciones entre estudiantes y arrendadores para seguridad y resolución de quejas.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1E40AF',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Lock size={14} />
            <span>Modo Solo Lectura</span>
          </div>

          <button
            onClick={fetchChats}
            disabled={loadingChats}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              padding: '7px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              color: '#374151',
              cursor: loadingChats ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Refrescar conversaciones"
          >
            <RefreshCw size={14} color="#6B7280" style={{ animation: loadingChats ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {/* ── Layout Dividido (Tipo WhatsApp Web / 30% - 70%) ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* ── COLUMNA IZQUIERDA (30% - 35%): Lista de Conversaciones ── */}
        <div
          style={{
            width: '32%',
            minWidth: 320,
            maxWidth: 420,
            borderRight: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            background: '#FAFAFA',
          }}
        >
          {/* Barra de Búsqueda de Conversaciones */}
          <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#F3F4F6',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
              }}
            >
              <Search size={15} color="#9CA3AF" />
              <input
                type="text"
                placeholder="Buscar por estudiante, arrendador o inmueble..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 12,
                  color: '#111827',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Conversaciones ({chatsFiltrados.length})
              </span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Registro institucional</span>
            </div>
          </div>

          {/* Lista de Chats (Scrollable) */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingChats ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                <RefreshCw size={24} color={WINE} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                <span>Cargando conversaciones...</span>
              </div>
            ) : chatsFiltrados.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                <MessageCircle size={36} color="#D1D5DB" style={{ margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontWeight: 600, color: '#6B7280' }}>No se encontraron conversaciones</p>
                <span style={{ fontSize: 11 }}>No hay mensajes que coincidan con la búsqueda.</span>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {chatsFiltrados.map((chat) => {
                  const isSelected = chatSeleccionado?.id === chat.id;
                  const estudianteNombre = chat.estudiante?.nombres || 'Estudiante ULEAM';
                  const arrendadorNombre = chat.arrendador?.nombres || 'Arrendador';
                  const propiedadNombre = chat.inmueble?.titulo || 'Alojamiento Manta';

                  return (
                    <li
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid #F3F4F6',
                        cursor: 'pointer',
                        background: isSelected ? '#FDF2F2' : '#FFFFFF',
                        borderLeft: isSelected ? `4px solid ${WINE}` : '4px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                    >
                      {/* Cabecera del Item: Participantes */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ flex: 1, marginRight: 8 }}>
                          {/* Formato: Jordy Zambrano (Estudiante) vs Carlos Mendoza (Arrendador) */}
                          <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? WINE : '#111827', lineHeight: '18px' }}>
                            <span>{estudianteNombre}</span>
                            <span style={{ fontSize: 10, color: '#2563EB', background: '#EFF6FF', padding: '1px 5px', borderRadius: 6, marginLeft: 4, fontWeight: 800 }}>
                              Estudiante
                            </span>
                            <span style={{ margin: '0 5px', color: '#9CA3AF', fontSize: 11, fontWeight: 500 }}>vs</span>
                            <span>{arrendadorNombre}</span>
                            <span style={{ fontSize: 10, color: '#166534', background: '#F0FDF4', padding: '1px 5px', borderRadius: 6, marginLeft: 4, fontWeight: 800 }}>
                              Arrendador
                            </span>
                          </div>
                        </div>

                        {chat.ultimo_mensaje_at && (
                          <span style={{ fontSize: 10, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                            {new Date(chat.ultimo_mensaje_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {/* Inmueble Vinculado */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, fontSize: 11, color: '#4B5563' }}>
                        <Building2 size={13} color="#9CA3AF" />
                        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {propiedadNombre}
                        </span>
                      </div>

                      {/* Último Mensaje Snippet */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: '#6B7280',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {chat.ultimo_mensaje_texto ? `"${chat.ultimo_mensaje_texto}"` : 'Sin mensajes recientes'}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── COLUMNA DERECHA (68% - 70%): Historial de Mensajes de Auditoría ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
          {chatSeleccionado ? (
            <>
              {/* Header de la Conversación Seleccionada */}
              <div
                style={{
                  padding: '16px 24px',
                  background: '#FFFFFF',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>
                      {chatSeleccionado.estudiante?.nombres} (Estudiante) &nbsp;↔&nbsp; {chatSeleccionado.arrendador?.nombres} (Arrendador)
                    </h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4, fontSize: 12, color: '#6B7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={14} color="#8C1515" />
                      <strong style={{ color: '#374151' }}>Inmueble:</strong> {chatSeleccionado.inmueble?.titulo || 'Alojamiento Manta'}
                    </span>
                    <span>•</span>
                    <span>
                      <strong style={{ color: '#374151' }}>Total Mensajes:</strong> {mensajes.length}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      color: '#92400E',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <AlertCircle size={13} />
                    <span>Registro Inmutable</span>
                  </div>
                </div>
              </div>

              {/* Contenedor de Mensajes (Chat Stream) */}
              <div
                ref={messagesEndRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                {loadingMensajes ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                    <RefreshCw size={24} color={WINE} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                    <span>Cargando transcripción de mensajes...</span>
                  </div>
                ) : mensajes.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                    <MessageSquare size={40} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontWeight: 600, color: '#64748B' }}>No hay mensajes en esta conversación</p>
                  </div>
                ) : (
                  mensajes.map((mensaje) => {
                    // Lógica del Prompt:
                    // Si mensaje.sender_id === chatSeleccionado.id_estudiante, alinea la burbuja a la izquierda (color azul suave)
                    // Si es el arrendador, alinea a la derecha (color gris o verde suave)
                    const isEstudiante = mensaje.sender_id === chatSeleccionado.id_estudiante;
                    const senderName = isEstudiante
                      ? chatSeleccionado.estudiante?.nombres || 'Estudiante'
                      : chatSeleccionado.arrendador?.nombres || 'Arrendador';

                    return (
                      <div
                        key={mensaje.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isEstudiante ? 'flex-start' : 'flex-end',
                          width: '100%',
                        }}
                      >
                        {/* Etiqueta de Remitente y Rol */}
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            marginBottom: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            color: isEstudiante ? '#1E40AF' : '#166534',
                          }}
                        >
                          {isEstudiante ? <GraduationCap size={13} /> : <Home size={13} />}
                          <span>{senderName}</span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '1px 5px',
                              borderRadius: 4,
                              background: isEstudiante ? '#DBEAFE' : '#DCFCE7',
                            }}
                          >
                            {isEstudiante ? 'Estudiante' : 'Arrendador'}
                          </span>
                        </div>

                        {/* Burbuja del Mensaje */}
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: isEstudiante ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                            background: isEstudiante ? '#EFF6FF' : '#F0FDF4',
                            border: `1px solid ${isEstudiante ? '#BFDBFE' : '#BBF7D0'}`,
                            color: '#1F2937',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            position: 'relative',
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 13, lineHeight: '20px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {mensaje.contenido}
                          </p>

                          {/* Fecha y Hora del Mensaje */}
                          <div
                            style={{
                              marginTop: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: isEstudiante ? 'flex-start' : 'flex-end',
                              gap: 6,
                              fontSize: 10,
                              color: '#6B7280',
                            }}
                          >
                            <Clock size={11} color="#9CA3AF" />
                            <span>{formatearFecha(mensaje.fecha || mensaje.created_at)}</span>
                            {mensaje.leido && <CheckCheck size={13} color="#2563EB" title="Mensaje leído por el destinatario" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Barra Inferior Fija: Aviso de Auditoría (Estricto Solo Lectura, Sin Input de Envío) */}
              <div
                style={{
                  padding: '14px 24px',
                  background: '#FFFFFF',
                  borderTop: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#4B5563',
                  fontWeight: 600,
                }}
              >
                <Lock size={15} color="#6B7280" />
                <span>
                  Panel de Auditoría Institucional ULEAM Rental. Este módulo es estrictamente de solo lectura con valor probatorio.
                </span>
              </div>
            </>
          ) : (
            /* Estado Vacío cuando no hay chat seleccionado */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#FEF2F2',
                  border: '2px solid #FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <MessageSquare size={34} color={WINE} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#111827' }}>
                Selecciona una conversación para auditar
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#6B7280', maxWidth: 420 }}>
                Elige cualquier chat en la columna izquierda para revisar la transcripción completa, marcas de tiempo y el inmueble relacionado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditoriaChats;
