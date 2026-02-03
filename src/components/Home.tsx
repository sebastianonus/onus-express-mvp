import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Warehouse, Truck, MapPin, Shield, Zap, DollarSign, Laptop, Headphones, MessageCircle } from 'lucide-react';
import mapaEspana from 'figma:asset/262733c1d6f0f6cca8186bfda30fcefe3da8b6ea.png';
import { TEXTS } from '@/content/texts';
import { ClientLogos } from './ClientLogos';

export function Home() {
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [showEmpresaMenu, setShowEmpresaMenu] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('youtube-background', {
        videoId: 'rFKUQwrf__4',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: 'rFKUQwrf__4',
          enablejsapi: 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };

    // If YT API is already loaded, reinitialize the player
    if ((window as any).YT && (window as any).YT.Player) {
      playerRef.current = new (window as any).YT.Player('youtube-background', {
        videoId: 'rFKUQwrf__4',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: 'rFKUQwrf__4',
          enablejsapi: 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Destroy player when leaving page
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const onPlayerReady = (event: any) => {
    event.target.playVideo();
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Monitor video time and loop at 20 seconds
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        if (currentTime >= 20) {
          playerRef.current.seekTo(0);
        }
      }
    }, 100);
  };

  const onPlayerStateChange = (event: any) => {
    // If video ends, restart it
    if (event.data === (window as any).YT.PlayerState.ENDED) {
      event.target.playVideo();
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="px-6 relative overflow-hidden flex items-center" style={{ backgroundColor: '#000935', minHeight: '600px', height: 'calc(100vh - 80px)' }}>
        {/* Video Background */}
        <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full overflow-hidden">
          <div
            id="youtube-background"
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
            style={{ pointerEvents: 'none', opacity: videoOpacity }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10 z-[1]" style={{ backgroundColor: '#00C9CE' }} />
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full opacity-5 z-[1]" style={{ backgroundColor: '#00C9CE' }} />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto max-w-4xl text-center" style={{ marginTop: '5vh' }}>
          <h1 className="onus-hero-title text-xl md:text-2xl lg:text-3xl mb-12 text-white mx-auto" style={{ letterSpacing: '-0.02em' }}>
            {TEXTS.home.heroTitle}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/servicios#mensajeros">
              <button 
                className="w-[180px] px-8 py-3 rounded-lg transition-all hover:scale-105"
                style={{ backgroundColor: '#00C9CE', color: '#000935' }}
              >
                {TEXTS.home.ctaMensajero}
              </button>
            </Link>
            
            {/* Dropdown Soy Empresa */}
            <div 
              className="relative"
              onMouseEnter={() => setShowEmpresaMenu(true)}
              onMouseLeave={() => setShowEmpresaMenu(false)}
            >
              <button 
                className="w-[180px] px-8 py-3 rounded-lg border-2 transition-all hover:scale-105"
                style={{ borderColor: '#00C9CE', color: '#00C9CE', backgroundColor: 'transparent' }}
              >
                {TEXTS.home.ctaEmpresa}
              </button>
              
              {showEmpresaMenu && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="bg-white rounded-lg shadow-xl py-2 min-w-[280px]">
                    <Link 
                      to="/servicios#empresas" 
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-5 h-5 mt-0.5" style={{ color: '#00C9CE' }} />
                      <div>
                        <div className="font-semibold" style={{ color: '#000935' }}>{TEXTS.home.dropdownEmpresasTitle}</div>
                        <div className="text-sm text-gray-600">{TEXTS.home.dropdownEmpresasSubtitle}</div>
                      </div>
                    </Link>
                    <Link 
                      to="/servicios#logistica" 
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Warehouse className="w-5 h-5 mt-0.5" style={{ color: '#00C9CE' }} />
                      <div>
                        <div className="font-semibold" style={{ color: '#000935' }}>{TEXTS.home.dropdownLogisticaTitle}</div>
                        <div className="text-sm text-gray-600">{TEXTS.home.dropdownLogisticaSubtitle}</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ¿Quiénes somos? */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="onus-title text-3xl md:text-4xl mb-8" style={{ color: '#000935' }}>
            {TEXTS.home.aboutTitle}
          </h2>
          <div className="space-y-6 text-gray-700 text-lg">
            <p>
              {TEXTS.home.aboutParagraph1}
            </p>
            <p>
              {TEXTS.home.aboutParagraph2}
            </p>
          </div>
        </div>
      </section>

      {/* Nuestros Servicios */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container mx-auto max-w-6xl">
          <h2 className="onus-title text-3xl md:text-4xl text-center mb-12" style={{ color: '#000935' }}>
            {TEXTS.home.servicesTitle}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Rutas para Mensajeros Autónomos */}
            <div className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#00C9CE20' }}>
                <Truck className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-4" style={{ color: '#000935' }}>
                {TEXTS.home.serviceCard1Title}
              </h3>
              <p className="text-gray-600 mb-6">
                {TEXTS.home.serviceCard1Description}
              </p>
              <Link to="/servicios#mensajeros" className="inline-flex items-center gap-2 text-[#00C9CE] hover:gap-4 transition-all">
                {TEXTS.common.viewMore}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Flota Operativa para Empresas */}
            <div className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#00C9CE20' }}>
                <Package className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-4" style={{ color: '#000935' }}>
                {TEXTS.home.serviceCard2Title}
              </h3>
              <p className="text-gray-600 mb-6">
                {TEXTS.home.serviceCard2Description}
              </p>
              <Link to="/servicios#empresas" className="inline-flex items-center gap-2 text-[#00C9CE] hover:gap-4 transition-all">
                {TEXTS.common.viewMore}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Apoyo Operativo para Centros Logísticos */}
            <div className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#00C9CE20' }}>
                <Warehouse className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-4" style={{ color: '#000935' }}>
                {TEXTS.home.serviceCard3Title}
              </h3>
              <p className="text-gray-600 mb-6">
                {TEXTS.home.serviceCard3Description}
              </p>
              <Link to="/servicios#logistica" className="inline-flex items-center gap-2 text-[#00C9CE] hover:gap-4 transition-all">
                {TEXTS.common.viewMore}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Clientes */}
      <ClientLogos />

      {/* Cobertura en todo el país - REDISEÑADA */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ backgroundColor: '#000935' }}>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Contenido de texto - Columna Izquierda */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl mb-6" style={{ color: '#FFFFFF', fontFamily: 'REM, sans-serif', fontWeight: 500 }}>
                  {TEXTS.home.coverageTitle}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {TEXTS.home.coverageDescription}
                </p>
              </div>

              {/* Tarjeta CTA */}
              <div className="bg-white rounded-2xl p-8 max-w-md">
                <h3 className="text-2xl mb-3" style={{ color: '#00C9CE', fontFamily: 'REM, sans-serif', fontWeight: 500 }}>
                  {TEXTS.home.coverageCtaTitle}
                </h3>
                <p className="text-gray-600 mb-6">
                  {TEXTS.home.coverageCtaDescription}
                </p>
                <a
                  href="https://wa.me/34676728527"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-lg transition-all hover:scale-105"
                  style={{ backgroundColor: '#00C9CE', color: '#000935' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  {TEXTS.home.coverageCtaButton}
                </a>
              </div>
            </div>

            {/* Mapa de España - Columna Derecha */}
            <div className="relative h-full min-h-[400px] md:min-h-[600px] overflow-hidden rounded-2xl flex items-center justify-center">
              <img 
                src={mapaEspana} 
                alt={TEXTS.home.coverageMapAlt}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ¿Por qué elegir ONUS? */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="onus-title text-3xl md:text-4xl text-center mb-12" style={{ color: '#000935' }}>
            {TEXTS.home.whyChooseTitle}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#00C9CE20' }}>
                <MapPin className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-2" style={{ color: '#000935' }}>
                {TEXTS.home.whyFeature1Title}
              </h3>
              <p className="text-gray-600">
                {TEXTS.home.whyFeature1Description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#00C9CE20' }}>
                <Shield className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-2" style={{ color: '#000935' }}>
                {TEXTS.home.whyFeature2Title}
              </h3>
              <p className="text-gray-600">
                {TEXTS.home.whyFeature2Description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#00C9CE20' }}>
                <Zap className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-2" style={{ color: '#000935' }}>
                {TEXTS.home.whyFeature3Title}
              </h3>
              <p className="text-gray-600">
                {TEXTS.home.whyFeature3Description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#00C9CE20' }}>
                <DollarSign className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-2" style={{ color: '#000935' }}>
                {TEXTS.home.whyFeature4Title}
              </h3>
              <p className="text-gray-600">
                {TEXTS.home.whyFeature4Description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#00C9CE20' }}>
                <Laptop className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-2" style={{ color: '#000935' }}>
                {TEXTS.home.whyFeature5Title}
              </h3>
              <p className="text-gray-600">
                {TEXTS.home.whyFeature5Description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#00C9CE20' }}>
                <Headphones className="w-8 h-8" style={{ color: '#00C9CE' }} />
              </div>
              <h3 className="onus-subtitle text-xl mb-2" style={{ color: '#000935' }}>
                {TEXTS.home.whyFeature6Title}
              </h3>
              <p className="text-gray-600">
                {TEXTS.home.whyFeature6Description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}