import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRole?: number | string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole, children }) => {
  // 1. Obtener token de autenticación (localStorage o sessionStorage)
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('uleam_auth_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('auth_token') ||
    sessionStorage.getItem('uleam_auth_token') ||
    sessionStorage.getItem('token');

  // Si no hay token válido, expulsar de inmediato al Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Obtener datos del usuario autenticado
  const userStr =
    localStorage.getItem('user') ||
    sessionStorage.getItem('user') ||
    localStorage.getItem('admin_user') ||
    '{}';

  let user: any = {};
  try {
    user = JSON.parse(userStr);
  } catch {
    user = {};
  }

  // 3. Verificación de rol administrativo si se especificó allowedRole (ej. 3 = Administrador)
  if (allowedRole) {
    const userRolId = user.id_rol ?? user.rol?.id_rol ?? (user.rol === 3 ? 3 : null);
    const userRolNombre = (user.rol?.nombre || user.rol || '').toString().toLowerCase();

    const matchId = userRolId === Number(allowedRole);
    const matchNombre =
      allowedRole === 3 &&
      (userRolNombre === 'administrador' || userRolNombre === 'admin');

    // Si el usuario no tiene privilegios requeridos
    if (!matchId && !matchNombre && userRolId !== undefined && Object.keys(user).length > 0) {
      console.warn('[ProtectedRoute] Acceso denegado: rol no autorizado', { userRolId, allowedRole });
      return <Navigate to="/login" replace />;
    }
  }

  // Permite su uso tanto como componente envoltorio ({children}) o como Route Layout (<Outlet />)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
