import { TEXTS } from '@/content/texts';

export function TermsConditions() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-white">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 pb-6 border-b-2" style={{ borderColor: '#000935' }}>
          <h1 className="text-4xl mb-2" style={{ color: '#000935' }}>
            {TEXTS.legal.terms.header.title}
          </h1>
          <p className="text-gray-500">
            {TEXTS.legal.terms.header.subtitle}
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-8" style={{ color: '#4a5568' }}>
          {/* Introducción */}
          <section>
            <p>
              {TEXTS.legal.terms.intro.paragraph}
            </p>
          </section>

          {/* Uso del sitio web */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.terms.sections.websiteUse.title}
            </h2>
            <p>
              {TEXTS.legal.terms.sections.websiteUse.paragraph}
            </p>
          </section>

          {/* Servicios */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.terms.sections.services.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.terms.sections.services.paragraph1}
            </p>
            <p>
              {TEXTS.legal.terms.sections.services.paragraph2}
            </p>
          </section>

          {/* Responsabilidad */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.terms.sections.liability.title}
            </h2>
            <p className="mb-3">
              {TEXTS.brand.company.name} {TEXTS.legal.terms.sections.liability.introSuffix}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>{TEXTS.legal.terms.sections.liability.items.item1}</li>
              <li>{TEXTS.legal.terms.sections.liability.items.item2}</li>
              <li>{TEXTS.legal.terms.sections.liability.items.item3}</li>
              <li>{TEXTS.legal.terms.sections.liability.items.item4}</li>
            </ul>
          </section>

          {/* Propiedad intelectual */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.terms.sections.intellectualProperty.title}
            </h2>
            <p className="mb-3">
              {TEXTS.legal.terms.sections.intellectualProperty.paragraph1}
            </p>
            <p>
              {TEXTS.legal.terms.sections.intellectualProperty.paragraph2}
            </p>
          </section>

          {/* Legislación aplicable */}
          <section>
            <h2 className="text-2xl mb-4" style={{ color: '#000935' }}>
              {TEXTS.legal.terms.sections.applicableLaw.title}
            </h2>
            <p>
              {TEXTS.legal.terms.sections.applicableLaw.paragraph}
            </p>
          </section>
        </div>

        {/* Última actualización */}
        <div className="mt-16 pt-8 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            {TEXTS.legal.terms.footer.lastUpdate}
          </p>
        </div>
      </div>
    </div>
  );
}