import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, User, Mail, Phone, Calendar, MessageSquare, AlertCircle, Download, MapPin, DollarSign, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { TEXTS } from '@/content/texts';
import { supabase } from '../../supabase';

interface Postulacion {
  id: string;
  user_id: string; // Cambiado de mensajeroCodigo - referencia a auth.users
  campaign_id: string; // Cambiado de campanaId
  mensajeroNombre: string; // Temporal - en producciÃƒÂ³n vendrÃƒÂ¡ de JOIN con auth.users
  mensajeroEmail: string; // Temporal - en producciÃƒÂ³n vendrÃƒÂ¡ de JOIN con auth.users
  mensajeroTelefono: string; // Temporal - en producciÃƒÂ³n vendrÃƒÂ¡ de JOIN con auth.users
  fecha: string;
  estado: 'En revisiÃƒÂ³n' | 'Aceptado' | 'Rechazado';
  motivacion?: string;
  experiencia?: string;
  disponibilidad?: string;
}

interface Campaign {
  id: string;
  titulo: string;
  logoUrl?: string;
  ciudad: string;
  tarifa: string;
  descripcion?: string;
  createdAt: string;
  vehiculos: string[];
  flotista: string[];
  mensajero: string[];
  isActive: boolean;
  cliente?: string;
}

interface CampanaDetalleViewProps {
  campaignId: string;
  onBack: () => void;
}

