import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { TEXTS } from '@/content/texts';
import { supabase } from '../supabase';
import { setAdminPin, setAdminSession } from '../utils/adminAuth';

export function AdminLogin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin.trim()) {
      setError(TEXTS.admin.panel.login.pinError);
      return;
    }

    setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('admin-login', {
        body: { pin: pin.trim() },
      });

      if (invokeError || !data?.ok) {
        setError(TEXTS.admin.panel.login.pinError);
        return;
      }

      setAdminSession();
      setAdminPin(pin.trim());
      navigate('/admin/panel');
    } catch {
      setError(TEXTS.admin.panel.login.pinError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#000935' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#00C9CE' }}
          >
            <Shield className="w-7 h-7" style={{ color: '#000935' }} />
          </div>
        </div>

        <h1 className="text-center mb-2" style={{ color: '#000935' }}>
          {TEXTS.admin.panel.login.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="admin-pin" className="text-[#000935]">
              {TEXTS.admin.panel.login.pinLabel}
            </Label>
            <Input
              id="admin-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={TEXTS.admin.panel.login.pinPlaceholder}
              autoComplete="current-password"
              className="mt-1 h-11 border-0 bg-[#E8E8E8] placeholder:text-gray-500 focus-visible:ring-[#00C9CE]"
              disabled={loading}
            />
            <p className="text-sm text-gray-500">{TEXTS.admin.panel.login.pinHelp}</p>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-11 rounded-lg text-base"
            style={{ backgroundColor: '#00C9CE', color: '#000935' }}
          >
            {loading ? TEXTS.admin.panel.login.accessing : TEXTS.admin.panel.login.accessButton}
          </Button>
        </form>

        <div className="text-center mt-10">
          <Link to="/" className="text-[#000935] hover:underline">
            {TEXTS.admin.panel.login.backToSite}
          </Link>
        </div>
      </div>
    </div>
  );
}
