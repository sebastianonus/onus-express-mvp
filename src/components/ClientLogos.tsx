import React, { useState } from 'react';

// Logos reales de empresas clientes
import logoGLS from 'figma:asset/03db1b024988fb2a3d5ff72cbd039f81023dbc6e.png';
import logoSEUR from 'figma:asset/34d77dfd477532343893cc970ec5579b52d5f4f9.png';
import logoZeleris from 'figma:asset/d7a05b3a9430302e25dbd3025422d808e5ab3f0d.png';
import logoCorreosExpress from 'figma:asset/a9fad0933c44ae19ff83116e16bdf747fbd685f0.png';
import logoDHL from 'figma:asset/057d6bd36cb2297f8ba7cc717d48a0b9ad7b9035.png';
import logoWallapop from 'figma:asset/990f948dbfe2c55c08b70cdded5406046b1ee4ec.png';

const logos = [
  {
    name: 'GLS',
    src: logoGLS
  },
  {
    name: 'SEUR',
    src: logoSEUR
  },
  {
    name: 'Zeleris',
    src: logoZeleris
  },
  {
    name: 'Correos Express',
    src: logoCorreosExpress
  },
  {
    name: 'DHL',
    src: logoDHL
  },
  {
    name: 'Wallapop',
    src: logoWallapop
  }
];

export function ClientLogos() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="py-20 px-6" style={{ backgroundColor: '#000935' }}>
      <div className="container mx-auto max-w-6xl">
        {/* Título y subtítulo */}
        <div className="text-center mb-12">
          <h2 
            className="onus-title text-3xl md:text-4xl mb-4"
            style={{ color: '#FFFFFF' }}
          >
            Nuestros clientes
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Empresas líderes del sector logístico que forman parte de nuestra cartera de clientes y confían en ONUS EXPRESS para sus servicios de mensajería
          </p>
        </div>

        {/* Carousel de logos */}
        <div className="relative overflow-hidden">
          <div
            className="flex"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              animation: isPaused ? 'none' : 'scroll 30s linear infinite',
              width: 'fit-content'
            }}
          >
            {/* Primera copia de logos */}
            {logos.map((logo, index) => (
              <div
                key={`logo-1-${index}`}
                className="flex items-center justify-center mx-8 flex-shrink-0"
                style={{ width: '320px', height: '160px' }}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
            
            {/* Segunda copia de logos para efecto infinito */}
            {logos.map((logo, index) => (
              <div
                key={`logo-2-${index}`}
                className="flex items-center justify-center mx-8 flex-shrink-0"
                style={{ width: '320px', height: '160px' }}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}

            {/* Tercera copia para seamless scroll */}
            {logos.map((logo, index) => (
              <div
                key={`logo-3-${index}`}
                className="flex items-center justify-center mx-8 flex-shrink-0"
                style={{ width: '320px', height: '160px' }}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
}