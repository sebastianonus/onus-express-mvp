import { useState, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Download, X, Package, Truck, ChevronDown, Zap, Weight, Ruler, Plus, FileText, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { TEXTS } from '@/content/texts';
import { toast } from 'sonner';
import { supabase } from '../../supabase';

export interface TarifarioMensajeriaExpressHandle {
  resetear: () => void;
}

interface TarifarioMensajeriaExpressProps {
  isAdmin?: boolean;
}

export const TarifarioMensajeriaExpress = forwardRef<
  TarifarioMensajeriaExpressHandle,
  TarifarioMensajeriaExpressProps
>(({ isAdmin = false }, ref) => {
  const getInitialState = () => ({
    nombreCliente: '',
    serviciosSeleccionados: [] as any[],
    suplementosPeso: [] as any[],
    suplementosDimensiones: [] as any[],
    serviciosAdicionales: [] as any[],
    otrosAjustes: { concepto: '', valor: '' },
  });

  const [state, setState] = useState(getInitialState());
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [catalogoAbierto, setCatalogoAbierto] = useState(true);
  const [tarifasPesoAbierto, setTarifasPesoAbierto] = useState(true);
  const [suplementosPesoAbierto, setSuplementosPesoAbierto] = useState(false);
  const [suplementosDimAbierto, setSuplementosDimAbierto] = useState(false);
  const [adicionalesAbierto, setAdicionalesAbierto] = useState(false);
  const [condicionesAbierto, setCondicionesAbierto] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    resetear: () => setState(getInitialState()),
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

  const tarifasPorPeso: Record<string, any> = useMemo(
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

  const calcularTotal = () => {
    let total = 0;
    state.serviciosSeleccionados.forEach((s: any) => (total += s.precio * s.cantidad));
    state.suplementosPeso.forEach((s: any) => (total += s.precio * s.cantidad));
    state.suplementosDimensiones.forEach((s: any) => (total += s.precio * s.cantidad));
    state.serviciosAdicionales.forEach((s: any) => (total += s.precio * s.cantidad));
    total += parseFloat(state.otrosAjustes.valor || '0');
    return total.toFixed(2);
  };

  const generarPDF = async () => {
    if (!pageRef.current) return;
    setGenerandoPDF(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(pageRef.current, { scale: 2, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');

      const width = pdf.internal.pageSize.getWidth() - 60;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', 30, 30, width, height);
      pdf.save('presupuesto-mensajeria-express.pdf');
    } catch {
      toast.error('Error al generar el PDF');
    } finally {
      setGenerandoPDF(false);
    }
  };

  const enviarPresupuesto = async () => {
    if (!state.nombreCliente) {
      toast.error('Indica el nombre del cliente');
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase.functions.invoke('send-presupuesto-email', {
        body: {
          tipo: 'mensajeria_express',
          cliente: state.nombreCliente,
          total: calcularTotal(),
          detalle: state,
        },
      });

      if (error) throw error;
      toast.success('Presupuesto enviado correctamente');
    } catch (err: any) {
      toast.error(err?.message || 'Error al enviar el presupuesto');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div ref={pageRef} className="max-w-[1200px] mx-auto bg-white shadow-lg p-6">
        {/* CONTENIDO VISUAL SIN CAMBIOS */}
        <div className="bg-[#000935] text-white p-4 rounded-lg flex justify-between items-center">
          <span>Total estimado</span>
          <span className="text-[#00C9CE] text-xl">{calcularTotal()} €</span>
        </div>

        <div className="space-y-3 mt-4">
          <Button
            onClick={enviarPresupuesto}
            disabled={enviando}
            className="w-full bg-[#00C9CE] text-white flex gap-2"
          >
            <Send className="h-4 w-4" />
            {TEXTS.tarifarios.common.cta.sendRequest}
          </Button>

          <Button
            variant="outline"
            onClick={generarPDF}
            disabled={generandoPDF}
            className="w-full flex gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar resumen (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
});

TarifarioMensajeriaExpress.displayName = 'TarifarioMensajeriaExpress';
