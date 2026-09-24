import React, { useState, useEffect } from 'react';
import api, { toggleUserStatus, updateAdminUser, sendNotificationToUser } from '../../services/api';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  Ban,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Phone,
  MapPin,
  X,
  Bell,
  Megaphone,
  Send,
  Trash2,
} from 'lucide-react';

const WINE = '#8C1515';

export interface UserItem {
  id_usuario: number;
  id?: number;
  nombres: string;
  correo: string;
  avatar?: string;
  foto_url?: string | null;
  foto_perfil?: string | null;
  cedula?: string;
  rol: string;
  estado: string;
  telefono?: string;
  ciudad_origen?: string;
  documento_verificado?: boolean;
  created_at?: string;
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'todos' | 'estudiante' | 'arrendador' | 'administrador'>('todos');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(
    'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Estados del Modal de Edición
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);
  const [editNombres, setEditNombres] = useState<string>('');
  const [editCorreo, setEditCorreo] = useState<string>('');
  const [editTelefono, setEditTelefono] = useState<string>('');
  const [editCiudad, setEditCiudad] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Estados del Modal de Notificación Oficial
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState<boolean>(false);
  const [notifyData, setNotifyData] = useState<{ titulo: string; mensaje: string }>({ titulo: '', mensaje: '' });
  const [userToNotify, setUserToNotify] = useState<UserItem | null>(null);
  const [isSendingNotification, setIsSendingNotification] = useState<boolean>(false);

