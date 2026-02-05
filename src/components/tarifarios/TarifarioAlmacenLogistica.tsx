import { useState, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Warehouse,
  Package,
  Download,
  X,
  ChevronDown,
  Truck,
  MapPin,
  Hand,
  PackageCheck,
  Send,
  ClipboardList,
  FileText,
  FileCheck
} from 'lucide-react';
import { Button } from '../ui/button';
import { TEXTS } from '@/content/texts';

export interface TarifarioAlmacenLogisticaHandle {
  resetear: () => void;
}

interface TarifarioAlmacenLogisticaProps {
  isAdmin?: boolean;
  nombreCliente?: string;
}

export const TarifarioAlmacenLogistica = forwardRef<
  TarifarioAlmacenLogisticaHandle,
  TarifarioAlmacenLogisticaProps
>(({ isAdmin = false, nombreCliente }, ref) => {
  const getInitialState = () => ({
    nombreCliente: '',
    almacenajeSeleccionado: [] as Array<{ tipo: string; descripcion: string; precio: number; cantidad: number }>,
    recepcionSeleccionada: [] as Array<{ servicio: string; precio: number; cantidad: number }>,
    ubicacionSeleccionada: [] as Array<{ servicio: string; precio: number; cantidad: number }>,
    pickingSeleccionado: [] as Array<{ tipo: string; precio: number; cantidad: number }>,
    packingSeleccionado: [] as Array<{ servicio: string; precio: number; cantidad: number }>,
    despachoSeleccionado: [] as Array<{ servicio: string; precio: number; cantidad: number }>,
    inventariosSeleccionados: [] as Array<{ servicio: string; precio: number; cantidad: number }>,
    extrasSeleccionados: [] as Array<{ concepto: string; precio: number; cantidad: number }>,
    otrosAjustes: { concepto: '', valor: '' }
  });

  const [state, setState] = useState(getInitialState());
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const [
    almacenajeAbierto,
    recepcionAbierto,
    ubicacionAbierto,
    pickingAbierto,
    packingAbierto,
    despachoAbierto,
    inventariosAbierto,
    extrasAbierto,
    condicionesAbierto
  ] = [
    useState(true)[0],
    useState(false)[0],
    useState(false)[0],
    useState(false)[0],
    useState(false)[0],
    useState(false)[0],
    useState(false)[0],
    useState(false)[0],
    useState(false)[0]
  ];

  const handleActualizar = () => setState(getInitialState());

  useImperativeHandle(ref, () => ({ resetear: handleActualizar }));

  const almacenajeData = useMemo(
    () => [
      { tipo: 'Pallet en rack (Industrial)', descripcion: 'EURO 80x120, custodia en rack', precio: '16.00', unidad: 'pallet/mes' },
      { tipo: 'Pallet en suelo (Industrial)', descripcion: 'EURO 80x120, almacenaje en suelo', precio: '13.00', unidad: 'pallet/mes' },
      { tipo: 'Pallet estándar (E-commerce)', descripcion: 'EURO 80x120', precio: '14.00', unidad: 'pallet/mes' },
      { tipo: 'Pallet técnico', descripcion: 'Almacenaje especializado', precio: '15.50', unidad: 'pallet/mes' },
      { tipo: 'Pallet fuera de medida', descripcion: 'Suplemento sobre tarifa base', precio: '3.20', unidad: 'pallet/mes' },
      { tipo: 'Caja/unidad técnica', descripcion: 'Piezas técnicas, control individual', precio: '1.50', unidad: 'unidad/mes' }
    ],
    []
  );

  const calcularTotal = () => {
    const sum = (arr: Array<{ precio: number; cantidad: number }>) =>
      arr.reduce((a, b) => a + b.precio * b.cantidad, 0);

    const otros = state.otrosAjustes.valor ? parseFloat(state.otrosAjustes.valor) : 0;

    return (
      sum(state.almacenajeSeleccionado) +
      sum(state.recepcionSeleccionada) +
      sum(state.ubicacionSeleccionada) +
      sum(state.pickingSeleccionado) +
      sum(state.packingSeleccionado) +
      sum(state.despachoSeleccionado) +
      sum(state.inventariosSeleccionados) +
      sum(state.extrasSeleccionados) +
      otros
    ).toFixed(2);
  };

  const generarPDF = async () => {
    if (!pageRef.current) return;
    setGenerandoPDF(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(pageRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');

      const width = pdf.internal.pageSize.getWidth() - 60;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', 30, 30, width, height);

      const slug = state.nombreCliente
        ? '-' + state.nombreCliente.toLowerCase().replace(/[^a-z0-9]+/gi, '-')
        : '';

      pdf.save(`tarifario-almacen-logistica-2026${slug}.pdf`);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div ref={pageRef} className="max-w-[1200px] mx-auto bg-white shadow-lg">
        {/* resto del JSX SIN CAMBIOS */}
      </div>
    </div>
  );
});

TarifarioAlmacenLogistica.displayName = 'TarifarioAlmacenLogistica';
