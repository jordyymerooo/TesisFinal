import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Usuarios from './pages/admin/Usuarios';
import Verificacion from './pages/admin/Verificacion';
import { PropertiesApproval } from './pages/admin/PropertiesApproval';
import AuditoriaChats from './pages/admin/AuditoriaChats';
import Reportes from './pages/admin/Reportes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="verificacion" element={<Verificacion />} />
          <Route path="auditoria-chats" element={<AuditoriaChats />} />
          <Route path="propiedades" element={<PropertiesApproval />} />
          <Route path="reportes" element={<Reportes />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
