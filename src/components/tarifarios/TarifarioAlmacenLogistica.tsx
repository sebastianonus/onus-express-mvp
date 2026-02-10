import { useState, useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Warehouse, Package, Download, X, ChevronDown, Truck, MapPin, Hand, PackageCheck, Send, ClipboardList, FileText, FileCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { TEXTS } from '@/content/texts';

export interface TarifarioAlmacenLogisticaHandle {
  resetear: () => void;
}

interface TarifarioAlmacenLogisticaProps {
  isAdmin?: boolean;
  nombreCliente?: string;
}

export const TarifarioAlmacenLogistica = forwardRef<TarifarioAlmacenLogisticaHandle, TarifarioAlmacenLogisticaProps>(({ isAdmin = false, nombreCliente }, ref) => {
  // Estados iniciales para resetear
  const getInitialState = (clientName = '') => ({
    nombreCliente: clientName,
    logoCliente: null as string | null,
    almacenajeSeleccionado: [] as Array<{
      tipo: string;
      descripcion: string;
      precio: number;
      cantidad: number;
    }>,
    recepcionSeleccionada: [] as Array<{
      servicio: string;
      precio: number;
      cantidad: number;
    }>,
    ubicacionSeleccionada: [] as Array<{
      servicio: string;
      precio: number;
      cantidad: number;
    }>,
    pickingSeleccionado: [] as Array<{
      tipo: string;
      precio: number;
      cantidad: number;
    }>,
    packingSeleccionado: [] as Array<{
      servicio: string;
      precio: number;
      cantidad: number;
    }>,
    despachoSeleccionado: [] as Array<{
      servicio: string;
      precio: number;
      cantidad: number;
    }>,
    inventariosSeleccionados: [] as Array<{
      servicio: string;
      precio: number;
      cantidad: number;
    }>,
    extrasSeleccionados: [] as Array<{
      concepto: string;
      precio: number;
      cantidad: number;
    }>,
    otrosAjustes: {
      concepto: '',
      valor: ''
    }
  });

  // Estados
  const [state, setState] = useState(() => getInitialState(nombreCliente || ''));
  const [generandoPDF, setGenerandoPDF] = useState(false);
  
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Estados para desplegables
  const [almacenajeAbierto, setAlmacenajeAbierto] = useState(true);
  const [recepcionAbierto, setRecepcionAbierto] = useState(false);
  const [ubicacionAbierto, setUbicacionAbierto] = useState(false);
  const [pickingAbierto, setPickingAbierto] = useState(false);
  const [packingAbierto, setPackingAbierto] = useState(false);
  const [despachoAbierto, setDespachoAbierto] = useState(false);
  const [inventariosAbierto, setInventariosAbierto] = useState(false);
  const [extrasAbierto, setExtrasAbierto] = useState(false);
  const [condicionesAbierto, setCondicionesAbierto] = useState(false);

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

  const almacenajeData = useMemo(() => [
    { tipo: "Pallet en rack (Industrial)", descripcion: "EURO 80x120, custodia en rack", precio: "16.00", unidad: "pallet/mes" },
    { tipo: "Pallet en suelo (Industrial)", descripcion: "EURO 80x120, almacenaje en suelo", precio: "13.00", unidad: "pallet/mes" },
    { tipo: "Pallet estándar (E-commerce)", descripcion: "EURO 80x120", precio: "14.00", unidad: "pallet/mes" },
    { tipo: "Pallet técnico", descripcion: "Almacenaje especializado", precio: "15.50", unidad: "pallet/mes" },
    { tipo: "Pallet fuera de medida", descripcion: "Suplemento sobre tarifa base", precio: "3.20", unidad: "pallet/mes" },
    { tipo: "Caja/unidad técnica", descripcion: "Piezas técnicas, control individual", precio: "1.50", unidad: "unidad/mes" }
  ], []);

  const recepcionData = useMemo(() => [
    { servicio: "Recepción pallet completo", precio: "5.50" },
    { servicio: "Recepción bulto suelto", precio: "1.00" },
    { servicio: "Recepción pieza técnica", precio: "0.80" },
    { servicio: "Recepción con incidencias", precio: "3.00" }
  ], []);

  const ubicacionData = useMemo(() => [
    { servicio: "Ubicación pallet en rack", precio: "2.50" },
    { servicio: "Reubicación interna", precio: "2.00" }
  ], []);

  const pickingData = useMemo(() => [
    { tipo: "Picking pallet completo", precio: "5.50" },
    { tipo: "Picking por caja", precio: "1.50" },
    { tipo: "Picking por unidad (e-commerce)", precio: "0.30" },
    { tipo: "Picking por unidad técnica", precio: "0.40" }
  ], []);

  const packingData = useMemo(() => [
    { servicio: "Packing estándar", precio: "1.50" },
    { servicio: "Packing con etiquetado", precio: "2.50" },
    { servicio: "Packing técnico especial", precio: "1.50" },
    { servicio: "Retractilado pallet", precio: "2.50" },
    { servicio: "Reempaquetado", precio: "6.00" },
    { servicio: "Etiquetado", precio: "0.30" }
  ], []);

  const despachoData = useMemo(() => [
    { servicio: "Despacho pallet", precio: "5.50" },
    { servicio: "Despacho bulto", precio: "1.80" },
    { servicio: "Despacho técnico", precio: "3.50" },
    { servicio: "Gestión documental transporte", precio: "5.50" }
  ], []);

  const inventariosData = useMemo(() => [
    { servicio: "Inventario puntual pallet", precio: "0.90" },
    { servicio: "Inventario por unidad", precio: "0.12" }
  ], []);

  const extrasData = useMemo(() => [
    { concepto: "Gestión de incidencias (por hora)", precio: "45.00" },
    { concepto: "Reportes personalizados (por hora)", precio: "60.00" },
    { concepto: "Gestión devoluciones e-commerce", precio: "2.70" },
    { concepto: "Control de lote/serie", precio: "0.20" }
  ], []);

  const calcularTotal = () => {
    const almacenajeTotal = state.almacenajeSeleccionado.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    const recepcionTotal = state.recepcionSeleccionada.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    const ubicacionTotal = state.ubicacionSeleccionada.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    const pickingTotal = state.pickingSeleccionado.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    const packingTotal = state.packingSeleccionado.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    const despachoTotal = state.despachoSeleccionado.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    const inventariosTotal = state.inventariosSeleccionados.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    const extrasTotal = state.extrasSeleccionados.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    const otrosAjustesValor = state.otrosAjustes.valor ? parseFloat(state.otrosAjustes.valor) : 0;
    
    return (almacenajeTotal + recepcionTotal + ubicacionTotal + pickingTotal + packingTotal + despachoTotal + inventariosTotal + extrasTotal + otrosAjustesValor).toFixed(2);
  };

  const handleSeleccionarAlmacenaje = (tipo: string, descripcion: string, precio: string) => {
    const yaSeleccionado = state.almacenajeSeleccionado.find(s => s.tipo === tipo);
    
    if (yaSeleccionado) {
      setState(prev => ({
        ...prev,
        almacenajeSeleccionado: prev.almacenajeSeleccionado.filter(s => s.tipo !== tipo)
      }));
    } else {
      setState(prev => ({
        ...prev,
        almacenajeSeleccionado: [...prev.almacenajeSeleccionado, {
          tipo,
          descripcion,
          precio: parseFloat(precio),
          cantidad: 1
        }]
      }));
    }
  };

  const esAlmacenajeSeleccionado = (tipo: string) => {
    return state.almacenajeSeleccionado.some(s => s.tipo === tipo);
  };

  const actualizarCantidadAlmacenaje = (tipo: string, cantidad: number) => {
    setState(prev => ({
      ...prev,
      almacenajeSeleccionado: prev.almacenajeSeleccionado.map(s => 
        s.tipo === tipo ? { ...s, cantidad: Math.max(1, cantidad) } : s
      )
    }));
  };

  const eliminarAlmacenaje = (tipo: string) => {
    setState(prev => ({
      ...prev,
      almacenajeSeleccionado: prev.almacenajeSeleccionado.filter(s => s.tipo !== tipo)
    }));
  };

  const agregarServicio = (
    tipo: 'recepcion' | 'ubicacion' | 'picking' | 'packing' | 'despacho' | 'inventarios' | 'extras',
    nombre: string,
    precio: string
  ) => {
    const precioNum = parseFloat(precio);
    
    setState(prev => {
      let newState = { ...prev };
      
      switch(tipo) {
        case 'recepcion': {
          const yaSeleccionado = prev.recepcionSeleccionada.find(s => s.servicio === nombre);
          if (yaSeleccionado) {
            newState.recepcionSeleccionada = prev.recepcionSeleccionada.map(s => 
              s.servicio === nombre ? { ...s, cantidad: s.cantidad + 1 } : s
            );
          } else {
            newState.recepcionSeleccionada = [...prev.recepcionSeleccionada, { servicio: nombre, precio: precioNum, cantidad: 1 }];
          }
          break;
        }
        case 'ubicacion': {
          const yaSeleccionado = prev.ubicacionSeleccionada.find(s => s.servicio === nombre);
          if (yaSeleccionado) {
            newState.ubicacionSeleccionada = prev.ubicacionSeleccionada.map(s => 
              s.servicio === nombre ? { ...s, cantidad: s.cantidad + 1 } : s
            );
          } else {
            newState.ubicacionSeleccionada = [...prev.ubicacionSeleccionada, { servicio: nombre, precio: precioNum, cantidad: 1 }];
          }
          break;
        }
        case 'picking': {
          const yaSeleccionado = prev.pickingSeleccionado.find(s => s.tipo === nombre);
          if (yaSeleccionado) {
            newState.pickingSeleccionado = prev.pickingSeleccionado.map(s => 
              s.tipo === nombre ? { ...s, cantidad: s.cantidad + 1 } : s
            );
          } else {
            newState.pickingSeleccionado = [...prev.pickingSeleccionado, { tipo: nombre, precio: precioNum, cantidad: 1 }];
          }
          break;
        }
        case 'packing': {
          const yaSeleccionado = prev.packingSeleccionado.find(s => s.servicio === nombre);
          if (yaSeleccionado) {
            newState.packingSeleccionado = prev.packingSeleccionado.map(s => 
              s.servicio === nombre ? { ...s, cantidad: s.cantidad + 1 } : s
            );
          } else {
            newState.packingSeleccionado = [...prev.packingSeleccionado, { servicio: nombre, precio: precioNum, cantidad: 1 }];
          }
          break;
        }
        case 'despacho': {
          const yaSeleccionado = prev.despachoSeleccionado.find(s => s.servicio === nombre);
          if (yaSeleccionado) {
            newState.despachoSeleccionado = prev.despachoSeleccionado.map(s => 
              s.servicio === nombre ? { ...s, cantidad: s.cantidad + 1 } : s
            );
          } else {
            newState.despachoSeleccionado = [...prev.despachoSeleccionado, { servicio: nombre, precio: precioNum, cantidad: 1 }];
          }
          break;
        }
        case 'inventarios': {
          const yaSeleccionado = prev.inventariosSeleccionados.find(s => s.servicio === nombre);
          if (yaSeleccionado) {
            newState.inventariosSeleccionados = prev.inventariosSeleccionados.map(s => 
              s.servicio === nombre ? { ...s, cantidad: s.cantidad + 1 } : s
            );
          } else {
            newState.inventariosSeleccionados = [...prev.inventariosSeleccionados, { servicio: nombre, precio: precioNum, cantidad: 1 }];
          }
          break;
        }
        case 'extras': {
          const yaSeleccionado = prev.extrasSeleccionados.find(s => s.concepto === nombre);
          if (yaSeleccionado) {
            newState.extrasSeleccionados = prev.extrasSeleccionados.map(s => 
              s.concepto === nombre ? { ...s, cantidad: s.cantidad + 1 } : s
            );
          } else {
            newState.extrasSeleccionados = [...prev.extrasSeleccionados, { concepto: nombre, precio: precioNum, cantidad: 1 }];
          }
          break;
        }
      }
      
      return newState;
    });
  };

  const actualizarCantidadServicio = (
    tipo: 'recepcion' | 'ubicacion' | 'picking' | 'packing' | 'despacho' | 'inventarios' | 'extras',
    nombre: string,
    cantidad: number
  ) => {
    setState(prev => {
      let newState = { ...prev };
      
      switch(tipo) {
        case 'recepcion':
          newState.recepcionSeleccionada = prev.recepcionSeleccionada.map(s => 
            s.servicio === nombre ? { ...s, cantidad: Math.max(1, cantidad) } : s
          );
          break;
        case 'ubicacion':
          newState.ubicacionSeleccionada = prev.ubicacionSeleccionada.map(s => 
            s.servicio === nombre ? { ...s, cantidad: Math.max(1, cantidad) } : s
          );
          break;
        case 'picking':
          newState.pickingSeleccionado = prev.pickingSeleccionado.map(s => 
            s.tipo === nombre ? { ...s, cantidad: Math.max(1, cantidad) } : s
          );
          break;
        case 'packing':
          newState.packingSeleccionado = prev.packingSeleccionado.map(s => 
            s.servicio === nombre ? { ...s, cantidad: Math.max(1, cantidad) } : s
          );
          break;
        case 'despacho':
          newState.despachoSeleccionado = prev.despachoSeleccionado.map(s => 
            s.servicio === nombre ? { ...s, cantidad: Math.max(1, cantidad) } : s
          );
          break;
        case 'inventarios':
          newState.inventariosSeleccionados = prev.inventariosSeleccionados.map(s => 
            s.servicio === nombre ? { ...s, cantidad: Math.max(1, cantidad) } : s
          );
          break;
        case 'extras':
          newState.extrasSeleccionados = prev.extrasSeleccionados.map(s => 
            s.concepto === nombre ? { ...s, cantidad: Math.max(1, cantidad) } : s
          );
          break;
      }
      
      return newState;
    });
  };

  const eliminarServicio = (
    tipo: 'recepcion' | 'ubicacion' | 'picking' | 'packing' | 'despacho' | 'inventarios' | 'extras',
    nombre: string
  ) => {
    setState(prev => {
      let newState = { ...prev };
      
      switch(tipo) {
        case 'recepcion':
          newState.recepcionSeleccionada = prev.recepcionSeleccionada.filter(s => s.servicio !== nombre);
          break;
        case 'ubicacion':
          newState.ubicacionSeleccionada = prev.ubicacionSeleccionada.filter(s => s.servicio !== nombre);
          break;
        case 'picking':
          newState.pickingSeleccionado = prev.pickingSeleccionado.filter(s => s.tipo !== nombre);
          break;
        case 'packing':
          newState.packingSeleccionado = prev.packingSeleccionado.filter(s => s.servicio !== nombre);
          break;
        case 'despacho':
          newState.despachoSeleccionado = prev.despachoSeleccionado.filter(s => s.servicio !== nombre);
          break;
        case 'inventarios':
          newState.inventariosSeleccionados = prev.inventariosSeleccionados.filter(s => s.servicio !== nombre);
          break;
        case 'extras':
          newState.extrasSeleccionados = prev.extrasSeleccionados.filter(s => s.concepto !== nombre);
          break;
      }
      
      return newState;
    });
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
      const fileName = `tarifario-almacen-logistica-2026${slug}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert(TEXTS.tarifarios.common.alerts.pdfError);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const tieneServiciosSeleccionados = 
    state.almacenajeSeleccionado.length > 0 ||
    state.recepcionSeleccionada.length > 0 ||
    state.ubicacionSeleccionada.length > 0 ||
    state.pickingSeleccionado.length > 0 ||
    state.packingSeleccionado.length > 0 ||
    state.despachoSeleccionado.length > 0 ||
    state.inventariosSeleccionados.length > 0 ||
    state.extrasSeleccionados.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido que se capturará en el PDF */}
      <div ref={pageRef} className="max-w-[1200px] mx-auto bg-white shadow-lg">
        {/* HEADER */}
        <div className={`bg-[#000935] text-white py-4 px-6 ${generandoPDF ? 'rounded-t-lg' : ''}`}>
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center">
              <h1 className="tracking-wide mb-1">
                {generandoPDF ? TEXTS.tarifarios.almacenLogistica.title.pdf : TEXTS.tarifarios.almacenLogistica.title.normal}
              </h1>
              <p className="text-[#00C9CE] text-xs">{TEXTS.tarifarios.almacenLogistica.subtitle}</p>
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
                
                {state.almacenajeSeleccionado.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Warehouse className="h-4 w-4 text-[#00C9CE]" />
                      <h4 className="text-[#00C9CE] text-sm">{TEXTS.tarifarios.almacenLogistica.breakdown.almacenaje}</h4>
                    </div>
                    <div>
                      <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                        <div className="col-span-6">{TEXTS.tarifarios.common.table.headers.concepto}</div>
                        <div className="col-span-2 text-center">{TEXTS.tarifarios.common.table.headers.cantidad}</div>
                        <div className="col-span-2 text-right">{TEXTS.tarifarios.common.table.headers.precioUnit}</div>
                        <div className="col-span-2 text-right">{TEXTS.tarifarios.common.table.headers.subtotal}</div>
                      </div>
                      {state.almacenajeSeleccionado.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                          <div className="col-span-6">
                            <div className="text-[#000935]">{item.tipo}</div>
                            <div className="text-xs text-gray-500">{item.descripcion}</div>
                          </div>
                          <div className="col-span-2 text-center">{item.cantidad}</div>
                          <div className="col-span-2 text-right">{item.precio.toFixed(2)} €</div>
                          <div className="col-span-2 text-right text-[#00C9CE] font-medium">
                            {(item.precio * item.cantidad).toFixed(2)} €
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {[
                  { data: state.recepcionSeleccionada, title: TEXTS.tarifarios.almacenLogistica.breakdown.recepcion, key: 'servicio' },
                  { data: state.ubicacionSeleccionada, title: TEXTS.tarifarios.almacenLogistica.breakdown.ubicacion, key: 'servicio' },
                  { data: state.pickingSeleccionado, title: TEXTS.tarifarios.almacenLogistica.breakdown.picking, key: 'tipo' },
                  { data: state.packingSeleccionado, title: TEXTS.tarifarios.almacenLogistica.breakdown.packing, key: 'servicio' },
                  { data: state.despachoSeleccionado, title: TEXTS.tarifarios.almacenLogistica.breakdown.despacho, key: 'servicio' },
                  { data: state.inventariosSeleccionados, title: TEXTS.tarifarios.almacenLogistica.breakdown.inventarios, key: 'servicio' },
                  { data: state.extrasSeleccionados, title: TEXTS.tarifarios.almacenLogistica.breakdown.administrativos, key: 'concepto' }
                ].map((section, sectionIdx) => (
                  section.data.length > 0 && (
                    <div key={sectionIdx}>
                      <h4 className="text-[#000935] text-sm mb-3">{section.title}</h4>
                      <div>
                        <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                          <div className="col-span-6">{TEXTS.tarifarios.common.table.headers.concepto}</div>
                          <div className="col-span-2 text-center">{TEXTS.tarifarios.common.table.headers.cantidad}</div>
                          <div className="col-span-2 text-right">{TEXTS.tarifarios.common.table.headers.precioUnit}</div>
                          <div className="col-span-2 text-right">{TEXTS.tarifarios.common.table.headers.subtotal}</div>
                        </div>
                        {section.data.map((item: any, idx: number) => (
                          <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                            <div className="col-span-6 text-[#000935]">{item[section.key]}</div>
                            <div className="col-span-2 text-center">{item.cantidad}</div>
                            <div className="col-span-2 text-right">{item.precio.toFixed(2)} €</div>
                            <div className="col-span-2 text-right text-[#00C9CE] font-medium">
                              {(item.precio * item.cantidad).toFixed(2)} €
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}

                {state.otrosAjustes.concepto && state.otrosAjustes.valor && (
                  <div>
                    <h4 className="text-[#000935] text-sm mb-3">{TEXTS.tarifarios.common.otherAdjustments.title}</h4>
                    <div>
                      <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                        <div className="col-span-6">{TEXTS.tarifarios.common.table.headers.concepto}</div>
                        <div className="col-span-2 text-center">-</div>
                        <div className="col-span-2 text-right">-</div>
                        <div className="col-span-2 text-right">{TEXTS.tarifarios.common.table.headers.importe}</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-3 text-sm">
                        <div className="col-span-6 text-[#000935]">{state.otrosAjustes.concepto}</div>
                        <div className="col-span-2 text-center">-</div>
                        <div className="col-span-2 text-right">-</div>
                        <div className="col-span-2 text-right text-[#00C9CE] font-medium">
                          {parseFloat(state.otrosAjustes.valor).toFixed(2)} €
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
                  <p>{TEXTS.tarifarios.almacenLogistica.conditionsPdf.pricesWithoutVAT}</p>
                  <p>{TEXTS.tarifarios.almacenLogistica.conditionsPdf.spaceAvailability}</p>
                  <p>{TEXTS.tarifarios.almacenLogistica.conditionsPdf.insurance}</p>
                  <p>{TEXTS.tarifarios.almacenLogistica.conditionsPdf.onDemand}</p>
                  <p>{TEXTS.tarifarios.almacenLogistica.conditionsPdf.monthlyBilling}</p>
                  <p>{TEXTS.tarifarios.almacenLogistica.conditionsPdf.quoteValidity}</p>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-600 space-y-1 pt-4">
              <p>
                <strong>{TEXTS.brand.company.name}</strong>
                {TEXTS.tarifarios.common.legalFooterTail}
              </p>
            </div>

          </div>
        ) : (
          /* VISTA NORMAL DEL TARIFARIO */
          <div className="max-w-[1200px] mx-auto p-6">

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

              <div className="space-y-6">
                
                {/* Almacenaje de Mercancía */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setAlmacenajeAbierto(!almacenajeAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Warehouse className="h-6 w-6" />
                        {TEXTS.tarifarios.almacenLogistica.breakdown.almacenaje}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${almacenajeAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {almacenajeAbierto && (
                    <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{TEXTS.tarifarios.common.table.headers.tipo}</TableHead>
                          <TableHead>{TEXTS.tarifarios.common.table.headers.descripcion}</TableHead>
                          <TableHead className="text-right">{TEXTS.tarifarios.common.table.headers.precio}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {almacenajeData.map((item, idx) => (
                          <TableRow 
                            key={idx}
                            onClick={() => handleSeleccionarAlmacenaje(item.tipo, item.descripcion, item.precio)}
                            className={`cursor-pointer transition-colors hover:bg-[#00C9CE]/10 ${
                              esAlmacenajeSeleccionado(item.tipo) ? 'bg-[#00C9CE]/20 border-l-4 border-l-[#00C9CE]' : ''
                            }`}
                          >
                            <TableCell className="text-[#00C9CE]">{item.tipo}</TableCell>
                            <TableCell className="text-sm text-gray-600">{item.descripcion}</TableCell>
                            <TableCell className="text-right">{item.precio} € / {item.unidad}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </CardContent>
                  )}
                </Card>

                {/* Recepción */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setRecepcionAbierto(!recepcionAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {TEXTS.tarifarios.almacenLogistica.breakdown.recepcion}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${recepcionAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {recepcionAbierto && (
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {recepcionData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-700">{item.servicio}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#000935]">{item.precio} €</span>
                              <Button
                                onClick={() => agregarServicio('recepcion', item.servicio, item.precio)}
                                size="sm"
                                style={{ backgroundColor: '#00C9CE' }}
                              >
                                {TEXTS.tarifarios.common.table.actions.agregar}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Ubicación */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setUbicacionAbierto(!ubicacionAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {TEXTS.tarifarios.almacenLogistica.breakdown.ubicacion}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${ubicacionAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {ubicacionAbierto && (
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {ubicacionData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-700">{item.servicio}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#000935]">{item.precio} €</span>
                              <Button
                                onClick={() => agregarServicio('ubicacion', item.servicio, item.precio)}
                                size="sm"
                                style={{ backgroundColor: '#00C9CE' }}
                              >
                                {TEXTS.tarifarios.common.table.actions.agregar}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Picking */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setPickingAbierto(!pickingAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Hand className="h-5 w-5" />
                        {TEXTS.tarifarios.almacenLogistica.breakdown.picking}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${pickingAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {pickingAbierto && (
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {pickingData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-700">{item.tipo}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#000935]">{item.precio} €</span>
                              <Button
                                onClick={() => agregarServicio('picking', item.tipo, item.precio)}
                                size="sm"
                                style={{ backgroundColor: '#00C9CE' }}
                              >
                                {TEXTS.tarifarios.common.table.actions.agregar}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Packing */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setPackingAbierto(!packingAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <PackageCheck className="h-5 w-5" />
                        {TEXTS.tarifarios.almacenLogistica.breakdown.packing}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${packingAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {packingAbierto && (
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {packingData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-700">{item.servicio}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#000935]">{item.precio} €</span>
                              <Button
                                onClick={() => agregarServicio('packing', item.servicio, item.precio)}
                                size="sm"
                                style={{ backgroundColor: '#00C9CE' }}
                              >
                                {TEXTS.tarifarios.common.table.actions.agregar}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Despacho */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setDespachoAbierto(!despachoAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        {TEXTS.tarifarios.almacenLogistica.breakdown.despacho}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${despachoAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {despachoAbierto && (
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {despachoData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-700">{item.servicio}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#000935]">{item.precio} €</span>
                              <Button
                                onClick={() => agregarServicio('despacho', item.servicio, item.precio)}
                                size="sm"
                                style={{ backgroundColor: '#00C9CE' }}
                              >
                                {TEXTS.tarifarios.common.table.actions.agregar}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Inventarios */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setInventariosAbierto(!inventariosAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        {TEXTS.tarifarios.almacenLogistica.breakdown.inventarios}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${inventariosAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {inventariosAbierto && (
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {inventariosData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-700">{item.servicio}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#000935]">{item.precio} €</span>
                              <Button
                                onClick={() => agregarServicio('inventarios', item.servicio, item.precio)}
                                size="sm"
                                style={{ backgroundColor: '#00C9CE' }}
                              >
                                {TEXTS.tarifarios.common.table.actions.agregar}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Extras */}
                <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                  <CardHeader 
                    className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors"
                    onClick={() => setExtrasAbierto(!extrasAbierto)}
                  >
                    <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {TEXTS.tarifarios.almacenLogistica.breakdown.administrativos}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${extrasAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {extrasAbierto && (
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {extrasData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-700">{item.concepto}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#000935]">{item.precio} €</span>
                              <Button
                                onClick={() => agregarServicio('extras', item.concepto, item.precio)}
                                size="sm"
                                style={{ backgroundColor: '#00C9CE' }}
                              >
                                {TEXTS.tarifarios.common.table.actions.agregar}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
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
                        <FileCheck className="h-5 w-5" />
                        Condiciones y Notas
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${condicionesAbierto ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                  {condicionesAbierto && (
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-700 space-y-2">
                        <p>• Tarifas sin IVA, facturación mensual</p>
                        <p>• Seguro según tipo y valor de mercancía</p>
                        <p>• Servicios adicionales bajo demanda</p>
                        <p>• Tecnología WMS disponible para trazabilidad</p>
                        <p>• Informes periódicos de stock y movimientos</p>
                      </div>
                    </CardContent>
                  )}
                </Card>

              </div>

              {/* COLUMNA DERECHA - RESUMEN */}
              <div className="space-y-6">
                <Card className="border-2 border-[#00C9CE] shadow-lg sticky top-6 overflow-hidden rounded-lg">
                  <CardHeader className="bg-[#00C9CE] text-white">
                    <CardTitle className="text-white text-center uppercase">{TEXTS.tarifarios.common.budgetCardTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                      {/* Campo nombre cliente */}
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <Label htmlFor="nombreCliente">
                          {TEXTS.tarifarios.common.labels.nombreCliente}
                        </Label>
                        <Input
                          id="nombreCliente"
                          type="text"
                          placeholder={TEXTS.tarifarios.almacenLogistica.placeholders.nombreCliente}
                          value={state.nombreCliente}
                          onChange={(e) => setState(prev => ({ ...prev, nombreCliente: e.target.value }))}
                          className="border-[#00C9CE] focus-visible:ring-[#00C9CE]"
                        />
                      </div>

                      {/* Logo del cliente */}
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <Label htmlFor="logoCliente">{TEXTS.tarifarios.common.logo.labelGeneric}</Label>
                        {!state.logoCliente ? (
                          <div>
                            <Input
                              id="logoCliente"
                              type="file"
                              accept=".png,.jpg,.jpeg,.svg"
                              onChange={handleLogoClienteChange}
                              className="border-[#00C9CE] focus-visible:ring-[#00C9CE]"
                            />
                            <p className="text-xs text-gray-600 mt-2">{TEXTS.tarifarios.common.logo.formatsNote}</p>
                          </div>
                        ) : (
                          <div className="bg-white border-2 border-[#00C9CE] rounded-lg p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img src={state.logoCliente} alt="Logo del cliente" className="h-12 w-auto max-w-[100px] object-contain" />
                                <span className="text-sm text-gray-600">{TEXTS.tarifarios.common.logo.loaded}</span>
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

                      {/* Lista de servicios seleccionados */}
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <Label className="flex items-center justify-between">
                          <span>{TEXTS.tarifarios.almacenLogistica.breakdown.selectedServices}</span>
                          <span className="text-xs text-gray-600">{TEXTS.tarifarios.common.hints.clickTables}</span>
                        </Label>
                        
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                          {!tieneServiciosSeleccionados ? (
                            <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded text-center">
                              {TEXTS.tarifarios.common.empty.noSelectedServicesTitle}<br />
                              {TEXTS.tarifarios.common.hints.clickRowsToSelect}
                            </div>
                        ) : (
                          <>
                            {/* Almacenaje */}
                            {state.almacenajeSeleccionado.map((item, idx) => (
                              <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="text-sm text-[#000935]">{item.tipo}</p>
                                    <p className="text-xs text-gray-500">{item.descripcion}</p>
                                  </div>
                                  <button
                                    onClick={() => eliminarAlmacenaje(item.tipo)}
                                    className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.cantidad}
                                    onChange={(e) => actualizarCantidadAlmacenaje(item.tipo, parseInt(e.target.value) || 1)}
                                    className="w-16 h-8 text-center text-xs"
                                  />
                                  <span className="text-xs text-gray-500">×</span>
                                  <span className="text-sm text-gray-700">{item.precio.toFixed(2)} €</span>
                                  <span className="text-xs text-gray-500">=</span>
                                  <span className="text-sm text-[#00C9CE]">
                                    {(item.precio * item.cantidad).toFixed(2)} €
                                  </span>
                                </div>
                              </div>
                            ))}

                            {/* Otros servicios */}
                            {[
                              { data: state.recepcionSeleccionada, tipo: 'recepcion', key: 'servicio' },
                              { data: state.ubicacionSeleccionada, tipo: 'ubicacion', key: 'servicio' },
                              { data: state.pickingSeleccionado, tipo: 'picking', key: 'tipo' },
                              { data: state.packingSeleccionado, tipo: 'packing', key: 'servicio' },
                              { data: state.despachoSeleccionado, tipo: 'despacho', key: 'servicio' },
                              { data: state.inventariosSeleccionados, tipo: 'inventarios', key: 'servicio' },
                              { data: state.extrasSeleccionados, tipo: 'extras', key: 'concepto' }
                            ].map((section, sectionIdx) => (
                              section.data.map((item: any, idx: number) => (
                                <div key={`${sectionIdx}-${idx}`} className="p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="text-sm text-[#000935] flex-1">{item[section.key]}</p>
                                    <button
                                      onClick={() => eliminarServicio(section.tipo as any, item[section.key])}
                                      className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="1"
                                      value={item.cantidad}
                                      onChange={(e) => actualizarCantidadServicio(section.tipo as any, item[section.key], parseInt(e.target.value) || 1)}
                                      className="w-16 h-8 text-center text-xs"
                                    />
                                    <span className="text-xs text-gray-500">×</span>
                                    <span className="text-sm text-gray-700">{item.precio.toFixed(2)} €</span>
                                    <span className="text-xs text-gray-500">=</span>
                                    <span className="text-sm text-[#00C9CE]">
                                      {(item.precio * item.cantidad).toFixed(2)} €
                                    </span>
                                  </div>
                                </div>
                              ))
                            ))}
                          </>
                        )}
                        </div>
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
                      <div className="bg-[#000935] text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg">{TEXTS.tarifarios.common.total.estimatedLabel}</span>
                          <span className="text-[#00C9CE] text-xl">{calcularTotal()} €</span>
                        </div>
                        <div className="text-center text-xs text-gray-400 mt-1">
                          {TEXTS.tarifarios.common.total.vatNote}
                        </div>
                      </div>

                      {/* Botón Enviar solicitud */}
                      <button
                        onClick={generarPDF}
                        disabled={!tieneServiciosSeleccionados}
                        className="w-full bg-[#00C9CE] hover:bg-[#00C9CE]/90 text-white py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="h-5 w-5" />
                        {TEXTS.tarifarios.common.cta.sendRequest}
                      </button>
                  </CardContent>
                </Card>
              </div>

            </div>

            <div className="bg-gray-100 p-6 rounded-lg text-center text-sm text-gray-700 space-y-2 mt-8">
              <p>
                <strong>{TEXTS.brand.company.name}</strong>
                {TEXTS.tarifarios.common.legalFooterTail}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
});

TarifarioAlmacenLogistica.displayName = 'TarifarioAlmacenLogistica';
