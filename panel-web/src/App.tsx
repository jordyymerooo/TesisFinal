import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Usuarios from './pages/admin/Usuarios';
import HistorialUsuarios from './pages/admin/HistorialUsuarios';
import Verificacion from './pages/admin/Verificacion';
import HistorialVerificaciones from './pages/admin/HistorialVerificaciones';
import { PropertiesApproval } from './pages/admin/PropertiesApproval';
import HistorialAprobaciones from './pages/admin/HistorialAprobaciones';
import MapaAdmin from './pages/admin/MapaAdmin';
import AuditoriaChats from './pages/admin/AuditoriaChats';
import Reportes from './pages/admin/Reportes';
import Denuncias from './pages/admin/Denuncias';
import Avisos from './pages/admin/Avisos';
import DetallePropiedad from './pages/admin/DetallePropiedad';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRole={3}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios/historial" element={<HistorialUsuarios />} />
          <Route path="verificacion" element={<Verificacion />} />
          <Route path="verificacion/historial" element={<HistorialVerificaciones />} />
          <Route path="denuncias" element={<Denuncias />} />
          <Route path="auditoria-chats" element={<AuditoriaChats />} />
          <Route path="propiedades" element={<PropertiesApproval />} />
          <Route path="propiedades/historial" element={<HistorialAprobaciones />} />
          <Route path="propiedades/:id" element={<DetallePropiedad />} />
          <Route path="mapa" element={<MapaAdmin />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="avisos" element={<Avisos />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
