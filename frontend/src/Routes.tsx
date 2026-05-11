// src/Routes.tsx
import { BrowserRouter, Routes as RRDRoutes, Route } from 'react-router-dom';
import App from './App';
import AuthCallback from './pages/AuthCallback';
import { FC } from 'react';
import { FrameViewer } from './components/FrameViewer';
import { Agenda } from './components/modules/Agenda';
import { Arquitectura } from './components/modules/Arquitectura';
import { Dashboard } from './components/modules/Dashboard';
import { Gastronomia } from './components/modules/Gastronomia';
import { Marketplace } from './components/modules/Marketplace';
import { Notificaciones } from './components/modules/Notificaciones';
import { Perfil } from './components/modules/Perfil';
import { Pujas } from './components/modules/Pujas';
import { README } from './components/modules/README';
import { Reservas } from './components/modules/Reservas';
import { Streaming } from './components/modules/Streaming';
import { DesignSystemDemo } from './DesignSystem/demo';
import Private from './components/Private';
import CouponsManager from './components/modules/CouponsManager';
import UsersManager from './components/modules/UsersManager';
import Access from './components/Access';
import AccessCheckIn from './pages/AccessCheckIn';

const Routes: FC = () => {
  return (
    <BrowserRouter>
      <RRDRoutes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<App />} >
          <Route index element={<Agenda />} />
          <Route path="access" element={<Private><Access /></Private>} />
          <Route path="reservas" element={<Private><Reservas /></Private>} />
          <Route path="pujas" element={<Private><Pujas /></Private>} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="marketplace" element={<Private><Marketplace /></Private>} />
          <Route path="gastronomia" element={<Private><Gastronomia /></Private>} />
          <Route path="streaming" element={<Private><Streaming /></Private>} />
          <Route path="notificaciones" element={<Private><Notificaciones /></Private>} />
          <Route path="dashboard" element={<Private><Dashboard /></Private>} />
          <Route path="cupones" element={<Private><CouponsManager /></Private>} />
          <Route path="usuarios" element={<Private><UsersManager /></Private>} />
          <Route path="arquitectura" element={<Private><Arquitectura /></Private>} />
          <Route path="readme" element={<Private><README /></Private>} />
          <Route path="designsystem" element={<Private><DesignSystemDemo /></Private>} />
          <Route path="frames" element={<Private><FrameViewer /></Private>} />
          <Route path="/access/check-in" element={<AccessCheckIn />} />
          <Route path="/events/:eventId/check-in" element={<AccessCheckIn />} />
        </Route>
      </RRDRoutes>
    </BrowserRouter>
  );
};

export default Routes;
