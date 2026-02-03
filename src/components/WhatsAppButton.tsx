import { MessageCircle } from 'lucide-react';
import { TEXTS } from '@/content/texts';

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/34676728527?text=Hola,%20necesito%20información%20sobre%20sus%20servicios"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform group"
      style={{ backgroundColor: '#25D366' }}
      title={TEXTS.common.a11y.whatsappContact}
      aria-label={TEXTS.common.a11y.whatsappContact}
    >
      <MessageCircle className="w-8 h-8 text-white" />
      
      {/* Ping animation - 80% menos frecuente */}
      <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-whatsapp-ping" style={{ backgroundColor: '#25D366' }}></span>
    </a>
  );
}