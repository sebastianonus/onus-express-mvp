# ONUS EXPRESS - Guía de Despliegue Completa

## 📋 Estructura del Proyecto

```
/
├── App.tsx                                  # Componente principal
├── components/
│   ├── Home.tsx                            # Página de inicio
│   ├── Servicios.tsx                       # Página de servicios
│   ├── Clientes.tsx                        # Página de clientes
│   ├── Mensajeros.tsx                      # Contenedor área mensajeros
│   ├── MensajerosLogin.tsx                 # Login mensajeros
│   ├── MensajerosRegister.tsx              # Registro mensajeros
│   ├── MensajerosBoard.tsx                 # Dashboard mensajeros
│   ├── Contacto.tsx                        # Página de contacto
│   ├── AdminPanel.tsx                      # Panel administración
│   └── ui/                                 # Componentes UI
├── supabase/functions/server/
│   ├── index.tsx                           # Servidor Hono (Edge Function)
│   ├── kv_store.tsx                        # Utilidades KV (NO EDITAR)
│   └── seed-campaigns.tsx                  # Seed de campañas
├── utils/supabase/
│   └── info.tsx                            # Configuración Supabase
└── styles/
    └── globals.css                         # Estilos globales
```

## 🚀 Características Implementadas

### Sistema de Registro de Mensajeros

**Frontend:**
- Formulario de registro con 3 campos (nombre, email, teléfono)
- Generación automática de código de acceso de 6 dígitos
- Validación de emails duplicados
- Sistema híbrido: backend + fallback local

**Backend (Edge Functions):**
- Endpoint `/mensajeros/register` - Registro de nuevos mensajeros
- Endpoint `/mensajeros/verify` - Verificación de códigos
- Almacenamiento en base de datos KV de Supabase
- Integración con Resend para envío de emails

## 📝 Código del Servidor (Edge Function)

### Archivo: `/supabase/functions/server/index.tsx`

```typescript
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============= ROUTES =============

// Health check endpoint
app.get("/make-server-372a0974/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= MENSAJEROS REGISTRATION ENDPOINTS =============

// Register new mensajero
app.post("/make-server-372a0974/mensajeros/register", async (c) => {
  try {
    const body = await c.req.json();
    const { nombre, email, telefono } = body;

    console.log('Registration request received:', { nombre, email, telefono });

    if (!nombre || !email || !telefono) {
      return c.json({ error: "Todos los campos son obligatorios" }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Email inválido" }, 400);
    }

    // Check if email already exists
    try {
      const existing = await kv.get(\`mensajero:\${email}\`);
      if (existing) {
        return c.json({ error: "Este email ya está registrado" }, 400);
      }
    } catch (kvError) {
      console.error('Error checking existing email:', kvError);
    }

    // Generate 6-digit code
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create mensajero record
    const mensajero = {
      nombre,
      email,
      telefono,
      accessCode,
      createdAt: new Date().toISOString(),
    };

    try {
      await kv.set(\`mensajero:\${email}\`, mensajero);
      console.log('Mensajero saved successfully');
    } catch (kvError) {
      console.error('Error saving mensajero:', kvError);
      return c.json({ error: "Error al guardar el registro" }, 500);
    }

    // Send email with access code (using Resend)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, returning code directly');
      return c.json({ 
        success: true, 
        message: "Registro exitoso. Tu código de acceso es: " + accessCode,
        code: accessCode
      });
    }

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${resendApiKey}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ONUS EXPRESS <onboarding@resend.dev>',
          to: email,
          subject: 'Tu código de acceso a ONUS EXPRESS',
          html: \`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #000935;">Bienvenido a ONUS EXPRESS</h1>
              <p>Hola \${nombre},</p>
              <p>Tu registro ha sido exitoso. Aquí está tu código de acceso:</p>
              <div style="background-color: #00C9CE; color: #000935; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                \${accessCode}
              </div>
              <p>Usa este código para acceder al área de mensajeros y ver las campañas disponibles en tu zona.</p>
              <p>Si no has solicitado este código, por favor ignora este email.</p>
              <br>
              <p>Saludos,<br><strong>Equipo ONUS EXPRESS</strong></p>
            </div>
          \`,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Error sending email:', errorText);
        return c.json({ 
          success: true, 
          message: "Registro exitoso. Tu código de acceso es: " + accessCode,
          code: accessCode,
          warning: "No se pudo enviar el email"
        });
      }

      console.log('Email sent successfully');
      return c.json({ 
        success: true, 
        message: "Registro exitoso. Revisa tu email para obtener el código de acceso."
      });
    } catch (emailError) {
      console.error('Error in email sending:', emailError);
      return c.json({ 
        success: true, 
        message: "Registro exitoso. Tu código de acceso es: " + accessCode,
        code: accessCode,
        warning: "No se pudo enviar el email"
      });
    }
  } catch (error) {
    console.error("Error registering mensajero:", error);
    return c.json({ error: "Error al registrar mensajero: " + error.message }, 500);
  }
});

// Verify mensajero access code
app.post("/make-server-372a0974/mensajeros/verify", async (c) => {
  try {
    const body = await c.req.json();
    const { codigo } = body;

    if (!codigo) {
      return c.json({ error: "Código requerido" }, 400);
    }

    // Search for mensajero with this code
    const allMensajeros = await kv.getByPrefix('mensajero:');
    const mensajero = allMensajeros.find((m: any) => m.accessCode === codigo);

    if (!mensajero) {
      return c.json({ error: "Código de acceso incorrecto" }, 401);
    }

    return c.json({ 
      success: true, 
      mensajero: {
        nombre: mensajero.nombre,
        email: mensajero.email,
        telefono: mensajero.telefono
      }
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    return c.json({ error: "Error al verificar código" }, 500);
  }
});

// ============= CAMPAIGNS ENDPOINTS =============
// (El resto de endpoints de campañas permanecen igual)

Deno.serve(app.fetch);
```

