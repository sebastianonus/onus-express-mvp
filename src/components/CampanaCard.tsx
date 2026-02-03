import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, Calendar, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import onusLogo from 'figma:asset/e80d7ef4ac3b9441721d6916cfc8ad34baf40db1.png';
import { TEXTS } from '@/content/texts';

interface CampanaCardProps {
  campana: {
    id: string;
    nombre: string;
    descripcion: string;
    ciudad: string;
    pago: string;
    fechaInicio: string;
    logoUrl?: string;
    vehiculos?: string[];
    requisitos?: string[];
  };
  onVer: () => void;
  onMeInteresa: () => void;
  isPostulado?: boolean;
}

export function CampanaCard({ campana, onVer, onMeInteresa, isPostulado = false }: CampanaCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Requisitos visibles (primeros 3)
  const requisitosVisibles = campana.requisitos?.slice(0, 3) || [];
  const requisitosRestantes = campana.requisitos?.slice(3) || [];
  const tieneRequisitosAdicionales = requisitosRestantes.length > 0;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all relative" style={{ fontFamily: 'REM, sans-serif' }}>
      {/* Logo */}
      <div className="flex justify-center mb-4 bg-gray-50 rounded-xl p-4">
        <img 
          src={campana.logoUrl || onusLogo} 
          alt={TEXTS.couriers.campaignCard.a11y.logoAlt}
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Título */}
      <h3 className="mb-3 text-base leading-tight" style={{ 
        color: '#000935',
        fontWeight: 500
      }}>
        {campana.nombre}
      </h3>

      {/* Badges de vehículos */}
      {campana.vehiculos && campana.vehiculos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {campana.vehiculos.map((vehiculo, idx) => (
            <Badge 
              key={idx}
              variant="outline"
              className="text-xs px-2 py-0.5"
              style={{ 
                backgroundColor: '#E8F4FF',
                borderColor: '#B3D9FF',
                color: '#000935'
              }}
            >
              {vehiculo}
            </Badge>
          ))}
        </div>
      )}

      {/* Fecha */}
      <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: '#00C9CE' }}>
        <Calendar className="w-4 h-4" />
        <span>{new Date(campana.fechaInicio).toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })}</span>
      </div>

      {/* Ubicación */}
      <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: '#00C9CE' }}>
        <MapPin className="w-4 h-4" />
        <span>{campana.ciudad}</span>
      </div>

      {/* Tarifa */}
      <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: '#00C9CE' }}>
        <DollarSign className="w-4 h-4" />
        <span>{campana.pago}</span>
      </div>

      {/* Requisitos */}
      {campana.requisitos && campana.requisitos.length > 0 && (
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: '#000935', fontWeight: 500 }}>
            {TEXTS.couriers.campaignCard.requirementsLabel}
          </p>
          <div className="flex flex-wrap gap-1.5 relative">
            {requisitosVisibles.map((req, idx) => (
              <Badge 
                key={idx}
                variant="outline"
                className="text-xs px-2 py-0.5 text-gray-700 border-gray-300"
              >
                {req}
              </Badge>
            ))}
            {tieneRequisitosAdicionales && (
              <div 
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Badge 
                  variant="outline"
                  className="text-xs px-2 py-0.5 cursor-help"
                  style={{ 
                    backgroundColor: '#E0F7F8',
                    borderColor: '#00C9CE',
                    color: '#00C9CE'
                  }}
                >
                  {TEXTS.couriers.campaignCard.templates.morePrefix}
                  {requisitosRestantes.length}{" "}
                  {TEXTS.couriers.campaignCard.templates.moreSuffix}
                </Badge>
                
                {/* Tooltip - aparece ARRIBA del badge */}
                {showTooltip && (
                  <div 
                    className="absolute z-50 bg-white border-2 rounded-lg p-3 shadow-xl min-w-[250px] left-0 bottom-full mb-2"
                    style={{ borderColor: '#00C9CE' }}
                  >
                    <p className="text-xs mb-2" style={{ color: '#000935', fontWeight: 500 }}>
                      {TEXTS.couriers.campaignCard.additionalRequirementsLabel}
                    </p>
                    <div className="space-y-1">
                      {requisitosRestantes.map((req, idx) => (
                        <p key={idx} className="text-xs text-gray-700">
                          • {req}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Descripción */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {campana.descripcion}
      </p>

      {/* Botones */}
      <div className="flex gap-2">
        <Button
          onClick={onVer}
          variant="outline"
          className="flex-1 border-[#00C9CE] text-[#00C9CE] hover:bg-[#00C9CE]/10 text-sm"
        >
          <Eye className="w-4 h-4 mr-1" />
          {TEXTS.couriers.campaignCard.buttonView}
        </Button>
        <Button
          onClick={onMeInteresa}
          disabled={isPostulado}
          className="flex-1 text-sm transition-opacity"
          style={{ 
            backgroundColor: isPostulado ? '#94A3B8' : '#00C9CE', 
            color: '#000935',
            opacity: isPostulado ? 0.7 : 1,
            cursor: isPostulado ? 'not-allowed' : 'pointer'
          }}
        >
          {isPostulado ? (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              {TEXTS.couriers.campaignCard.buttonApplied}
            </div>
          ) : (
            TEXTS.couriers.campaignCard.buttonInterested
          )}
        </Button>
      </div>
    </div>
  );
}