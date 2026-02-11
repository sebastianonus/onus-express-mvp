import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MessageCircle, Mail, Phone, CheckCircle2 } from 'lucide-react';
import backgroundImg from 'figma:asset/e4d65246763c398c8158c537a32f609404b085bd.png';
import { TEXTS } from '@/content/texts';
import { supabase } from '../supabase';
import { insertWithSchemaMatch } from '../utils/supabaseInsertMatch';

export function Contacto() {
  const [searchParams] = useSearchParams();
  const leadType = searchParams.get('lead_type') || 'client';
  const service = searchParams.get('service') || 'general_contact';
  
  // Determinar texto contextual según el servicio
  const getContextualText = () => {
    switch (service) {
      case 'fleet':
        return TEXTS.contact.context.fleet;
      case 'logistics_staff':
        return TEXTS.contact.context.logisticsStaff;
      default:
        return TEXTS.contact.context.general;
    }
  };

  // Formulario de contacto con estados
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
    email: '',
    mensaje: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const nombre = formData.nombre.trim();
      const telefono = formData.telefono.trim();
      const email = formData.email.trim();
      const enrichedMessage = [
        formData.empresa.trim() ? `Empresa: ${formData.empresa.trim()}` : '',
        `Contexto: ${getContextualText()}`,
        '',
        formData.mensaje.trim(),
      ]
        .filter(Boolean)
        .join('\n');
      const origenFormulario =
        service === 'fleet'
          ? 'servicios_solicitar_flota'
          : service === 'logistics_staff'
            ? 'servicios_personal_logistico'
            : 'contacto_general';

      const variants: Record<string, unknown>[] = [
        { nombre, telefono, email, mensaje: enrichedMessage, origen_formulario: origenFormulario },
        { nombre, telefono, email, mensaje: enrichedMessage },
        { name: nombre, phone: telefono, email, message: enrichedMessage },
        { full_name: nombre, phone: telefono, email, message: enrichedMessage },
        { nombre, telefono, email },
        { name: nombre, phone: telefono, email },
        { telefono, email, mensaje: enrichedMessage },
        { phone: telefono, email, message: enrichedMessage },
        { email, mensaje: enrichedMessage },
        { email, message: enrichedMessage },
      ];

      await insertWithSchemaMatch('contactos', variants, async (table, payload) => {
        const result = await supabase.from(table).insert(payload);
        return { error: result.error };
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Error guardando contacto:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero con background image al 50% */}
      <section 
        className="pt-52 pb-52 px-6 min-h-[600px] relative"
        style={{ backgroundColor: '#000935' }}
      >
        {/* Imagen de fondo con opacidad 50% */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImg})`,
            opacity: 0.5
          }}
        ></div>
        
        {/* Contenido sobre la imagen */}
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#00C9CE20' }}>
            <MessageCircle className="w-10 h-10" style={{ color: '#00C9CE' }} />
          </div>
          <h1 className="text-4xl md:text-5xl mb-6" style={{ color: '#FFFFFF', fontFamily: 'REM, sans-serif', fontWeight: 500 }}>
            {TEXTS.contact.title}
          </h1>
          <p className="text-lg text-gray-300">
            {TEXTS.contact.subtitle}
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Opciones de contacto */}
            <div>
              <h2 className="onus-title text-3xl mb-8" style={{ color: '#000935' }}>
                {TEXTS.contact.directContactTitle}
              </h2>
              
              <div className="space-y-6">
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/34676728527?text=Hola,%20necesito%20información%20sobre%20sus%20servicios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-6 rounded-xl border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: '#00C9CE' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00C9CE20' }}>
                    <MessageCircle className="w-6 h-6" style={{ color: '#00C9CE' }} />
                  </div>
                  <div>
                    <h3 className="onus-title text-xl mb-2" style={{ color: '#000935' }}>
                      {TEXTS.contact.direct.whatsappTitle}
                    </h3>
                    <p className="text-gray-600">
                      {TEXTS.contact.direct.whatsappDescription}
                    </p>
                    <p className="mt-2" style={{ color: '#00C9CE' }}>
                      +34 676 72 85 27
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:info@onusexpress.com"
                  className="flex items-start gap-4 p-6 rounded-xl border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: '#00C9CE' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00C9CE20' }}>
                    <Mail className="w-6 h-6" style={{ color: '#00C9CE' }} />
                  </div>
                  <div>
                    <h3 className="onus-title text-xl mb-2" style={{ color: '#000935' }}>
                      {TEXTS.contact.direct.emailTitle}
                    </h3>
                    <p className="text-gray-600">
                      {TEXTS.contact.direct.emailDescription}
                    </p>
                    <p className="mt-2" style={{ color: '#00C9CE' }}>
                      info@onusexpress.com
                    </p>
                  </div>
                </a>

                {/* Teléfono */}
                <a 
                  href="tel:+34933596834"
                  className="flex items-start gap-4 p-6 rounded-xl border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: '#00C9CE' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00C9CE20' }}>
                    <Phone className="w-6 h-6" style={{ color: '#00C9CE' }} />
                  </div>
                  <div>
                    <h3 className="onus-title text-xl mb-2" style={{ color: '#000935' }}>
                      {TEXTS.contact.direct.phoneTitle}
                    </h3>
                    <p className="text-gray-600">
                      {TEXTS.contact.direct.phoneDescription}
                    </p>
                    <p className="mt-2" style={{ color: '#00C9CE' }}>
                      933 59 68 34
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Formulario */}
            <div>
              <h2 className="onus-title text-3xl mb-2" style={{ color: '#000935' }}>
                {TEXTS.contact.form.formTitle}
              </h2>
              
              {/* Texto contextual según el servicio */}
              <p className="text-sm mb-6" style={{ color: '#00C9CE' }}>
                {getContextualText()}
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="nombre">{TEXTS.contact.form.labels.fullName}</Label>
                    <Input
                      id="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="empresa">{TEXTS.contact.form.labels.company}</Label>
                    <Input
                      id="empresa"
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">{TEXTS.contact.form.labels.phone}</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{TEXTS.contact.form.labels.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mensaje">{TEXTS.contact.form.labels.message}</Label>
                    <Textarea
                      id="mensaje"
                      value={formData.mensaje}
                      onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                      className="mt-2"
                      rows={5}
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full"
                    style={{ backgroundColor: '#00C9CE', color: '#000935' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? TEXTS.contact.form.buttons.submitting : TEXTS.contact.form.buttons.submit}
                  </Button>

                  {error && (
                    <p className="text-sm text-red-500 text-center mt-2">
                      {error}
                    </p>
                  )}

                  <p className="text-sm text-gray-500 text-center">
                    {TEXTS.contact.form.helperNote}
                  </p>
                </form>
              ) : (
                <div className="border-2 rounded-xl p-12 text-center" style={{ borderColor: '#00C9CE' }}>
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: '#00C9CE' }} />
                  <h3 className="onus-title text-2xl mb-4" style={{ color: '#000935' }}>
                    {TEXTS.contact.form.successTitle}
                  </h3>
                  <p className="text-gray-600">
                    {TEXTS.contact.form.successMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


