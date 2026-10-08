import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  MessageSquare,
  Building2,
  BarChart3,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Megaphone,
  MapPin,
} from 'lucide-react';

const WINE = '#8C1515';
const SIDEBAR_BG = '#1E1E2E';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    // Limpiar todo rastro de la sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sanctum_token');
    localStorage.removeItem('uleam_auth_token');
    sessionStorage.clear();

    // Redirigir al login y evitar volver atrás
    navigate('/login', { replace: true });
  };
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/admin/arrendadores/pendientes');
      const total = res.data?.total ?? (Array.isArray(res.data?.data) ? res.data.data.length : 0);
      setPendingCount(total);
    } catch (err) {
      console.warn('[AdminLayout] Error al obtener solicitudes pendientes:', err);
    }
  };

  const fetchPendingReportsCount = async () => {
    try {
      const res = await api.get('/admin/reportes');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const count = list.filter((r: any) => r.estado === 'pendiente').length;
      setPendingReportsCount(count);
    } catch (err) {
      console.warn('[AdminLayout] Error al obtener denuncias pendientes:', err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setAdminUser(res.data?.user || res.data);
    } catch (err) {
      console.warn('[AdminLayout] Error al obtener usuario autenticado:', err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    fetchPendingReportsCount();
    fetchUser();

    const handleUpdate = () => {
      fetchPendingCount();
      fetchPendingReportsCount();
    };

    window.addEventListener('verification-updated', handleUpdate);
    window.addEventListener('reportes-updated', handleUpdate);
    return () => {
      window.removeEventListener('verification-updated', handleUpdate);
      window.removeEventListener('reportes-updated', handleUpdate);
    };
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/usuarios', label: 'Usuarios', icon: Users },
    { path: '/verificacion', label: 'Verificación', icon: ShieldCheck, isVerification: true },
    { path: '/denuncias', label: 'Denuncias', icon: AlertTriangle, isDenuncias: true },
    { path: '/auditoria-chats', label: 'Auditoría de Chats', icon: MessageSquare },
    { path: '/propiedades', label: 'Propiedades', icon: Building2 },
    { path: '/mapa', label: 'Mapa de Alojamientos', icon: MapPin },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
    { path: '/avisos', label: 'Gestión de Avisos', icon: Megaphone },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', sans-serif" }}>
      {/* ── 1. Sidebar Fijo a la Izquierda ── */}
      <aside
        style={{
          width: 260,
          background: SIDEBAR_BG,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo ULEAM Rental */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: WINE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 14px ${WINE}60`,
            }}
          >
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>U</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
              ULEAM Rental
            </h1>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
              Panel Administrativo
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ padding: '0 10px 8px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Menú Principal
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 mb-2 transition-all duration-300 ease-in-out no-underline ${
                  isActive
                    ? 'bg-gradient-to-r from-red-800 to-red-700 text-white rounded-lg shadow-lg shadow-red-900/40 border-l-4 border-red-400 font-semibold tracking-wide'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100 rounded-lg font-medium hover:pl-5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span className="text-sm">{item.label}</span>
                </div>

                {item.isVerification && pendingCount > 0 ? (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-500 text-gray-900'
                    }`}
                  >
                    {pendingCount}
                  </span>
                ) : item.isDenuncias && pendingReportsCount > 0 ? (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {pendingReportsCount}
                  </span>
                ) : (
                  isActive && (
                    <ChevronRight size={18} className="animate-pulse text-red-200" />
                  )
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Admin Status y Logout */}
        <div className="mt-auto p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-400 hover:text-white hover:bg-red-700/80 rounded-lg transition-all duration-200 font-semibold mb-3 group border-0 cursor-pointer"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>

          {/* Indicador de Backend API Online */}
          <div className="flex items-center justify-between px-2 pt-1 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
              <span className="text-[11px] font-medium text-emerald-400">Backend Online</span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Laravel 11</span>
          </div>
        </div>
      </aside>

      {/* ── 2. Área Principal de Contenido ── */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header
          style={{
            height: 68,
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Input de Búsqueda */}
          {/* Acciones Derecha (Perfil Superadmin) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Divisor */}
            <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

            {/* Avatar Superadministrador */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onClick={() => setIsProfileModalOpen(true)}
              title="Cambiar foto de perfil"
            >
              {adminUser?.foto_url || adminUser?.foto ? (
                <img
                  src={adminUser.foto_url || adminUser.foto}
                  alt="Avatar Administrador"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    objectFit: 'cover',
                    border: `2px solid ${WINE}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: '#FDF2F8',
                    border: `2px solid ${WINE}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: WINE,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {(adminUser?.nombres || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                  {adminUser?.nombres || 'Cargando...'}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
                  {adminUser?.rol?.nombre_rol || 'Administrador'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Modal Perfil */}
        {isProfileModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, width: 340, padding: 24, textAlign: 'center', position: 'relative' }}>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Mi Perfil</h3>
              
              <div style={{ marginBottom: 20 }}>
                {adminUser?.foto_url || adminUser?.foto ? (
                  <img
                    src={adminUser.foto_url || adminUser.foto}
                    alt="Perfil"
                    style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB', margin: '0 auto' }}
                  />
                ) : (
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#FDF2F8', border: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: WINE, fontSize: 32, fontWeight: 700, margin: '0 auto' }}>
                    {(adminUser?.nombres || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    setIsUploadingPhoto(true);
                    const formData = new FormData();
                    formData.append('foto', e.target.files[0]);
                    try {
                      const res = await api.post('/auth/profile/photo', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      setAdminUser(res.data.user);
                      alert('Foto actualizada');
                    } catch (err) {
                      alert('Error al subir foto');
                    } finally {
                      setIsUploadingPhoto(false);
                      setIsProfileModalOpen(false);
                    }
                  }
                }}
              />

              <button
                disabled={isUploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                style={{ background: WINE, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 13, width: '100%', cursor: isUploadingPhoto ? 'not-allowed' : 'pointer', opacity: isUploadingPhoto ? 0.7 : 1 }}
              >
                {isUploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('sanctum_token');
                  localStorage.removeItem('uleam_auth_token');
                  window.location.href = '/login';
                }}
                style={{ marginTop: 12, background: 'transparent', color: '#DC2626', border: '1px solid #FECACA', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 13, width: '100%', cursor: 'pointer' }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main style={{ flex: 1, padding: '32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

