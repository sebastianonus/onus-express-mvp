import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Youtube, Instagram, Facebook, Linkedin, Clock, MapPin } from 'lucide-react';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';
import { TEXTS } from '@/content/texts';

export function Footer() {
  const handleLinkClick = () => {
    // Forzar scroll al top cuando se hace clic en un enlace
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <footer className="py-12 px-6 relative" style={{ backgroundColor: '#000935', color: '#FFFFFF' }}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo */}
          <div>
            <img src={logo} alt={TEXTS.footer.a11y.logoAlt} className="h-10 mb-4 brightness-0 invert" />
            <a 
              href="https://maps.app.goo.gl/qggArKLj411G3c436" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-sm text-gray-400 hover:text-[#00C9CE] transition-colors group"
            >
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-[#00C9CE]" />
              <span className="text-left leading-relaxed">{TEXTS.footer.note}</span>
            </a>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="mb-4" style={{ color: '#00C9CE' }}>{TEXTS.footer.linksTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/servicios" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.nav.services}
                </Link>
              </li>
              <li>
                <Link to="/clientes" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.nav.clients}
                </Link>
              </li>
              <li>
                <Link to="/mensajeros" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.nav.couriers}
                </Link>
              </li>
              <li>
                <Link to="/contacto" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.nav.contact}
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.nav.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4" style={{ color: '#00C9CE' }}>{TEXTS.footer.legalTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/aviso-legal" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.footer.legalNotice}
                </Link>
              </li>
              <li>
                <Link to="/privacidad" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link to="/terminos" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.footer.termsConditions}
                </Link>
              </li>
              <li>
                <Link to="/politica-cookies" onClick={handleLinkClick} className="text-gray-300 hover:text-[#00C9CE] transition-colors">
                  {TEXTS.footer.cookiePolicy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Horario Comercial */}
          <div>
            <h4 className="mb-4" style={{ color: '#00C9CE' }}>{TEXTS.footer.scheduleTitle}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-20">{TEXTS.footer.monday}</span>
                <span className="text-gray-300">{TEXTS.footer.scheduleTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-20">{TEXTS.footer.tuesday}</span>
                <span className="text-gray-300">{TEXTS.footer.scheduleTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-20">{TEXTS.footer.wednesday}</span>
                <span className="text-gray-300">{TEXTS.footer.scheduleTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-20">{TEXTS.footer.thursday}</span>
                <span className="text-gray-300">{TEXTS.footer.scheduleTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-20">{TEXTS.footer.friday}</span>
                <span className="text-gray-300">{TEXTS.footer.scheduleTime}</span>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="mb-4" style={{ color: '#00C9CE' }}>{TEXTS.footer.contactTitle}</h4>
            <div className="space-y-3">
              <a
                href={`mailto:${TEXTS.footer.contactEmail}`}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#00C9CE] transition-colors"
              >
                <Mail className="w-4 h-4" />
                {TEXTS.footer.contactEmail}
              </a>
              <a href="https://wa.me/34676728527" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#00C9CE] transition-colors">
                <MessageCircle className="w-4 h-4" />
                {TEXTS.footer.whatsapp}
              </a>
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="pb-8 border-b border-gray-700">
          <h4 className="text-center mb-4" style={{ color: '#00C9CE' }}>{TEXTS.footer.followUs}</h4>
          <div className="flex justify-center gap-6">
            <a 
              href="https://youtube.com/@onus_express?si=NAkAjd4Q8d3PC2xa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#00C9CE] transition-colors transform hover:scale-110"
              aria-label={TEXTS.footer.a11y.youtube}
            >
              <Youtube className="w-6 h-6" />
            </a>
            <a 
              href="https://instagram.com/onusexpress" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#00C9CE] transition-colors transform hover:scale-110"
              aria-label={TEXTS.footer.a11y.instagram}
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://www.facebook.com/OnusExpress" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#00C9CE] transition-colors transform hover:scale-110"
              aria-label={TEXTS.footer.a11y.facebook}
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a 
              href="https://www.tiktok.com/@onusexpress?is_from_webapp=1&sender_device=pc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#00C9CE] transition-colors transform hover:scale-110"
              aria-label={TEXTS.footer.a11y.tiktok}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/onusexpress/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#00C9CE] transition-colors transform hover:scale-110"
              aria-label={TEXTS.footer.a11y.linkedin}
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {TEXTS.brand.name}. {TEXTS.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}