import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import logo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';
import { TEXTS } from '@/content/texts';

export function Header({ onOpenMensajeroForm }: { 
  onOpenMensajeroForm?: () => void;
}) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    // Para mensajeros, marcar activo si estamos en /mensajeros o /mensajeros/*
    if (path === '/mensajeros') {
      return location.pathname === '/mensajeros' || location.pathname.startsWith('/mensajeros/');
    }
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  };

  const handleTrabajarConONUS = () => {
    if (onOpenMensajeroForm) {
      onOpenMensajeroForm();
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-3">
          <img src={logo} alt={TEXTS.header.a11y.logoAlt} className="h-10" />
        </Link>
        
        {/* Desktop Navigation - Centered */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
          <Link 
            to="/" 
            onClick={handleLinkClick}
            className={`transition-colors ${isActive('/') ? 'text-[#00C9CE]' : 'text-[#000935] hover:text-[#00C9CE]'}`}
          >
            {TEXTS.nav.home}
          </Link>
          <Link 
            to="/servicios" 
            onClick={handleLinkClick}
            className={`transition-colors ${isActive('/servicios') ? 'text-[#00C9CE]' : 'text-[#000935] hover:text-[#00C9CE]'}`}
          >
            {TEXTS.nav.services}
          </Link>
          <Link 
            to="/clientes" 
            onClick={handleLinkClick}
            className={`transition-colors ${isActive('/clientes') ? 'text-[#00C9CE]' : 'text-[#000935] hover:text-[#00C9CE]'}`}
          >
            {TEXTS.nav.clients}
          </Link>
          <Link 
            to="/mensajeros" 
            onClick={handleLinkClick}
            className={`transition-colors ${isActive('/mensajeros') ? 'text-[#00C9CE]' : 'text-[#000935] hover:text-[#00C9CE]'}`}
          >
            {TEXTS.nav.couriers}
          </Link>
          <Link 
            to="/contacto" 
            onClick={handleLinkClick}
            className={`transition-colors ${isActive('/contacto') ? 'text-[#00C9CE]' : 'text-[#000935] hover:text-[#00C9CE]'}`}
          >
            {TEXTS.nav.contact}
          </Link>
          <Link 
            to="/faq" 
            onClick={handleLinkClick}
            className={`transition-colors ${isActive('/faq') ? 'text-[#00C9CE]' : 'text-[#000935] hover:text-[#00C9CE]'}`}
          >
            {TEXTS.nav.faq}
          </Link>
        </nav>

        {/* CTA Button - Right */}
        <div className="hidden lg:block">
          <button
            onClick={handleTrabajarConONUS}
            className="px-4 py-2 rounded-lg border-2 transition-all hover:bg-gray-50"
            style={{ borderColor: '#00C9CE', color: '#000935' }}
          >
            {TEXTS.cta.joinOnus}
          </button>
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden p-2" 
          style={{ color: '#000935' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={TEXTS.header.a11y.toggleMenu}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-4">
            <Link 
              to="/" 
              onClick={handleLinkClick}
              className={`py-2 transition-colors ${isActive('/') ? 'text-[#00C9CE]' : 'text-[#000935]'}`}
            >
              {TEXTS.nav.home}
            </Link>
            <Link 
              to="/servicios" 
              onClick={handleLinkClick}
              className={`py-2 transition-colors ${isActive('/servicios') ? 'text-[#00C9CE]' : 'text-[#000935]'}`}
            >
              {TEXTS.nav.services}
            </Link>
            <Link 
              to="/clientes" 
              onClick={handleLinkClick}
              className={`py-2 transition-colors ${isActive('/clientes') ? 'text-[#00C9CE]' : 'text-[#000935]'}`}
            >
              {TEXTS.nav.clients}
            </Link>
            <Link 
              to="/mensajeros" 
              onClick={handleLinkClick}
              className={`py-2 transition-colors ${isActive('/mensajeros') ? 'text-[#00C9CE]' : 'text-[#000935]'}`}
            >
              {TEXTS.nav.couriers}
            </Link>
            <Link 
              to="/contacto" 
              onClick={handleLinkClick}
              className={`py-2 transition-colors ${isActive('/contacto') ? 'text-[#00C9CE]' : 'text-[#000935]'}`}
            >
              {TEXTS.nav.contact}
            </Link>
            <Link 
              to="/faq" 
              onClick={handleLinkClick}
              className={`py-2 transition-colors ${isActive('/faq') ? 'text-[#00C9CE]' : 'text-[#000935]'}`}
            >
              {TEXTS.nav.faq}
            </Link>
            
            {/* Mobile CTAs */}
            <button
              onClick={handleTrabajarConONUS}
              className="py-3 px-6 rounded-lg border-2 text-center transition-all"
              style={{ borderColor: '#00C9CE', color: '#000935' }}
            >
              {TEXTS.cta.joinOnus}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}