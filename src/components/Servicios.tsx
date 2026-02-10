import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Package, Clock, MapPin, Truck, CheckCircle2, Warehouse, Send, X } from 'lucide-react';
import mensajeroImg from 'figma:asset/f7f66d53263abb0cb68cc2557f63811408636e3d.png';
import flotaImg from 'figma:asset/75a4f1c6db6f262602b59fe34d37008c74077a3f.png';
import logisticaImg from 'figma:asset/db9abd92e988b2aa58d2d633b644cd55d0b3a92d.png';
import heroBg from 'figma:asset/0a1757e638ab1fb53c0032b34a92c151833d26de.png';
import { TEXTS } from '@/content/texts';
import { supabase } from '../supabase';

export function Servicios() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFormulario, setShowFormulario] = useState(false);
  const [formularioEnviado, setFormularioEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formularioData, setFormularioData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    zona: '',
    experiencia: '',
    tipoVehiculo: '',
    caracteristicasVehiculo: '',
    fechaInicio: '',
    horarioDisponible: '',
    autonomo: '',
    comentarios: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormularioData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const basePayload = {
        nombre: formularioData.nombre.trim(),
        telefono: formularioData.telefono.trim(),
        email: formularioData.email.trim(),
        ciudad: formularioData.zona.trim(),
      };

      const experienciaDetallada = [
        `Experiencia: ${formularioData.experiencia.trim()}`,
        `Veh�culo: ${formularioData.tipoVehiculo.trim()}`,
        `Caracter�sticas del veh�culo: ${formularioData.caracteristicasVehiculo.trim()}`,
        `Fecha de inicio: ${formularioData.fechaInicio.trim()}`,
        `Horario disponible: ${formularioData.horarioDisponible.trim()}`,
        `Aut�nomo: ${formularioData.autonomo.trim()}`,
        `Comentarios: ${formularioData.comentarios.trim()}`,
      ]
        .filter((linea) => !linea.endsWith(': '))
        .join('\n');

      const payloadA = {
        ...basePayload,
        experiencia: experienciaDetallada || null,
        vehiculo: formularioData.tipoVehiculo.trim() || null,
        flotista: formularioData.autonomo.trim() || null,
      };
      const payloadB = {
        ...basePayload,
        experiencia: experienciaDetallada || null,
      };

      let insertError: unknown = null;
      const first = await supabase.from('solicitudes_mensajeros').insert(payloadA);
      insertError = first.error;
      if (insertError) {
        const second = await supabase.from('solicitudes_mensajeros').insert(payloadB);
        insertError = second.error;
      }
      if (insertError) {
        const third = await supabase.from('solicitudes_mensajeros').insert(basePayload);
        insertError = third.error;
      }
      if (insertError) {
        throw insertError;
      }

      setFormularioEnviado(true);
    } catch (error) {
      console.error('Error guardando solicitud:', error);
      setError(error instanceof Error ? error.message : 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Efecto para manejar el scroll a la sección correcta cuando hay un hash en la URL
  useEffect(() => {
    if (location.hash) {
      // Esperar a que las imágenes se carguen antes de hacer scroll
      const handleScroll = () => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      // Intentar scroll después de que todo se cargue
      if (document.readyState === 'complete') {
        handleScroll();
      } else {
        window.addEventListener('load', handleScroll);
      }
    } else {
      // Si no hay hash, scroll al inicio
      window.scrollTo(0, 0);
    }
  }, [location]);

  // Efecto para escuchar el evento personalizado desde Header
  useEffect(() => {
    const handleOpenMensajeroForm = () => {
      setShowFormulario(true);
    };

    window.addEventListener('openMensajeroForm', handleOpenMensajeroForm);

    return () => {
      window.removeEventListener('openMensajeroForm', handleOpenMensajeroForm);
    };
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section 
        className="pt-52 pb-52 px-6 relative overflow-hidden min-h-[600px]" 
        style={{ 
          backgroundColor: '#000935',
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-[#000935]/70"></div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#00C9CE20' }}>
            <Truck className="w-10 h-10" style={{ color: '#00C9CE' }} />
          </div>
          <h1 className="text-4xl md:text-5xl mb-6" style={{ color: '#FFFFFF', fontFamily: 'REM, sans-serif', fontWeight: 500 }}>
            {TEXTS.services.heroTitle}
          </h1>
          <p className="text-lg text-gray-300">
            {TEXTS.services.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Servicio 1: Mensajeros Autónomos */}
      <section id="mensajeros" className="py-20 px-6 bg-white scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#00C9CE20' }}>
                <Truck className="w-10 h-10" style={{ color: '#00C9CE' }} />
              </div>
              <h2 className="onus-title text-3xl md:text-4xl mb-4" style={{ color: '#000935' }}>
                {TEXTS.services.mensajerosTitle}
              </h2>
              <p className="text-xl mb-6" style={{ color: '#00C9CE' }}>
                {TEXTS.services.mensajerosSubtitle}
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {TEXTS.services.mensajerosDescription}
              </p>
              
              <div className="space-y-3 mb-8">
                {[
                  TEXTS.services.messengersBenefit1,
                  TEXTS.services.messengersBenefit2,
                  TEXTS.services.messengersBenefit3,
                  TEXTS.services.messengersBenefit4,
                  TEXTS.services.messengersBenefit5
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00C9CE' }} />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowFormulario(true)}
                className="inline-block px-8 py-4 rounded-lg transition-all hover:scale-105"
                style={{ backgroundColor: '#00C9CE', color: '#000935' }}
              >
                {TEXTS.cta.joinOnus}
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={mensajeroImg} 
                alt={TEXTS.services.messengerImageAlt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modal del formulario */}
      {showFormulario && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowFormulario(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-scroll scrollbar-hide shadow-2xl" style={{ backgroundColor: '#000935' }} onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="sticky top-0 bg-[#000935] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00C9CE20' }}>
                  <Truck className="w-6 h-6" style={{ color: '#00C9CE' }} />
                </div>
                <div>
                  <h3 className="text-xl">{TEXTS.services.modal.title}</h3>
                  <p className="text-sm text-gray-300">{TEXTS.services.modal.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFormulario(false)}
                className="text-white hover:text-[#00C9CE] transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del formulario */}
            <div className="p-8 bg-white rounded-b-2xl">
              {formularioEnviado ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#00C9CE20' }}>
                    <Send className="w-10 h-10" style={{ color: '#00C9CE' }} />
                  </div>
                  <h3 className="text-2xl mb-3" style={{ color: '#000935' }}>{TEXTS.services.modal.successTitle}</h3>
                  <p className="text-gray-600 mb-6">{TEXTS.services.modal.form.helper.successMessage}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-[#00C9CE] animate-pulse"></div>
                    {TEXTS.services.modal.form.helper.autoCloseMessage}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitFormulario} className="space-y-6">
                  {/* Nombre completo */}
                  <div>
                    <label htmlFor="nombre" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.fullName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      value={formularioData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent"
                      placeholder={TEXTS.services.modal.form.placeholders.fullName}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="telefono" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      required
                      value={formularioData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent"
                      placeholder={TEXTS.services.modal.form.placeholders.phone}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.email} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formularioData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent"
                      placeholder={TEXTS.services.modal.form.placeholders.email}
                    />
                  </div>

                  {/* Zona */}
                  <div>
                    <label htmlFor="zona" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.zone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="zona"
                      name="zona"
                      required
                      value={formularioData.zona}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent"
                      placeholder={TEXTS.services.modal.form.placeholders.zone}
                    />
                  </div>

                  {/* Experiencia */}
                  <div>
                    <label htmlFor="experiencia" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.experience} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="experiencia"
                      name="experiencia"
                      required
                      rows={3}
                      value={formularioData.experiencia}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent resize-none"
                      placeholder={TEXTS.services.modal.form.placeholders.experience}
                    />
                  </div>

                  {/* Tipo de vehículo */}
                  <div>
                    <label htmlFor="tipoVehiculo" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.vehicle} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tipoVehiculo"
                      name="tipoVehiculo"
                      required
                      value={formularioData.tipoVehiculo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent"
                    >
                      <option value="">{TEXTS.services.modal.form.placeholders.vehicle}</option>
                      <option value="Moto">Moto</option>
                      <option value="Coche">Coche</option>
                      <option value="Furgoneta (3 m³ o menor)">Furgoneta (3 m³ o menor)</option>
                      <option value="Furgoneta (6 m³ o menor)">Furgoneta (6 m³ o menor)</option>
                      <option value="Furgoneta (11m³ o menor)">Furgoneta (11m³ o menor)</option>
                      <option value="Furgoneta (11m³ o mayor)">Furgoneta (11m³ o mayor)</option>
                      <option value="Carrozado">Carrozado</option>
                      <option value="Carrozado con plataforma">Carrozado con plataforma</option>
                      <option value="Carrozado Frigorifico">Carrozado Frigorifico</option>
                      <option value="Carrozado Frigorifico con plataforma">Carrozado Frigorifico con plataforma</option>
                      <option value="Vehículo rigido (mayor a 3500 Kg)">Vehículo rigido (mayor a 3500 Kg)</option>
                      <option value="Trailer">Trailer</option>
                    </select>
                  </div>

                  {/* Características del vehículo */}
                  <div>
                    <label htmlFor="caracteristicasVehiculo" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.vehicleDetails} <span className="text-red-500">*</span>
                      <span className="text-sm text-gray-500 block mt-1">{TEXTS.services.modal.form.helper.vehicleDetailsNote}</span>
                    </label>
                    <textarea
                      id="caracteristicasVehiculo"
                      name="caracteristicasVehiculo"
                      required
                      rows={3}
                      value={formularioData.caracteristicasVehiculo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent resize-none"
                      placeholder={TEXTS.services.modal.form.placeholders.vehicleDetails}
                    />
                  </div>

                  {/* Fecha de inicio */}
                  <div>
                    <label htmlFor="fechaInicio" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.startDate} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="fechaInicio"
                      name="fechaInicio"
                      required
                      value={formularioData.fechaInicio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent"
                    />
                  </div>

                  {/* Horario disponible */}
                  <div>
                    <label htmlFor="horarioDisponible" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.labels.schedule} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="horarioDisponible"
                      name="horarioDisponible"
                      required
                      value={formularioData.horarioDisponible}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent"
                      placeholder={TEXTS.services.modal.form.placeholders.schedule}
                    />
                  </div>

                  {/* Autónomo */}
                  <div>
                    <label className="block mb-3 text-gray-700">
                      {TEXTS.services.modal.form.labels.selfEmployed} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="autonomo"
                          value="Sí"
                          checked={formularioData.autonomo === 'Sí'}
                          onChange={handleInputChange}
                          required
                          className="w-4 h-4 text-[#00C9CE] focus:ring-2 focus:ring-[#00C9CE]"
                        />
                        <span className="text-gray-700">{TEXTS.services.modal.form.helper.radioYes}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="autonomo"
                          value="No"
                          checked={formularioData.autonomo === 'No'}
                          onChange={handleInputChange}
                          required
                          className="w-4 h-4 text-[#00C9CE] focus:ring-2 focus:ring-[#00C9CE]"
                        />
                        <span className="text-gray-700">{TEXTS.services.modal.form.helper.radioNo}</span>
                      </label>
                    </div>
                  </div>

                  {/* Comentarios adicionales */}
                  <div>
                    <label htmlFor="comentarios" className="block mb-2 text-gray-700">
                      {TEXTS.services.modal.form.helper.commentsLabel}
                    </label>
                    <textarea
                      id="comentarios"
                      name="comentarios"
                      rows={4}
                      value={formularioData.comentarios}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9CE] focus:border-transparent resize-none"
                      placeholder={TEXTS.services.modal.form.placeholders.comments}
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowFormulario(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {TEXTS.services.modal.form.buttons.cancel}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 rounded-lg text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#00C9CE', color: '#000935' }}
                      disabled={isSubmitting}
                    >
                      <Send className="w-5 h-5" />
                      {isSubmitting ? TEXTS.services.modal.form.buttons.submitting : TEXTS.services.modal.form.buttons.submit}
                    </button>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}

                  {/* Nota de privacidad */}
                  <p className="text-xs text-gray-500 text-center pt-2">
                    {TEXTS.services.modal.form.privacy.notice}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Servicio 2: Empresas de Mensajería */}
      <section id="empresas" className="py-20 px-6 scroll-mt-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={flotaImg} 
                  alt={TEXTS.services.teamImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#00C9CE20' }}>
                <Package className="w-10 h-10" style={{ color: '#00C9CE' }} />
              </div>
              <h2 className="onus-title text-3xl md:text-4xl mb-4" style={{ color: '#000935' }}>
                {TEXTS.services.empresasTitle}
              </h2>
              <p className="text-xl mb-6" style={{ color: '#00C9CE' }}>
                {TEXTS.services.empresasSubtitle}
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {TEXTS.services.empresasDescription}
              </p>
              
              <div className="space-y-3 mb-8">
                {[
                  TEXTS.services.companiesBenefit1,
                  TEXTS.services.companiesBenefit2,
                  TEXTS.services.companiesBenefit3,
                  TEXTS.services.companiesBenefit4,
                  TEXTS.services.companiesBenefit5
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00C9CE' }} />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/contacto?lead_type=client&service=fleet"
                className="inline-block px-8 py-4 rounded-lg transition-all hover:scale-105"
                style={{ backgroundColor: '#00C9CE', color: '#000935' }}
              >
                {TEXTS.services.empresasButton}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Servicio 3: Centros Logísticos */}
      <section id="logistica" className="py-20 px-6 bg-white scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#00C9CE20' }}>
                <Warehouse className="w-10 h-10" style={{ color: '#00C9CE' }} />
              </div>
              <h2 className="onus-title text-3xl md:text-4xl mb-4" style={{ color: '#000935' }}>
                {TEXTS.services.logisticaTitle}
              </h2>
              <p className="text-xl mb-6" style={{ color: '#00C9CE' }}>
                {TEXTS.services.logisticaSubtitle}
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {TEXTS.services.logisticsDescription}
              </p>
              
              <div className="space-y-3 mb-8">
                {[
                  TEXTS.services.logisticsBenefit1,
                  TEXTS.services.logisticsBenefit2,
                  TEXTS.services.logisticsBenefit3,
                  TEXTS.services.logisticsBenefit4,
                  TEXTS.services.logisticsBenefit5
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00C9CE' }} />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/contacto?lead_type=client&service=logistics_staff"
                className="inline-block px-8 py-4 rounded-lg transition-all hover:scale-105"
                style={{ backgroundColor: '#00C9CE', color: '#000935' }}
              >
                {TEXTS.services.logisticaButton}
              </Link>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={logisticaImg} 
                alt={TEXTS.services.teamImageAlt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
