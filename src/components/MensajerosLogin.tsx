import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader2, UserCircle, X, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import backgroundImage from 'figma:asset/4261f3db5c66ef3456a8ebcae9838917a1e10ea5.png';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';
import { TEXTS } from '@/content/texts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * COMPONENTE: Login de Mensajeros
 *
 * Reglas MVP:
 * - Mensajeros: Magic link (Supabase Auth signInWithOtp)
 * - Sin localStorage, sin mocks, sin flujos inventados
 *
 * Registro:
 * - Inserta solicitud en tabla pública: solicitudes_mensajeros (solo INSERT con RLS)
 */
export function MensajerosLogin() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);

  // Login (magic link)
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registro (solicitud)
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    telefono: '',
    ciudad: '',
    vehiculo: '',
    flotista: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      if (!supabase) {
        setLoginError(TEXTS.couriers.login.feedback.errors.supabaseConfigError);
        return;
      }

      const emailTrimmed = email.trim();
      if (!emailTrimmed) {
        setLoginError(TEXTS.couriers.login.feedback.errors.emailRequired);
        return;
      }

      const redirectTo = `${window.location.origin}/mensajeros`;

      const { error } = await supabase.auth.signInWithOtp({
        email: emailTrimmed,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        setLoginError(TEXTS.couriers.login.feedback.errors.magicLinkFailed);
        return;
      }

      toast.success(TEXTS.couriers.login.feedback.linkSentToast);
    } catch (err) {
      console.error('Error en login:', err);
      setLoginError(TEXTS.couriers.login.feedback.errors.magicLinkRetry);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (!supabase) {
        toast.error(TEXTS.couriers.login.feedback.errors.supabaseConfigError);
        return;
      }

      const payload = {
        email: formData.email.trim(),
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        ciudad: formData.ciudad,
        experiencia: `Vehículo: ${formData.vehiculo}\nFlotista: ${formData.flotista}`,
      };

      const payloadLegacy = {
        ...payload,
        vehiculo: formData.vehiculo,
        flotista: formData.flotista,
      };

      let insertError: unknown = null;
      const first = await supabase.from('solicitudes_mensajeros').insert(payloadLegacy);
      insertError = first.error;
      if (insertError) {
        const second = await supabase.from('solicitudes_mensajeros').insert(payload);
        insertError = second.error;
      }
      if (insertError) {
        const third = await supabase.from('solicitudes_mensajeros').insert({
          nombre: payload.nombre,
          email: payload.email,
          telefono: payload.telefono,
          ciudad: payload.ciudad,
        });
        insertError = third.error;
      }

      if (insertError) {
        toast.error(TEXTS.couriers.login.feedback.errors.registerFailed);
        return;
      }

      toast.success(TEXTS.couriers.login.feedback.registerRequestSentToast);
      setShowForm(false);

      setFormData({
        email: '',
        nombre: '',
        telefono: '',
        ciudad: '',
        vehiculo: '',
        flotista: '',
      });
    } catch (err) {
      console.error('Error en registro:', err);
      toast.error(TEXTS.couriers.login.feedback.errors.registerUnexpectedError);
    } finally {
      setFormLoading(false);
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

          {!showForm ? (
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLoginError('');
                      }}
                      placeholder={TEXTS.couriers.login.emailPlaceholder}
                      className="pl-10 h-11 border-gray-300 focus:border-[#00C9CE] focus:ring-[#00C9CE]"
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{loginError}</div>
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

                <div className="text-center">
                  <Button
                    type="button"
                    onClick={() => navigate('/mensajeros/recuperar-contrasena')}
                    variant="ghost"
                    className="text-sm text-gray-600 hover:text-[#00C9CE]"
                    disabled={loading}
                  >
                    {TEXTS.couriers.login.forgotPassword}
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 mb-3">{TEXTS.couriers.login.noAccount}</p>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  className="w-full h-11 border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/5 font-medium"
                  disabled={loading}
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
                  disabled={loading}
                >
                  {TEXTS.couriers.login.backToSite}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#000935]">{TEXTS.couriers.register.title}</h1>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  disabled={formLoading}
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
                    disabled={formLoading}
                    autoComplete="email"
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
                    disabled={formLoading}
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
                    disabled={formLoading}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <Label htmlFor="ciudad">{TEXTS.couriers.register.cityLabel}</Label>
                  <Select
                    value={formData.ciudad}
                    onValueChange={(value) => handleSelectChange('ciudad', value)}
                    disabled={formLoading}
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
                    disabled={formLoading}
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
                    disabled={formLoading}
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
