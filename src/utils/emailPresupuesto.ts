import { supabase } from '@/supabase';

export interface PresupuestoItemEmail {
  nombre: string;
  cantidad: number;
  precio: number | string;
}

interface EnviarPresupuestoParams {
  tarifario: string;
  total: string | number;
  items: PresupuestoItemEmail[];
}

const QUEUE_KEY = 'onus_presupuestos_queue';

const pushQueue = (payload: Record<string, unknown>) => {
  try {
    const current = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
    const safeCurrent = Array.isArray(current) ? current : [];
    safeCurrent.push({
      ...payload,
      queuedAt: new Date().toISOString(),
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(safeCurrent));
  } catch (error) {
    console.error('Error guardando cola de presupuestos:', error);
  }
};

export async function enviarPresupuestoPorEmail({
  tarifario,
  total,
  items,
}: EnviarPresupuestoParams): Promise<{ success: boolean; message: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    const user = session?.user;

    if (!session || !user?.email) {
      return { success: false, message: 'Sin sesion de cliente activa' };
    }

    const payload = {
      cliente_nombre:
        String(user.user_metadata?.nombre ?? '').trim() ||
        String(user.email).split('@')[0],
      cliente_email: user.email,
      tarifario,
      total,
      items: (items ?? []).slice(0, 100).map((item) => ({
        nombre: String(item.nombre ?? '').trim(),
        cantidad: Number(item.cantidad ?? 0) || 0,
        precio: item.precio ?? 0,
      })),
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    if (!supabaseUrl || !supabaseAnonKey) {
      pushQueue(payload);
      return {
        success: false,
        message: 'Configuracion de Supabase incompleta. Se guardo en cola.',
      };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-presupuesto-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      pushQueue(payload);
      return {
        success: false,
        message: `No se pudo enviar el email (${response.status}): ${errorText || 'error desconocido'}. Se guardo en cola.`,
      };
    }

    return { success: true, message: 'Notificacion enviada' };
  } catch (error) {
    pushQueue({
      tarifario,
      total,
      items,
    });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
