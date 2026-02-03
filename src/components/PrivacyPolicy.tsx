import { TEXTS } from '@/content/texts';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-white">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 pb-6 border-b-2" style={{ borderColor: '#000935' }}>
          <h1 className="text-4xl mb-2" style={{ color: '#000935' }}>
            {TEXTS.legal.privacy.title}
          </h1>
          <p className="text-gray-500">
            {TEXTS.brand.company.name}
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-8" style={{ color: '#4a5568' }}>
          {/* Responsable del tratamiento */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.responsible.title}
            </h2>
            <div className="space-y-1 leading-relaxed">
              <p><strong>{TEXTS.legal.privacy.responsible.businessName}</strong> {TEXTS.brand.company.name}</p>
              <p><strong>{TEXTS.legal.privacy.responsible.cif}</strong> {TEXTS.brand.company.cif}</p>
              <p><strong>{TEXTS.legal.privacy.responsible.address}</strong> {TEXTS.brand.company.address}</p>
              <p><strong>{TEXTS.legal.privacy.responsible.email}</strong> <a href={`mailto:${TEXTS.footer.contactEmail}`} className="text-[#00C9CE] hover:underline">{TEXTS.footer.contactEmail}</a></p>
            </div>
          </section>

          {/* Datos que se recogen */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.dataCollected.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.privacy.dataCollected.intro}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>{TEXTS.legal.privacy.dataCollected.items.name}</li>
              <li>{TEXTS.legal.privacy.dataCollected.items.phone}</li>
              <li>{TEXTS.legal.privacy.dataCollected.items.email}</li>
              <li>{TEXTS.legal.privacy.dataCollected.items.professional}</li>
            </ul>
          </section>

          {/* Finalidad del tratamiento */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.purpose.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.privacy.purpose.intro}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>{TEXTS.legal.privacy.purpose.items.requests}</li>
              <li>{TEXTS.legal.privacy.purpose.items.contact}</li>
              <li>{TEXTS.legal.privacy.purpose.items.management}</li>
            </ul>
          </section>

          {/* Legitimación */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.legitimation.title}
            </h2>
            <p>
              {TEXTS.legal.privacy.legitimation.text}
            </p>
          </section>

          {/* Conservación */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.retention.title}
            </h2>
            <p>
              {TEXTS.legal.privacy.retention.text}
            </p>
          </section>

          {/* Derechos del usuario */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.rights.title}
            </h2>
            <p className="mb-2">
              {TEXTS.legal.privacy.rights.text}
            </p>
            <p>
              <a href={`mailto:${TEXTS.footer.contactEmail}`} className="text-[#00C9CE] hover:underline">
                {TEXTS.footer.contactEmail}
              </a>
            </p>
          </section>

          {/* Seguridad */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.security.title}
            </h2>
            <p>
              {TEXTS.legal.privacy.security.text}
            </p>
          </section>

          {/* Cookies y tecnologías de seguimiento */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.cookies.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.privacy.cookies.paragraph1}
            </p>
            <p className="mb-3">
              {TEXTS.legal.privacy.cookies.paragraph2}
            </p>
            <p>
              {TEXTS.legal.privacy.cookies.paragraph3}{' '}
              <a 
                href="/politica-cookies" 
                className="hover:underline"
                style={{ color: '#00C9CE' }}
              >
                {TEXTS.legal.privacy.cookies.cookiePolicyLink}
              </a>
              .
            </p>
          </section>

          {/* Transferencias internacionales */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.privacy.transfers.title}
            </h2>
            <p>
              {TEXTS.legal.privacy.transfers.text}
            </p>
          </section>
        </div>

        {/* Última actualización */}
        <div className="mt-16 pt-8 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            {TEXTS.legal.privacy.lastUpdate}
          </p>
        </div>
      </div>
    </div>
  );
}