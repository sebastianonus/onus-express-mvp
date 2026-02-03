import { useState } from 'react';
import { saveCookieConsent, getCookieConsent, initTracking } from '../utils/analytics';
import { toast } from 'sonner@2.0.3';
import { TEXTS } from '@/content/texts';

export function CookiePolicy() {
  const currentConsent = getCookieConsent();
  const [analytics, setAnalytics] = useState(currentConsent?.analytics ?? true);
  const [marketing, setMarketing] = useState(currentConsent?.marketing ?? true);

  const handleSavePreferences = () => {
    saveCookieConsent(analytics, marketing);
    initTracking();
    toast.info('Preferencias de cookies guardadas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-white">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 pb-6 border-b-2" style={{ borderColor: '#000935' }}>
          <h1 className="text-4xl mb-2" style={{ color: '#000935' }}>
            {TEXTS.legal.cookies.title}
          </h1>
          <p className="text-gray-500">
            {TEXTS.brand.company.name}
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-8" style={{ color: '#4a5568' }}>
          {/* ¿Qué son las cookies? */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.cookies.sections.whatAre.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.cookies.sections.whatAre.p1}
            </p>
            <p>
              {TEXTS.legal.cookies.sections.whatAre.p2}
            </p>
          </section>

          {/* Tipos de cookies que utilizamos */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.cookies.sections.types.title}
            </h2>

            <div className="space-y-6">
              {/* Cookies necesarias */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f7f7f7' }}>
                <h3 className="text-xl mb-2" style={{ color: '#000935' }}>
                  {TEXTS.legal.cookies.sections.types.necessary.title}
                </h3>
                <p className="mb-2">
                  {TEXTS.legal.cookies.sections.types.necessary.p1}
                </p>
                <p className="text-sm">
                  <strong>{TEXTS.legal.cookies.sections.types.necessary.purposeLabel}</strong> {TEXTS.legal.cookies.sections.types.necessary.purposeText}
                </p>
                <p className="text-sm">
                  <strong>{TEXTS.legal.cookies.sections.types.necessary.durationLabel}</strong> {TEXTS.legal.cookies.sections.types.necessary.durationText}
                </p>
                <p className="text-sm">
                  <strong>{TEXTS.legal.cookies.sections.types.necessary.ownerLabel}</strong> {TEXTS.brand.company.name}
                </p>
              </div>

              {/* Cookies de análisis */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f7f7f7' }}>
                <h3 className="text-xl mb-2" style={{ color: '#000935' }}>
                  {TEXTS.legal.cookies.sections.types.analytics.title}
                </h3>
                <p className="mb-2">
                  {TEXTS.legal.cookies.sections.types.analytics.p1}
                </p>
                <p className="text-sm mb-1">
                  <strong>{TEXTS.legal.cookies.sections.types.analytics.purposeLabel}</strong> {TEXTS.legal.cookies.sections.types.analytics.purposeText}
                </p>
                <p className="text-sm mb-1">
                  <strong>{TEXTS.legal.cookies.sections.types.analytics.durationLabel}</strong> {TEXTS.legal.cookies.sections.types.analytics.durationText}
                </p>
                <p className="text-sm mb-1">
                  <strong>{TEXTS.legal.cookies.sections.types.analytics.ownerLabel}</strong> {TEXTS.legal.cookies.sections.types.analytics.ownerText}
                </p>
                <p className="text-sm">
                  <strong>{TEXTS.legal.cookies.sections.types.analytics.moreInfoLabel}</strong>{' '}
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: '#00C9CE' }}
                  >
                    {TEXTS.legal.cookies.sections.types.analytics.linkText}
                  </a>
                </p>
              </div>

              {/* Cookies de marketing */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f7f7f7' }}>
                <h3 className="text-xl mb-2" style={{ color: '#000935' }}>
                  {TEXTS.legal.cookies.sections.types.marketing.title}
                </h3>
                <p className="mb-2">
                  {TEXTS.legal.cookies.sections.types.marketing.p1}
                </p>
                <p className="text-sm mb-1">
                  <strong>{TEXTS.legal.cookies.sections.types.marketing.purposeLabel}</strong> {TEXTS.legal.cookies.sections.types.marketing.purposeText}
                </p>
                <p className="text-sm mb-1">
                  <strong>{TEXTS.legal.cookies.sections.types.marketing.durationLabel}</strong> {TEXTS.legal.cookies.sections.types.marketing.durationText}
                </p>
                <p className="text-sm mb-1">
                  <strong>{TEXTS.legal.cookies.sections.types.marketing.ownerLabel}</strong> {TEXTS.legal.cookies.sections.types.marketing.ownerText}
                </p>
                <p className="text-sm">
                  <strong>{TEXTS.legal.cookies.sections.types.marketing.moreInfoLabel}</strong>{' '}
                  <a 
                    href="https://www.facebook.com/privacy/policy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: '#00C9CE' }}
                  >
                    {TEXTS.legal.cookies.sections.types.marketing.linkText}
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Base legal */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.cookies.sections.legalBasis.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.cookies.sections.legalBasis.p1}
            </p>
            <p>
              {TEXTS.legal.cookies.sections.legalBasis.p2}
            </p>
          </section>

          {/* Gestión de cookies */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.cookies.sections.manage.title}
            </h2>
            <p className="mb-4">
              {TEXTS.legal.cookies.sections.manage.p1}
            </p>

            {/* Panel de preferencias */}
            <div className="p-6 rounded-lg border-2 space-y-4" style={{ borderColor: '#000935' }}>
              <h3 className="text-xl mb-4" style={{ color: '#000935' }}>
                {TEXTS.legal.cookies.sections.manage.panelTitle}
              </h3>

              {/* Cookies necesarias */}
              <div className="flex items-start justify-between p-4 rounded-lg" style={{ backgroundColor: '#f7f7f7' }}>
                <div className="flex-1">
                  <h4 style={{ color: '#000935' }}>{TEXTS.legal.cookies.sections.manage.necessaryTitle}</h4>
                  <p className="text-sm text-gray-600">
                    {TEXTS.legal.cookies.sections.manage.necessarySubtitle}
                  </p>
                </div>
                <div className="ml-4 px-3 py-1 rounded text-xs bg-gray-600 text-white">
                  {TEXTS.legal.cookies.sections.manage.necessaryBadge}
                </div>
              </div>

              {/* Cookies de análisis */}
              <div className="flex items-start justify-between p-4 rounded-lg" style={{ backgroundColor: '#f7f7f7' }}>
                <div className="flex-1">
                  <h4 style={{ color: '#000935' }}>{TEXTS.legal.cookies.sections.manage.analyticsTitle}</h4>
                  <p className="text-sm text-gray-600">
                    {TEXTS.legal.cookies.sections.manage.analyticsSubtitle}
                  </p>
                </div>
                <label className="ml-4 relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C9CE]"></div>
                </label>
              </div>

              {/* Cookies de marketing */}
              <div className="flex items-start justify-between p-4 rounded-lg" style={{ backgroundColor: '#f7f7f7' }}>
                <div className="flex-1">
                  <h4 style={{ color: '#000935' }}>{TEXTS.legal.cookies.sections.manage.marketingTitle}</h4>
                  <p className="text-sm text-gray-600">
                    {TEXTS.legal.cookies.sections.manage.marketingSubtitle}
                  </p>
                </div>
                <label className="ml-4 relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C9CE]"></div>
                </label>
              </div>

              <button
                onClick={handleSavePreferences}
                className="w-full py-3 rounded-lg text-white transition-transform hover:scale-[1.02] mt-4"
                style={{ backgroundColor: '#00C9CE' }}
              >
                {TEXTS.legal.cookies.sections.manage.saveButton}
              </button>
            </div>
          </section>

          {/* Configuración del navegador */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.cookies.sections.browser.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.cookies.sections.browser.p1}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>
                <a 
                  href="https://support.google.com/chrome/answer/95647" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: '#00C9CE' }}
                >
                  {TEXTS.legal.cookies.sections.browser.chrome}
                </a>
              </li>
              <li>
                <a 
                  href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: '#00C9CE' }}
                >
                  {TEXTS.legal.cookies.sections.browser.firefox}
                </a>
              </li>
              <li>
                <a 
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: '#00C9CE' }}
                >
                  {TEXTS.legal.cookies.sections.browser.safari}
                </a>
              </li>
              <li>
                <a 
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: '#00C9CE' }}
                >
                  {TEXTS.legal.cookies.sections.browser.edge}
                </a>
              </li>
            </ul>
          </section>

          {/* Actualización de la política */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.cookies.sections.updates.title}
            </h2>
            <p>
              {TEXTS.legal.cookies.sections.updates.p1}
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.cookies.sections.contact.title}
            </h2>
            <p>
              {TEXTS.legal.cookies.sections.contact.p1Prefix}{' '}
              <a 
                href={`mailto:${TEXTS.footer.contactEmail}`}
                className="hover:underline"
                style={{ color: '#00C9CE' }}
              >
                {TEXTS.footer.contactEmail}
              </a>
            </p>
          </section>
        </div>

        {/* Última actualización */}
        <div className="mt-16 pt-8 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            {TEXTS.legal.cookies.lastUpdate}
          </p>
        </div>
      </div>
    </div>
  );
}