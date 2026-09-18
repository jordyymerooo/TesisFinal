import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

const WINE = '#8C1515';
const SIDEBAR_BG = '#1E1E2E';

export function AdminLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingCount, setPendingCount] = useState<number>(0);

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/admin/arrendadores/pendientes');
      const total = res.data?.total ?? (Array.isArray(res.data?.data) ? res.data.data.length : 0);
      setPendingCount(total);
    } catch (err) {
      console.warn('[AdminLayout] Error al obtener solicitudes pendientes:', err);
    }
  };

  useEffect(() => {
    fetchPendingCount();

    const handleUpdate = () => {
      fetchPendingCount();
    };

    window.addEventListener('verification-updated', handleUpdate);
    return () => {
      window.removeEventListener('verification-updated', handleUpdate);
    };
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/usuarios', label: 'Usuarios', icon: Users },
    { path: '/verificacion', label: 'Verificación', icon: ShieldCheck, isVerification: true },
    { path: '/auditoria-chats', label: 'Auditoría de Chats', icon: MessageSquare },
    { path: '/propiedades', label: 'Propiedades', icon: Building2 },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  background: isActive ? WINE : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={18} color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
                  <span>{item.label}</span>
                </div>

                {item.isVerification ? (
                  pendingCount > 0 && (
                    <span
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.25)' : '#F59E0B',
                        color: isActive ? '#FFFFFF' : '#111',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 10,
                      }}
                    >
                      {pendingCount}
                    </span>
                  )
                ) : (
                  isActive && <ChevronRight size={14} color="#FFFFFF" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Admin Status */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#34D399' }}>Backend API Online</span>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Laravel 11 + PostgreSQL</span>
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
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Input de Búsqueda */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#F3F4F6',
              padding: '8px 16px',
              borderRadius: 12,
              width: 380,
              border: '1px solid #E5E7EB',
            }}
          >
            <Search size={16} color="#6B7280" />
            <input
              type="text"
              placeholder="Buscar por usuario, cédula, propiedad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Acciones Derecha (Notificaciones + Perfil Superadmin) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Campanita de Notificaciones */}
            <button
              style={{
                position: 'relative',
                background: '#F3F4F6',
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Notificaciones"
            >
              <Bell size={18} color="#4B5563" />
              {pendingCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: WINE,
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fff',
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Divisor */}
            <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

            {/* Avatar Superadministrador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Avatar Superadministrador"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  objectFit: 'cover',
                  border: `2px solid ${WINE}`,
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                  Ing. Jordy Zambrano
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
                  Superadministrador
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main style={{ flex: 1, padding: '32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

