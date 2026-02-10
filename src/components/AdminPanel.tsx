import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CampanaDetalleView } from './admin/CampanaDetalleView';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Plus, Trash2, Shield, LogOut, Briefcase, Pencil, Upload, Copy, Power, PowerOff, Search, X, User } from 'lucide-react';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { TEXTS } from '@/content/texts';
import { useRequireRole } from '../hooks/useRequireRole';
import { supabase } from '../supabase';
import {
  clearAdminSession,
  isAdminSessionActive,
  setAdminSession,
} from '../utils/adminAuth';

/**
 * COMPONENTE: Panel de Administración - Frontend limpio sin backend
 * 
 * ESTADO ACTUAL: Solo UI funcional
 * - Formularios de creación/edición de campañas (visual)
 * - NO guarda datos
 * - NO persiste campañas
 * - NO mantiene estado
 * 
 * INTEGRACIÓN FUTURA:
 * - handleSubmit → POST/PUT a /api/campaigns
 * - loadCampaigns → GET de /api/campaigns  
 * - deleteCampaign → DELETE a /api/campaigns/:id
 * - Todas las operaciones CRUD se conectarán a Supabase
 */

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

export function AdminPanel() {
  // Guard de rol: solo admins pueden acceder
  useRequireRole('admin');

  const [isAuthenticated, setIsAuthenticated] = useState(isAdminSessionActive());
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());

  // Estados para filtros de búsqueda
  const [searchCliente, setSearchCliente] = useState('all');
  const [searchCiudad, setSearchCiudad] = useState('all');
  const [searchDescripcion, setSearchDescripcion] = useState('');
  const [searchTarifa, setSearchTarifa] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    ciudad: '',
    tarifa: '',
    descripcion: '',
    vehiculos: [] as string[],
    flotista: [] as string[],
    mensajero: [] as string[],
    cliente: '' as string,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  /**
   * PLACEHOLDER: Cargar campañas desde backend
   * 
   * INTEGRACIÓN FUTURA:
   * useEffect(() => {
   *   const fetchCampaigns = async () => {
   *     const { data } = await supabase.from('campaigns').select('*');
   *     setCampaigns(data || []);
   *   };
   *   fetchCampaigns();
   * }, []);
   */
  useEffect(() => {
    // Placeholder: No hay campañas hasta que se conecte el backend
    setCampaigns([]);
  }, []);

  // Aplicar filtros cuando cambien las campañas o los filtros
  useEffect(() => {
    let filtered = [...campaigns];

    // Filtrar por cliente
    if (searchCliente !== 'all') {
      filtered = filtered.filter(c => c.cliente === searchCliente);
    }

    // Filtrar por ciudad
    if (searchCiudad !== 'all') {
      filtered = filtered.filter(c => c.ciudad === searchCiudad);
    }

    // Filtrar por descripción
    if (searchDescripcion.trim()) {
      const searchTerm = searchDescripcion.toLowerCase();
      filtered = filtered.filter(c => 
        c.titulo.toLowerCase().includes(searchTerm) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm))
      );
    }

    // Filtrar por tarifa
    if (searchTarifa.trim()) {
      const searchTerm = searchTarifa.toLowerCase();
      filtered = filtered.filter(c => 
        c.tarifa.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchCliente, searchCiudad, searchDescripcion, searchTarifa]);

  const clearFilters = () => {
    setSearchCliente('all');
    setSearchCiudad('all');
    setSearchDescripcion('');
    setSearchTarifa('');
  };

  const hasActiveFilters = searchCliente !== 'all' || searchCiudad !== 'all' || searchDescripcion !== '' || searchTarifa !== '';

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    navigate('/admin');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (!pin.trim()) {
      setPinError(TEXTS.admin.panel.login.pinError);
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { pin: pin.trim() },
      });

      if (error || !data?.ok) {
        setPinError(TEXTS.admin.panel.login.pinError);
        return;
      }

      setAdminSession();
      setIsAuthenticated(true);
      setPin('');
    } catch {
      setPinError(TEXTS.admin.panel.login.pinError);
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000935] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00C9CE' }}>
                <Shield className="w-8 h-8 text-[#000935]" />
              </div>
            </div>
            <h1 className="text-center text-[#000935] mb-2">
              {TEXTS.admin.panel.login.title}
            </h1>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div>
                <Label htmlFor="pin" className="text-[#000935]">
                  {TEXTS.admin.panel.login.pinLabel}
                </Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={TEXTS.admin.panel.login.pinPlaceholder}
                  className="mt-1 h-11 border-0 bg-[#E8E8E8] focus-visible:ring-[#00C9CE]"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">{TEXTS.admin.panel.login.pinHelp}</p>
                {pinError && <p className="text-red-500 text-sm mt-2">{pinError}</p>}
              </div>

              <Button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 rounded-lg bg-[#00C9CE] hover:bg-[#00B5BA] text-[#000935]"
              >
                {authLoading ? TEXTS.admin.panel.login.accessing : TEXTS.admin.panel.login.accessButton}
              </Button>

              <div className="text-center pt-6">
                <Link to="/" className="text-sm text-gray-600 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.admin.panel.login.backToSite}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const deleteAllCampaigns = () => {
    if (!confirm(TEXTS.admin.panel.messages.confirms.deleteAll)) {
      return;
    }
    
    /**
     * PLACEHOLDER: DELETE ALL campaigns
     * 
     * INTEGRACIÓN FUTURA:
     * await supabase.from('campaigns').delete().neq('id', '00000000');
     */
    setCampaigns([]);
    setSelectedCampaigns(new Set());
    toast.info(TEXTS.admin.panel.messages.info.pendingBackendGeneric);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.ciudad || !formData.tarifa) {
      toast.error(TEXTS.admin.panel.messages.errors.requiredFields);
      return;
    }

    if (formData.vehiculos.length === 0) {
      toast.error(TEXTS.admin.panel.messages.errors.selectVehicle);
      return;
    }

    setLoading(true);

    try {
      const campaignId = editingCampaign?.id || crypto.randomUUID();
      
      const campaignData: Campaign = {
        id: campaignId,
        titulo: formData.titulo,
        ciudad: formData.ciudad,
        tarifa: formData.tarifa,
        descripcion: formData.descripcion,
        vehiculos: formData.vehiculos,
        flotista: formData.flotista,
        mensajero: formData.mensajero,
        logoUrl: logoPreview || undefined,
        isActive: editingCampaign?.isActive !== undefined ? editingCampaign.isActive : true,
        createdAt: editingCampaign?.createdAt || new Date().toISOString(),
        cliente: formData.cliente,
      };

      let updatedCampaigns: Campaign[];
      
      if (editingCampaign) {
        // Actualizar campaña existente
        updatedCampaigns = campaigns.map(c => c.id === campaignId ? campaignData : c);
        toast.info(TEXTS.admin.panel.messages.info.pendingUpdateCampaign);
      } else {
        // Crear nueva campaña
        updatedCampaigns = [...campaigns, campaignData];
        toast.info(TEXTS.admin.panel.messages.info.pendingCreateCampaign);
      }

      setCampaigns(updatedCampaigns);
      saveCampaigns(updatedCampaigns);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error(TEXTS.admin.panel.messages.errors.saveCampaign);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm(TEXTS.admin.panel.messages.confirms.deleteOne)) return;

    const updatedCampaigns = campaigns.filter(c => c.id !== id);
    setCampaigns(updatedCampaigns);
    saveCampaigns(updatedCampaigns);
    toast.info(TEXTS.admin.panel.messages.info.pendingDeleteCampaign);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      titulo: campaign.titulo,
      ciudad: campaign.ciudad,
      tarifa: campaign.tarifa,
      descripcion: campaign.descripcion || '',
      vehiculos: campaign.vehiculos || [],
      flotista: campaign.flotista || [],
      mensajero: campaign.mensajero || [],
      cliente: campaign.cliente || '',
    });
    setLogoPreview(campaign.logoUrl || '');
    setLogoFile(null);
    setShowModal(true);
  };

  const handleDuplicate = (campaign: Campaign) => {
    const duplicateCampaign: Campaign = {
      id: crypto.randomUUID(), // Nueva ID única
      titulo: `${campaign.titulo} (copia)`,
      ciudad: campaign.ciudad,
      tarifa: campaign.tarifa,
      descripcion: campaign.descripcion || '',
      vehiculos: [...campaign.vehiculos], // Copia profunda del array
      flotista: [...campaign.flotista], // Copia profunda del array
      mensajero: [...campaign.mensajero], // Copia profunda del array
      logoUrl: campaign.logoUrl,
      isActive: false, // Las copias se crean inactivas
      createdAt: new Date().toISOString(), // Nueva fecha
      cliente: campaign.cliente || '', // Normalizar a string vacío
    };

    const updatedCampaigns = [...campaigns, duplicateCampaign];
    setCampaigns(updatedCampaigns);
    saveCampaigns(updatedCampaigns);
    toast.info(TEXTS.admin.panel.messages.info.pendingDuplicateCampaign);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      ciudad: '',
      tarifa: '',
      descripcion: '',
      vehiculos: [],
      flotista: [],
      mensajero: [],
      cliente: '',
    });
    setEditingCampaign(null);
    setLogoFile(null);
    setLogoPreview('');
  };

  const toggleVehiculo = (vehiculo: string) => {
    setFormData(prev => ({
      ...prev,
      vehiculos: prev.vehiculos.includes(vehiculo)
        ? prev.vehiculos.filter(v => v !== vehiculo)
        : [...prev.vehiculos, vehiculo]
    }));
  };

  const toggleDocumento = (tipo: 'flotista' | 'mensajero', documento: string) => {
    setFormData(prev => ({
      ...prev,
      [tipo]: prev[tipo].includes(documento)
        ? prev[tipo].filter(d => d !== documento)
        : [...prev[tipo], documento]
    }));
  };

  const toggleCampaignActive = (id: string, currentState: boolean) => {
    const updatedCampaigns = campaigns.map(c => 
      c.id === id ? { ...c, isActive: !currentState } : c
    );
    setCampaigns(updatedCampaigns);
    saveCampaigns(updatedCampaigns);
  };

  const activateSelected = () => {
    const idsToActivate = Array.from(selectedCampaigns);
    
    if (idsToActivate.length === 0) {
      toast.error(TEXTS.admin.panel.messages.errors.noSelection);
      return;
    }

    const updatedCampaigns = campaigns.map(c => 
      idsToActivate.includes(c.id) ? { ...c, isActive: true } : c
    );
    
    setCampaigns(updatedCampaigns);
    saveCampaigns(updatedCampaigns);
    setSelectedCampaigns(new Set());
    toast.info(
      `${TEXTS.admin.panel.messages.info.pendingActivatePrefix}${idsToActivate.length}${TEXTS.admin.panel.messages.info.pendingActivateSuffix}`
    );
  };

  const deactivateSelected = () => {
    const idsToDeactivate = Array.from(selectedCampaigns);
    
    if (idsToDeactivate.length === 0) {
      toast.error(TEXTS.admin.panel.messages.errors.noSelection);
      return;
    }

    const updatedCampaigns = campaigns.map(c => 
      idsToDeactivate.includes(c.id) ? { ...c, isActive: false } : c
    );
    
    setCampaigns(updatedCampaigns);
    saveCampaigns(updatedCampaigns);
    setSelectedCampaigns(new Set());
    toast.info(
      `${TEXTS.admin.panel.messages.info.pendingDeactivatePrefix}${idsToDeactivate.length}${TEXTS.admin.panel.messages.info.pendingDeactivateSuffix}`
    );
  };

  const toggleCampaignSelection = (id: string) => {
    setSelectedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllCampaigns = () => {
    if (selectedCampaigns.size === campaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(campaigns.map(c => c.id)));
    }
  };

  // Función para contar postulaciones de una campaña
  const getPostulacionesCount = (campaignId: string): number => {
    /**
     * PLACEHOLDER: Conteo de postulaciones
     * 
     * INTEGRACIÓN FUTURA:
     * - GET /api/postulaciones?campaign_id=:id&count=true
     */
    return 0;
  };

  // Handler para ver postulaciones de una campaña
  const handleViewPostulaciones = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
  };

  const activeCampaigns = campaigns.filter(c => c.isActive);
  const inactiveCampaigns = campaigns.filter(c => !c.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt={TEXTS.admin.panel.a11y.logoAlt} style={{ width: '114.74px', height: '40px' }} />
              <div>
                <h1 className="mb-1" style={{ 
                  color: '#000935',
                  fontFamily: 'REM, sans-serif',
                  fontWeight: 500
                }}>
                  {TEXTS.admin.panel.header.title}
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">{activeCampaigns.length} {TEXTS.admin.panel.header.active}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">{inactiveCampaigns.length} {TEXTS.admin.panel.header.inactive}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {TEXTS.admin.panel.header.logout}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedCampaignId ? (
            <CampanaDetalleView
              campaignId={selectedCampaignId}
              onBack={() => setSelectedCampaignId(null)}
            />
          ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-black flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#00C9CE]/20 rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#00C9CE]" />
                  </div>
                  {TEXTS.admin.panel.campaigns.manageTitle}
                </h1>
                <p className="text-gray-400">
                  {TEXTS.admin.panel.campaigns.totalPrefix} {campaigns.length} {TEXTS.admin.panel.campaigns.totalSuffix}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedCampaigns.size > 0 && (
                  <>
                    <div className="bg-[#00C9CE]/10 px-4 py-2 rounded-lg">
                      <span className="text-[#00C9CE]">{selectedCampaigns.size} {TEXTS.admin.panel.campaigns.selectedSuffix}</span>
                    </div>
                    <Button
                      onClick={activateSelected}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {TEXTS.admin.panel.campaigns.bulkActivate}
                    </Button>
                    <Button
                      onClick={deactivateSelected}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <PowerOff className="w-4 h-4 mr-2" />
                      {TEXTS.admin.panel.campaigns.bulkDeactivate}
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="bg-[#00C9CE] hover:bg-[#00B5BA] text-[#000935]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {TEXTS.admin.panel.campaigns.newCampaign}
                </Button>
                <Button
                  onClick={deleteAllCampaigns}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {TEXTS.admin.panel.campaigns.deleteAll}
                </Button>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-black text-xl mb-2">{TEXTS.admin.panel.campaigns.emptyTitle}</h3>
                <p className="text-gray-400 mb-6">{TEXTS.admin.panel.campaigns.emptySubtitle}</p>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="bg-[#00C9CE] hover:bg-[#00B5BA] text-[#000935]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {TEXTS.admin.panel.campaigns.createFirst}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Filtros de búsqueda */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-[#00C9CE]" />
                      <h3 className="text-lg" style={{ color: '#000935', fontFamily: 'REM, sans-serif', fontWeight: 500 }}>
                        {TEXTS.admin.panel.filters.title}
                      </h3>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-300 hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {TEXTS.admin.panel.filters.clear}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="filterCliente" className="text-gray-700 text-sm mb-2 block">
                        {TEXTS.admin.panel.filters.clientLabel}
                      </Label>
                      <Select value={searchCliente} onValueChange={setSearchCliente}>
                        <SelectTrigger>
                          <SelectValue placeholder={TEXTS.admin.panel.filters.clientPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{TEXTS.admin.panel.filters.clientAll}</SelectItem>
                          {TEXTS.admin.panel.data.clientesMensajeria.map((cliente) => (
                            <SelectItem key={cliente} value={cliente}>
                              {cliente}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="filterCiudad" className="text-gray-700 text-sm mb-2 block">
                        {TEXTS.admin.panel.filters.cityLabel}
                      </Label>
                      <Select value={searchCiudad} onValueChange={setSearchCiudad}>
                        <SelectTrigger>
                          <SelectValue placeholder={TEXTS.admin.panel.filters.cityPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{TEXTS.admin.panel.filters.cityAll}</SelectItem>
                          {TEXTS.admin.panel.data.ciudades.map((ciudad) => (
                            <SelectItem key={ciudad} value={ciudad}>
                              {ciudad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="filterDescripcion" className="text-gray-700 text-sm mb-2 block">
                        {TEXTS.admin.panel.filters.titleDescLabel}
                      </Label>
                      <Input
                        id="filterDescripcion"
                        value={searchDescripcion}
                        onChange={(e) => setSearchDescripcion(e.target.value)}
                        placeholder={TEXTS.admin.panel.filters.titleDescPlaceholder}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="filterTarifa" className="text-gray-700 text-sm mb-2 block">
                        {TEXTS.admin.panel.filters.tarifaLabel}
                      </Label>
                      <Input
                        id="filterTarifa"
                        value={searchTarifa}
                        onChange={(e) => setSearchTarifa(e.target.value)}
                        placeholder={TEXTS.admin.panel.filters.tarifaPlaceholder}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        {TEXTS.admin.panel.filters.showingPrefix} <span className="text-[#00C9CE]">{filteredCampaigns.length}</span> {TEXTS.admin.panel.filters.showingMiddle} {campaigns.length} {TEXTS.admin.panel.filters.showingSuffix}
                      </p>
                    </div>
                  )}
                </div>

                {filteredCampaigns.filter(c => c.isActive).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <h2 className="text-black text-xl">{TEXTS.admin.panel.campaigns.activeGroupTitlePrefix} ({filteredCampaigns.filter(c => c.isActive).length})</h2>
                    </div>
                    <div className="space-y-4">
                      {filteredCampaigns.filter(c => c.isActive).map((campaign) => (
                        <CampaignCard
                          key={campaign.id}
                          campaign={campaign}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onDuplicate={handleDuplicate}
                          onToggleActive={toggleCampaignActive}
                          isSelected={selectedCampaigns.has(campaign.id)}
                          onToggleSelect={toggleCampaignSelection}
                          onViewPostulaciones={handleViewPostulaciones}
                          postulacionesCount={getPostulacionesCount(campaign.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredCampaigns.filter(c => !c.isActive).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <h2 className="text-black text-xl">{TEXTS.admin.panel.campaigns.inactiveGroupTitlePrefix} ({filteredCampaigns.filter(c => !c.isActive).length})</h2>
                    </div>
                    <div className="space-y-4">
                      {filteredCampaigns.filter(c => !c.isActive).map((campaign) => (
                        <CampaignCard
                          key={campaign.id}
                          campaign={campaign}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onDuplicate={handleDuplicate}
                          onToggleActive={toggleCampaignActive}
                          isSelected={selectedCampaigns.has(campaign.id)}
                          onToggleSelect={toggleCampaignSelection}
                          onViewPostulaciones={handleViewPostulaciones}
                          postulacionesCount={getPostulacionesCount(campaign.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredCampaigns.length === 0 && (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-black text-xl mb-2">{TEXTS.admin.panel.campaigns.notFoundTitle}</h3>
                    <p className="text-gray-500 mb-6">{TEXTS.admin.panel.campaigns.notFoundSubtitle}</p>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {TEXTS.admin.panel.campaigns.clearFilters}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? TEXTS.admin.panel.modal.editTitle : TEXTS.admin.panel.modal.newTitle}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign ? TEXTS.admin.panel.modal.editDesc : TEXTS.admin.panel.modal.newDesc}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <Label>{TEXTS.admin.panel.modal.logoLabel}</Label>
              <p className="text-xs text-gray-500 mb-2">
                {TEXTS.admin.panel.modal.logoHelp}
              </p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <label 
                    htmlFor="logo-upload" 
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#00C9CE] hover:bg-gray-50 transition-all bg-white"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt={TEXTS.admin.panel.a11y.logoPreviewAlt} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>{TEXTS.admin.panel.modal.formats}</p>
                  <p>{TEXTS.admin.panel.modal.recommendedSize}</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="titulo">{TEXTS.admin.panel.modal.campaignTitleLabel}</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder={TEXTS.admin.panel.modal.campaignTitlePlaceholder}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ciudad">{TEXTS.admin.panel.modal.cityLabel}</Label>
                <Select value={formData.ciudad} onValueChange={(value) => setFormData({ ...formData, ciudad: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={TEXTS.admin.panel.modal.cityPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXTS.admin.panel.data.ciudades.map((ciudad) => (
                      <SelectItem key={ciudad} value={ciudad}>
                        {ciudad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tarifa">{TEXTS.admin.panel.modal.tarifaLabel}</Label>
                <Input
                  id="tarifa"
                  value={formData.tarifa}
                  onChange={(e) => setFormData({ ...formData, tarifa: e.target.value })}
                  placeholder={TEXTS.admin.panel.modal.tarifaPlaceholder}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cliente">{TEXTS.admin.panel.modal.clientLabel}</Label>
              <Select value={formData.cliente || 'none'} onValueChange={(value) => setFormData({ ...formData, cliente: value === 'none' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder={TEXTS.admin.panel.modal.clientPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{TEXTS.admin.panel.modal.noSpecificClient}</SelectItem>
                  {TEXTS.admin.panel.data.clientesMensajeria.map((cliente) => (
                    <SelectItem key={cliente} value={cliente}>
                      {cliente}
                    </SelectItem>
                  ))}</SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descripcion">{TEXTS.admin.panel.modal.descLabel}</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder={TEXTS.admin.panel.modal.descPlaceholder}
                rows={4}
              />
            </div>

            <div>
              <Label>{TEXTS.admin.panel.modal.vehiclesLabel}</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {TEXTS.admin.panel.data.vehiculos.map((vehiculo) => (
                  <div key={vehiculo} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vehiculo-${vehiculo}`}
                      checked={formData.vehiculos.includes(vehiculo)}
                      onCheckedChange={() => toggleVehiculo(vehiculo)}
                    />
                    <label htmlFor={`vehiculo-${vehiculo}`} className="text-sm cursor-pointer">
                      {vehiculo}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>{TEXTS.admin.panel.modal.flotistaDocsLabel}</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto p-2 border rounded">
                {TEXTS.admin.panel.data.documentos.flotista.map((doc) => (
                  <div key={doc} className="flex items-center space-x-2">
                    <Checkbox
                      id={`flotista-${doc}`}
                      checked={formData.flotista.includes(doc)}
                      onCheckedChange={() => toggleDocumento('flotista', doc)}
                    />
                    <label htmlFor={`flotista-${doc}`} className="text-sm cursor-pointer">
                      {doc}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>{TEXTS.admin.panel.modal.courierDocsLabel}</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto p-2 border rounded">
                {TEXTS.admin.panel.data.documentos.mensajero.map((doc) => (
                  <div key={doc} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mensajero-${doc}`}
                      checked={formData.mensajero.includes(doc)}
                      onCheckedChange={() => toggleDocumento('mensajero', doc)}
                    />
                    <label htmlFor={`mensajero-${doc}`} className="text-sm cursor-pointer">
                      {doc}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                {TEXTS.admin.panel.modal.cancel}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#00C9CE] hover:bg-[#00B5BA] text-[#000935]"
              >
                {loading ? TEXTS.admin.panel.modal.saving : editingCampaign ? TEXTS.admin.panel.modal.update : TEXTS.admin.panel.modal.create}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onDuplicate: (campaign: Campaign) => void;
  onToggleActive: (id: string, currentState: boolean) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewPostulaciones?: (campaignId: string) => void;
  postulacionesCount?: number;
}

function CampaignCard({ campaign, onEdit, onDelete, onDuplicate, onToggleActive, isSelected, onToggleSelect, onViewPostulaciones, postulacionesCount = 0 }: CampaignCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
      isSelected ? 'border-[#00C9CE] shadow-md' : 'border-gray-200 hover:border-[#00C9CE]/50 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(campaign.id)}
            className="mt-1"
          />
          
          <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {campaign.logoUrl ? (
              <img src={campaign.logoUrl} alt={TEXTS.admin.panel.a11y.campaignLogoAlt} className="max-w-full max-h-full object-contain" />
            ) : (
              <img src={logo} alt={TEXTS.admin.panel.a11y.onusLogoAlt} className="max-w-full max-h-full object-contain" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <h3 className="text-xl" style={{ 
                color: '#000935',
                fontFamily: 'REM, sans-serif',
                fontWeight: 500 
              }}>{campaign.titulo}</h3>
              <span className={`px-3 py-1 rounded-full text-xs flex-shrink-0 ${
                campaign.isActive 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}>
                {campaign.isActive ? TEXTS.admin.panel.card.statusActive : TEXTS.admin.panel.card.statusInactive}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-gray-500 text-sm">{TEXTS.admin.panel.card.cityLabel}</p>
                <p className="text-gray-900">{campaign.ciudad}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{TEXTS.admin.panel.card.tarifaLabel}</p>
                <p className="text-gray-900">{campaign.tarifa}</p>
              </div>
              {campaign.cliente && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-sm">{TEXTS.admin.panel.card.clientLabel}</p>
                  <p className="text-gray-900">{campaign.cliente}</p>
                </div>
              )}
            </div>

            {campaign.descripcion && (
              <p className="text-gray-600 text-sm mb-3">{campaign.descripcion}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {campaign.vehiculos && campaign.vehiculos.map((v) => (
                <span key={v} className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs">
                  {v}
                </span>
              ))}
            </div>
            
            {/* Postulaciones */}
            {onViewPostulaciones && postulacionesCount !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => onViewPostulaciones(campaign.id)}
                  size="sm"
                  variant="outline"
                  className="border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/10 w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  {TEXTS.admin.panel.card.viewApplications}
                  {postulacionesCount > 0 && (
                    <span className="ml-2 bg-[#00C9CE] text-white rounded-full px-2 py-0.5 text-xs">
                      {postulacionesCount}
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Switch
            checked={campaign.isActive}
            onCheckedChange={() => onToggleActive(campaign.id, campaign.isActive)}
            className="data-[state=checked]:bg-green-500"
          />
          <Button
            onClick={() => onEdit(campaign)}
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-[#00C9CE] hover:bg-[#00C9CE]/10"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDuplicate(campaign)}
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-[#00C9CE] hover:bg-[#00C9CE]/10"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(campaign.id)}
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