  // Estados del Modal de Creación de Usuario
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newUser, setNewUser] = useState({
    nombre_completo: '',
    email: '',
    identificacion: '',
    telefono: '',
    password: '',
    rol: 'estudiante',
  });
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/usuarios');
      const data = response.data?.data || response.data || [];
      setUsuarios(data);
      setLastUpdated('Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error('Error al cargar usuarios desde Laravel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpenEditModal = (user: UserItem) => {
    const fotoUrl =
      user.foto_url ||
      (user.avatar && !user.avatar.includes('ui-avatars.com') ? user.avatar : null) ||
      (user as any).foto_perfil ||
      null;

    setUserToEdit({
      ...user,
      foto_url: fotoUrl,
    });
    setEditNombres(user.nombres || '');
    setEditCorreo(user.correo || '');
    setEditTelefono(user.telefono || '');
    setEditCiudad(user.ciudad_origen || '');
    setIsModalOpen(true);
  };

  const handleOpenNotifyModal = (user: UserItem) => {
    setUserToNotify(user);
    setNotifyData({ titulo: '', mensaje: '' });
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userToNotify) return;

    if (!notifyData.titulo.trim() || !notifyData.mensaje.trim()) {
      alert('Por favor completa tanto el título como el mensaje del aviso.');
      return;
    }

    setIsSendingNotification(true);
    try {
      const targetId = userToNotify.id || userToNotify.id_usuario;
      await sendNotificationToUser(targetId, notifyData);
      setIsNotifyModalOpen(false);
      setNotifyData({ titulo: '', mensaje: '' });
      setSuccessAlert(`✓ Notificación oficial enviada con éxito a ${userToNotify.nombres}.`);
      setTimeout(() => setSuccessAlert(null), 5000);
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      alert('Hubo un error al enviar la notificación al usuario.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleCreateUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newUser.nombre_completo.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      alert('Por favor completa los campos requeridos: Nombre completo, correo electrónico y contraseña.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const response = await api.post('/admin/usuarios', newUser);
      if (response.status === 201 || response.status === 200) {
        setIsCreateModalOpen(false);
        setNewUser({
          nombre_completo: '',
          email: '',
          identificacion: '',
          telefono: '',
          password: '',
          rol: 'estudiante',
        });
        setSuccessAlert('✓ Usuario creado correctamente.');
        setTimeout(() => setSuccessAlert(null), 5000);
        await fetchUsuarios();
      }
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      const msg =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : 'Hubo un error al crear el usuario.');
      alert(msg);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!userToEdit) return;
    const userId = userToEdit.id_usuario || userToEdit.id;
    if (!userId) return;

    if (!editNombres.trim()) {
      alert('El nombre del usuario no puede estar vacío.');
      return;
    }

    setIsSaving(true);
    try {
      await updateAdminUser(userId, {
        nombres: editNombres.trim(),
        correo: editCorreo.trim(),
        telefono: editTelefono.trim(),
        ciudad_origen: editCiudad.trim(),
      });

      setIsModalOpen(false);
      setUserToEdit(null);
      setSuccessAlert(`✓ Datos de "${editNombres.trim()}" actualizados con éxito.`);
      setTimeout(() => setSuccessAlert(null), 5000);

      // Refrescar los usuarios de la base de datos de inmediato
      await fetchUsuarios();
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      const msg = error.response?.data?.message || 'Hubo un problema al guardar los cambios del usuario.';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async (id?: number) => {
    const targetId = id || userToEdit?.id || userToEdit?.id_usuario;
    if (!targetId) return;

    if (!window.confirm('¿Seguro que deseas eliminar la foto de perfil de este usuario?')) return;

    try {
      await api.delete(`/admin/usuarios/${targetId}/foto`);
      // Actualizar el estado local del modal para que la foto desaparezca al instante
      if (userToEdit) {
        setUserToEdit({ ...userToEdit, foto_url: null, avatar: undefined });
      }
      setSuccessAlert('✓ Foto de perfil eliminada correctamente.');
      setTimeout(() => setSuccessAlert(null), 4000);
      // Refrescar la tabla de fondo
      await fetchUsuarios();
    } catch (error) {
      console.error('Error eliminando foto', error);
      alert('Hubo un error al eliminar la foto de perfil.');
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const userId = user.id_usuario || user.id;
    if (!userId) return;

    const isCurrentlyActive = (user.estado || '').toLowerCase() === 'activo';
    const confirmMessage = isCurrentlyActive
      ? `¿Estás seguro de cambiar el estado de este usuario (${user.nombres}) a 'Suspendido'? Si es un arrendador, sus propiedades se ocultarán del mapa.`
      : `¿Estás seguro de reactivar la cuenta de ${user.nombres}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setTogglingId(userId);
    try {
      const response = await toggleUserStatus(userId);
      const nuevoEstado = response.estado || (isCurrentlyActive ? 'suspendido' : 'activo');

      // Actualizar el estado local de la tabla iterando el array de usuarios
      setUsuarios((prev) =>
        prev.map((u) => {
          const uId = u.id_usuario || u.id;
          if (uId === userId) {
            return {
              ...u,
              estado: nuevoEstado,
            };
          }
          return u;
        })
      );

      const alertMsg = nuevoEstado === 'suspendido'
        ? `✕ Usuario ${user.nombres} suspendido. Las propiedades de arrendador han sido ocultadas del mapa.`
        : `✓ Usuario ${user.nombres} reactivado con éxito.`;

      setSuccessAlert(alertMsg);
      setTimeout(() => setSuccessAlert(null), 5000);
    } catch (error: any) {
      console.error('Error al cambiar estado del usuario:', error);
      alert('Hubo un problema al actualizar el estado del usuario. Por favor intenta de nuevo.');
    } finally {
      setTogglingId(null);
    }
  };

  const obtenerIniciales = (nombre?: string) => {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  };

  const handleDeleteUser = async (id: number, userName?: string) => {
    if (
      !window.confirm(
        '¿Estás seguro de eliminar PERMANENTEMENTE a este usuario y todos sus datos?'
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/admin/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => (u.id_usuario !== id && u.id !== id)));
      setSuccessAlert(
        `✓ Usuario ${userName ? `"${userName}"` : `#${id}`} y todos sus registros han sido eliminados de la base de datos.`
      );
      setTimeout(() => setSuccessAlert(null), 5000);
    } catch (error: any) {
      console.error('Error al eliminar usuario permanentemente:', error);
      const msg =
        error.response?.data?.message ||
        'Hubo un error al eliminar permanentemente al usuario del sistema.';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = usuarios.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      (u.nombres || '').toLowerCase().includes(term) ||
      (u.correo || '').toLowerCase().includes(term) ||
      (u.cedula || '').includes(term) ||
      (u.ciudad_origen || '').toLowerCase().includes(term);

    const matchRole =
      selectedRole === 'todos' ||
      (u.rol || '').toLowerCase() === selectedRole.toLowerCase();

    return matchSearch && matchRole;
  });

  const getRoleBadge = (rol: string) => {
    const r = (rol || '').toLowerCase();
    switch (r) {
      case 'administrador':
        return {
          label: 'Administrador',
          bg: '#FDF2F8',
          color: '#BE185D',
          border: '#FBCFE8',
          icon: Shield,
        };
      case 'arrendador':
        return {
          label: 'Arrendador',
          bg: 'rgba(140, 21, 21, 0.08)',
          color: WINE,
          border: 'rgba(140, 21, 21, 0.25)',
          icon: Building2,
        };
      case 'estudiante':
      default:
        return {
          label: 'Estudiante',
          bg: '#EFF6FF',
          color: '#1D4ED8',
          border: '#BFDBFE',
          icon: GraduationCap,
        };
    }
  };

  const getStatusBadge = (estado: string) => {
    const st = (estado || '').toLowerCase();
    switch (st) {
      case 'activo':
        return {
          label: 'Activo',
          bg: '#ECFDF5',
          color: '#059669',
          border: '#A7F3D0',
        };
      case 'suspendido':
        return {
          label: 'Suspendido',
          bg: '#FEF2F2',
          color: '#DC2626',
          border: '#FECACA',
        };
      case 'pendiente':
      default:
        return {
          label: 'Pendiente',
          bg: '#FFFBEB',
          color: '#D97706',
          border: '#FDE68A',
        };
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px' }}>
              Gestión de Usuarios
            </h1>
            <span
              style={{
                background: 'rgba(140, 21, 21, 0.08)',
                color: WINE,
                border: '1px solid rgba(140, 21, 21, 0.2)',
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 12,
              }}
            >
              {usuarios.length} registrados
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
            Listado general de estudiantes, arrendadores y administradores conectados a la base de datos de Laravel.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Indicador de carga */}
          {loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                padding: '7px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Sincronizando...</span>
            </div>
          )}

          {/* Botón de Sincronizar */}
          <button
            onClick={fetchUsuarios}
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
            title="Refrescar usuarios de la base de datos"
          >
            <RefreshCw size={14} color="#6B7280" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Actualizar</span>
          </button>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: WINE,
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${WINE}40`,
              transition: 'all 0.2s ease',
            }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* ── Banner de Notificación de Éxito / Alerta ── */}
      {successAlert && (
        <div
          style={{
            background: successAlert.startsWith('✓') ? '#ECFDF5' : '#FFFBEB',
            border: `1px solid ${successAlert.startsWith('✓') ? '#A7F3D0' : '#FDE68A'}`,
            color: successAlert.startsWith('✓') ? '#065F46' : '#92400E',
            padding: '12px 18px',
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {successAlert.startsWith('✓') ? (
            <CheckCircle2 size={18} color="#10B981" />
          ) : (
            <ShieldAlert size={18} color="#D97706" />
          )}
          <span>{successAlert}</span>
        </div>
      )}

      {/* ── Barra de Búsqueda y Filtros ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid #E5E7EB',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 420 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '8px 14px',
              width: '100%',
            }}
          >
            <Search size={16} color="#6B7280" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: '#111827',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Píldoras de Selección de Rol */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['todos', 'estudiante', 'arrendador', 'administrador'] as const).map((r) => {
            const isSelected = selectedRole === r;
            const labels: Record<string, string> = {
              todos: 'Todos',
              estudiante: 'Estudiantes',
              arrendador: 'Arrendadores',
              administrador: 'Administradores',
            };
            const count =
              r === 'todos'
                ? usuarios.length
                : usuarios.filter((u) => (u.rol || '').toLowerCase() === r).length;

            return (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: isSelected ? WINE : '#F9FAFB',
                  color: isSelected ? '#FFFFFF' : '#4B5563',
                  border: isSelected ? `1px solid ${WINE}` : '1px solid #E5E7EB',
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{labels[r]}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#E5E7EB',
                    color: isSelected ? '#FFFFFF' : '#6B7280',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tabla de Usuarios Conectada a Laravel ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ID
                </th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Usuario
                </th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cédula / Teléfono
                </th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Rol
                </th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Estado
                </th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Registro
                </th>
                <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <Loader2 size={28} color={WINE} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
                        Cargando usuarios desde la base de datos de Laravel...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                    No se encontraron usuarios en la base de datos con los criterios especificados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const roleBadge = getRoleBadge(user.rol);
                  const statusBadge = getStatusBadge(user.estado);
                  const RoleIcon = roleBadge.icon;
                  const userId = user.id_usuario || user.id;
                  const isUserActive = (user.estado || '').toLowerCase() === 'activo';
                  const isToggling = togglingId === userId;

                  return (
                    <tr
                      key={userId}
                      style={{
                        borderBottom: index < filteredUsers.length - 1 ? '1px solid #F3F4F6' : 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* ID */}
                      <td style={{ padding: '16px 24px', fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace' }}>
                        #{userId.toString().padStart(3, '0')}
                      </td>

                      {/* Usuario: Avatar + Nombre + Correo + Ciudad */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {user.foto_url ? (
                            <img
                              src={user.foto_url}
                              alt="Perfil"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombres)}&background=8C1515&color=fff`;
                              }}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8C1515 0%, #B91C1C 100%)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                boxShadow: '0 2px 4px rgba(140, 21, 21, 0.25)',
                                flexShrink: 0,
                              }}
                              title={user.nombres}
                            >
                              {obtenerIniciales(user.nombres)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                              {user.nombres}
                            </div>
                            <div style={{ fontSize: 11, color: '#6B7280' }}>{user.correo}</div>
                            {user.ciudad_origen && (
                              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={10} />
                                <span>{user.ciudad_origen}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cédula y Teléfono */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace', fontWeight: 600 }}>
                          {user.cedula || '1300000000'}
                        </div>
                        {user.telefono && (
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={10} />
                            <span>{user.telefono}</span>
                          </div>
                        )}
                      </td>

                      {/* Rol */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: roleBadge.bg,
                            color: roleBadge.color,
                            border: `1px solid ${roleBadge.border}`,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 8,
                          }}
                        >
                          <RoleIcon size={12} />
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: statusBadge.color,
                            }}
                          />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Fecha de Registro */}
                      <td style={{ padding: '16px 20px', fontSize: 12, color: '#6B7280' }}>
                        {user.created_at || '14 Sep 2026'}
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {/* Botón Editar (Lápiz) */}
                          <button
                            title="Editar usuario"
                            style={{
                              background: '#F9FAFB',
                              border: '1px solid #E5E7EB',
                              borderRadius: 8,
                              padding: '6px 10px',
                              cursor: 'pointer',
                              color: '#4B5563',
                              transition: 'all 0.15s ease',
                            }}
                            onClick={() => handleOpenEditModal(user)}
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Botón Enviar Notificación Oficial (Megáfono) */}
                          <button
                            title="Enviar notificación oficial"
                            style={{
                              background: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              borderRadius: 8,
                              padding: '6px 10px',
                              cursor: 'pointer',
                              color: '#2563EB',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            onClick={() => handleOpenNotifyModal(user)}
                          >
                            <Megaphone size={13} />
                          </button>

                          {/* Botón Dar de Baja (Suspender) / Reactivar */}
                          <button
                            title={isUserActive ? 'Dar de baja (Suspender)' : 'Reactivar usuario'}
                            disabled={isToggling}
                            style={{
                              background: isUserActive ? '#FEF2F2' : '#ECFDF5',
                              border: `1px solid ${isUserActive ? '#FECACA' : '#A7F3D0'}`,
                              borderRadius: 8,
                              padding: '6px 10px',
                              cursor: isToggling ? 'not-allowed' : 'pointer',
                              color: isUserActive ? '#DC2626' : '#059669',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {isToggling ? (
                              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : isUserActive ? (
                              <Ban size={13} />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                          </button>

                          {/* Botón Eliminar Permanentemente (Basurero) */}
                          <button
                            title="Eliminar usuario permanentemente"
                            disabled={deletingId === userId}
                            style={{
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: 8,
                              padding: '6px 10px',
                              cursor: deletingId === userId ? 'not-allowed' : 'pointer',
                              color: '#DC2626',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            onClick={() => handleDeleteUser(userId, user.nombres)}
                          >
                            {deletingId === userId ? (
                              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Emergente de Edición de Usuario ── */}
      {isModalOpen && userToEdit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 17, 23, 0.68)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => {
            if (!isSaving) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 480,
              width: '100%',
              padding: '26px 28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E5E7EB',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                borderBottom: '1px solid #F3F4F6',
                paddingBottom: 14,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>
                  Editar Usuario
                </h3>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  ID #{userToEdit.id_usuario || userToEdit.id} · Rol: {userToEdit.rol}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  color: '#6B7280',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* --- INICIO BLOQUE FOTO DE PERFIL --- */}
              <div
                className="flex flex-col items-center mb-6"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: 20,
                  width: '100%',
                }}
              >
                {userToEdit?.foto_url ? (
                  <>
                    <img
                      src={userToEdit.foto_url}
                      alt="Perfil"
                      className="w-24 h-24 rounded-full object-cover mb-2 border border-gray-200 shadow-sm"
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: 8,
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://ui-avatars.com/api/?name=' +
                          encodeURIComponent(userToEdit.nombres || 'U') +
                          '&background=8C1515&color=fff&size=128';
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemovePhoto(userToEdit.id || userToEdit.id_usuario)} 
                      className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      style={{
                        fontSize: 12,
                        color: '#DC2626',
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 4,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      Eliminar foto actual
                    </button>
                  </>
                ) : (
                  <div
                    className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-2 border border-slate-200 shadow-sm"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <span
                      className="text-slate-400 text-xs font-medium"
                      style={{ color: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                    >
                      Sin foto
                    </span>
                  </div>
                )}
              </div>
              {/* --- FIN BLOQUE FOTO DE PERFIL --- */}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={editNombres}
                  onChange={(e) => setEditNombres(e.target.value)}
                  placeholder="Ej. Carlos Mendoza Moreira"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 13,
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={editCorreo}
                  onChange={(e) => setEditCorreo(e.target.value)}
                  placeholder="Ej. usuario@uleam.edu.ec"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 13,
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                    placeholder="Ej. 0991234567"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid #D1D5DB',
                      fontSize: 13,
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    Ciudad de Origen
                  </label>
                  <input
                    type="text"
                    value={editCiudad}
                    onChange={(e) => setEditCiudad(e.target.value)}
                    placeholder="Ej. Manta, Portoviejo"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid #D1D5DB',
                      fontSize: 13,
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid #F3F4F6',
              }}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                style={{
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#4B5563',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                style={{
                  background: WINE,
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 12px ${WINE}40`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                {isSaving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal de Envío de Notificación Oficial ── */}
      {isNotifyModalOpen && userToNotify && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              width: '100%',
              maxWidth: 520,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FAFAFA',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Megaphone size={18} color="#2563EB" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                    Enviar notificación a {userToNotify.nombres}
                  </h3>
                  <span style={{ fontSize: 11, color: '#6B7280' }}>
                    Comunicado oficial institucional dirigido a {userToNotify.correo}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsNotifyModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendNotification} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Título del aviso */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#374151',
                      marginBottom: 6,
                    }}
                  >
                    Título del aviso <span style={{ color: WINE }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Aviso importante sobre inspección de alojamiento"
                    value={notifyData.titulo}
                    onChange={(e) => setNotifyData((prev) => ({ ...prev, titulo: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #D1D5DB',
                      fontSize: 13,
                      color: '#111827',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Mensaje / Textarea */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#374151',
                      marginBottom: 6,
                    }}
                  >
                    Mensaje <span style={{ color: WINE }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Escribe aquí el contenido del aviso oficial..."
                    value={notifyData.mensaje}
                    onChange={(e) => setNotifyData((prev) => ({ ...prev, mensaje: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #D1D5DB',
                      fontSize: 13,
                      color: '#111827',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#9CA3AF' }}>
                    Aparecerá en el Centro de Notificaciones de la app del usuario bajo 'Soporte ULEAM Rental'.
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsNotifyModalOpen(false)}
                  disabled={isSendingNotification}
                  style={{
                    background: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    padding: '9px 18px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#4B5563',
                    cursor: isSendingNotification ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSendingNotification}
                  style={{
                    background: '#2563EB',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: isSendingNotification ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isSendingNotification ? (
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>{isSendingNotification ? 'Enviando...' : 'Enviar Notificación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de Creación de Nuevo Usuario ── */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={() => {
            if (!isCreatingUser) setIsCreateModalOpen(false);
          }}
        >
          <div
            className="bg-white p-6 rounded-2xl w-full max-w-[420px] shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-800 border border-red-100">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 m-0 leading-tight">Crear Nuevo Usuario</h3>
                  <span className="text-xs text-gray-500">Acceso inmediato para la app móvil</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isCreatingUser}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Valeria Nicole Cedeño"
                  value={newUser.nombre_completo}
                  onChange={(e) => setNewUser({ ...newUser, nombre_completo: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Correo Electrónico <span className="text-red-700">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ej: estudiante@uleam.edu.ec"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cédula / Identificación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 1312345678"
                    value={newUser.identificacion}
                    onChange={(e) => setNewUser({ ...newUser, identificacion: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Teléfono / Celular
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 0991234567"
                    value={newUser.telefono}
                    onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contraseña <span className="text-red-700">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tipo de Rol <span className="text-red-700">*</span>
                </label>
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition"
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="arrendador">Arrendador</option>
                </select>
                <span className="block mt-1 text-[11px] text-gray-400">
                  Podrá iniciar sesión en la app móvil con este correo y clave.
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreatingUser}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateUser}
                  disabled={isCreatingUser}
                  className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-md"
                >
                  {isCreatingUser && <Loader2 size={14} className="animate-spin" />}
                  <span>{isCreatingUser ? 'Creando...' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
