import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  type ChangeEvent,
} from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Download, X, Package, Truck, ChevronDown, Zap, Weight, Ruler, Plus, FileText } from 'lucide-react';
import { TEXTS } from '@/content/texts';
import { enviarPresupuestoPorEmail } from '@/utils/emailPresupuesto';

export interface TarifarioMensajeriaExpressHandle {
  resetear: () => void;
}

interface TarifarioMensajeriaExpressProps {
  isAdmin?: boolean;
  nombreCliente?: string;
}

type ServicioSeleccionado = {
  servicio: string;
  peso: number;
  cantidad: number;
  precio: number;
};

type Suplemento = {
  descripcion: string;
  precio: number;
  cantidad: number;
};

type ServicioAdicional = {
  concepto: string;
  precio: number;
  cantidad: number;
};

type State = {
  nombreCliente: string;
  logoCliente: string | null;
  serviciosSeleccionados: ServicioSeleccionado[];
  suplementosPeso: Suplemento[];
  suplementosDimensiones: Suplemento[];
  serviciosAdicionales: ServicioAdicional[];
  otrosAjustes: { concepto: string; valor: string };
};

export const TarifarioMensajeriaExpress = forwardRef<TarifarioMensajeriaExpressHandle, TarifarioMensajeriaExpressProps>(
  ({ isAdmin = false, nombreCliente }, ref) => {
    const getInitialState = (clientName = ''): State => ({
      nombreCliente: clientName,
      logoCliente: null,
      serviciosSeleccionados: [],
      suplementosPeso: [],
      suplementosDimensiones: [],
      serviciosAdicionales: [],
      otrosAjustes: { concepto: '', valor: '' },
    });

    const [state, setState] = useState<State>(() => getInitialState(nombreCliente || ''));
    const [generandoPDF, setGenerandoPDF] = useState(false);

    const [catalogoAbierto, setCatalogoAbierto] = useState(true);
    const [tarifasPesoAbierto, setTarifasPesoAbierto] = useState(true);
    const [suplementosPesoAbierto, setSuplementosPesoAbierto] = useState(false);
    const [suplementosDimAbierto, setSuplementosDimAbierto] = useState(false);
    const [adicionalesAbierto, setAdicionalesAbierto] = useState(false);
    const [condicionesAbierto, setCondicionesAbierto] = useState(false);

    const pageRef = useRef<HTMLDivElement>(null);

    const handleReset = useCallback(() => {
      setState(getInitialState(nombreCliente || ''));
    }, [nombreCliente]);

    useEffect(() => {
      if (!nombreCliente) return;
      setState((prev) =>
        prev.nombreCliente.trim() === '' ? { ...prev, nombreCliente } : prev
      );
    }, [nombreCliente]);

    useImperativeHandle(ref, () => ({
      resetear: handleReset,
    }));

    const servicios = useMemo(
      () => [
        { nombre: '19h', descripcion: 'Entrega antes de las 19:00', uso: 'Opción más económica del día' },
        { nombre: '14h', descripcion: 'Entrega antes de las 14:00', uso: 'Económico con franja horaria' },
        { nombre: '12h', descripcion: 'Entrega antes de las 12:00', uso: 'Rapidez y equilibrio' },
        { nombre: '10h', descripcion: 'Entrega antes de las 10:00', uso: 'Documentos o paquetería urgente' },
        { nombre: '08:30h', descripcion: 'Entrega antes de las 08:30', uso: 'Máxima urgencia' },
        { nombre: 'HOY', descripcion: 'Entrega mismo día', uso: 'Envíos críticos' },
      ],
      []
    );

    const tarifasPorPeso: Record<
      string,
      { hasta2kg: number | 'Consultar'; hasta5kg: number | 'Consultar'; hasta10kg: number | 'Consultar'; kgAdicional: number | 'Consultar' }
    > = useMemo(
      () => ({
        '19h': { hasta2kg: 9.87, hasta5kg: 10.17, hasta10kg: 13.08, kgAdicional: 0.81 },
        '14h': { hasta2kg: 14.04, hasta5kg: 15.42, hasta10kg: 24.03, kgAdicional: 1.68 },
        '12h': { hasta2kg: 15.66, hasta5kg: 17.73, hasta10kg: 29.08, kgAdicional: 1.86 },
        '10h': { hasta2kg: 29.59, hasta5kg: 32.63, hasta10kg: 49.0, kgAdicional: 2.62 },
        '08:30h': { hasta2kg: 56.62, hasta5kg: 62.11, hasta10kg: 86.5, kgAdicional: 3.86 },
        HOY: { hasta2kg: 'Consultar', hasta5kg: 'Consultar', hasta10kg: 'Consultar', kgAdicional: 'Consultar' },
      }),
      []
    );

    const suplementosPesoData = useMemo(() => [{ descripcion: 'Bultos de más de 40 kg', precio: 10.0 }, { descripcion: 'Bultos de más de 60 kg', precio: 20.0 }], []);

    const suplementosDimensionesData = useMemo(() => [{ rango: '151–200 cm', precio: 22.35 }, { rango: '201–250 cm', precio: 67.77 }, { rango: '251–300 cm', precio: 114.0 }], []);

    const serviciosAdicionalesData = useMemo(
      () => [{ concepto: 'Reembolsos / Adelantos (6% del valor)', precio: 6.0 }, { concepto: 'Confirmación inmediata', precio: 0.75 }, { concepto: 'Seguro adicional', precio: 0 }],
      []
    );

    const calcularPrecioEnvio = useCallback(
      (servicio: string, peso: number) => {
        const tarifa = tarifasPorPeso[servicio];
        if (!tarifa) return 0;
        if (tarifa.hasta2kg === 'Consultar') return 0;

        if (peso <= 2) return tarifa.hasta2kg;
        if (peso <= 5) return tarifa.hasta5kg as number;
        if (peso <= 10) return tarifa.hasta10kg as number;

        const kgExtra = peso - 10;
        return (tarifa.hasta10kg as number) + kgExtra * (tarifa.kgAdicional as number);
      },
      [tarifasPorPeso]
    );

    const totalEstimado = useMemo(() => {
      let total = 0;

      state.serviciosSeleccionados.forEach((s) => {
        total += (Number.isFinite(s.precio) ? s.precio : 0) * (Number.isFinite(s.cantidad) ? s.cantidad : 0);
      });
      state.suplementosPeso.forEach((s) => {
        total += (Number.isFinite(s.precio) ? s.precio : 0) * (Number.isFinite(s.cantidad) ? s.cantidad : 0);
      });
      state.suplementosDimensiones.forEach((s) => {
        total += (Number.isFinite(s.precio) ? s.precio : 0) * (Number.isFinite(s.cantidad) ? s.cantidad : 0);
      });
      state.serviciosAdicionales.forEach((s) => {
        total += (Number.isFinite(s.precio) ? s.precio : 0) * (Number.isFinite(s.cantidad) ? s.cantidad : 0);
      });

      const otros = parseFloat(state.otrosAjustes.valor || '0');
      if (!Number.isNaN(otros)) total += otros;

      return total.toFixed(2);
    }, [state]);

    const agregarServicio = useCallback(
      (servicio: string, peso: number) => {
        const precio = calcularPrecioEnvio(servicio, peso);
        if (precio === 0 && servicio === 'HOY') {
          alert(TEXTS.tarifarios.common.alerts.hoyContact);
          return;
        }
        setState((prev) => ({
          ...prev,
          serviciosSeleccionados: [...prev.serviciosSeleccionados, { servicio, peso, cantidad: 1, precio }],
        }));
      },
      [calcularPrecioEnvio]
    );

    const agregarSuplementoPeso = useCallback((descripcion: string, precio: number) => {
      setState((prev) => ({
        ...prev,
        suplementosPeso: [...prev.suplementosPeso, { descripcion, precio, cantidad: 1 }],
      }));
    }, []);

    const agregarSuplementoDimension = useCallback((rango: string, precio: number) => {
      setState((prev) => ({
        ...prev,
        suplementosDimensiones: [...prev.suplementosDimensiones, { descripcion: `Suplemento ${rango}`, precio, cantidad: 1 }],
      }));
    }, []);

    const agregarServicioAdicional = useCallback((concepto: string, precio: number) => {
      setState((prev) => ({
        ...prev,
        serviciosAdicionales: [...prev.serviciosAdicionales, { concepto, precio, cantidad: 1 }],
      }));
    }, []);

    const eliminarServicio = useCallback((index: number) => {
      setState((prev) => ({
        ...prev,
        serviciosSeleccionados: prev.serviciosSeleccionados.filter((_, i) => i !== index),
      }));
    }, []);

    const eliminarSuplementoPeso = useCallback((index: number) => {
      setState((prev) => ({
        ...prev,
        suplementosPeso: prev.suplementosPeso.filter((_, i) => i !== index),
      }));
    }, []);

    const eliminarSuplementoDimension = useCallback((index: number) => {
      setState((prev) => ({
        ...prev,
        suplementosDimensiones: prev.suplementosDimensiones.filter((_, i) => i !== index),
      }));
    }, []);

    const eliminarServicioAdicional = useCallback((index: number) => {
      setState((prev) => ({
        ...prev,
        serviciosAdicionales: prev.serviciosAdicionales.filter((_, i) => i !== index),
      }));
    }, []);

    const actualizarServicio = useCallback((index: number, patch: Partial<ServicioSeleccionado>) => {
      setState((prev) => ({
        ...prev,
        serviciosSeleccionados: prev.serviciosSeleccionados.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      }));
    }, []);

    const actualizarSuplementoPeso = useCallback((index: number, patch: Partial<Suplemento>) => {
      setState((prev) => ({
        ...prev,
        suplementosPeso: prev.suplementosPeso.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      }));
    }, []);

    const actualizarSuplementoDimension = useCallback((index: number, patch: Partial<Suplemento>) => {
      setState((prev) => ({
        ...prev,
        suplementosDimensiones: prev.suplementosDimensiones.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      }));
    }, []);

    const actualizarServicioAdicional = useCallback((index: number, patch: Partial<ServicioAdicional>) => {
      setState((prev) => ({
        ...prev,
        serviciosAdicionales: prev.serviciosAdicionales.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      }));
    }, []);

    const generarPDF = useCallback(async () => {
      if (!pageRef.current) return;

      setGenerandoPDF(true);

      try {
        const [html2canvasModule, jsPDFModule] = await Promise.all([import('html2canvas'), import('jspdf')]);
        const html2canvas = html2canvasModule.default;
        const { jsPDF } = jsPDFModule;

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

              const hasUnsupportedColor = (color: string) =>
                color && (color.includes('oklch') || color.includes('oklab') || color.includes('lch') || color.includes('lab'));

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
          },
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
        const fileName = `tarifario-mensajeria-express-2026${slug}.pdf`;

        pdf.save(fileName);

        const itemsEmail = [
          ...state.serviciosSeleccionados.map((s) => ({
            nombre: `${s.servicio} (${s.peso}kg)`,
            cantidad: s.cantidad,
            precio: s.precio,
          })),
          ...state.suplementosPeso.map((s) => ({
            nombre: s.descripcion,
            cantidad: s.cantidad,
            precio: s.precio,
          })),
          ...state.suplementosDimensiones.map((s) => ({
            nombre: s.descripcion,
            cantidad: s.cantidad,
            precio: s.precio,
          })),
          ...state.serviciosAdicionales.map((s) => ({
            nombre: s.concepto,
            cantidad: s.cantidad,
            precio: s.precio,
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
          tarifario: 'Mensajería Express',
          total: totalEstimado,
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
    }, [state.nombreCliente, state.logoCliente]);

    const handleLogoClienteChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert(TEXTS.tarifarios.common.alerts.logoTooLarge);
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setState((prev) => ({ ...prev, logoCliente: reader.result as string }));
      };
      reader.onerror = () => {
        alert(TEXTS.tarifarios.common.alerts.logoLoadError);
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }, []);

    const eliminarLogoCliente = useCallback(() => {
      setState((prev) => ({ ...prev, logoCliente: null }));
    }, []);

    return (
      <div className="min-h-screen bg-gray-50">
        <div ref={pageRef} className="max-w-[1200px] mx-auto bg-white shadow-lg">
          <div className={`bg-[#000935] text-white py-4 px-6 ${generandoPDF ? 'rounded-t-lg' : ''}`}>
            <div className="max-w-[1200px] mx-auto">
              <div className="text-center">
                <h1 className="tracking-wide mb-1">
                  {generandoPDF ? TEXTS.tarifarios.mensajeriaExpress.title.pdf : TEXTS.tarifarios.mensajeriaExpress.title.normal}
                </h1>
                <p className="text-[#00C9CE] text-xs">{TEXTS.tarifarios.mensajeriaExpress.subtitle}</p>
              </div>
            </div>
          </div>

          {generandoPDF ? (
            <div className="max-w-[1200px] mx-auto p-8 space-y-6">
              {state.nombreCliente && (
                <div className="border-3 border-[#00C9CE] rounded-lg p-6 bg-white flex items-center justify-between">
                  <div className="text-[#00C9CE] text-sm">Cliente</div>
                  <div className="text-lg text-[#000935]">{state.nombreCliente}</div>
                </div>
              )}

              <div className="border-2 border-[#000935] rounded-lg overflow-hidden">
                <div className="bg-[#000935] text-white px-6 py-3">
                  <h3 className="text-base">Desglose de Servicios</h3>
                </div>
                <div className="p-6 bg-white space-y-6">
                  {state.serviciosSeleccionados.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-[#00C9CE]" />
                        <h4 className="text-[#00C9CE] text-sm">Servicios Express</h4>
                      </div>
                      <div>
                        <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                          <div className="col-span-6">Concepto</div>
                          <div className="col-span-2 text-center">Cantidad</div>
                          <div className="col-span-2 text-right">Precio Unit.</div>
                          <div className="col-span-2 text-right">Subtotal</div>
                        </div>
                        {state.serviciosSeleccionados.map((s, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                            <div className="col-span-6">
                              <div className="text-[#000935]">
                                Servicio {s.servicio} – {s.peso} kg
                              </div>
                              <div className="text-xs text-gray-500">Mensajería Express</div>
                            </div>
                            <div className="col-span-2 text-center">{s.cantidad}</div>
                            <div className="col-span-2 text-right">{s.precio.toFixed(2)} €</div>
                            <div className="col-span-2 text-right text-[#00C9CE] font-medium">{(s.precio * s.cantidad).toFixed(2)} €</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {state.suplementosPeso.length > 0 && (
                    <div>
                      <h4 className="text-[#000935] text-sm mb-3">Suplementos por Peso</h4>
                      <div>
                        <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                          <div className="col-span-6">Concepto</div>
                          <div className="col-span-2 text-center">Cantidad</div>
                          <div className="col-span-2 text-right">Precio Unit.</div>
                          <div className="col-span-2 text-right">Subtotal</div>
                        </div>
                        {state.suplementosPeso.map((s, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                            <div className="col-span-6 text-[#000935]">{s.descripcion}</div>
                            <div className="col-span-2 text-center">{s.cantidad}</div>
                            <div className="col-span-2 text-right">{s.precio.toFixed(2)} €</div>
                            <div className="col-span-2 text-right text-[#00C9CE] font-medium">{(s.precio * s.cantidad).toFixed(2)} €</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {state.suplementosDimensiones.length > 0 && (
                    <div>
                      <h4 className="text-[#000935] text-sm mb-3">Suplementos por Dimensiones</h4>
                      <div>
                        <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                          <div className="col-span-6">Concepto</div>
                          <div className="col-span-2 text-center">Cantidad</div>
                          <div className="col-span-2 text-right">Precio Unit.</div>
                          <div className="col-span-2 text-right">Subtotal</div>
                        </div>
                        {state.suplementosDimensiones.map((s, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                            <div className="col-span-6 text-[#000935]">{s.descripcion}</div>
                            <div className="col-span-2 text-center">{s.cantidad}</div>
                            <div className="col-span-2 text-right">{s.precio.toFixed(2)} €</div>
                            <div className="col-span-2 text-right text-[#00C9CE] font-medium">{(s.precio * s.cantidad).toFixed(2)} €</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {state.serviciosAdicionales.length > 0 && (
                    <div>
                      <h4 className="text-[#000935] text-sm mb-3">Servicios Adicionales</h4>
                      <div>
                        <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                          <div className="col-span-6">Concepto</div>
                          <div className="col-span-2 text-center">Cantidad</div>
                          <div className="col-span-2 text-right">Precio Unit.</div>
                          <div className="col-span-2 text-right">Subtotal</div>
                        </div>
                        {state.serviciosAdicionales.map((s, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-4 py-3 text-sm">
                            <div className="col-span-6 text-[#000935]">{s.concepto}</div>
                            <div className="col-span-2 text-center">{s.cantidad}</div>
                            <div className="col-span-2 text-right">{s.precio.toFixed(2)} €</div>
                            <div className="col-span-2 text-right text-[#00C9CE] font-medium">{(s.precio * s.cantidad).toFixed(2)} €</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {state.otrosAjustes.valor !== '' && parseFloat(state.otrosAjustes.valor || '0') !== 0 && (
                    <div>
                      <h4 className="text-[#000935] text-sm mb-3">Otros Ajustes</h4>
                      <div>
                        <div className="grid grid-cols-12 gap-4 py-2 text-xs text-gray-600">
                          <div className="col-span-10">Concepto</div>
                          <div className="col-span-2 text-right">Importe</div>
                        </div>
                        <div className="grid grid-cols-12 gap-4 py-3 text-sm">
                          <div className="col-span-10 text-[#000935]">{state.otrosAjustes.concepto || 'Ajustes adicionales'}</div>
                          <div
                            className={`col-span-2 text-right font-medium ${
                              parseFloat(state.otrosAjustes.valor || '0') < 0 ? 'text-red-600' : 'text-[#00C9CE]'
                            }`}
                          >
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
                    <div className="text-[#000935] text-sm">Total del presupuesto</div>
                    <div className="text-xs text-gray-500">(sin IVA)</div>
                  </div>
                  <div className="text-[#00C9CE] text-4xl font-medium">{totalEstimado} €</div>
                </div>
              </div>

              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
                  <h3 className="text-[#000935] text-base">{TEXTS.tarifarios.common.conditions.title}</h3>
                </div>
                <div className="p-6 bg-white">
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>{TEXTS.tarifarios.common.conditions.pricesWithoutVAT}</p>
                    <p>{TEXTS.tarifarios.common.conditions.scope}</p>
                    <p>{TEXTS.tarifarios.common.conditions.validYear}</p>
                    <p>{TEXTS.tarifarios.common.conditions.volumetricWeight}</p>
                    <p>{TEXTS.tarifarios.common.conditions.basicInsurance}</p>
                    <p>{TEXTS.tarifarios.common.conditions.cumulativeSurcharges}</p>
                    <p>{TEXTS.tarifarios.common.conditions.quoteValidity}</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-600 space-y-1 pt-4">
                <p>{TEXTS.tarifarios.common.legalFooter}</p>
              </div>
            </div>
          ) : (
            <div className="max-w-[1200px] mx-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                <div className="space-y-6">
                  <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                    <CardHeader className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors" onClick={() => setCatalogoAbierto(!catalogoAbierto)}>
                      <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                        <span className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Catálogo de Servicios Express
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${catalogoAbierto ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                    {catalogoAbierto && (
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Servicio</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead>Uso recomendado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {servicios.map((s, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="text-[#00C9CE] font-medium">{s.nombre}</TableCell>
                                <TableCell>{s.descripcion}</TableCell>
                                <TableCell className="text-sm text-gray-600">{s.uso}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>

                  <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                    <CardHeader className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors" onClick={() => setTarifasPesoAbierto(!tarifasPesoAbierto)}>
                      <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                        <span className="flex items-center gap-2">
                          <Weight className="h-5 w-5" />
                          Tarifas por Peso (€)
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${tarifasPesoAbierto ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                    {tarifasPesoAbierto && (
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Servicio</TableHead>
                              <TableHead className="text-right">Hasta 2kg</TableHead>
                              <TableHead className="text-right">Hasta 5kg</TableHead>
                              <TableHead className="text-right">Hasta 10kg</TableHead>
                              <TableHead className="text-right">Kg adicional</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(tarifasPorPeso).map(([servicio, tarifa]) => (
                              <TableRow key={servicio}>
                                <TableCell className="text-[#00C9CE] font-medium">{servicio}</TableCell>

                                <TableCell
                                  className="text-right cursor-pointer hover:bg-[#00C9CE]/10 transition-colors font-medium"
                                  onClick={() => {
                                    if (tarifa.hasta2kg !== 'Consultar') agregarServicio(servicio, 2);
                                  }}
                                >
                                  {typeof tarifa.hasta2kg === 'number' ? tarifa.hasta2kg.toFixed(2) : tarifa.hasta2kg}
                                </TableCell>

                                <TableCell
                                  className="text-right cursor-pointer hover:bg-[#00C9CE]/10 transition-colors font-medium"
                                  onClick={() => {
                                    if (tarifa.hasta5kg !== 'Consultar') agregarServicio(servicio, 5);
                                  }}
                                >
                                  {typeof tarifa.hasta5kg === 'number' ? tarifa.hasta5kg.toFixed(2) : tarifa.hasta5kg}
                                </TableCell>

                                <TableCell
                                  className="text-right cursor-pointer hover:bg-[#00C9CE]/10 transition-colors font-medium"
                                  onClick={() => {
                                    if (tarifa.hasta10kg !== 'Consultar') agregarServicio(servicio, 10);
                                  }}
                                >
                                  {typeof tarifa.hasta10kg === 'number' ? tarifa.hasta10kg.toFixed(2) : tarifa.hasta10kg}
                                </TableCell>

                                <TableCell
                                  className="text-right cursor-pointer hover:bg-[#00C9CE]/10 transition-colors font-medium"
                                  onClick={() => {
                                    if (tarifa.kgAdicional !== 'Consultar') agregarServicio(servicio, 15);
                                  }}
                                >
                                  {typeof tarifa.kgAdicional === 'number' ? tarifa.kgAdicional.toFixed(2) : tarifa.kgAdicional}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>

                  <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                    <CardHeader className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors" onClick={() => setSuplementosPesoAbierto(!suplementosPesoAbierto)}>
                      <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                        <span className="flex items-center gap-2">
                          <Truck className="h-5 w-5" />
                          Suplementos por Peso
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${suplementosPesoAbierto ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                    {suplementosPesoAbierto && (
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Descripción</TableHead>
                              <TableHead className="text-right">Precio (€)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {suplementosPesoData.map((s, idx) => (
                              <TableRow
                                key={idx}
                                onClick={() => agregarSuplementoPeso(s.descripcion, s.precio)}
                                className="cursor-pointer transition-colors hover:bg-[#00C9CE]/10"
                              >
                                <TableCell>{s.descripcion}</TableCell>
                                <TableCell className="text-right font-medium">{s.precio.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>

                  <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                    <CardHeader className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors" onClick={() => setSuplementosDimAbierto(!suplementosDimAbierto)}>
                      <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                        <span className="flex items-center gap-2">
                          <Ruler className="h-5 w-5" />
                          Suplementos por Dimensiones
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${suplementosDimAbierto ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                    {suplementosDimAbierto && (
                      <CardContent className="pt-6">
                        <div className="text-sm text-gray-700 mb-3 bg-blue-50 p-3 rounded border border-blue-200">
                          <strong>Medición:</strong> Suma de largo + ancho + alto (cm)
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rango (cm)</TableHead>
                              <TableHead className="text-right">Precio (€)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {suplementosDimensionesData.map((s, idx) => (
                              <TableRow
                                key={idx}
                                onClick={() => agregarSuplementoDimension(s.rango, s.precio)}
                                className="cursor-pointer transition-colors hover:bg-[#00C9CE]/10"
                              >
                                <TableCell>{s.rango}</TableCell>
                                <TableCell className="text-right font-medium">{s.precio.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>

                  <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                    <CardHeader className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors" onClick={() => setAdicionalesAbierto(!adicionalesAbierto)}>
                      <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                        <span className="flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Servicios Adicionales
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${adicionalesAbierto ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                    {adicionalesAbierto && (
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Concepto</TableHead>
                              <TableHead className="text-right">Precio</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {serviciosAdicionalesData.map((s, idx) => (
                              <TableRow
                                key={idx}
                                onClick={() => agregarServicioAdicional(s.concepto, s.precio)}
                                className="cursor-pointer transition-colors hover:bg-[#00C9CE]/10"
                              >
                                <TableCell>{s.concepto}</TableCell>
                                <TableCell className="text-right font-medium">{s.precio > 0 ? `${s.precio.toFixed(2)} €` : 'Variable'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>

                  <Card className="border-2 border-[#00C9CE] overflow-hidden rounded-lg">
                    <CardHeader className="bg-[#00C9CE]/10 cursor-pointer hover:bg-[#00C9CE]/20 transition-colors" onClick={() => setCondicionesAbierto(!condicionesAbierto)}>
                      <CardTitle className="flex items-center justify-between text-[#00C9CE]">
                        <span className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Condiciones Comerciales
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${condicionesAbierto ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                    {condicionesAbierto && (
                      <CardContent className="pt-6">
                        <div className="bg-blue-50 p-4 rounded border border-blue-200 text-sm space-y-3">
                          <ul className="space-y-2 ml-5 list-disc">
                            <li>Precios sin IVA</li>
                            <li>Ámbito: Península Ibérica</li>
                            <li>Tarifas válidas para 2026</li>
                            <li>Peso volumétrico: (L × A × H cm) / 5000</li>
                            <li>Seguro básico incluido hasta 300 €</li>
                            <li>Facturación mensual por defecto</li>
                          </ul>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>

                <Card className="border-2 border-[#00C9CE] shadow-lg overflow-hidden rounded-lg">
                  <CardHeader className="bg-[#00C9CE] text-white">
                    <CardTitle className="text-white text-center uppercase">PRESUPUESTO</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <Label htmlFor="nombreCliente">Nombre del cliente</Label>
                      <Input
                        id="nombreCliente"
                        type="text"
                        placeholder="Ej: Empresa SL"
                        value={state.nombreCliente}
                        onChange={(e) => setState((prev) => ({ ...prev, nombreCliente: e.target.value }))}
                        className="border-[#00C9CE] focus-visible:ring-[#00C9CE]"
                      />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <Label htmlFor="logoCliente">Logo del cliente</Label>
                      {!state.logoCliente ? (
                        <div>
                          <Input id="logoCliente" type="file" accept=".png,.jpg,.jpeg,.svg" onChange={handleLogoClienteChange} className="border-[#00C9CE] focus-visible:ring-[#00C9CE]" />
                          <p className="text-xs text-gray-600 mt-2">Formatos: PNG, JPG, SVG (Máx. 5MB)</p>
                        </div>
                      ) : (
                        <div className="bg-white border-2 border-[#00C9CE] rounded-lg p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img src={state.logoCliente} alt="Logo del cliente" className="h-12 w-auto max-w-[100px] object-contain" />
                              <span className="text-sm text-gray-600">Logo cargado</span>
                            </div>
                            <button onClick={eliminarLogoCliente} className="text-red-500 hover:text-red-700 p-1" title={TEXTS.tarifarios.common.actions.deleteLogo}>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <Label className="flex items-center justify-between">
                        <span>Servicios Express</span>
                        <span className="text-xs text-gray-600">Haz clic en las tablas</span>
                      </Label>

                      {state.serviciosSeleccionados.length === 0 ? (
                        <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded text-center">
                          No hay servicios seleccionados.
                          <br />
                          Haz clic en las celdas de precio para agregar.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {state.serviciosSeleccionados.map((s, idx) => (
                            <div key={idx} className="bg-white border-2 border-[#00C9CE] rounded-lg p-3 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <Label htmlFor={`servicio-${idx}`} className="text-xs">
                                      Servicio
                                    </Label>
                                    <Input
                                      id={`servicio-${idx}`}
                                      type="text"
                                      value={`${s.servicio} – ${s.peso} kg`}
                                      onChange={(e) => {
                                        const partes = e.target.value.split('–');
                                        if (partes.length >= 2) {
                                          const srv = partes[0]?.trim() || s.servicio;
                                          const pesoMatch = partes[1].match(/\d+/);
                                          const peso = pesoMatch ? parseInt(pesoMatch[0], 10) : s.peso;
                                          actualizarServicio(idx, { servicio: srv, peso });
                                        }
                                      }}
                                      className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                    />
                                  </div>
                                </div>

                                <button onClick={() => eliminarServicio(idx)} className="text-red-500 hover:text-red-700 p-1" title={TEXTS.tarifarios.common.actions.delete}>
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label htmlFor={`cant-srv-${idx}`} className="text-xs">
                                    Cantidad
                                  </Label>
                                  <Input
                                    id={`cant-srv-${idx}`}
                                    type="number"
                                    min="1"
                                    value={s.cantidad}
                                    onChange={(e) => {
                                      const n = parseInt(e.target.value, 10);
                                      actualizarServicio(idx, { cantidad: Number.isFinite(n) && n > 0 ? n : 1 });
                                    }}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`precio-srv-${idx}`} className="text-xs">
                                    Precio €
                                  </Label>
                                  <Input
                                    id={`precio-srv-${idx}`}
                                    type="number"
                                    step="0.01"
                                    value={s.precio}
                                    onChange={(e) => {
                                      const n = parseFloat(e.target.value);
                                      actualizarServicio(idx, { precio: Number.isFinite(n) ? n : 0 });
                                    }}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                  />
                                </div>
                              </div>

                              <div className="text-right text-sm pt-1 border-t border-gray-200">
                                <span className="text-gray-600">Subtotal: </span>
                                <span className="font-medium text-[#00C9CE]">{(s.precio * s.cantidad).toFixed(2)} €</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {state.suplementosPeso.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <Label>Suplementos por Peso</Label>
                        <div className="space-y-2">
                          {state.suplementosPeso.map((s, idx) => (
                            <div key={idx} className="bg-white border-2 border-[#00C9CE] rounded-lg p-3 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-[#000935]">{s.descripcion}</div>
                                </div>
                                <button onClick={() => eliminarSuplementoPeso(idx)} className="text-red-500 hover:text-red-700 p-1" title={TEXTS.tarifarios.common.actions.delete}>
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label htmlFor={`cant-peso-${idx}`} className="text-xs">
                                    Cantidad
                                  </Label>
                                  <Input
                                    id={`cant-peso-${idx}`}
                                    type="number"
                                    min="1"
                                    value={s.cantidad}
                                    onChange={(e) => {
                                      const n = parseInt(e.target.value, 10);
                                      actualizarSuplementoPeso(idx, { cantidad: Number.isFinite(n) && n > 0 ? n : 1 });
                                    }}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`precio-peso-${idx}`} className="text-xs">
                                    Precio €
                                  </Label>
                                  <Input
                                    id={`precio-peso-${idx}`}
                                    type="number"
                                    step="0.01"
                                    value={s.precio}
                                    onChange={(e) => {
                                      const n = parseFloat(e.target.value);
                                      actualizarSuplementoPeso(idx, { precio: Number.isFinite(n) ? n : 0 });
                                    }}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                  />
                                </div>
                              </div>

                              <div className="text-right text-sm pt-1 border-t border-gray-200">
                                <span className="text-gray-600">Subtotal: </span>
                                <span className="font-medium text-[#00C9CE]">{(s.precio * s.cantidad).toFixed(2)} €</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {state.suplementosDimensiones.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <Label>Suplementos por Dimensiones</Label>
                        <div className="space-y-2">
                          {state.suplementosDimensiones.map((s, idx) => (
                            <div key={idx} className="bg-white border-2 border-[#00C9CE] rounded-lg p-3 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-[#000935]">{s.descripcion}</div>
                                </div>
                                <button onClick={() => eliminarSuplementoDimension(idx)} className="text-red-500 hover:text-red-700 p-1" title={TEXTS.tarifarios.common.actions.delete}>
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label htmlFor={`cant-dim-${idx}`} className="text-xs">
                                    Cantidad
                                  </Label>
                                  <Input
                                    id={`cant-dim-${idx}`}
                                    type="number"
                                    min="1"
                                    value={s.cantidad}
                                    onChange={(e) => {
                                      const n = parseInt(e.target.value, 10);
                                      actualizarSuplementoDimension(idx, { cantidad: Number.isFinite(n) && n > 0 ? n : 1 });
                                    }}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`precio-dim-${idx}`} className="text-xs">
                                    Precio €
                                  </Label>
                                  <Input
                                    id={`precio-dim-${idx}`}
                                    type="number"
                                    step="0.01"
                                    value={s.precio}
                                    onChange={(e) => {
                                      const n = parseFloat(e.target.value);
                                      actualizarSuplementoDimension(idx, { precio: Number.isFinite(n) ? n : 0 });
                                    }}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                  />
                                </div>
                              </div>

                              <div className="text-right text-sm pt-1 border-t border-gray-200">
                                <span className="text-gray-600">Subtotal: </span>
                                <span className="font-medium text-[#00C9CE]">{(s.precio * s.cantidad).toFixed(2)} €</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {state.serviciosAdicionales.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <Label>Servicios Adicionales</Label>
                        <div className="space-y-2">
                          {state.serviciosAdicionales.map((s, idx) => (
                            <div key={idx} className="bg-white border-2 border-[#00C9CE] rounded-lg p-3 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-[#000935]">{s.concepto}</div>
                                </div>
                                <button onClick={() => eliminarServicioAdicional(idx)} className="text-red-500 hover:text-red-700 p-1" title={TEXTS.tarifarios.common.actions.delete}>
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label htmlFor={`cant-adic-${idx}`} className="text-xs">
                                    Cantidad
                                  </Label>
                                  <Input
                                    id={`cant-adic-${idx}`}
                                    type="number"
                                    min="1"
                                    value={s.cantidad}
                                    onChange={(e) => {
                                      const n = parseInt(e.target.value, 10);
                                      actualizarServicioAdicional(idx, { cantidad: Number.isFinite(n) && n > 0 ? n : 1 });
                                    }}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`precio-adic-${idx}`} className="text-xs">
                                    Precio €
                                  </Label>
                                  <Input
                                    id={`precio-adic-${idx}`}
                                    type="number"
                                    step="0.01"
                                    value={s.precio}
                                    onChange={(e) => {
                                      const n = parseFloat(e.target.value);
                                      actualizarServicioAdicional(idx, { precio: Number.isFinite(n) ? n : 0 });
                                    }}
                                    className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm h-8"
                                  />
                                </div>
                              </div>

                              <div className="text-right text-sm pt-1 border-t border-gray-200">
                                <span className="text-gray-600">Subtotal: </span>
                                <span className="font-medium text-[#00C9CE]">{(s.precio * s.cantidad).toFixed(2)} €</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="text-sm mb-2">
                          <strong>Otros ajustes</strong>
                          <span className="block text-xs text-gray-600 mt-1">(descuentos, suplementos especiales, etc.)</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="otrosAjustesConcepto" className="text-xs">
                              Concepto
                            </Label>
                            <Input
                              id="otrosAjustesConcepto"
                              type="text"
                              placeholder="Ej: Descuento especial..."
                              value={state.otrosAjustes.concepto}
                              onChange={(e) => setState((prev) => ({ ...prev, otrosAjustes: { ...prev.otrosAjustes, concepto: e.target.value } }))}
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
                                  setState((prev) => ({ ...prev, otrosAjustes: { ...prev.otrosAjustes, valor: value } }));
                                }
                              }}
                              className="border-[#00C9CE] focus-visible:ring-[#00C9CE] text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#000935] text-white p-4 rounded-lg flex items-center justify-between">
                      <span className="text-lg">Total estimado:</span>
                      <span className="text-[#00C9CE] text-xl">{totalEstimado} €</span>
                    </div>

                    <button
                      onClick={generarPDF}
                      className="w-full bg-[#00C9CE] hover:bg-[#00C9CE]/90 text-white py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Enviar solicitud
                    </button>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gray-100 p-6 rounded-lg text-center text-sm text-gray-700 space-y-2 mt-8">
                <p>
                  <strong>ONUS Express SL</strong> · www.onusexpress.com · Carrer d'Anselm Clavé, s/n, Nave 24 – PI Matacás – 08980 Sant Feliu de Llobregat,
                  Barcelona · NIF: B72735277
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TarifarioMensajeriaExpress.displayName = 'TarifarioMensajeriaExpress';
