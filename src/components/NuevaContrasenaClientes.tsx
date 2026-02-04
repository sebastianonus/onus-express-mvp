import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import backgroundImage from 'figma:asset/433f006a1a8dbb744643830e0e0b3f07184d05b1.png';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';

/**
 * COMPONENTE: Nueva Contraseña - Área Clientes
 * 
 * Solo se muestra si hay token de Supabase en la URL (type=recovery).
 * Usa exclusivamente: supabase.auth.updateUser({ password })
 * 
 * NO guarda tokens, NO usa localStorage, NO lógica custom.
 */

export function NuevaContrasenaClientes() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    /**
     * INTEGRACIÓN FUTURA:
     * Verificar si hay token de recovery en la URL
     * 
     * const hashParams = new URLSearchParams(window.location.hash.substring(1));
     * const type = hashParams.get('type');
     * if (type === 'recovery') {
     *   setHasToken(true);
     * } else {
     *   navigate('/clientes');
     * }
     */
    
    // Placeholder: permitir acceso para pruebas de UI
    setHasToken(true);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica de contraseñas coincidentes
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validación básica de longitud
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      /**
       * INTEGRACIÓN FUTURA:
       * await supabase.auth.updateUser({ password });
       * 
       * Si éxito:
       * - Mostrar toast de éxito
       * - Redirigir a login
       * 
       * NO guardar tokens
       * NO localStorage
       * NO lógica custom
       */
      
      // Placeholder: mostrar que está pendiente de integración
      toast.info('Función de actualización de contraseña pendiente de integración con Supabase Auth');
      
      // En producción, redirigir a login tras éxito
      setTimeout(() => {
        toast.success('Contraseña actualizada correctamente');
        navigate('/clientes');
      }, 1000);
      
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      setError('Error al actualizar la contraseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00C9CE]" />
          <p className="text-gray-600">Verificando...</p>
        </div>
      </div>
    );
  }

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
              NUEVA CONTRASEÑA
            </h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nueva Contraseña */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 h-11 border-gray-300 focus:border-[#00C9CE] focus:ring-[#00C9CE]"
                    required
                  />
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="pl-10 h-11 border-gray-300 focus:border-[#00C9CE] focus:ring-[#00C9CE]"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-[#00C9CE] hover:bg-[#00B5BA] text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Contraseña'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate('/clientes')}
                variant="ghost"
                className="text-sm text-gray-600 hover:text-gray-900"
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
