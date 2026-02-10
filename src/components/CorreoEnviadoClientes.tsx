import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';
import backgroundImage from 'figma:asset/433f006a1a8dbb744643830e0e0b3f07184d05b1.png';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';
import { TEXTS } from '@/content/texts';

/**
 * COMPONENTE: Correo Enviado (confirmación) - Área Clientes
 *
 * Pantalla de confirmación neutra tras solicitar recuperación.
 * No revela si el email existe o no en la base de datos.
 */
export function CorreoEnviadoClientes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Columna izquierda: Imagen */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-[#000935]/60" />
      </div>

      {/* Columna derecha: Contenido */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img src={logo} alt={TEXTS.header.a11y.logoAlt} className="h-14" />
          </div>

          <div>
            {/* Ícono de éxito */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#00C9CE]/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#00C9CE]" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-[#000935] mb-4">
              {TEXTS.clients.emailSent.title}
            </h1>

            {/* Mensaje neutro */}
            <div className="bg-[#00C9CE]/5 border border-[#00C9CE]/20 rounded-lg p-4 mb-8">
              <p className="text-gray-700 text-sm leading-relaxed">
                {TEXTS.clients.emailSent.message}
              </p>
            </div>

            <Button
              onClick={() => navigate('/clientes')}
              className="w-full h-11 bg-[#00C9CE] hover:bg-[#00B5BA] text-white font-medium"
            >
              {TEXTS.clients.emailSent.backToLogin}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
