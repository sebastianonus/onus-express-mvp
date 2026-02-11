import { useState } from 'react';
import { Package, Zap, Warehouse, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { TarifarioUltimaMilla } from './tarifarios/TarifarioUltimaMilla';
import { TarifarioMensajeriaExpress } from './tarifarios/TarifarioMensajeriaExpress';
import { TarifarioAlmacenLogistica } from './tarifarios/TarifarioAlmacenLogistica';
import backgroundImage from 'figma:asset/433f006a1a8dbb744643830e0e0b3f07184d05b1.png';
import { TEXTS } from '@/content/texts';
import { supabase } from '@/supabase';

export function Clientes() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [error, setError] = useState('');
  const [tarifarioActivo, setTarifarioActivo] = useState<
    'ultima-milla' | 'envios-express' | 'almacen' | null
  >(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(TEXTS.clients.errors.emptyCode);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(TEXTS.clients.errors.invalidCode);
      return;
    }

    const role = data.user.app_metadata?.role;

    if (role !== 'cliente') {
      await supabase.auth.signOut();
      setError(TEXTS.clients.errors.invalidCode);
      return;
    }

    setIsAuthenticated(true);
    setNombreCliente(data.user.email ?? '');
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div
          className={`sticky top-16 z-40 bg-white shadow-md ${
            tarifarioActivo === null ? 'hidden md:block' : ''
          }`}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="onus-title text-xl" style={{ color: '#000935' }}>
                {TEXTS.clients.dashboard.tariffSelectorTitle}
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setTarifarioActivo('ultima-milla')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    tarifarioActivo === 'ultima-milla'
                      ? 'bg-[#00C9CE] text-white shadow-lg'
                      : 'bg-gray-100 text-[#000935] hover:bg-gray-200'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>{TEXTS.clients.dashboard.tabLastMile}</span>
                </button>
                <button
                  onClick={() => setTarifarioActivo('envios-express')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    tarifarioActivo === 'envios-express'
                      ? 'bg-[#00C9CE] text-white shadow-lg'
                      : 'bg-gray-100 text-[#000935] hover:bg-gray-200'
                  }`}
                >
                  <Zap className="h-5 w-5" />
                  <span>{TEXTS.clients.dashboard.tabExpress}</span>
                </button>
                <button
                  onClick={() => setTarifarioActivo('almacen')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    tarifarioActivo === 'almacen'
                      ? 'bg-[#00C9CE] text-white shadow-lg'
                      : 'bg-gray-100 text-[#000935] hover:bg-gray-200'
                  }`}
                >
                  <Warehouse className="h-5 w-5" />
                  <span>{TEXTS.clients.dashboard.tabWarehouse}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          {tarifarioActivo === null && (
            <div className="container mx-auto px-6 py-20">
              <div className="max-w-4xl mx-auto text-center">
                <CheckCircle2 className="h-20 w-20 mx-auto mb-6 text-green-500" />
                <h2 className="onus-title text-3xl mb-4" style={{ color: '#000935' }}>
                  {TEXTS.clients.dashboard.welcomeTitle}
                </h2>
                <p className="text-lg text-gray-600 mb-12">
                  {TEXTS.clients.dashboard.welcomeSubtitle}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setTarifarioActivo('ultima-milla')}
                    className="bg-white border-2 border-gray-200 hover:border-[#00C9CE] rounded-lg p-8 transition-all hover:shadow-lg group h-full"
                  >
                    <div className="text-center h-full flex flex-col items-center justify-center">
                      <Package className="h-16 w-16 mx-auto mb-4 text-gray-400 group-hover:text-[#00C9CE] transition-colors" />
                      <h3 className="onus-title text-xl mb-2 text-[#000935]">
                        {TEXTS.clients.dashboard.cardLastMileTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {TEXTS.clients.dashboard.cardLastMileDescription}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setTarifarioActivo('envios-express')}
                    className="bg-white border-2 border-gray-200 hover:border-[#00C9CE] rounded-lg p-8 transition-all hover:shadow-lg group h-full"
                  >
                    <div className="text-center h-full flex flex-col items-center justify-center">
                      <Zap className="h-16 w-16 mx-auto mb-4 text-gray-400 group-hover:text-[#00C9CE] transition-colors" />
                      <h3 className="onus-title text-xl mb-2 text-[#000935]">
                        {TEXTS.clients.dashboard.cardExpressTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {TEXTS.clients.dashboard.cardExpressDescription}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setTarifarioActivo('almacen')}
                    className="bg-white border-2 border-gray-200 hover:border-[#00C9CE] rounded-lg p-8 transition-all hover:shadow-lg group h-full"
                  >
                    <div className="text-center h-full flex flex-col items-center justify-center">
                      <Warehouse className="h-16 w-16 mx-auto mb-4 text-gray-400 group-hover:text-[#00C9CE] transition-colors" />
                      <h3 className="onus-title text-xl mb-2 text-[#000935]">
                        {TEXTS.clients.dashboard.cardWarehouseTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {TEXTS.clients.dashboard.cardWarehouseDescription}
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-12 p-6 bg-blue-50 border-l-4 border-[#00C9CE] rounded text-left">
                  <p className="text-sm text-gray-700">
                    <strong>{TEXTS.clients.dashboard.tipLabel}</strong>{' '}
                    {TEXTS.clients.dashboard.tipText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tarifarioActivo === 'ultima-milla' && (
            <TarifarioUltimaMilla nombreCliente={nombreCliente} isAdmin={false} />
          )}
          {tarifarioActivo === 'envios-express' && (
            <TarifarioMensajeriaExpress nombreCliente={nombreCliente} isAdmin={false} />
          )}
          {tarifarioActivo === 'almacen' && (
            <TarifarioAlmacenLogistica nombreCliente={nombreCliente} isAdmin={false} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <section
        className="pt-52 pb-52 px-6 relative overflow-hidden min-h-[600px]"
        style={{ backgroundColor: '#000935' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: 'center 30%',
            opacity: 0.5,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: '#000935', opacity: 0.5 }}
        />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#00C9CE20' }}
          >
            <Lock className="w-10 h-10" style={{ color: '#00C9CE' }} />
          </div>
          <h1
            className="text-4xl md:text-5xl mb-6"
            style={{
              color: '#FFFFFF',
              fontFamily: 'REM, sans-serif',
              fontWeight: 500,
            }}
          >
            {TEXTS.clients.title}
          </h1>
          <p className="text-lg text-gray-300">{TEXTS.clients.subtitle}</p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-xl">
          <div className="border-2 rounded-xl p-8 md:p-12" style={{ borderColor: '#00C9CE' }}>
            <h2 className="onus-title text-2xl mb-6 text-center" style={{ color: '#000935' }}>
              {TEXTS.clients.formTitle}
            </h2>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-base">
                  {TEXTS.clients.form.labels.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder={TEXTS.clients.placeholders.email}
                  className="mt-2"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-base">
                  {TEXTS.clients.form.labels.password}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder={TEXTS.clients.placeholders.password}
                  className="mt-2"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-sm text-center" style={{ color: '#dc2626' }}>
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#00C9CE', color: '#000935' }}
              >
                {TEXTS.clients.form.labels.accessButton}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  onClick={() => navigate('/clientes/recuperar-contrasena')}
                  variant="ghost"
                  className="text-sm text-gray-600 hover:text-[#00C9CE]"
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600 mb-4">{TEXTS.clients.form.labels.noCode}</p>
              <Button
                onClick={() => navigate('/contacto')}
                className="w-full"
                variant="outline"
                style={{ borderColor: '#000935', color: '#000935' }}
              >
                {TEXTS.clients.form.labels.requestAccess}
              </Button>
            </div>

            <p className="text-xs text-center text-gray-400 mt-6">
              {TEXTS.clients.form.labels.testCode}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