export function CampanaDetalleView({ campaignId, onBack }: CampanaDetalleViewProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [filter, setFilter] = useState<'all' | 'En revisiÃƒÂ³n' | 'Aceptado' | 'Rechazado'>('all');
  const [loading, setLoading] = useState(true);

  const dbEstadoToUi = (estado: string | null | undefined): Postulacion['estado'] => {
    if (!estado) return 'En revisiÃ³n';
    const normalized = estado.toLowerCase();
    if (normalized === 'accepted' || normalized === 'aceptado') return 'Aceptado';
    if (normalized === 'rejected' || normalized === 'rechazado') return 'Rechazado';
    return 'En revisiÃ³n';
  };

  const uiEstadoToDb = (estado: Postulacion['estado']): 'pending' | 'accepted' | 'rejected' => {
    if (estado === 'Aceptado') return 'accepted';
    if (estado === 'Rechazado') return 'rejected';
    return 'pending';
  };

  const parseMensaje = (mensaje: string | null | undefined) => {
    const raw = typeof mensaje === 'string' ? mensaje : '';
    const lines = raw.split('\n').map((line) => line.trim());
    const extract = (prefix: string) =>
      lines
        .find((line) => line.toLowerCase().startsWith(prefix))
        ?.split(':')
        .slice(1)
        .join(':')
        .trim();

    return {
      motivacion: extract('motivaci'),
      experiencia: extract('experiencia'),
      disponibilidad: extract('disponibilidad'),
    };
  };

  useEffect(() => {
    loadData();
  }, [campaignId]);

  useEffect(() => {
    const channel = supabase
      .channel(`admin-campana-postulaciones-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'postulaciones',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          void loadData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [campaignId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: campaignRow, error: campaignErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (campaignErr || !campaignRow) {
        console.error('Error loading campaign detail:', campaignErr);
        toast.error(TEXTS.admin.panel.messages.errors.loadCampaigns);
        setCampaign(null);
        setPostulaciones([]);
        return;
      }

      const requisitos = Array.isArray((campaignRow as any).requisitos)
        ? ((campaignRow as any).requisitos as string[])
        : Array.isArray((campaignRow as any).requirements)
          ? ((campaignRow as any).requirements as string[])
          : [];

      const flotista = requisitos
        .filter((item) => item.startsWith('FLOTISTA::'))
        .map((item) => item.replace('FLOTISTA::', ''));
      const mensajero = requisitos
        .filter((item) => item.startsWith('MENSAJERO::'))
        .map((item) => item.replace('MENSAJERO::', ''));

      setCampaign({
        id: String((campaignRow as any).id),
        titulo: String((campaignRow as any).titulo ?? (campaignRow as any).title ?? (campaignRow as any).nombre ?? ''),
        logoUrl: (campaignRow as any).logo_url ?? (campaignRow as any).logo ?? undefined,
        ciudad: String((campaignRow as any).ciudad ?? (campaignRow as any).city ?? ''),
        tarifa: String((campaignRow as any).tarifa ?? (campaignRow as any).rate ?? ''),
        descripcion: String((campaignRow as any).descripcion ?? (campaignRow as any).description ?? ''),
        createdAt: String((campaignRow as any).created_at ?? new Date().toISOString()),
        vehiculos: Array.isArray((campaignRow as any).vehiculos)
          ? ((campaignRow as any).vehiculos as string[])
          : Array.isArray((campaignRow as any).vehicles)
            ? ((campaignRow as any).vehicles as string[])
            : [],
        flotista,
        mensajero,
        isActive: Boolean((campaignRow as any).is_active ?? (campaignRow as any).active ?? true),
        cliente: String((campaignRow as any).cliente ?? (campaignRow as any).client ?? ''),
      });

      const { data: postsRows, error: postsErr } = await supabase
        .from('postulaciones')
        .select('id, user_id, campaign_id, created_at, estado, mensaje')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (postsErr) {
        console.error('Error loading postulaciones detail:', postsErr);
        setPostulaciones([]);
        return;
      }

      const mapped: Postulacion[] = (postsRows ?? []).map((row: any) => {
        const parsed = parseMensaje(row.mensaje);
        const userId = String(row.user_id ?? '');
        return {
          id: String(row.id),
          user_id: userId,
          campaign_id: String(row.campaign_id ?? campaignId),
          mensajeroNombre: userId || TEXTS.admin.campanaDetalle.defaults.courierName,
          mensajeroEmail: '',
          mensajeroTelefono: '',
          fecha: String(row.created_at ?? new Date().toISOString()),
          estado: dbEstadoToUi(row.estado),
          motivacion: parsed.motivacion,
          experiencia: parsed.experiencia,
          disponibilidad: parsed.disponibilidad,
        };
      });

      setPostulaciones(mapped);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (postulacion: Postulacion) => {
    if (!postulacion.mensajeroTelefono) {
      toast.error(TEXTS.admin.campanaDetalle.toasts.missingPhone);
      return;
    }

    const firstName = postulacion.mensajeroNombre.split(' ')[0];
    const greeting = TEXTS.admin.campanaDetalle.whatsapp.greeting.replace('{firstName}', firstName);
    
    let message = greeting;
    
    if (postulacion.estado === 'Aceptado') {
      message += TEXTS.admin.campanaDetalle.whatsapp.acceptedMessage.replace('{campaignTitle}', campaign?.titulo || '');
    } else {
      message += TEXTS.admin.campanaDetalle.whatsapp.rejectedMessage.replace('{campaignTitle}', campaign?.titulo || '');
    }

    const whatsappUrl = `https://wa.me/34${postulacion.mensajeroTelefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportToCSV = () => {
    if (postulaciones.length === 0) {
      toast.error(TEXTS.admin.campanaDetalle.toasts.noDataToExport);
      return;
    }

    try {
      // Preparar datos CSV con punto y coma como separador (formato europeo/Excel)
      const headers = [
        TEXTS.admin.campanaDetalle.csv.headers.courierCode,
        TEXTS.admin.campanaDetalle.csv.headers.name,
        TEXTS.admin.campanaDetalle.csv.headers.email,
        TEXTS.admin.campanaDetalle.csv.headers.phone,
        TEXTS.admin.campanaDetalle.csv.headers.applicationDate,
        TEXTS.admin.campanaDetalle.csv.headers.status,
        TEXTS.admin.campanaDetalle.csv.headers.motivation,
        TEXTS.admin.campanaDetalle.csv.headers.experience,
        TEXTS.admin.campanaDetalle.csv.headers.availability
      ];
      
      const rows = postulaciones.map(p => [
        p.user_id,
        p.mensajeroNombre,
        p.mensajeroEmail,
        p.mensajeroTelefono,
        new Date(p.fecha).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        p.estado,
        p.motivacion || '',
        p.experiencia || '',
        p.disponibilidad || ''
      ]);

      // Crear contenido CSV
      const csvHeaderLine = headers.map(h => `"${h}"`).join(';');
      const csvDataLines = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'));
      const csvContent = [csvHeaderLine, ...csvDataLines].join('\n');

      // AÃƒÂ±adir BOM para que Excel reconozca UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre de archivo con fecha y nombre de campaÃƒÂ±a
      const fecha = new Date().toISOString().split('T')[0];
      const campanaNombre = campaign?.titulo.replace(/[^a-zA-Z0-9]/g, '_') || 'Campana';
      link.download = `ONUS_Postulaciones_${campanaNombre}_${fecha}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.info(TEXTS.admin.campanaDetalle.toasts.exportPendingIntegration);
    } catch (error) {
      console.error('Error exportando CSV:', error);
      toast.error(TEXTS.admin.campanaDetalle.toasts.exportError);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Aceptado':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300 border">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {TEXTS.admin.campanaDetalle.statuses.accepted}
          </Badge>
        );
      case 'Rechazado':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300 border">
            <XCircle className="w-3 h-3 mr-1" />
            {TEXTS.admin.campanaDetalle.statuses.rejected}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 border">
            <AlertCircle className="w-3 h-3 mr-1" />
            {TEXTS.admin.campanaDetalle.statuses.inReview}
          </Badge>
        );
    }
  };

  const filteredPostulaciones = filter === 'all' 
    ? postulaciones 
    : postulaciones.filter(p => p.estado === filter);

  const stats = {
    total: postulaciones.length,
    enRevision: postulaciones.filter(p => p.estado === 'En revisiÃƒÂ³n').length,
    aceptados: postulaciones.filter(p => p.estado === 'Aceptado').length,
    rechazados: postulaciones.filter(p => p.estado === 'Rechazado').length
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{TEXTS.admin.campanaDetalle.loading}</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{TEXTS.admin.campanaDetalle.empty.noApplications}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-[#00C9CE] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {TEXTS.admin.campanaDetalle.backButton}
        </button>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-start gap-4">
            {campaign.logoUrl && (
              <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <img src={campaign.logoUrl} alt={TEXTS.admin.campanaDetalle.logoAlt} className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl mb-2" style={{ 
                color: '#000935',
                fontFamily: 'REM, sans-serif',
                fontWeight: 500 
              }}>
                {campaign.titulo}
              </h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  <MapPin className="w-3 h-3 mr-1" />
                  {campaign.ciudad}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {campaign.tarifa}
                </Badge>
                {campaign.cliente && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                    <Building2 className="w-3 h-3 mr-1" />
                    {campaign.cliente}
                  </Badge>
                )}
              </div>
              {campaign.descripcion && (
                <p className="text-gray-600 text-sm">{campaign.descripcion}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EstadÃƒÂ­sticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
          <p className="text-3xl mb-2" style={{ color: '#000935', fontWeight: 600 }}>
            {stats.total}
          </p>
          <p className="text-sm text-gray-600">{TEXTS.admin.campanaDetalle.stats.totalApplications}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200 text-center">
          <p className="text-3xl text-yellow-700 mb-2" style={{ fontWeight: 600 }}>
            {stats.enRevision}
          </p>
          <p className="text-sm text-gray-600">{TEXTS.admin.campanaDetalle.stats.inReview}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 text-center">
          <p className="text-3xl text-green-700 mb-2" style={{ fontWeight: 600 }}>
            {stats.aceptados}
          </p>
          <p className="text-sm text-gray-600">{TEXTS.admin.campanaDetalle.stats.accepted}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 text-center">
          <p className="text-3xl text-red-700 mb-2" style={{ fontWeight: 600 }}>
            {stats.rechazados}
          </p>
          <p className="text-sm text-gray-600">{TEXTS.admin.campanaDetalle.stats.rejected}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">{TEXTS.admin.campanaDetalle.filters.label}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                className={filter === 'all' 
                  ? 'bg-[#00C9CE] text-[#000935] hover:bg-[#00B5BA]' 
                  : 'text-gray-700 border-gray-300'}
              >
                {TEXTS.admin.campanaDetalle.filters.all} ({stats.total})
              </Button>
              <Button
                onClick={() => setFilter('En revisiÃƒÂ³n')}
                size="sm"
                variant={filter === 'En revisiÃƒÂ³n' ? 'default' : 'outline'}
                className={filter === 'En revisiÃƒÂ³n' 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                  : 'text-gray-700 border-gray-300'}
              >
                {TEXTS.admin.campanaDetalle.filters.inReview} ({stats.enRevision})
              </Button>
              <Button
                onClick={() => setFilter('Aceptado')}
                size="sm"
                variant={filter === 'Aceptado' ? 'default' : 'outline'}
                className={filter === 'Aceptado' 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'text-gray-700 border-gray-300'}
              >
                {TEXTS.admin.campanaDetalle.filters.accepted} ({stats.aceptados})
              </Button>
              <Button
                onClick={() => setFilter('Rechazado')}
                size="sm"
                variant={filter === 'Rechazado' ? 'default' : 'outline'}
                className={filter === 'Rechazado' 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'text-gray-700 border-gray-300'}
              >
                {TEXTS.admin.campanaDetalle.filters.rejected} ({stats.rechazados})
              </Button>
            </div>
          </div>
          <Button
            onClick={handleExportToCSV}
            size="sm"
            disabled={postulaciones.length === 0}
            className="border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE] hover:text-white transition-colors"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {TEXTS.admin.campanaDetalle.actions.exportCSV}
          </Button>
        </div>
      </div>

      {/* Lista de Postulaciones */}
      <div className="space-y-4">
        {filteredPostulaciones.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border-2 border-gray-200 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">
              {filter === 'all' 
                ? TEXTS.admin.campanaDetalle.empty.noApplications
                : TEXTS.admin.campanaDetalle.empty.noApplicationsWithFilter.replace('{filter}', filter)}
            </p>
          </div>
        ) : (
          filteredPostulaciones.map((postulacion) => (
            <div 
              key={postulacion.id}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#00C9CE] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#00C9CE]/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" style={{ color: '#00C9CE' }} />
                  </div>
                  <div>
                    <h3 className="text-lg" style={{ 
                      color: '#000935',
                      fontFamily: 'REM, sans-serif',
                      fontWeight: 500 
                    }}>
                      {postulacion.mensajeroNombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {TEXTS.admin.campanaDetalle.labels.code} <span className="font-mono">{postulacion.user_id}</span>
                    </p>
                  </div>
                </div>
                {getEstadoBadge(postulacion.estado)}
              </div>

              {/* InformaciÃƒÂ³n de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" style={{ color: '#00C9CE' }} />
                  <span className="text-gray-700">{postulacion.mensajeroTelefono}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4" style={{ color: '#00C9CE' }} />
                  <span className="text-gray-700">{postulacion.mensajeroEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" style={{ color: '#00C9CE' }} />
                  <span className="text-gray-700">
                    {new Date(postulacion.fecha).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Detalles de la postulaciÃƒÂ³n */}
              <div className="space-y-3 mb-4">
                {postulacion.motivacion && (
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#00C9CE', fontWeight: 500 }}>
                      {TEXTS.admin.campanaDetalle.labels.motivation}
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                      {postulacion.motivacion}
                    </p>
                  </div>
                )}
                {postulacion.experiencia && (
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#00C9CE', fontWeight: 500 }}>
                      {TEXTS.admin.campanaDetalle.labels.experience}
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                      {postulacion.experiencia}
                    </p>
                  </div>
                )}
                {postulacion.disponibilidad && (
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#00C9CE', fontWeight: 500 }}>
                      {TEXTS.admin.campanaDetalle.labels.availability}
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {postulacion.disponibilidad}
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-600 uppercase tracking-wide">{TEXTS.admin.campanaDetalle.actions.statusLabel}</span>
                  <p className="text-sm text-gray-600">{TEXTS.admin.campanaDetalle.actions.statusReadOnlyInfo}</p>
                </div>

                {(postulacion.estado === 'Aceptado' || postulacion.estado === 'Rechazado') && (
                  <Button
                    onClick={() => handleWhatsApp(postulacion)}
                    className="w-full md:w-auto"
                    style={{ backgroundColor: '#00C9CE', color: '#000935' }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {TEXTS.admin.campanaDetalle.actions.notifyWhatsApp}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

