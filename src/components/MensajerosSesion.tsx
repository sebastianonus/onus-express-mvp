import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  LogOut,
  MapPin,
  Clock,
  Calendar,
  Truck,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import backgroundImage from 'figma:asset/4261f3db5c66ef3456a8ebcae9838917a1e10ea5.png';
import { toast } from 'sonner';
import { CampanaCard } from './CampanaCard';
import { TEXTS } from '@/content/texts';
import { useRequireRole } from '../hooks/useRequireRole';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const CIUDADES = [
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Zaragoza',
  'Málaga',
  'Murcia',
  'Palma',
  'Las Palmas',
  'Bilbao',
  'Alicante',
  'Córdoba',
  'Valladolid',
  'Vigo',
  'Gijón',
  'Hospitalet de Llobregat',
  'A Coruña',
  'Granada',
  'Vitoria',
  'Elche',
  'Oviedo',
  'Santa Cruz de Tenerife',
  'Badalona',
  'Cartagena',
  'Terrassa',
  'Jerez de la Frontera',
  'Sabadell',
  'Móstoles',
  'Alcalá de Henares',
  'Pamplona',
].sort();

interface MensajeroAuth {
  codigo: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  fechaLogin: string;
  filtros?: {
    ciudad: string;
    radioKm: number;
    vehiculo: string;
    horario: string;
    jornada: string;
  };
}

interface Campana {
  id: string;
  nombre: string;
  descripcion: string;
  ciudad: string;
  vehiculo: string;
  horario: string;
  jornada: string;
  pago: string;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
}

