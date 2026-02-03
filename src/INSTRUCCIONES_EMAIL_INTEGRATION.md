# Integración de Envío de Emails - Instrucciones para Supabase

## 📧 ESTADO ACTUAL

**✅ IMPLEMENTADO (modo offline)**:
- Generación de PDFs dinámicos en los 3 tarifarios
- Descarga automática de PDFs
- Registro de emails en cola local (localStorage: `onus_email_queue`)
- Email del usuario capturado al autenticarse en área clientes
- Toast notifications al usuario

**⏳ PENDIENTE (migración a Supabase)**:
- Envío real de emails con archivos adjuntos
- Integración con servicio de email transaccional (Resend recomendado)

---

## 🚀 PASOS PARA ACTIVAR ENVÍO REAL DE EMAILS

### 1. Crear cuenta en Resend

1. Ir a https://resend.com
2. Crear cuenta (gratis hasta 3,000 emails/mes)
3. Verificar dominio personalizado o usar `onboarding@resend.dev` para pruebas
4. Obtener API Key

### 2. Crear Supabase Edge Function

```bash
# En tu proyecto Supabase
supabase functions new send-email

# Editar /supabase/functions/send-email/index.ts
```

**Contenido de la Edge Function**:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, subject, html, attachments, metadata } = await req.json()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'noreply@onusexpress.com', // Cambiar por dominio verificado
        to: to,
        subject: subject,
        html: html,
        attachments: attachments // Array con {filename, content (base64), encoding}
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error al enviar email')
    }

    // Registrar en tabla de emails enviados
    // ... código para guardar en tabla email_logs

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
```

### 3. Configurar variables de entorno

```bash
# En Supabase Dashboard > Settings > Edge Functions > Environment Variables
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 4. Desplegar Edge Function

```bash
supabase functions deploy send-email
```

### 5. Crear tabla para logs de emails (opcional)

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  tarifario_type TEXT NOT NULL,
  pdf_filename TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resend_id TEXT,
  status TEXT DEFAULT 'sent',
  metadata JSONB
);

-- Índices
CREATE INDEX idx_email_logs_user_email ON email_logs(user_email);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
```

### 6. Actualizar código en `/utils/emailService.ts`

Descomentar la sección TODO y reemplazar:

```typescript
const response = await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}` // Importar de /utils/supabase/info
  },
  body: JSON.stringify({
    to: 'info@onusexpress.com',
    subject: emailData.subject,
    html: emailData.body.trim(),
    attachments: [{
      filename: pdfFileName,
      content: pdfBase64,
      encoding: 'base64'
    }],
    metadata: {
      userEmail,
      userName,
      tarifarioType
    }
  })
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || 'Error al enviar email');
}

const result = await response.json();
console.log('✅ Email enviado exitosamente:', result);

return {
  success: true,
  message: 'PDF enviado correctamente a info@onusexpress.com'
};
```

### 7. Actualizar obtención de email de usuario

Cuando los clientes se almacenen en Supabase:

```typescript
export async function obtenerEmailUsuarioActual(codigoCliente: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('email')
      .eq('codigo', codigoCliente)
      .single();
    
    if (error) throw error;
    return data?.email || null;
  } catch (error) {
    console.error('Error obteniendo email usuario:', error);
    return null;
  }
}
```

---

## 📊 COLA DE EMAILS PENDIENTES

Los emails generados actualmente están registrados en `localStorage` bajo la clave `onus_email_queue`.

**Para procesar emails pendientes al activar Supabase**:

```typescript
// Script para migrar cola local
const emailQueue = JSON.parse(localStorage.getItem('onus_email_queue') || '[]');

for (const email of emailQueue) {
  if (email.status === 'pending_supabase') {
    // Reenviar email usando la Edge Function
    // Actualizar status a 'sent'
  }
}
```

---

## 🧪 TESTING

### Modo desarrollo (actual):
1. Cliente se autentica con código `000000`
2. Genera PDF en cualquier tarifario
3. Revisa `localStorage.onus_email_queue` → verás el email registrado
4. Revisa `localStorage.onus_cliente_actual` → verás el email del cliente

### Con Supabase activo:
1. Probar con email de prueba en Resend
2. Verificar recepción en `info@onusexpress.com`
3. Comprobar logs en tabla `email_logs`

---

## ⚠️ NOTAS IMPORTANTES

1. **Límite de archivos adjuntos**: Resend permite hasta 40MB por email
2. **Dominio verificado**: Para envíos desde `@onusexpress.com`, verificar el dominio en Resend
3. **Rate limits**: Plan gratuito permite 100 emails/día, 3,000/mes
4. **Alternativas a Resend**: SendGrid, Mailgun, Amazon SES

---

## 📝 CHECKLIST MIGRACIÓN

- [ ] Crear cuenta Resend
- [ ] Verificar dominio en Resend
- [ ] Crear Edge Function en Supabase
- [ ] Configurar RESEND_API_KEY
- [ ] Desplegar Edge Function
- [ ] Crear tabla `email_logs` (opcional)
- [ ] Actualizar `/utils/emailService.ts`
- [ ] Probar envío de email test
- [ ] Procesar cola de emails pendientes
- [ ] Monitorizar primeros envíos reales

---

## 🔗 RECURSOS

- [Resend Docs](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Resend + Supabase Tutorial](https://resend.com/docs/send-with-supabase-edge-functions)
