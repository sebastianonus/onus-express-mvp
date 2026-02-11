import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  LogOut,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import backgroundImage from 'figma:asset/4261f3db5c66ef3456a8ebcae9838917a1e10ea5.png';
import { TEXTS } from '@/content/texts';
import { useRequireRole } from '../hooks/useRequireRole';
import { toast } from 'sonner';
import { clearMensajeroSessionWindow, ensureMensajeroSessionWindow, isMensajeroSessionExpired } from '../utils/mensajerosSession';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface MensajeroAuth {
  codigo: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  fechaLogin: string;
}

interface Postulacion {
  id: string;
  user_id: string;
  campaign_id: string;
  campanaNombre: string;
  fecha: string;
  estado: 'En revisión' | 'Aceptado' | 'Rechazado';
  motivacion?: string;
  experiencia?: string;
  disponibilidad?: string;
  mensaje?: string;
}

export function MensajerosPostulaciones() {
  useRequireRole('mensajero');

  const navigate = useNavigate();
  const [mensajero, setMensajero] = useState<MensajeroAuth | null>(null);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        navigate('/mensajeros/acceso');
        return;
      }

      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session?.user) {
        navigate('/mensajeros/acceso');
        return;
      }

      const role = session.user.app_metadata?.role;
      if (role !== 'mensajero') {
        await supabase.auth.signOut();
        clearMensajeroSessionWindow();
        navigate('/mensajeros/acceso');
        return;
      }
      if (isMensajeroSessionExpired(session)) {
        await supabase.auth.signOut();
        clearMensajeroSessionWindow();
        toast.error(TEXTS.couriers.login.feedback.errors.sessionExpired24h);
        navigate('/mensajeros/acceso');
        return;
      }
      ensureMensajeroSessionWindow(session);
      setCurrentUserId(session.user.id);

      setMensajero({
        codigo: String(session.user.user_metadata?.codigo ?? '—'),
        nombre: String(session.user.user_metadata?.nombre ?? session.user.email ?? 'Mensajero'),
        email: session.user.email ?? '',
        telefono: String(session.user.user_metadata?.telefono ?? ''),
        activo: true,
        fechaLogin: new Date().toISOString(),
      });

      const { data: posts, error: postsErr } = await supabase
        .from('postulaciones')
        .select('id, user_id, campaign_id, created_at, estado, mensaje')
        .eq('user_id', session.user.id);

      if (postsErr) {
        console.error('Error cargando postulaciones:', postsErr);
        setPostulaciones([]);
        return;
      }

      const campaignIds = Array.from(
        new Set((posts ?? []).map((p: any) => String(p.campaign_id)).filter(Boolean))
      );

      let campaignNameById = new Map<string, string>();
      if (campaignIds.length > 0) {
        const { data: camps, error: campsErr } = await supabase
          .from('campaigns')
          .select('id, nombre, titulo, title')
          .in('id', campaignIds);

        if (campsErr) {
          console.error('Error cargando campañas:', campsErr);
        } else {
          campaignNameById = new Map(
            (camps ?? []).map((c: any) => [String(c.id), String(c.nombre ?? c.titulo ?? c.title ?? 'Campaña')])
          );
        }
      }

      const mapped: Postulacion[] = (posts ?? []).map((p: any) => {
        const rawEstado = String(p.estado ?? 'pending');
        const estado =
          rawEstado === 'Aceptado' || rawEstado === 'accepted'
            ? 'Aceptado'
            : rawEstado === 'Rechazado' || rawEstado === 'rejected'
              ? 'Rechazado'
              : 'En revisión';

        const rawMensaje = typeof p.mensaje === 'string' ? p.mensaje : '';
        const lineas = rawMensaje.split('\n').map((linea: string) => linea.trim());
        const motivacion =
          lineas
            .find((l: string) => l.toLowerCase().startsWith('motivaci'))
            ?.split(':')
            .slice(1)
            .join(':')
            .trim() || undefined;
        const experiencia =
          lineas
            .find((l: string) => l.toLowerCase().startsWith('experiencia'))
            ?.split(':')
            .slice(1)
            .join(':')
            .trim() || undefined;
        const disponibilidad =
          lineas
            .find((l: string) => l.toLowerCase().startsWith('disponibilidad'))
            ?.split(':')
            .slice(1)
            .join(':')
            .trim() || undefined;

        return {
          id: String(p.id),
          user_id: String(p.user_id),
          campaign_id: String(p.campaign_id),
          campanaNombre: campaignNameById.get(String(p.campaign_id)) ?? 'Campaña',
          fecha: String(p.created_at ?? new Date().toISOString()),
          estado,
          motivacion,
          experiencia,
          disponibilidad,
          mensaje: rawMensaje || undefined,
        };
      });

      setPostulaciones(
        mapped.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      );
    };

    void init();
  }, [navigate]);

  useEffect(() => {
    if (!supabase || !currentUserId) return;

    const channel = supabase
      .channel(`mensajero-postulaciones-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'postulaciones',
          filter: `user_id=eq.${currentUserId}`,
        },
        async () => {
          const { data: posts, error: postsErr } = await supabase
            .from('postulaciones')
            .select('id, user_id, campaign_id, created_at, estado, mensaje')
            .eq('user_id', currentUserId);

          if (postsErr) {
            console.error('Error refrescando postulaciones:', postsErr);
            return;
          }

          const campaignIds = Array.from(
            new Set((posts ?? []).map((p: any) => String(p.campaign_id)).filter(Boolean))
          );

          let campaignNameById = new Map<string, string>();
          if (campaignIds.length > 0) {
            const { data: camps } = await supabase
              .from('campaigns')
              .select('id, nombre, titulo, title')
              .in('id', campaignIds);

            campaignNameById = new Map(
              (camps ?? []).map((c: any) => [String(c.id), String(c.nombre ?? c.titulo ?? c.title ?? 'Campaña')])
            );
          }

          const mapped: Postulacion[] = (posts ?? []).map((p: any) => {
            const rawEstado = String(p.estado ?? 'pending');
            const estado =
              rawEstado === 'Aceptado' || rawEstado === 'accepted'
                ? 'Aceptado'
                : rawEstado === 'Rechazado' || rawEstado === 'rejected'
                  ? 'Rechazado'
                  : 'En revisiÃ³n';

            const rawMensaje = typeof p.mensaje === 'string' ? p.mensaje : '';
            const lineas = rawMensaje.split('\n').map((linea: string) => linea.trim());
            const motivacion =
              lineas
                .find((l: string) => l.toLowerCase().startsWith('motivaci'))
                ?.split(':')
                .slice(1)
                .join(':')
                .trim() || undefined;
            const experiencia =
              lineas
                .find((l: string) => l.toLowerCase().startsWith('experiencia'))
                ?.split(':')
                .slice(1)
                .join(':')
                .trim() || undefined;
            const disponibilidad =
              lineas
                .find((l: string) => l.toLowerCase().startsWith('disponibilidad'))
                ?.split(':')
                .slice(1)
                .join(':')
                .trim() || undefined;

            return {
              id: String(p.id),
              user_id: String(p.user_id),
              campaign_id: String(p.campaign_id),
              campanaNombre: campaignNameById.get(String(p.campaign_id)) ?? 'CampaÃ±a',
              fecha: String(p.created_at ?? new Date().toISOString()),
              estado,
              motivacion,
              experiencia,
              disponibilidad,
              mensaje: rawMensaje || undefined,
            };
          });

          setPostulaciones(
            mapped.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    clearMensajeroSessionWindow();
    navigate('/mensajeros/acceso');
  };

  const getEstadoBadge = (estado: Postulacion['estado']) => {
    switch (estado) {
      case 'Aceptado':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300 border">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {TEXTS.couriers.applications.status.accepted}
          </Badge>
        );
      case 'Rechazado':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300 border">
            <XCircle className="w-3 h-3 mr-1" />
            {TEXTS.couriers.applications.status.rejected}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 border">
            <AlertCircle className="w-3 h-3 mr-1" />
            {TEXTS.couriers.applications.status.review}
          </Badge>
        );
    }
  };

  if (!mensajero) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000935' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#00C9CE' }} />
          <p className="text-white">{TEXTS.couriers.applications.loading.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: '#000935', minHeight: 'calc(100vh - 80px)' }}
    >
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center',
          opacity: 0.5,
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: '#000935', opacity: 0.5 }} />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1
                className="mb-2"
                style={{ color: '#FFFFFF', fontFamily: 'REM, sans-serif', fontWeight: 500 }}
              >
                {TEXTS.couriers.applications.header.title}
              </h1>
              <p className="text-gray-300">
                {mensajero.nombre} • Código:{' '}
                <span className="font-mono text-[#00C9CE]">{mensajero.codigo}</span>
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/10 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {TEXTS.couriers.applications.header.logout}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="mb-0"
              style={{ color: '#000935', fontFamily: 'REM, sans-serif', fontWeight: 500 }}
            >
              {TEXTS.couriers.applications.main.title}
            </h2>
            <Link to="/mensajeros">
              <Button
                variant="outline"
                className="border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {TEXTS.couriers.applications.main.back}
              </Button>
            </Link>
          </div>

          {postulaciones.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg mb-2">{TEXTS.couriers.applications.empty.title}</p>
              <p className="text-gray-500 mb-6">{TEXTS.couriers.applications.empty.subtitle}</p>
              <Link to="/mensajeros">
                <Button style={{ backgroundColor: '#00C9CE', color: '#000935' }}>
                  {TEXTS.couriers.applications.empty.cta}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {postulaciones.map((postulacion) => (
                <div
                  key={postulacion.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#00C9CE] transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3
                          className="text-lg mb-1"
                          style={{
                            color: '#000935',
                            fontFamily: 'REM, sans-serif',
                            fontWeight: 500,
                          }}
                        >
                          {postulacion.campanaNombre}
                        </h3>
                        {getEstadoBadge(postulacion.estado)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" style={{ color: '#00C9CE' }} />
                          {TEXTS.couriers.applications.labels.applicationDate}{' '}
                          {new Date(postulacion.fecha).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" style={{ color: '#00C9CE' }} />
                          {new Date(postulacion.fecha).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {postulacion.motivacion && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p
                            className="text-xs uppercase tracking-wide mb-2"
                            style={{ color: '#00C9CE', fontWeight: 500 }}
                          >
                            {TEXTS.couriers.applications.labels.yourMotivation}
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {postulacion.motivacion}
                          </p>
                        </div>
                      )}

                      {postulacion.experiencia && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <p
                            className="text-xs uppercase tracking-wide mb-2"
                            style={{ color: '#00C9CE', fontWeight: 500 }}
                          >
                            {TEXTS.couriers.applications.labels.yourExperience}
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {postulacion.experiencia}
                          </p>
                        </div>
                      )}

                      {postulacion.disponibilidad && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <p
                            className="text-xs uppercase tracking-wide mb-2"
                            style={{ color: '#00C9CE', fontWeight: 500 }}
                          >
                            {TEXTS.couriers.applications.labels.yourAvailability}
                          </p>
                          <p className="text-sm text-gray-700">{postulacion.disponibilidad}</p>
                        </div>
                      )}

                      {postulacion.estado === 'En revisión' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            {TEXTS.couriers.applications.info.review}
                          </p>
                        </div>
                      )}
                      {postulacion.estado === 'Aceptado' && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            {TEXTS.couriers.applications.info.accepted}
                          </p>
                        </div>
                      )}
                      {postulacion.estado === 'Rechazado' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            {TEXTS.couriers.applications.info.rejected}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {postulaciones.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3
                className="text-sm uppercase tracking-wide mb-4"
                style={{ color: '#00C9CE', fontWeight: 500 }}
              >
                {TEXTS.couriers.applications.stats.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1" style={{ color: '#000935', fontWeight: 600 }}>
                    {postulaciones.length}
                  </p>
                  <p className="text-sm text-gray-600">{TEXTS.couriers.applications.stats.total}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl text-green-700 mb-1" style={{ fontWeight: 600 }}>
                    {postulaciones.filter((p) => p.estado === 'Aceptado').length}
                  </p>
                  <p className="text-sm text-gray-600">
                    {TEXTS.couriers.applications.stats.accepted}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <p className="text-2xl text-yellow-700 mb-1" style={{ fontWeight: 600 }}>
                    {postulaciones.filter((p) => p.estado === 'En revisión').length}
                  </p>
                  <p className="text-sm text-gray-600">{TEXTS.couriers.applications.stats.review}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