export function MensajerosSesion() {
  useRequireRole('mensajero');

  const navigate = useNavigate();

  const [mensajero, setMensajero] = useState<MensajeroAuth | null>(null);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [campanasFiltradas, setCampanasFiltradas] = useState<Campana[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [ciudad, setCiudad] = useState('');
  const [radioKm, setRadioKm] = useState([50]);
  const [vehiculo, setVehiculo] = useState('');
  const [horario, setHorario] = useState('');
  const [jornada, setJornada] = useState('');

  const [postulaciones, setPostulaciones] = useState<string[]>([]);

  const [selectedCampaign, setSelectedCampaign] = useState<Campana | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const [formData, setFormData] = useState({
    motivacion: '',
    experiencia: '',
    disponibilidad: '',
  });

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        toast.error('Configuración de Supabase incompleta');
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
        navigate('/mensajeros/acceso');
        return;
      }

      setMensajero({
        codigo: String(session.user.user_metadata?.codigo ?? '—'),
        nombre: String(session.user.user_metadata?.nombre ?? session.user.email ?? 'Mensajero'),
        email: session.user.email ?? '',
        telefono: String(session.user.user_metadata?.telefono ?? ''),
        activo: true,
        fechaLogin: new Date().toISOString(),
        filtros: undefined,
      });

      // Cargar campañas (RLS: solo mensajero)
      const { data: campanasData, error: campErr } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campErr) {
        console.error('Error cargando campañas:', campErr);
        setCampanas([]);
        setCampanasFiltradas([]);
      } else {
        const mapped: Campana[] = (campanasData ?? []).map((c: any) => ({
          id: c.id,
          nombre: c.nombre ?? c.titulo ?? 'Campaña',
          descripcion: c.descripcion ?? 'Sin descripción',
          ciudad: c.ciudad ?? '—',
          vehiculo: c.vehiculo ?? 'Todos',
          horario: c.horario ?? 'Todos',
          jornada: c.jornada ?? 'Todas',
          pago: c.pago ?? c.tarifa ?? '—',
          fechaInicio: c.fecha_inicio ?? c.created_at ?? new Date().toISOString(),
          fechaFin: c.fecha_fin ?? c.created_at ?? new Date().toISOString(),
          activa: Boolean(c.activa ?? c.is_active ?? true),
        }));

        setCampanas(mapped);
        setCampanasFiltradas(mapped);
      }

      // Cargar postulaciones del mensajero (RLS: solo mensajero)
      const { data: postData, error: postErr } = await supabase
        .from('postulaciones')
        .select('campaign_id');

      if (postErr) {
        console.error('Error cargando postulaciones:', postErr);
        setPostulaciones([]);
      } else {
        setPostulaciones((postData ?? []).map((p: any) => String(p.campaign_id)));
      }
    };

    void init();
  }, [navigate]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/mensajeros/acceso');
  };

  const applyLocalFilter = (items: Campana[]) => {
    const filtros = {
      ciudad: ciudad || 'Todas',
      radioKm: radioKm[0],
      vehiculo: vehiculo || 'Todos',
      horario: horario || 'Todos',
      jornada: jornada || 'Todas',
    };

    if (mensajero) {
      setMensajero({ ...mensajero, filtros });
    }

    const filtered = items.filter((c) => {
      if (filtros.ciudad !== 'Todas' && c.ciudad !== filtros.ciudad) return false;

      if (filtros.vehiculo !== 'Todos') {
        if (c.vehiculo !== 'Todos' && c.vehiculo !== filtros.vehiculo) return false;
      }

      if (filtros.horario !== 'Todos') {
        if (c.horario !== 'Todos' && c.horario !== filtros.horario) return false;
      }

      if (filtros.jornada !== 'Todas') {
        if (c.jornada !== 'Todas' && c.jornada !== filtros.jornada) return false;
      }

      return true;
    });

    setCampanasFiltradas(filtered);
    setShowFilters(false);
  };

  const handleBuscarCampanas = () => {
    // Filtro local (sin endpoint inventado)
    applyLocalFilter(campanas);
  };

  if (!mensajero) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#000935' }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
            style={{ borderColor: '#00C9CE' }}
          />
          <p className="text-white">{TEXTS.couriers.session.list.loading}</p>
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

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1
                className="mb-2"
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'REM, sans-serif',
                  fontWeight: 500,
                }}
              >
                {TEXTS.couriers.session.header.hello} {mensajero.nombre}
              </h1>
              <p className="text-gray-300">
                {TEXTS.couriers.session.header.codeLabel}{' '}
                <span className="font-mono text-[#00C9CE]">{mensajero.codigo}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/mensajeros/postulaciones">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {TEXTS.couriers.session.actions.myApplications}
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/10 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {TEXTS.couriers.session.actions.logout}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2
                className="mb-1"
                style={{ color: '#000935', fontFamily: 'REM, sans-serif', fontWeight: 500 }}
              >
                {TEXTS.couriers.session.title}
              </h2>
              {mensajero.filtros && (mensajero.filtros.ciudad || mensajero.filtros.radioKm) && (
                <p className="text-sm text-gray-600">
                  {mensajero.filtros.ciudad &&
                    mensajero.filtros.ciudad !== 'Todas' &&
                    mensajero.filtros.ciudad}
                  {mensajero.filtros.radioKm &&
                    ` • ${TEXTS.couriers.session.list.templates.radiusPrefix} ${mensajero.filtros.radioKm} ${TEXTS.couriers.session.list.templates.kmSuffix}`}
                </p>
              )}
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {TEXTS.couriers.session.actions.logout}
            </Button>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <span style={{ color: '#000935', fontFamily: 'REM, sans-serif', fontWeight: 500 }}>
                {TEXTS.couriers.session.filters.title}
              </span>
              {showFilters ? (
                <ChevronUp className="w-5 h-5" style={{ color: '#00C9CE' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: '#00C9CE' }} />
              )}
            </button>

            {showFilters && (
              <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="filter-ciudad" className="text-gray-700 mb-2">
                      {TEXTS.couriers.session.filters.labels.city}
                    </Label>
                    <Select value={ciudad} onValueChange={setCiudad}>
                      <SelectTrigger id="filter-ciudad">
                        <SelectValue
                          placeholder={TEXTS.couriers.session.filters.placeholders.allCities}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">
                          {TEXTS.couriers.session.filters.options.allCitiesFeminine}
                        </SelectItem>
                        {CIUDADES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filter-vehiculo" className="text-gray-700 mb-2">
                      {TEXTS.couriers.session.filters.labels.vehicle}
                    </Label>
                    <Select value={vehiculo} onValueChange={setVehiculo}>
                      <SelectTrigger id="filter-vehiculo">
                        <SelectValue
                          placeholder={TEXTS.couriers.session.filters.placeholders.allVehicles}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">
                          {TEXTS.couriers.session.filters.options.allVehicles}
                        </SelectItem>
                        <SelectItem value="Moto">
                          {TEXTS.couriers.session.filters.options.vehicleMoto}
                        </SelectItem>
                        <SelectItem value="Coche">
                          {TEXTS.couriers.session.filters.options.vehicleCar}
                        </SelectItem>
                        <SelectItem value="Furgoneta">
                          {TEXTS.couriers.session.filters.options.vehicleVan}
                        </SelectItem>
                        <SelectItem value="Bicicleta">
                          {TEXTS.couriers.session.filters.options.vehicleBike}
                        </SelectItem>
                        <SelectItem value="A pie">
                          {TEXTS.couriers.session.filters.options.vehicleWalking}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filter-horario" className="text-gray-700 mb-2">
                      {TEXTS.couriers.session.filters.labels.schedule}
                    </Label>
                    <Select value={horario} onValueChange={setHorario}>
                      <SelectTrigger id="filter-horario">
                        <SelectValue
                          placeholder={TEXTS.couriers.session.filters.placeholders.allSchedules}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">
                          {TEXTS.couriers.session.filters.options.allSchedules}
                        </SelectItem>
                        <SelectItem value="Mañana">
                          {TEXTS.couriers.session.filters.options.scheduleMorning}
                        </SelectItem>
                        <SelectItem value="Tarde">
                          {TEXTS.couriers.session.filters.options.scheduleAfternoon}
                        </SelectItem>
                        <SelectItem value="Noche">
                          {TEXTS.couriers.session.filters.options.scheduleNight}
                        </SelectItem>
                        <SelectItem value="24h">
                          {TEXTS.couriers.session.filters.options.scheduleFullDay}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="filter-jornada" className="text-gray-700 mb-2">
                      {TEXTS.couriers.session.filters.labels.workday}
                    </Label>
                    <Select value={jornada} onValueChange={setJornada}>
                      <SelectTrigger id="filter-jornada">
                        <SelectValue
                          placeholder={TEXTS.couriers.session.filters.placeholders.allWorkdays}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">
                          {TEXTS.couriers.session.filters.options.allWorkdays}
                        </SelectItem>
                        <SelectItem value="Media jornada">
                          {TEXTS.couriers.session.filters.options.workdayHalf}
                        </SelectItem>
                        <SelectItem value="Jornada completa">
                          {TEXTS.couriers.session.filters.options.workdayFull}
                        </SelectItem>
                        <SelectItem value="Por horas">
                          {TEXTS.couriers.session.filters.options.workdayHourly}
                        </SelectItem>
                        <SelectItem value="Fines de semana">
                          {TEXTS.couriers.session.filters.options.workdayWeekend}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filter-radio" className="text-gray-700 mb-2">
                      {TEXTS.couriers.session.filters.labels.radius}: {radioKm[0]} km
                    </Label>
                    <Slider
                      id="filter-radio"
                      min={20}
                      max={80}
                      step={1}
                      value={radioKm}
                      onValueChange={setRadioKm}
                      className="mt-2"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {TEXTS.couriers.session.filters.options.km20}
                      </span>
                      <span className="text-xs text-gray-500">
                        {TEXTS.couriers.session.filters.options.km80}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleBuscarCampanas}
                    className="w-full md:w-auto hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#00C9CE', color: '#000935' }}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {TEXTS.couriers.session.actions.searchCampaigns}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {mensajero.filtros && (
            <div className="flex flex-wrap gap-2 mb-6">
              {mensajero.filtros.ciudad && mensajero.filtros.ciudad !== 'Todas' && (
                <Badge variant="outline" className="bg-[#00C9CE]/10 text-[#000935] border-[#00C9CE]">
                  <MapPin className="w-3 h-3 mr-1" />
                  {mensajero.filtros.ciudad}
                </Badge>
              )}
              {mensajero.filtros.vehiculo && mensajero.filtros.vehiculo !== 'Todos' && (
                <Badge variant="outline" className="bg-[#00C9CE]/10 text-[#000935] border-[#00C9CE]">
                  <Truck className="w-3 h-3 mr-1" />
                  {mensajero.filtros.vehiculo}
                </Badge>
              )}
              {mensajero.filtros.horario && mensajero.filtros.horario !== 'Todos' && (
                <Badge variant="outline" className="bg-[#00C9CE]/10 text-[#000935] border-[#00C9CE]">
                  <Clock className="w-3 h-3 mr-1" />
                  {mensajero.filtros.horario}
                </Badge>
              )}
              {mensajero.filtros.jornada && mensajero.filtros.jornada !== 'Todas' && (
                <Badge variant="outline" className="bg-[#00C9CE]/10 text-[#000935] border-[#00C9CE]">
                  <Calendar className="w-3 h-3 mr-1" />
                  {mensajero.filtros.jornada}
                </Badge>
              )}
            </div>
          )}

          {campanasFiltradas.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Info className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg mb-2">{TEXTS.couriers.session.list.emptyTitle}</p>
              <p className="text-gray-500">{TEXTS.couriers.session.list.emptySubtitle}</p>
              {campanas.length > 0 && (
                <p className="text-gray-500 mt-2">
                  {TEXTS.couriers.session.list.templates.campaignsPrefix} {campanas.length}{' '}
                  {campanas.length !== 1
                    ? TEXTS.couriers.session.list.templates.campaignPlural
                    : TEXTS.couriers.session.list.templates.campaignSingular}{' '}
                  {campanas.length !== 1
                    ? TEXTS.couriers.session.list.templates.availablePlural
                    : TEXTS.couriers.session.list.templates.availableSingular}{' '}
                  {TEXTS.couriers.session.list.availableOtherZones}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campanasFiltradas.map((campana) => (
                <CampanaCard
                  key={campana.id}
                  campana={campana}
                  isPostulado={postulaciones.includes(campana.id)}
                  onVer={() => {
                    setSelectedCampaign(campana);
                    setShowDetailsModal(true);
                  }}
                  onMeInteresa={() => {
                    setSelectedCampaign(campana);
                    setShowFormModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && selectedCampaign && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2
                    className="mb-2"
                    style={{
                      color: '#000935',
                      fontFamily: 'REM, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {selectedCampaign.nombre}
                  </h2>
                  <Badge className="bg-[#00C9CE] text-white border-0">
                    {TEXTS.couriers.session.modals.details.badgeActive}
                  </Badge>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  style={{ color: '#000935' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm uppercase tracking-wide mb-2" style={{ color: '#00C9CE' }}>
                    {TEXTS.couriers.session.modals.details.sectionDescription}
                  </h3>
                  <p className="text-gray-700">{selectedCampaign.descripcion}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 mr-2" style={{ color: '#00C9CE' }} />
                      <span className="text-sm text-gray-600">
                        {TEXTS.couriers.session.modals.details.labelLocation}
                      </span>
                    </div>
                    <p className="font-medium" style={{ color: '#000935' }}>
                      {selectedCampaign.ciudad}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 mr-2" style={{ color: '#00C9CE' }} />
                      <span className="text-sm text-gray-600">
                        {TEXTS.couriers.session.modals.details.labelCompensation}
                      </span>
                    </div>
                    <p className="font-medium" style={{ color: '#00C9CE' }}>
                      {selectedCampaign.pago}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wide mb-3" style={{ color: '#00C9CE' }}>
                    {TEXTS.couriers.session.modals.details.sectionRequirements}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Truck className="w-4 h-4 mr-3 shrink-0" style={{ color: '#00C9CE' }} />
                      <span className="text-sm text-gray-700">
                        {TEXTS.couriers.session.modals.details.requirements.vehicle}{' '}
                        {selectedCampaign.vehiculo}
                      </span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 mr-3 shrink-0" style={{ color: '#00C9CE' }} />
                      <span className="text-sm text-gray-700">
                        {TEXTS.couriers.session.modals.details.requirements.schedule}{' '}
                        {selectedCampaign.horario}
                      </span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 mr-3 shrink-0" style={{ color: '#00C9CE' }} />
                      <span className="text-sm text-gray-700">
                        {TEXTS.couriers.session.modals.details.requirements.workday}{' '}
                        {selectedCampaign.jornada}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {TEXTS.couriers.session.modals.details.createdOn}{' '}
                    {new Date(selectedCampaign.fechaInicio).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      const mensaje = `Hola! Me interesa la campaña: ${selectedCampaign.nombre}. Mi nombre es ${mensajero.nombre} (Código: ${mensajero.codigo}). ${TEXTS.couriers.session.modals.details.whatsappMessageEnd}`;
                      window.open(
                        `https://wa.me/34676728527?text=${encodeURIComponent(mensaje)}`,
                        '_blank'
                      );
                    }}
                    className="flex-1 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#00C9CE', color: '#000935' }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {TEXTS.couriers.session.modals.details.whatsappButton}
                  </Button>
                  <Button
                    onClick={() => setShowDetailsModal(false)}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {TEXTS.couriers.session.modals.details.buttonClose}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFormModal && selectedCampaign && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowFormModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2
                    className="mb-2"
                    style={{
                      color: '#000935',
                      fontFamily: 'REM, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {TEXTS.couriers.session.modals.application.title} {selectedCampaign.nombre}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {TEXTS.couriers.session.modals.application.subtitle}
                  </p>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  style={{ color: '#000935' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!supabase) {
                    toast.error('Configuración de Supabase incompleta');
                    return;
                  }

                  const { data } = await supabase.auth.getSession();
                  const user = data.session?.user;

                  if (!user) {
                    navigate('/mensajeros/acceso');
                    return;
                  }

                  const payload = {
                    campaign_id: selectedCampaign.id,
                    motivacion: formData.motivacion,
                    experiencia: formData.experiencia,
                    disponibilidad: formData.disponibilidad,
                  };

                  const { error } = await supabase.from('postulaciones').insert(payload);

                  if (error) {
                    toast.error('No se pudo enviar la postulación. Intenta nuevamente.');
                    return;
                  }

                  toast.success('Postulación enviada');
                  setPostulaciones((prev) => Array.from(new Set([...prev, selectedCampaign.id])));
                  setShowFormModal(false);
                  setFormData({ motivacion: '', experiencia: '', disponibilidad: '' });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="motivacion" className="text-gray-700">
                    {TEXTS.couriers.session.modals.application.labels.motivation}
                  </Label>
                  <Textarea
                    id="motivacion"
                    value={formData.motivacion}
                    onChange={(e) => setFormData({ ...formData, motivacion: e.target.value })}
                    required
                    rows={4}
                    placeholder={TEXTS.couriers.session.modals.application.placeholders.motivation}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="experiencia" className="text-gray-700">
                    {TEXTS.couriers.session.modals.application.labels.experience}
                  </Label>
                  <Textarea
                    id="experiencia"
                    value={formData.experiencia}
                    onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                    required
                    rows={3}
                    placeholder={TEXTS.couriers.session.modals.application.placeholders.experience}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="disponibilidad" className="text-gray-700">
                    {TEXTS.couriers.session.modals.application.labels.availability}
                  </Label>
                  <Input
                    id="disponibilidad"
                    value={formData.disponibilidad}
                    onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
                    required
                    placeholder={TEXTS.couriers.session.modals.application.placeholders.availability}
                    className="mt-1"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4
                    className="text-sm mb-3"
                    style={{ color: '#000935', fontFamily: 'REM, sans-serif', fontWeight: 500 }}
                  >
                    {TEXTS.couriers.session.modals.application.profileSection.title}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">
                      <strong>{TEXTS.couriers.session.modals.application.profileSection.name}</strong>{' '}
                      {mensajero.nombre}
                    </p>
                    <p className="text-gray-700">
                      <strong>{TEXTS.couriers.session.modals.application.profileSection.email}</strong>{' '}
                      {mensajero.email}
                    </p>
                    <p className="text-gray-700">
                      <strong>{TEXTS.couriers.session.modals.application.profileSection.phone}</strong>{' '}
                      {mensajero.telefono}
                    </p>
                    <p className="text-gray-700">
                      <strong>{TEXTS.couriers.session.modals.application.profileSection.code}</strong>{' '}
                      {mensajero.codigo}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {TEXTS.couriers.session.modals.application.buttons.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#00C9CE', color: '#000935' }}
                  >
                    {TEXTS.couriers.session.actions.sendApplication}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
