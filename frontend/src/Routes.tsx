// src/Routes.tsx
import { BrowserRouter, Routes as RRDRoutes, Route } from 'react-router-dom';
import App from './App';
import AuthCallback from './pages/AuthCallback';
import { FC } from 'react';
import { Agenda } from './components/modules/Agenda';
import { Dashboard } from './components/modules/Dashboard';
import { Perfil } from './components/modules/Perfil';
import Private from './components/Private';
import CouponsManager from './components/modules/CouponsManager';
import UsersManager from './components/modules/UsersManager';
import SiteSettingsManager from './components/modules/SiteSettingsManager';
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
          <Route path="perfil" element={<Perfil />} />
          <Route path="dashboard" element={<Private><Dashboard /></Private>} />
          <Route path="cupones" element={<Private><CouponsManager /></Private>} />
          <Route path="usuarios" element={<Private><UsersManager /></Private>} />
          <Route path="configuracion" element={<Private><SiteSettingsManager /></Private>} />
          <Route path="/access/check-in" element={<AccessCheckIn />} />
          <Route path="/events/:eventId/check-in" element={<AccessCheckIn />} />
        </Route>
      </RRDRoutes>
    </BrowserRouter>
  );
};

export default Routes;
