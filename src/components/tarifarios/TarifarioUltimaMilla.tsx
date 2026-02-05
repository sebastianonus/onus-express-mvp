import { useState, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Truck, Clock, Download, X, ChevronDown, Package, MapPin, FileText, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { TEXTS } from '@/content/texts';
import { toast } from 'sonner';
import { supabase } from '../../supabase';

export interface TarifarioUltimaMillaHandle {
  resetear: () => void;
}

interface TarifarioUltimaMillaProps {
  isAdmin?: boolean;
  nombreCliente?: string;
}

export const TarifarioUltimaMilla = forwardRef<
  TarifarioUltimaMillaHandle,
  TarifarioUltimaMillaProps
>(({ isAdmin = false }, ref) => {
  const getInitialState = () => ({
    nombreCliente: '',
    vehiculosSeleccionados: [] as any[],
    tramosSeleccionados: [] as any[],
    extrasSeleccionados: [] as any[],
    otrosAjustes: { concepto: '', valor: '' },
  });

  const [state, setState] = useState(getInitialState());
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [vehiculosAbierto, setVehiculosAbierto] = useState(true);
  const [jornadaCompletaAbierto, setJornadaCompletaAbierto] = useState(false);
  const [refuerzosAbierto, setRefuerzosAbierto] = useState(false);
  const [tramosAbierto, setTramosAbierto] = useState(false);
  const [extrasAbierto, setExtrasAbierto] = useState(false);
  const [especialesAbierto, setEspecialesAbierto] = useState(false);
  const [condicionesAbierto, setCondicionesAbierto] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    resetear: () => setState(getInitialState()),
  }));

  const vehiculos = useMemo(
    () => [
      { tipo: 'Tipo A (3 m³ – 1 pallet)', mediaJornada: '90', jornadaCompleta: '160', refuerzo: '80' },
      { tipo: 'Tipo B (6 m³ – 2 pallets)', mediaJornada: '95', jornadaCompleta: '170', refuerzo: '90' },
      { tipo: 'Tipo C (12 m³)', mediaJornada: '100', jornadaCompleta: '180', refuerzo: '100' },
      { tipo: 'Tipo D (Carrozado)', mediaJornada: '120', jornadaCompleta: '220', refuerzo: '110' },
      { tipo: 'Tipo E (Moto)', mediaJornada: '65', jornadaCompleta: '110', refuerzo: '50' },
      { tipo: 'Tipo F (Bici)', mediaJornada: '55', jornadaCompleta: '90', refuerzo: '40' },
    ],
    []
  );

  const tramosKm = useMemo(
    () => [
      { nombre: 'Tramo 1 (00–100 km)', valor: 0 },
      { nombre: 'Tramo 2 (100–200 km)', valor: 10 },
      { nombre: 'Tramo 3 (+200 km)', valor: 15 },
      { nombre: 'Tramo 4 (+300 km)', valor: 20 },
    ],
    []
  );

  const calcularTotal = () => {
    let total = 0;
    state.vehiculosSeleccionados.forEach((v: any) => (total += v.precio * v.cantidad));
    state.tramosSeleccionados.forEach((t: any) => (total += t.valor));
    state.extrasSeleccionados.forEach((e: any) => (total += e.precio * e.cantidad));
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
      pdf.save('presupuesto-ultima-milla.pdf');
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
          tipo: 'ultima_milla',
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
        {/* … TODO EL TARIFARIO SIN CAMBIOS VISUALES … */}

        <div className="bg-[#000935] text-white p-4 rounded-lg flex justify-between items-center">
          <span>{TEXTS.tarifarios.common.total.estimatedLabel}</span>
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

TarifarioUltimaMilla.displayName = 'TarifarioUltimaMilla';
