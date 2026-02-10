import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import backgroundImage from 'figma:asset/433f006a1a8dbb744643830e0e0b3f07184d05b1.png';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';
import { TEXTS } from '@/content/texts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * COMPONENTE: Recuperar Contraseña - Área Clientes
 *
 * Solicita email para enviar instrucciones de recuperación.
 * Usa Supabase Auth: supabase.auth.resetPasswordForEmail()
 *
 * UX neutra: no revela si el email existe o no.
 */
function RecuperarContrasenaClientes() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabase) {
        toast.error(TEXTS.clients.recovery.supabaseConfigError);
        navigate('/clientes/correo-enviado');
        return;
      }

      const redirectTo = `${window.location.origin}/clientes/nueva-contrasena`;

      await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      toast.success(TEXTS.clients.recovery.neutralSuccessToast);
      navigate('/clientes/correo-enviado');
    } catch (error) {
      console.error('Error en recuperación:', error);
      navigate('/clientes/correo-enviado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-[#000935]/60" />
      </div>

      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-10">
            <img src={logo} alt={TEXTS.header.a11y.logoAlt} className="h-14" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[#000935] mb-2 text-center">
              {TEXTS.clients.recovery.title}
            </h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              {TEXTS.clients.recovery.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {TEXTS.clients.recovery.emailLabel}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={TEXTS.clients.recovery.emailPlaceholder}
                    className="pl-10 h-11 border-gray-300 focus:border-[#00C9CE] focus:ring-[#00C9CE]"
                    required
                    disabled={loading}
                    autoComplete="email"
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
                    {TEXTS.clients.recovery.sendingButton}
                  </>
                ) : (
                  TEXTS.clients.recovery.sendButton
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate('/clientes')}
                variant="ghost"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                disabled={loading}
              >
                {TEXTS.clients.recovery.backToLogin}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { RecuperarContrasenaClientes };