## 🔧 Configuración Requerida

### Variables de Entorno (Supabase)

```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_DB_URL=postgresql://...
RESEND_API_KEY=re_tu_api_key  # Opcional, para envío de emails
```

### Configuración de Resend (Opcional)

1. Crea cuenta en [Resend.com](https://resend.com)
2. Obtén tu API Key
3. Agrégala como variable de entorno `RESEND_API_KEY`
4. Los emails se enviarán automáticamente al registrar usuarios

**Sin Resend:** El sistema funciona igualmente mostrando el código en pantalla.

## 📦 Base de Datos

### Tabla KV Store (Ya existe)

```sql
CREATE TABLE kv_store_372a0974 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### Estructura de Datos - Mensajeros

```json
{
  "key": "mensajero:email@ejemplo.com",
  "value": {
    "nombre": "Juan Pérez",
    "email": "email@ejemplo.com",
    "telefono": "+34 600 123 456",
    "accessCode": "123456",
    "createdAt": "2024-12-16T10:30:00.000Z"
  }
}
```

## 🎯 Flujo de Usuario

### Registro de Nuevo Mensajero

1. Usuario accede a `/mensajeros`
2. Hace clic en "Regístrate aquí"
3. Completa formulario:
   - Nombre completo
   - Email
   - Teléfono
4. Sistema genera código de 6 dígitos
5. Opciones:
   - **Con Resend:** Recibe email con código
   - **Sin Resend:** Ve código en pantalla
6. Guarda el código
7. Vuelve al login

### Login con Código

1. Ingresa código de 6 dígitos
2. Selecciona preferencias:
   - Ciudad
   - Radio de búsqueda
   - Vehículo
   - Horario
   - Jornada
3. Accede al dashboard de campañas

## 🔄 Sistema Híbrido

El sistema tiene **doble respaldo**:

**Backend (Prioridad 1):**
- Usa Edge Function de Supabase
- Almacena en base de datos KV
- Envía emails con Resend

**LocalStorage (Fallback automático):**
- Si backend no disponible
- Almacena en navegador
- Genera códigos localmente
- Funciona offline

## 📤 Despliegue

### En Supabase

1. Ve a tu proyecto Supabase
2. Edge Functions → Crear nueva función llamada `make-server-372a0974`
3. Copia el código de `index.tsx`
4. Despliega la función
5. Configura variables de entorno

### En Figma Make

El proyecto ya está completo y funcionando. Para exportar:

1. Haz clic en el botón de menú (⋮)
2. Selecciona "Export code" o "Download"
3. Descarga todo el proyecto como ZIP

## 🧪 Testing

### Probar Registro

```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/make-server-372a0974/mensajeros/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -d '{"nombre":"Test User","email":"test@example.com","telefono":"+34600000000"}'
```

### Probar Verificación

```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/make-server-372a0974/mensajeros/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -d '{"codigo":"123456"}'
```

## 📊 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/mensajeros/register` | Registrar nuevo mensajero |
| POST | `/mensajeros/verify` | Verificar código de acceso |
| GET | `/campaigns` | Listar todas las campañas |
| GET | `/campaigns/filtered` | Campañas filtradas por ciudad |
| POST | `/campaigns` | Crear nueva campaña |
| PUT | `/campaigns/:id` | Actualizar campaña |
| DELETE | `/campaigns/:id` | Eliminar campaña |
| POST | `/seed-campaigns` | Crear campañas de ejemplo |

## 🎨 Diseño y Marca

- **Color principal:** #000935 (Azul marino oscuro)
- **Color acento:** #00C9CE (Turquesa)
- **Tipografía:** 
  - Títulos H1: Raleway ExtraBold 800
  - Títulos H2/H3: Raleway Bold 700
  - Cuerpo: REM

## 📝 Notas Importantes

1. **Código de acceso por defecto:** `000000` (siempre funciona para testing)
2. **Códigos registrados:** Se almacenan en KV o localStorage
3. **Email no requerido:** El sistema funciona sin Resend configurado
4. **Validación de duplicados:** Se verifica que el email no esté registrado
5. **Sesión:** Se guarda en sessionStorage, persiste hasta cerrar navegador

## 🔐 Seguridad

- ✅ Validación de formato de email
- ✅ Verificación de duplicados
- ✅ Códigos aleatorios de 6 dígitos
- ✅ CORS configurado correctamente
- ✅ Service Role Key solo en servidor
- ✅ Anon Key en cliente

## 💡 Mejoras Futuras Sugeridas

- [ ] Expiración de códigos (24-48 horas)
- [ ] Límite de intentos de login
- [ ] Recuperación de código por email
- [ ] Panel admin para gestionar mensajeros
- [ ] Notificaciones push para nuevas campañas
- [ ] Sistema de rating/reviews
- [ ] Historial de campañas completadas

## 📞 Soporte

Para cualquier duda sobre la implementación:
- Revisa los logs en Supabase Dashboard
- Verifica las variables de entorno
- Comprueba que la Edge Function esté desplegada
- El sistema fallback local siempre funciona

---

**Desarrollado para ONUS EXPRESS**  
Sistema de gestión logística y mensajería profesional
