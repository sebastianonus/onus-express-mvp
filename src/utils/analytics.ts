// Google Analytics
export const initGoogleAnalytics = () => {
  const GA_MEASUREMENT_ID = import.meta?.env?.VITE_GA_MEASUREMENT_ID;
  
  if (!GA_MEASUREMENT_ID) {
    return;
  }

  // Cargar script de Google Analytics
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Inicializar gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      'anonymize_ip': true,
      'cookie_flags': 'SameSite=None;Secure'
    });
  `;
  document.head.appendChild(script2);
};

// Meta Pixel (Facebook Pixel)
export const initMetaPixel = () => {
  const META_PIXEL_ID = import.meta?.env?.VITE_META_PIXEL_ID;
  
  if (!META_PIXEL_ID) {
    return;
  }

  // Cargar Meta Pixel
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${META_PIXEL_ID}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  // Noscript fallback
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" />`;
  document.body.appendChild(noscript);
};

// Gestión de consentimiento de cookies
export const getCookieConsent = (): {
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
} | null => {
  const consent = localStorage.getItem('cookie-consent');
  return consent ? JSON.parse(consent) : null;
};

export const saveCookieConsent = (analytics: boolean, marketing: boolean) => {
  const consent = {
    analytics,
    marketing,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('cookie-consent', JSON.stringify(consent));
};

export const hasUserRespondedToCookies = (): boolean => {
  return localStorage.getItem('cookie-consent') !== null;
};

// Inicializar tracking basado en consentimiento
export const initTracking = () => {
  const consent = getCookieConsent();
  
  if (!consent) return;

  if (consent.analytics) {
    initGoogleAnalytics();
  }

  if (consent.marketing) {
    initMetaPixel();
  }
};