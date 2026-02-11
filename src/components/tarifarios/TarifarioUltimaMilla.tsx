import { useState, useRef, useMemo, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Truck, Clock, Download, X, RotateCcw, ChevronDown, Zap, Package, MapPin, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { TEXTS } from '@/content/texts';
import { enviarPresupuestoPorEmail } from '@/utils/emailPresupuesto';

export interface TarifarioUltimaMillaHandle {
  resetear: () => void;
}

interface TarifarioUltimaMillaProps {
  isAdmin?: boolean;
  nombreCliente?: string;
}

export const TarifarioUltimaMilla = forwardRef<TarifarioUltimaMillaHandle, TarifarioUltimaMillaProps>(({ isAdmin = false, nombreCliente }, ref) => {
  // Estados iniciales para resetear
  const getInitialState = (clientName = '') => ({
    nombreCliente: clientName,
    logoCliente: null as string | null,
    vehiculosSeleccionados: [] as Array<{
      tipo: string;
      jornada: string;
      precio: number;
      cantidad: number;
    }>,
    tramosSeleccionados: [] as Array<{
      nombre: string;
      valor: number;
    }>,
    extrasSeleccionados: [] as Array<{
      concepto: string;
      precio: number;
      cantidad: number;
    }>,
    otrosAjustes: { concepto: '', valor: '' }
  });

  // Estados
  const [state, setState] = useState(() => getInitialState(nombreCliente || ''));
  const [generandoPDF, setGenerandoPDF] = useState(false);
  
  // Estados para desplegables
  const [vehiculosAbierto, setVehiculosAbierto] = useState(true);
  const [jornadaCompletaAbierto, setJornadaCompletaAbierto] = useState(false);
  const [refuerzosAbierto, setRefuerzosAbierto] = useState(false);
  const [tramosAbierto, setTramosAbierto] = useState(false);
  const [extrasAbierto, setExtrasAbierto] = useState(false);
  const [especialesAbierto, setEspecialesAbierto] = useState(false);
  const [condicionesAbierto, setCondicionesAbierto] = useState(false);
  
  const pageRef = useRef<HTMLDivElement>(null);

  // Función de reseteo
  const handleActualizar = () => {
    setState(getInitialState(nombreCliente || ''));
  };

  useEffect(() => {
    if (!nombreCliente) return;
    setState((prev) =>
      prev.nombreCliente.trim() === '' ? { ...prev, nombreCliente } : prev
    );
  }, [nombreCliente]);

  // Exponer la función al componente padre
  useImperativeHandle(ref, () => ({
    resetear: handleActualizar
  }));

  // Datos de vehículos - Optimizado con useMemo
  const vehiculos = useMemo(() => [
    { tipo: "Tipo A (3 m³ – 1 pallet)", mediaJornada: "90", jornadaCompleta: "160", refuerzo: "80" },
    { tipo: "Tipo B (6 m³ – 2 pallets)", mediaJornada: "95", jornadaCompleta: "170", refuerzo: "90" },
    { tipo: "Tipo C (12 m³)", mediaJornada: "100", jornadaCompleta: "180", refuerzo: "100" },
    { tipo: "Tipo D (Carrozado)", mediaJornada: "120", jornadaCompleta: "220", refuerzo: "110" },
    { tipo: "Tipo E (Moto)", mediaJornada: "65", jornadaCompleta: "110", refuerzo: "50" },
    { tipo: "Tipo F (Bici)", mediaJornada: "55", jornadaCompleta: "90", refuerzo: "40" }
  ], []);

  const tramosKm = useMemo(() => [
    { nombre: "Tramo 1 (00–100 km)", valor: 0 },
    { nombre: "Tramo 2 (100–200 km)", valor: 10 },
    { nombre: "Tramo 3 (+200 km)", valor: 15 },
    { nombre: "Tramo 4 (+300 km)", valor: 20 }
  ], []);

  const extras = useMemo(() => [
    { concepto: "Hora extra", precio: "20 €/h" },
    { concepto: "Hora nocturna", precio: "5 €/h" },
    { concepto: "Mozo de almacén", precio: "140 €" },
    { concepto: "Jefe de tráfico", precio: "165 €" }
  ], []);

  const especiales = useMemo(() => [
    { concepto: "Festivos y domingos", detalle: "Suplemento adicional según zona" },
    { concepto: "Servicios urgentes", detalle: "Suplemento por activación inmediata" },
    { concepto: "Esperas prolongadas", detalle: "Aplicable según tiempo adicional" },
    { concepto: "Segunda persona", detalle: "Coste según mozo/ayudante" },
    { concepto: "Cambios de ruta", detalle: "Suplemento según impacto operativo" }
  ], []);

  const calcularTotal = () => {
    let subtotal = state.vehiculosSeleccionados.reduce((sum, v) => sum + (v.precio * v.cantidad), 0);
    const tramosTotal = state.tramosSeleccionados.reduce((sum, t) => sum + t.valor, 0);
    subtotal += tramosTotal;
    let extrasTotal = 0;
    state.extrasSeleccionados.forEach(e => extrasTotal += e.precio * e.cantidad);
    const total = subtotal + extrasTotal + parseFloat(state.otrosAjustes.valor || '0');
    return total.toFixed(2);
  };

  const handleSeleccionarTarifa = (tipo: string, jornada: string, precio: string) => {
    const yaSeleccionado = state.vehiculosSeleccionados.find(v => v.tipo === tipo && v.jornada === jornada);
    
    if (yaSeleccionado) {
      setState(prev => ({
        ...prev,
        vehiculosSeleccionados: prev.vehiculosSeleccionados.filter(v => !(v.tipo === tipo && v.jornada === jornada))
      }));
    } else {
      setState(prev => ({
        ...prev,
        vehiculosSeleccionados: [...prev.vehiculosSeleccionados, {
          tipo,
          jornada,
          precio: parseFloat(precio),
          cantidad: 1
        }]
      }));
    }
  };

  const esVehiculoSeleccionado = (tipo: string, jornada: string) => {
    return state.vehiculosSeleccionados.some(v => v.tipo === tipo && v.jornada === jornada);
  };

  const handleSeleccionarTramo = (nombre: string, valor: number) => {
    const yaSeleccionado = state.tramosSeleccionados.find(t => t.nombre === nombre);
    
    if (yaSeleccionado) {
      setState(prev => ({
        ...prev,
        tramosSeleccionados: prev.tramosSeleccionados.filter(t => t.nombre !== nombre)
      }));
    } else {
      setState(prev => ({
        ...prev,
        tramosSeleccionados: [...prev.tramosSeleccionados, { nombre, valor }]
      }));
    }
  };

  const esTramoSeleccionado = (nombre: string) => {
    return state.tramosSeleccionados.some(t => t.nombre === nombre);
  };

  const actualizarCantidadVehiculo = (tipo: string, jornada: string, cantidad: number) => {
    setState(prev => ({
      ...prev,
      vehiculosSeleccionados: prev.vehiculosSeleccionados.map(v => 
        v.tipo === tipo && v.jornada === jornada ? { ...v, cantidad } : v
      )
    }));
  };

  const actualizarPrecioVehiculo = (tipo: string, jornada: string, precio: number) => {
    setState(prev => ({
      ...prev,
      vehiculosSeleccionados: prev.vehiculosSeleccionados.map(v => 
        v.tipo === tipo && v.jornada === jornada ? { ...v, precio } : v
      )
    }));
  };

  const actualizarTipoVehiculo = (tipoAntiguo: string, jornadaAntigua: string, tipoNuevo: string) => {
    setState(prev => ({
      ...prev,
      vehiculosSeleccionados: prev.vehiculosSeleccionados.map(v => 
        v.tipo === tipoAntiguo && v.jornada === jornadaAntigua ? { ...v, tipo: tipoNuevo } : v
      )
    }));
  };

  const actualizarJornadaVehiculo = (tipo: string, jornadaAntigua: string, jornadaNueva: string) => {
    setState(prev => ({
      ...prev,
      vehiculosSeleccionados: prev.vehiculosSeleccionados.map(v => 
        v.tipo === tipo && v.jornada === jornadaAntigua ? { ...v, jornada: jornadaNueva } : v
      )
    }));
  };

  const eliminarVehiculo = (tipo: string, jornada: string) => {
    setState(prev => ({
      ...prev,
      vehiculosSeleccionados: prev.vehiculosSeleccionados.filter(v => !(v.tipo === tipo && v.jornada === jornada))
    }));
  };

  const eliminarTramo = (nombre: string) => {
    setState(prev => ({
      ...prev,
      tramosSeleccionados: prev.tramosSeleccionados.filter(t => t.nombre !== nombre)
    }));
  };

  const agregarExtra = (concepto: string, precio: number) => {
    const yaSeleccionado = state.extrasSeleccionados.find(e => e.concepto === concepto);
    
    if (yaSeleccionado) {
      setState(prev => ({
        ...prev,
        extrasSeleccionados: prev.extrasSeleccionados.map(e => 
          e.concepto === concepto ? { ...e, cantidad: e.cantidad + 1 } : e
        )
      }));
    } else {
      setState(prev => ({
        ...prev,
        extrasSeleccionados: [...prev.extrasSeleccionados, {
          concepto,
          precio,
          cantidad: 1
        }]
      }));
    }
  };

  const eliminarExtra = (concepto: string) => {
    setState(prev => ({
      ...prev,
      extrasSeleccionados: prev.extrasSeleccionados.filter(e => e.concepto !== concepto)
    }));
  };

  const generarPDF = async () => {
    if (!pageRef.current) return;
    
    setGenerandoPDF(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const elemento = pageRef.current;
      const canvas = await html2canvas(elemento, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: async (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            const computedStyle = clonedDoc.defaultView?.getComputedStyle(el);
            if (!computedStyle) return;
            
            const hasUnsupportedColor = (color: string) => {
              return color && (color.includes('oklch') || color.includes('oklab') || color.includes('lch') || color.includes('lab'));
            };
            
            if (hasUnsupportedColor(computedStyle.color)) el.style.color = 'rgb(0, 0, 0)';
            if (hasUnsupportedColor(computedStyle.backgroundColor)) el.style.backgroundColor = 'transparent';
            if (hasUnsupportedColor(computedStyle.borderColor)) el.style.borderColor = 'rgb(0, 0, 0)';
          });
          
          const logoClienteElement = clonedDoc.querySelector('img[alt="Logo del cliente"]');
          if (logoClienteElement && state.logoCliente) {
            try {
              const tempCanvas = clonedDoc.createElement('canvas');
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                  tempCanvas.width = img.width;
                  tempCanvas.height = img.height;
                  const ctx = tempCanvas.getContext('2d');
                  if (!ctx) {
                    reject(new Error('No context'));
                    return;
                  }
                  
                  ctx.drawImage(img, 0, 0);
                  const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                  const data = imageData.data;
                  
                  for (let i = 0; i < data.length; i += 4) {
                    const alpha = data[i + 3];
                    if (alpha > 0) {
                      data[i] = 255;
                      data[i + 1] = 255;
                      data[i + 2] = 255;
                    }
                  }
                  
                  ctx.putImageData(imageData, 0, 0);
                  (logoClienteElement as HTMLImageElement).src = tempCanvas.toDataURL('image/png');
                  resolve();
                };
                img.onerror = reject;
                img.src = state.logoCliente;
              });
            } catch (error) {
              console.error('Error al procesar el logo:', error);
              (logoClienteElement as HTMLElement).style.filter = 'brightness(0) invert(1)';
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const marginX = 30;
      const marginTop = 30;
      
      let imgWidth = pdfWidth - marginX * 2;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const maxHeight = pdfHeight - marginTop - 30;
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const posX = (pdfWidth - imgWidth) / 2;
      const posY = marginTop;

      pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight);

      const slug = state.nombreCliente
        ? '-' + state.nombreCliente.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '')
        : '';
      const fileName = `tarifario-ultima-milla-2026${slug}.pdf`;

      pdf.save(fileName);

      const itemsEmail = [
        ...state.vehiculosSeleccionados.map((v) => ({
          nombre: `${v.tipo} - ${v.jornada}`,
          cantidad: v.cantidad,
          precio: v.precio,
        })),
        ...state.tramosSeleccionados.map((t) => ({
          nombre: t.nombre,
          cantidad: 1,
          precio: t.valor,
        })),
        ...state.extrasSeleccionados.map((e) => ({
          nombre: e.concepto,
          cantidad: e.cantidad,
          precio: e.precio,
        })),
      ];

      if (state.otrosAjustes.concepto || state.otrosAjustes.valor) {
        itemsEmail.push({
          nombre: state.otrosAjustes.concepto || TEXTS.tarifarios.common.otherAdjustments.title,
          cantidad: 1,
          precio: state.otrosAjustes.valor || 0,
        });
      }

      const emailResult = await enviarPresupuestoPorEmail({
        tarifario: 'Última Milla',
        total: calcularTotal(),
        items: itemsEmail,
      });

      if (!emailResult.success) {
        console.error('Error enviando presupuesto por email:', emailResult.message);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert(TEXTS.tarifarios.common.alerts.pdfError);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleLogoClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, logoCliente: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarLogoCliente = () => {
    setState(prev => ({ ...prev, logoCliente: null }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido que se capturará en el PDF */}
      <div ref={pageRef} className="max-w-[1200px] mx-auto bg-white shadow-lg">
        {/* HEADER */}
        <div className={`bg-[#000935] text-white py-4 px-6 ${generandoPDF ? 'rounded-t-lg' : ''}`}>
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center">
              <h1 className="tracking-wide mb-1">
                {generandoPDF ? TEXTS.tarifarios.ultimaMilla.title.pdf : TEXTS.tarifarios.ultimaMilla.title.normal}
              </h1>
              <p className="text-[#00C9CE] text-xs">{TEXTS.tarifarios.ultimaMilla.subtitle}</p>
            </div>
          </div>
        </div>

        {generandoPDF ? (
          /* VISTA DE PRESUPUESTO PARA PDF */
          <div className="max-w-[1200px] mx-auto p-8 space-y-6">
            
            {state.nombreCliente && (
              <div className="border-3 border-[#00C9CE] rounded-lg p-6 bg-white flex items-center justify-between">
                <div className="text-[#00C9CE] text-sm">{TEXTS.tarifarios.common.labels.cliente}</div>
                <div className="text-lg text-[#000935]">{state.nombreCliente}</div>
              </div>
            )}

            <div className="border-2 border-[#000935] rounded-lg overflow-hidden">
              <div className="bg-[#000935] text-white px-6 py-3">
                <h3 className="text-base">{TEXTS.tarifarios.common.breakdown.title}</h3>
              </div>
              <div className="p-6 bg-white space-y-6">
                
                {state.vehiculosSeleccionados.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="h-4 w-4 text-[#00C9CE]" />
                      <h4 className="text-[#00C9CE] text-sm">{TEXTS.tarifarios.ultimaMilla.breakdown.vehiculosYJornadas}</h4>
                    </div>
                    <div>
                      <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                        <div className="col-span-6">Concepto</div>
                        <div className="col-span-2 text-center">Cantidad</div>
                        <div className="col-span-2 text-right">Precio Unit.</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                      </div>
                      {state.vehiculosSeleccionados.map((v, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                          <div className="col-span-6">
                            <div className="text-[#000935]">{v.tipo}</div>
                            <div className="text-xs text-gray-500">{v.jornada}</div>
                          </div>
                          <div className="col-span-2 text-center">{v.cantidad}</div>
                          <div className="col-span-2 text-right">{v.precio.toFixed(2)} €</div>
                          <div className="col-span-2 text-right text-[#00C9CE] font-medium">
                            {(v.precio * v.cantidad).toFixed(2)} €
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {state.tramosSeleccionados.length > 0 && (
                  <div>
                    <h4 className="text-[#000935] text-sm mb-3">{TEXTS.tarifarios.ultimaMilla.breakdown.kilometraje}</h4>
                    <div>
                      <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                        <div className="col-span-10">Tramo</div>
                        <div className="col-span-2 text-right">Suplemento</div>
                      </div>
                      {state.tramosSeleccionados.map((t, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                          <div className="col-span-10 text-[#000935]">{t.nombre}</div>
                          <div className="col-span-2 text-right text-[#00C9CE] font-medium">
                            {t.valor.toFixed(2)} €
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {state.extrasSeleccionados.length > 0 && (
                  <div>
                    <h4 className="text-[#000935] text-sm mb-3">{TEXTS.tarifarios.ultimaMilla.breakdown.extrasOperativos}</h4>
                    <div>
                      <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                        <div className="col-span-6">Concepto</div>
                        <div className="col-span-2 text-center">Cantidad</div>
                        <div className="col-span-2 text-right">Precio Unit.</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                      </div>
                      {state.extrasSeleccionados.map((e, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                          <div className="col-span-6 text-[#000935]">{e.concepto}</div>
                          <div className="col-span-2 text-center">{e.cantidad}</div>
                          <div className="col-span-2 text-right">{e.precio.toFixed(2)} €</div>
                          <div className="col-span-2 text-right text-[#00C9CE] font-medium">
                            {(e.precio * e.cantidad).toFixed(2)} €
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {state.otrosAjustes.valor !== '' && (
                  <div>
                    <h4 className="text-[#000935] text-sm mb-3">{TEXTS.tarifarios.common.otherAdjustments.title}</h4>
                    <div>
                      <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                        <div className="col-span-10">Concepto</div>
                        <div className="col-span-2 text-right">Importe</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-3 text-sm">
                        <div className="col-span-10 text-[#000935]">
                          {state.otrosAjustes.concepto || 'Suplementos adicionales (festivos, urgencias, esperas, etc.)'}
                        </div>
                        <div className={`col-span-2 text-right font-medium ${parseFloat(state.otrosAjustes.valor || '0') < 0 ? 'text-red-600' : 'text-[#00C9CE]'}`}>
                          {parseFloat(state.otrosAjustes.valor || '0').toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="border-3 border-[#00C9CE] rounded-lg p-6 bg-white">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[#000935] text-sm">{TEXTS.tarifarios.common.total.title}</div>
                  <div className="text-xs text-gray-500">{TEXTS.tarifarios.common.total.vatNote}</div>
                </div>
                <div className="text-[#00C9CE] text-4xl font-medium">{calcularTotal()} €</div>
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
                <h3 className="text-[#000935] text-base">{TEXTS.tarifarios.common.conditions.title}</h3>
              </div>
              <div className="p-6 bg-white">
                <div className="text-sm text-gray-700 space-y-1">
                  <p>* {TEXTS.tarifarios.ultimaMilla.conditions.pricesWithoutVAT}</p>
                  <p>* {TEXTS.tarifarios.ultimaMilla.conditions.fleetAvailability}</p>
                  <p>* {TEXTS.tarifarios.ultimaMilla.conditions.additionalKm}</p>
                  <p>* {TEXTS.tarifarios.ultimaMilla.conditions.insurance}</p>
                  <p>* {TEXTS.tarifarios.ultimaMilla.conditions.operationChanges}</p>
                  <p>* {TEXTS.tarifarios.ultimaMilla.conditions.monthlyBilling}</p>
                  <p>* {TEXTS.tarifarios.ultimaMilla.conditions.quoteValidity}</p>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-600 space-y-1 pt-4">
              <p>
                {TEXTS.tarifarios.common.legalFooter}
              </p>
            </div>

          </div>
        ) : (
          /* VISTA NORMAL DEL TARIFARIO */
          <div className="max-w-[1200px] mx-auto p-6">

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

              <div className="space-y-6">
                
                {/* Tarifas Media Jornada */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setVehiculosAbierto(!vehiculosAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {TEXTS.tarifarios.ultimaMilla.sections.mediaJornada}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${vehiculosAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {vehiculosAbierto && (
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo de Vehículo</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vehiculos.map((v, idx) => (
                            <TableRow 
                              key={idx}
                              onClick={() => handleSeleccionarTarifa(v.tipo, 'Media Jornada', v.mediaJornada)}
                              className={`cursor-pointer transition-colors hover:bg-[#00C9CE]/10 ${
                                esVehiculoSeleccionado(v.tipo, 'Media Jornada') ? 'bg-[#00C9CE]/20 border-l-4 border-l-[#00C9CE]' : ''
                              }`}
                            >
                              <TableCell>{v.tipo}</TableCell>
                              <TableCell className="text-right">{v.mediaJornada} €</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  )}
                </Card>

                {/* Tarifas Jornada Completa */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setJornadaCompletaAbierto(!jornadaCompletaAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {TEXTS.tarifarios.ultimaMilla.sections.jornadaCompleta}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${jornadaCompletaAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {jornadaCompletaAbierto && (
                    <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo de Vehículo</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehiculos.map((v, idx) => (
                          <TableRow 
                            key={idx}
                            onClick={() => handleSeleccionarTarifa(v.tipo, 'Jornada Completa', v.jornadaCompleta)}
                            className={`cursor-pointer transition-colors hover:bg-[#00C9CE]/10 ${
                              esVehiculoSeleccionado(v.tipo, 'Jornada Completa') ? 'bg-[#00C9CE]/20 border-l-4 border-l-[#00C9CE]' : ''
                            }`}
                          >
                            <TableCell>{v.tipo}</TableCell>
                            <TableCell className="text-right">{v.jornadaCompleta} €</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </CardContent>
                  )}
                </Card>

                {/* Tarifas Refuerzos */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setRefuerzosAbierto(!refuerzosAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {TEXTS.tarifarios.ultimaMilla.sections.refuerzos}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${refuerzosAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {refuerzosAbierto && (
                    <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo de Vehículo</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehiculos.map((v, idx) => (
                          <TableRow 
                            key={idx}
                            onClick={() => handleSeleccionarTarifa(v.tipo, 'Refuerzo', v.refuerzo)}
                            className={`cursor-pointer transition-colors hover:bg-[#00C9CE]/10 ${
                              esVehiculoSeleccionado(v.tipo, 'Refuerzo') ? 'bg-[#00C9CE]/20 border-l-4 border-l-[#00C9CE]' : ''
                            }`}
                          >
                            <TableCell>{v.tipo}</TableCell>
                            <TableCell className="text-right">{v.refuerzo} €</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </CardContent>
                  )}
                </Card>

                {/* Suplementos por KM */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setTramosAbierto(!tramosAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {TEXTS.tarifarios.ultimaMilla.sections.tramosKm}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${tramosAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {tramosAbierto && (
                    <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tramo</TableHead>
                          <TableHead className="text-right">Suplemento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tramosKm.map((t, idx) => (
                          <TableRow 
                            key={idx}
                            onClick={() => handleSeleccionarTramo(t.nombre, t.valor)}
                            className={`cursor-pointer transition-colors hover:bg-[#00C9CE]/10 ${
                              esTramoSeleccionado(t.nombre) ? 'bg-[#00C9CE]/20 border-l-4 border-l-[#00C9CE]' : ''
                            }`}
                          >
                            <TableCell>{t.nombre}</TableCell>
                            <TableCell className="text-right">{t.valor} €</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </CardContent>
                  )}
                </Card>

                {/* Extras Operativos */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setExtrasAbierto(!extrasAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {TEXTS.tarifarios.ultimaMilla.sections.extras}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${extrasAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {extrasAbierto && (
                    <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extras.map((e, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{e.concepto}</TableCell>
                            <TableCell className="text-right">{e.precio}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </CardContent>
                  )}
                </Card>

                {/* Suplementos Especiales */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setEspecialesAbierto(!especialesAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {TEXTS.tarifarios.ultimaMilla.sections.especiales}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${especialesAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {especialesAbierto && (
                    <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Detalle</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {especiales.map((s, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{s.concepto}</TableCell>
                            <TableCell className="text-right text-sm">{s.detalle}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </CardContent>
                  )}
                </Card>

                {/* Condiciones */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setCondicionesAbierto(!condicionesAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Condiciones del Servicio
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${condicionesAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {condicionesAbierto && (
                    <CardContent className="pt-6">
                    <div className="bg-blue-50 p-4 rounded border border-blue-200 text-sm">
                      <ul className="space-y-2 ml-5 list-disc">
                        <li>{TEXTS.tarifarios.ultimaMilla.conditions.pricesWithoutVAT}</li>
                        <li>{TEXTS.tarifarios.ultimaMilla.conditions.fleetAvailability}</li>
                        <li>{TEXTS.tarifarios.ultimaMilla.conditions.additionalKm}</li>
                        <li>{TEXTS.tarifarios.ultimaMilla.conditions.insurance}</li>
                        <li>{TEXTS.tarifarios.ultimaMilla.conditions.operationChanges}</li>
                        <li>{TEXTS.tarifarios.ultimaMilla.conditions.monthlyBilling}</li>
                      </ul>
                    </div>
                    </CardContent>
                  )}
                </Card>

              </div>

              {/* COLUMNA DERECHA - SIMULADOR */}
              <Card className="border-2 border-[#00C9CE] shadow-lg overflow-hidden rounded-lg">
                <CardHeader className="bg-[#00C9CE] text-white">
                  <CardTitle className="text-white text-center uppercase">{TEXTS.tarifarios.common.budgetCardTitle}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  
                  {/* Nombre del cliente */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <Label htmlFor="nombreCliente">{TEXTS.tarifarios.common.labels.nombreCliente}</Label>
                    <Input
                      id="nombreCliente"
                      type="text"
                      placeholder={TEXTS.tarifarios.ultimaMilla.placeholders.nombreCliente}
                      value={state.nombreCliente}
                      onChange={(e) => setState(prev => ({ ...prev, nombreCliente: e.target.value }))}
                      className="border-[#00C9CE] focus-visible:ring-[#00C9CE]"
                    />
                  </div>

                  {/* Logo del cliente */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <Label htmlFor="logoCliente">{TEXTS.tarifarios.common.labels.logoClientePng}</Label>
                    {!state.logoCliente ? (
                      <div>
                        <Input
                          id="logoCliente"
                          type="file"
                          accept=".png"
                          onChange={handleLogoClienteChange}
                          className="border-[#00C9CE] focus-visible:ring-[#00C9CE]"
                        />
                        <p className="text-xs text-gray-600 mt-2">{TEXTS.tarifarios.common.helpers.logoUpload}</p>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-[#00C9CE] rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img src={state.logoCliente} alt="Logo del cliente" className="h-12 w-auto max-w-[100px] object-contain" />
                            <span className="text-sm text-gray-600">Logo cargado</span>
                          </div>
                          <button
                            onClick={eliminarLogoCliente}
                            className="text-red-500 hover:text-red-700 p-1"
                            title={TEXTS.tarifarios.common.actions.deleteLogo}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vehículos seleccionados */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <Label className="flex items-center justify-between">
                      <span>{TEXTS.tarifarios.ultimaMilla.selected.vehiculos}</span>
                      <span className="text-xs text-gray-600">Haz clic en las tablas</span>
                    </Label>
                    
                    {state.vehiculosSeleccionados.length === 0 ? (
                      <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded text-center">
                        No hay vehículos seleccionados.<br />
                        Haz clic en las filas de las tablas para seleccionar.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {state.vehiculosSeleccionados.map((v, idx) => (
                          <div key={idx} className="bg-white border-2 border-[#00C9CE] rounded-lg p-3 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <Label htmlFor={`tipo-${idx}`} className="text-xs">Tipo de vehículo</Label>
                                  <Input
                                    id={`tipo-${idx}`}
                                    type="text"
                                    value={v.tipo}
                                    onChange={(e) => actualizarTipoVehiculo(v.tipo, v.jornada, e.target.value)}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                    placeholder="Ej: Tipo A (3 m³ – 1 pallet)"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`jornada-${idx}`} className="text-xs">Tipo de jornada</Label>
                                  <Input
                                    id={`jornada-${idx}`}
                                    type="text"
                                    value={v.jornada}
                                    onChange={(e) => actualizarJornadaVehiculo(v.tipo, v.jornada, e.target.value)}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                    placeholder="Ej: Media Jornada"
                                  />
                                </div>
                              </div>
                              
                              <button
                                onClick={() => eliminarVehiculo(v.tipo, v.jornada)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title={TEXTS.tarifarios.common.actions.delete}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor={`cant-${idx}`} className="text-xs">Cantidad</Label>
                                <Input
                                  id={`cant-${idx}`}
                                  type="number"
                                  min="1"
                                  value={v.cantidad}
                                  onChange={(e) => actualizarCantidadVehiculo(v.tipo, v.jornada, parseInt(e.target.value) || 1)}
                                  className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`precio-${idx}`} className="text-xs">Precio €</Label>
                                <Input
                                  id={`precio-${idx}`}
                                  type="number"
                                  step="0.01"
                                  value={v.precio}
                                  onChange={(e) => actualizarPrecioVehiculo(v.tipo, v.jornada, parseFloat(e.target.value) || 0)}
                                  className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                />
                              </div>
                            </div>
                            
                            <div className="text-right text-sm pt-1 border-t border-gray-200">
                              <span className="text-gray-600">Subtotal: </span>
                              <span className="font-medium text-[#00C9CE]">{(v.precio * v.cantidad).toFixed(2)} €</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tramos de km seleccionados */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <Label className="flex items-center justify-between">
                      <span>{TEXTS.tarifarios.ultimaMilla.selected.tramos}</span>
                      <span className="text-xs text-gray-600">Haz clic en las tablas</span>
                    </Label>
                    
                    {state.tramosSeleccionados.length === 0 ? (
                      <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded text-center">
                        No hay tramos seleccionados
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {state.tramosSeleccionados.map((t, idx) => (
                          <div key={idx} className="bg-white border-2 border-[#00C9CE] rounded-lg p-2 flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <div className="font-medium text-[#000935]">{t.nombre}</div>
                              <div className="text-xs text-[#00C9CE]">+{t.valor} €</div>
                            </div>
                            <button
                              onClick={() => eliminarTramo(t.nombre)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title={TEXTS.tarifarios.common.actions.delete}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Extras operativos */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="text-sm mb-2">
                      <strong>{TEXTS.tarifarios.ultimaMilla.selected.extras}</strong>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="horaExtra"
                          checked={state.extrasSeleccionados.some(e => e.concepto === "Hora extra")}
                          onChange={(e) => e.target.checked ? agregarExtra("Hora extra", 20) : eliminarExtra("Hora extra")}
                          className="mt-1"
                        />
                        <label htmlFor="horaExtra">Hora extra (+20 € por hora)</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="horaNocturna"
                          checked={state.extrasSeleccionados.some(e => e.concepto === "Hora nocturna")}
                          onChange={(e) => e.target.checked ? agregarExtra("Hora nocturna", 5) : eliminarExtra("Hora nocturna")}
                          className="mt-1"
                        />
                        <label htmlFor="horaNocturna">Hora nocturna (+5 € por hora)</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="mozo"
                          checked={state.extrasSeleccionados.some(e => e.concepto === "Mozo de almacén")}
                          onChange={(e) => e.target.checked ? agregarExtra("Mozo de almacén", 140) : eliminarExtra("Mozo de almacén")}
                          className="mt-1"
                        />
                        <label htmlFor="mozo">Mozo de almacén (+140 €)</label>
                      </div>
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="jefeTrafico"
                          checked={state.extrasSeleccionados.some(e => e.concepto === "Jefe de tráfico")}
                          onChange={(e) => e.target.checked ? agregarExtra("Jefe de tráfico", 165) : eliminarExtra("Jefe de tráfico")}
                          className="mt-1"
                        />
                        <label htmlFor="jefeTrafico">Jefe de tráfico (+165 €)</label>
                      </div>
                    </div>

                    {state.extrasSeleccionados.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {state.extrasSeleccionados.map((e, idx) => (
                          <div key={idx} className="bg-white border-2 border-[#00C9CE] rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 text-sm">
                                <div className="font-medium text-[#000935]">{e.concepto}</div>
                                <div className="text-xs text-gray-600">{e.precio} € cada uno</div>
                              </div>
                              <button
                                onClick={() => eliminarExtra(e.concepto)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title={TEXTS.tarifarios.common.actions.delete}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor={`extra-cant-${idx}`} className="text-xs">Cantidad</Label>
                                <Input
                                  id={`extra-cant-${idx}`}
                                  type="number"
                                  min="1"
                                  value={e.cantidad}
                                  onChange={(event) => {
                                    const nuevaCantidad = parseInt(event.target.value) || 1;
                                    setState(prev => ({
                                      ...prev,
                                      extrasSeleccionados: prev.extrasSeleccionados.map(ex => 
                                        ex.concepto === e.concepto ? { ...ex, cantidad: nuevaCantidad } : ex
                                      )
                                    }));
                                  }}
                                  className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`extra-precio-${idx}`} className="text-xs">Precio €</Label>
                                <Input
                                  id={`extra-precio-${idx}`}
                                  type="number"
                                  step="0.01"
                                  value={e.precio}
                                  onChange={(event) => {
                                    const nuevoPrecio = parseFloat(event.target.value) || 0;
                                    setState(prev => ({
                                      ...prev,
                                      extrasSeleccionados: prev.extrasSeleccionados.map(ex => 
                                        ex.concepto === e.concepto ? { ...ex, precio: nuevoPrecio } : ex
                                      )
                                    }));
                                  }}
                                  className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                />
                              </div>
                            </div>
                            
                            <div className="text-right text-sm pt-1 border-t border-gray-200">
                              <span className="text-gray-600">Subtotal: </span>
                              <span className="font-medium text-[#00C9CE]">{(e.precio * e.cantidad).toFixed(2)} €</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Otros ajustes - Solo visible para administradores */}
                  {isAdmin && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="text-sm mb-2">
                        <strong>Otros ajustes</strong>
                        <span className="block text-xs text-gray-600 mt-1">(festivos, urgencias, esperas, descuentos, etc.)</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="otrosAjustesConcepto" className="text-xs">Concepto</Label>
                          <Input
                            id="otrosAjustesConcepto"
                            type="text"
                            placeholder="Ej: Descuento especial, festivo..."
                            value={state.otrosAjustes.concepto}
                            onChange={(e) => setState(prev => ({ ...prev, otrosAjustes: { ...prev.otrosAjustes, concepto: e.target.value } }))}
                            className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="otrosAjustesValor" className="text-xs">
                            Importe €
                            <span className="block text-xs text-gray-500">(usa - para descuentos: -50)</span>
                          </Label>
                          <Input
                            id="otrosAjustesValor"
                            type="text"
                            placeholder="0"
                            value={state.otrosAjustes.valor}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                                setState(prev => ({ ...prev, otrosAjustes: { ...prev.otrosAjustes, valor: value } }));
                              }
                            }}
                            className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="bg-[#000935] text-white p-4 rounded-lg flex items-center justify-between">
                    <span className="text-lg">{TEXTS.tarifarios.common.total.estimatedLabel}</span>
                    <span className="text-[#00C9CE] text-xl">{calcularTotal()} €</span>
                  </div>

                  {/* Botón Enviar solicitud */}
                  <button
                    onClick={generarPDF}
                    className="w-full bg-[#00C9CE] hover:bg-[#00C9CE]/90 text-white py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    {TEXTS.tarifarios.common.cta.sendRequest}
                  </button>

                </CardContent>
              </Card>

            </div>

            <div className="bg-gray-100 p-6 rounded-lg text-center text-sm text-gray-700 space-y-2 mt-8">
              <p>
                <strong>ONUS Express SL</strong> · www.onusexpress.com · Carrer d'Anselm Clavé, s/n, Nave 24 – PI Matacás – 08980 Sant Feliu de Llobregat, Barcelona · NIF: B72735277
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
});

TarifarioUltimaMilla.displayName = 'TarifarioUltimaMilla';
