/**
 * Servicio de envío de presupuestos por email
 * 
 * PLACEHOLDER: Frontend limpio sin backend
 * 
 * INTEGRACIÓN FUTURA:
 * - Enviar presupuestos mediante Supabase Edge Function + Resend
 * - Notificar al cliente y a info@onusexpress.com
 */

interface PresupuestoParams {
  userEmail: string;
  userName: string;
  tarifario: string;
  desglose: string;
  total: string;
}

/**
 * PLACEHOLDER: Envío de presupuesto por email
 * 
 * INTEGRACIÓN FUTURA:
 * - POST a Edge Function de Supabase
 * - Envío mediante Resend API
 * - Notificación dual (cliente + ONUS)
 */
export async function enviarPresupuesto(params: PresupuestoParams): Promise<{ success: boolean; message: string }> {
  const { userEmail, userName, tarifario, total } = params;

  try {
    /**
     * TODO: Integración con Supabase Edge Function
     * 
     * const response = await fetch('YOUR_SUPABASE_EDGE_FUNCTION_URL', {
     *   method: 'POST',
     *   headers: {
     *     'Content-Type': 'application/json',
     *     'Authorization': `Bearer ${access_token}` // NO anon key
     *   },
     *   body: JSON.stringify({
     *     to: [userEmail, 'info@onusexpress.com'],
     *     subject: `Presupuesto ONUS Express - ${tarifario}`,
     *     userName,
     *     tarifario,
     *     desglose: params.desglose,
     *     total
     *   })
     * });
     */

    console.info('Envío de presupuesto pendiente de integración:', {
      userEmail,
      userName,
      tarifario,
      total
    });

    return {
      success: true,
      message: 'Presupuesto registrado (pendiente integración con backend)'
    };

  } catch (error) {
    console.error('Error en enviarPresupuesto:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * PLACEHOLDER: Obtener email del cliente actual
 * 
 * INTEGRACIÓN FUTURA:
 * - Leer email desde supabase.auth.getUser()
 */
export function obtenerEmailCliente(): string | null {
  /**
   * TODO: Cuando se conecte Supabase Auth:
   * 
   * const { data: { user } } = await supabase.auth.getUser();
   * return user?.email || null;
   */
  
  console.info('Obtención de email pendiente de integración con Supabase Auth');
  return null;
}

/**
 * PLACEHOLDER: Obtener nombre del cliente actual
 * 
 * INTEGRACIÓN FUTURA:
 * - Leer nombre desde user_metadata o tabla de clientes
 */
export function obtenerNombreCliente(): string | null {
  /**
   * TODO: Cuando se conecte Supabase Auth:
   * 
   * const { data: { user } } = await supabase.auth.getUser();
   * return user?.user_metadata?.nombre || user?.email || null;
   */
  
  console.info('Obtención de nombre pendiente de integración con Supabase Auth');
  return null;
}
