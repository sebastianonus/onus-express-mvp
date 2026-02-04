import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import backgroundImage from 'figma:asset/433f006a1a8dbb744643830e0e0b3f07184d05b1.png';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';

/**
 * COMPONENTE: Recuperar Contraseña - Área Clientes
 * 
 * Solicita email para enviar instrucciones de recuperación.
 * Usa exclusivamente Supabase Auth: supabase.auth.resetPasswordForEmail()
 * 
 * UX neutra: no revela si el email existe o no.
 */

export function RecuperarContrasenaClientes() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /**
       * INTEGRACIÓN FUTURA:
       * await supabase.auth.resetPasswordForEmail(email, {
       *   redirectTo: `${window.location.origin}/clientes/nueva-contrasena`
       * });
       */
      
      // Placeholder: mostrar que está pendiente de integración
      toast.info('Función de recuperación pendiente de integración con Supabase Auth');
      
      // En producción, redirigir a pantalla de confirmación
      setTimeout(() => {
        navigate('/clientes/correo-enviado');
      }, 1000);
      
    } catch (error) {
      console.error('Error en recuperación:', error);
      // En producción, siempre redirigir (UX neutra)
      navigate('/clientes/correo-enviado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Columna izquierda: Imagen */}
      <div 
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-[#000935]/60" />
      </div>

      {/* Columna derecha: Formulario */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img src={logo} alt="ONUS Express" className="h-14" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[#000935] mb-2 text-center">
              RECUPERAR CONTRASEÑA
            </h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10 h-11 border-gray-300 focus:border-[#00C9CE] focus:ring-[#00C9CE]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#00C9CE] hover:bg-[#00B5BA] text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Instrucciones'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate('/clientes')}
                variant="ghost"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
