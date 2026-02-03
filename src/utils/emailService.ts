/**
 * Servicio de envío de emails para tarifarios
 * 
 * PLACEHOLDER: Frontend limpio sin backend
 * 
 * INTEGRACIÓN FUTURA:
 * - Enviar emails mediante Supabase Edge Function + Resend
 * - Adjuntar PDFs generados
 * - Notificar a info@onusexpress.com
 */

interface EmailParams {
  userEmail: string;
  userName: string;
  pdfBase64: string;
  pdfFileName: string;
  tarifarioType: 'ultima-milla' | 'mensajeria-express' | 'almacen-logistica';
}

/**
 * Convierte un Blob de PDF a Base64
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extraer solo el contenido base64 (sin el prefijo data:application/pdf;base64,)
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * PLACEHOLDER: Envío de PDF por email
 * 
 * INTEGRACIÓN FUTURA:
 * - POST a Edge Function de Supabase
 * - Envío mediante Resend API
 * - Adjuntar PDF en base64
 */
export async function enviarPDFporEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
  const { userEmail, userName, pdfFileName, tarifarioType } = params;

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
     *     to: 'info@onusexpress.com',
     *     subject: `Nuevo tarifario: ${tarifarioType}`,
     *     userName,
     *     userEmail,
     *     pdfBase64: params.pdfBase64,
     *     pdfFileName
     *   })
     * });
     */

    console.info('Envío de PDF pendiente de integración:', {
      userEmail,
      userName,
      pdfFileName,
      tarifarioType
    });

    return {
      success: true,
      message: 'PDF registrado (pendiente integración con backend)'
    };

  } catch (error) {
    console.error('Error en enviarPDFporEmail:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * PLACEHOLDER: Obtener email del usuario autenticado
 * 
 * INTEGRACIÓN FUTURA:
 * - Leer email desde supabase.auth.getUser()
 * - O consultar tabla de clientes
 */
export function obtenerEmailUsuarioActual(): string | null {
  /**
   * TODO: Cuando se conecte Supabase Auth:
   * 
   * const { data: { user } } = await supabase.auth.getUser();
   * return user?.email || null;
   */
  
  console.info('Obtención de email pendiente de integración con Supabase Auth');
  return null;
}
