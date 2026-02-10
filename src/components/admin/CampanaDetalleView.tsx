import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, User, Mail, Phone, Calendar, MessageSquare, AlertCircle, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { TEXTS } from '@/content/texts';

interface Postulacion {
  id: string;
  user_id: string; // Cambiado de mensajeroCodigo - referencia a auth.users
  campaign_id: string; // Cambiado de campanaId
  mensajeroNombre: string; // Temporal - en producción vendrá de JOIN con auth.users
  mensajeroEmail: string; // Temporal - en producción vendrá de JOIN con auth.users
  mensajeroTelefono: string; // Temporal - en producción vendrá de JOIN con auth.users
  fecha: string;
  estado: 'En revisión' | 'Aceptado' | 'Rechazado';
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
  const [filter, setFilter] = useState<'all' | 'En revisión' | 'Aceptado' | 'Rechazado'>('all');

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const loadData = () => {
    /**
     * PLACEHOLDER: Cargar campaña y postulaciones
     * 
     * INTEGRACIÓN FUTURA:
     * - GET /api/campaigns/:id
     * - GET /api/postulaciones?campaign_id=:id
     */
    
    // Placeholder: No hay datos hasta que se conecte backend
    setCampaign(null);
    setPostulaciones([]);
    
    console.info('CampanaDetalleView: Pendiente de integración con backend');
  };

  const handleUpdateEstado = (postulacionId: string, nuevoEstado: 'Aceptado' | 'Rechazado') => {
    /**
     * PLACEHOLDER: Actualizar estado de postulación
     * 
     * INTEGRACIÓN FUTURA:
     * - PATCH /api/postulaciones/:id { estado: nuevoEstado }
     */
    
    toast.info(TEXTS.admin.campanaDetalle.toasts.updatePendingIntegration);
  };

  const handleWhatsApp = (postulacion: Postulacion) => {
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

      // Añadir BOM para que Excel reconozca UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre de archivo con fecha y nombre de campaña
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
    enRevision: postulaciones.filter(p => p.estado === 'En revisión').length,
    aceptados: postulaciones.filter(p => p.estado === 'Aceptado').length,
    rechazados: postulaciones.filter(p => p.estado === 'Rechazado').length
  };

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{TEXTS.admin.campanaDetalle.loading}</p>
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
                  📍 {campaign.ciudad}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  💰 {campaign.tarifa}
                </Badge>
                {campaign.cliente && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                    🏢 {campaign.cliente}
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

      {/* Estadísticas */}
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
                onClick={() => setFilter('En revisión')}
                size="sm"
                variant={filter === 'En revisión' ? 'default' : 'outline'}
                className={filter === 'En revisión' 
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

              {/* Información de contacto */}
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

              {/* Detalles de la postulación */}
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
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {postulacion.estado === 'En revisión' && (
                  <>
                    <Button
                      onClick={() => handleUpdateEstado(postulacion.id, 'Aceptado')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {TEXTS.admin.campanaDetalle.actions.accept}
                    </Button>
                    <Button
                      onClick={() => handleUpdateEstado(postulacion.id, 'Rechazado')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {TEXTS.admin.campanaDetalle.actions.reject}
                    </Button>
                  </>
                )}
                {postulacion.estado !== 'En revisión' && (
                  <Button
                    onClick={() => handleWhatsApp(postulacion)}
                    className="flex-1"
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
