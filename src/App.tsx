import { useEffect, type ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { FAQ } from './components/FAQ';
import { Servicios } from './components/Servicios';
import { Clientes } from './components/Clientes';
import { Contacto } from './components/Contacto';
import { ScrollToTop } from './components/ScrollToTop';
import { MensajerosLogin } from './components/MensajerosLogin';
import { MensajerosSesion } from './components/MensajerosSesion';
import { MensajerosPostulaciones } from './components/MensajerosPostulaciones';
import { RecuperarContrasena } from './components/RecuperarContrasena';
import { CorreoEnviado } from './components/CorreoEnviado';
import { NuevaContrasena } from './components/NuevaContrasena';
import { RecuperarContrasenaClientes } from './components/RecuperarContrasenaClientes';
import { CorreoEnviadoClientes } from './components/CorreoEnviadoClientes';
import { NuevaContrasenaClientes } from './components/NuevaContrasenaClientes';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { WhatsAppButton } from './components/WhatsAppButton';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsConditions } from './components/TermsConditions';
import { LegalNotice } from './components/LegalNotice';
import { CookiePolicy } from './components/CookiePolicy';
import { CookieBanner } from './components/CookieBanner';
import { Toaster } from 'sonner@2.0.3';
import { Settings } from 'lucide-react';
import { initTracking } from './utils/analytics';
import { isAdminSessionActive } from './utils/adminAuth';
import './styles/globals.css';

function AdminProtectedRoute({ children }: { children: ReactElement }) {
  if (!isAdminSessionActive()) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function MainLayout() {
  const navigate = useNavigate();

  const handleOpenMensajeroForm = () => {
    navigate('/servicios');
    window.dispatchEvent(new CustomEvent('openMensajeroForm'));
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <ScrollToTop />
      <Header onOpenMensajeroForm={handleOpenMensajeroForm} />

      <main className="flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/mensajeros" element={<MensajerosSesion />} />
          <Route path="/mensajeros/postulaciones" element={<MensajerosPostulaciones />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos" element={<TermsConditions />} />
          <Route path="/aviso-legal" element={<LegalNotice />} />
          <Route path="/politica-cookies" element={<CookiePolicy />} />
        </Routes>
      </main>

      <Footer />

      <WhatsAppButton />

      <Link
        to="/admin"
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-all opacity-30 hover:opacity-100"
        style={{ backgroundColor: '#000935' }}
        title="Panel de Administración"
        aria-label="Panel de Administración"
      >
        <Settings className="w-5 h-5" style={{ color: '#00C9CE' }} />
      </Link>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initTracking();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/panel"
          element={
            <AdminProtectedRoute>
              <AdminPanel />
            </AdminProtectedRoute>
          }
        />

        <Route path="/mensajeros/acceso" element={<MensajerosLogin />} />
        <Route path="/mensajeros/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/mensajeros/correo-enviado" element={<CorreoEnviado />} />
        <Route path="/mensajeros/nueva-contrasena" element={<NuevaContrasena />} />

        <Route path="/clientes/recuperar-contrasena" element={<RecuperarContrasenaClientes />} />
        <Route path="/clientes/correo-enviado" element={<CorreoEnviadoClientes />} />
        <Route path="/clientes/nueva-contrasena" element={<NuevaContrasenaClientes />} />

        <Route path="/*" element={<MainLayout />} />
      </Routes>

      <Toaster />
      <CookieBanner />
    </Router>
  );
}
