import { TEXTS } from '@/content/texts';

export function LegalNotice() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-white">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 pb-6 border-b-2" style={{ borderColor: '#000935' }}>
          <h1 className="text-4xl mb-2" style={{ color: '#000935' }}>
            {TEXTS.legal.notice.title}
          </h1>
        </div>

        {/* Contenido */}
        <div className="space-y-8" style={{ color: '#4a5568' }}>
          {/* Titular del sitio web */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.notice.sections.owner.title}
            </h2>
            <p className="mb-1">{TEXTS.brand.company.name}</p>
            <p>{TEXTS.legal.notice.sections.owner.cifPrefix} {TEXTS.brand.company.cif}</p>
          </section>

          {/* Domicilio social */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.notice.sections.address.title}
            </h2>
            <p>{TEXTS.legal.notice.sections.address.line1}</p>
            <p>{TEXTS.legal.notice.sections.address.line2}</p>
            <p>{TEXTS.legal.notice.sections.address.line3}</p>
          </section>

          {/* Correo electrónico de contacto */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.notice.sections.contactEmail.title}
            </h2>
            <p>
              <a 
                href={`mailto:${TEXTS.footer.contactEmail}`}
                className="hover:underline"
                style={{ color: '#00C9CE' }}
              >
                {TEXTS.footer.contactEmail}
              </a>
            </p>
          </section>

          {/* Objeto */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.notice.sections.purpose.title}
            </h2>
            <p>
              {TEXTS.legal.notice.sections.purpose.paragraph}
            </p>
          </section>

          {/* Condiciones de uso */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.notice.sections.terms.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.notice.sections.terms.paragraph1}
            </p>
            <p>
              {TEXTS.legal.notice.sections.terms.paragraph2}
            </p>
          </section>

          {/* Responsabilidad */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.notice.sections.liability.title}
            </h2>
            <p className="mb-3">
              {TEXTS.brand.company.name} {TEXTS.legal.notice.sections.liability.introSuffix}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>{TEXTS.legal.notice.sections.liability.items.item1}</li>
              <li>{TEXTS.legal.notice.sections.liability.items.item2}</li>
              <li>{TEXTS.legal.notice.sections.liability.items.item3}</li>
            </ul>
          </section>

          {/* Propiedad intelectual e industrial */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.notice.sections.ip.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.notice.sections.ip.paragraph1}
            </p>
            <p>
              {TEXTS.legal.notice.sections.ip.paragraph2}
            </p>
          </section>

          {/* Legislación aplicable */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.notice.sections.law.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.notice.sections.law.paragraph1}
            </p>
            <p>
              {TEXTS.legal.notice.sections.law.paragraph2}
            </p>
          </section>
        </div>

        {/* Última actualización */}
        <div className="mt-16 pt-8 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            {TEXTS.legal.notice.footer.lastUpdate}
          </p>
        </div>
      </div>
    </div>
  );
}