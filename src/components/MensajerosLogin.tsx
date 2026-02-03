import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader2, UserCircle, X, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import backgroundImage from 'figma:asset/4261f3db5c66ef3456a8ebcae9838917a1e10ea5.png';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';
import { TEXTS } from '@/content/texts';

/**
 * COMPONENTE: Login de Mensajeros - Frontend limpio sin backend
 * 
 * ESTADO ACTUAL: Solo UI funcional
 * - Formulario de magic link (visual)
 * - Formulario de registro (visual)
 * - NO guarda datos
 * - NO autentica usuarios
 * - NO persiste estado
 * 
 * INTEGRACIÓN FUTURA:
 * - handleMagicLinkSubmit → supabase.auth.signInWithOtp()
 * - handleFormSubmit → supabase.auth.signUp() + insertar en tabla mensajeros
 */

export function MensajerosLogin() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    telefono: '',
    ciudad: '',
    vehiculo: '',
    flotista: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  /**
   * PLACEHOLDER: Login con email y contraseña
   * 
   * INTEGRACIÓN FUTURA:
   * await supabase.auth.signInWithPassword({ email, password });
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      /**
       * PLACEHOLDER: Login de mensajero
       * 
       * INTEGRACIÓN FUTURA:
       * await supabase.auth.signInWithPassword({ email, password })
       */
      toast.info('Función de login pendiente de integración con Supabase Auth');
      setLoading(false);
    } catch (error) {
      console.error('Error en login:', error);
      setError('Email o contraseña incorrectos');
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * PLACEHOLDER: Registro de nuevo mensajero
   * 
   * INTEGRACIÓN FUTURA:
   * 1. await supabase.auth.signUp({ email, password })
   * 2. await supabase.from('mensajeros').insert({ ...formData, user_id })
   * 3. Asignar role 'mensajero' en app_metadata
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      /**
       * PLACEHOLDER: Registro de mensajero
       * 
       * INTEGRACIÓN FUTURA:
       * 1. await supabase.auth.signUp({ email, password })
       * 2. await supabase.from('mensajeros').insert({ ...formData, user_id })
       * 3. Asignar role 'mensajero'
       */
      
      toast.info('Función de registro pendiente de integración con Supabase Auth');
      setFormLoading(false);
      setShowForm(false);
      
      // Resetear formulario
      setFormData({
        email: '',
        nombre: '',
        telefono: '',
        ciudad: '',
        vehiculo: '',
        flotista: '',
      });
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error('Error al registrar. Intenta nuevamente.');
      setFormLoading(false);
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

          {!showForm ? (
            <>
              {/* Magic Link Form */}
              <div>
                <h1 className="text-2xl font-semibold text-[#000935] mb-2 text-center">
                  {TEXTS.couriers.login.title}
                </h1>
                <p className="text-gray-500 text-sm mb-8 text-center">
                  {TEXTS.couriers.login.subtitle}
                </p>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      {TEXTS.couriers.login.emailLabel}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={TEXTS.couriers.login.emailPlaceholder}
                        className="pl-10 h-11 border-gray-300 focus:border-[#00C9CE] focus:ring-[#00C9CE]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                      {TEXTS.couriers.login.passwordLabel}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={TEXTS.couriers.login.passwordPlaceholder}
                        className="pl-10 h-11 border-gray-300 focus:border-[#00C9CE] focus:ring-[#00C9CE]"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#00C9CE] hover:bg-[#00B5BA] text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {TEXTS.couriers.login.sendingButton}
                      </>
                    ) : (
                      TEXTS.couriers.login.sendButton
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    {TEXTS.couriers.login.noAccount}
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="w-full h-11 border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/5 font-medium"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    {TEXTS.couriers.login.registerButton}
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {TEXTS.couriers.login.backToSite}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Registration Form */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#000935]">
                  {TEXTS.couriers.register.title}
                </h1>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="form-email">{TEXTS.couriers.register.emailLabel}</Label>
                  <Input
                    id="form-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder={TEXTS.couriers.register.emailPlaceholder}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="nombre">{TEXTS.couriers.register.nameLabel}</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleFormChange}
                    placeholder={TEXTS.couriers.register.namePlaceholder}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">{TEXTS.couriers.register.phoneLabel}</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleFormChange}
                    placeholder={TEXTS.couriers.register.phonePlaceholder}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ciudad">{TEXTS.couriers.register.cityLabel}</Label>
                  <Select
                    value={formData.ciudad}
                    onValueChange={(value) => handleSelectChange('ciudad', value)}
                  >
                    <SelectTrigger id="ciudad">
                      <SelectValue placeholder={TEXTS.couriers.register.cityPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXTS.couriers.register.cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehiculo">{TEXTS.couriers.register.vehicleLabel}</Label>
                  <Select
                    value={formData.vehiculo}
                    onValueChange={(value) => handleSelectChange('vehiculo', value)}
                  >
                    <SelectTrigger id="vehiculo">
                      <SelectValue placeholder={TEXTS.couriers.register.vehiclePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXTS.couriers.register.vehicles.map((vehicle) => (
                        <SelectItem key={vehicle} value={vehicle}>
                          {vehicle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="flotista">{TEXTS.couriers.register.fleetLabel}</Label>
                  <Select
                    value={formData.flotista}
                    onValueChange={(value) => handleSelectChange('flotista', value)}
                  >
                    <SelectTrigger id="flotista">
                      <SelectValue placeholder={TEXTS.couriers.register.fleetPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXTS.couriers.register.fleets.map((fleet) => (
                        <SelectItem key={fleet} value={fleet}>
                          {fleet}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#00C9CE] hover:bg-[#00B5BA] text-[#000935]"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {TEXTS.couriers.register.submittingButton}
                    </>
                  ) : (
                    TEXTS.couriers.register.submitButton
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}