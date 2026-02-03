# BACKEND SPECIFICATIONS - ONUS EXPRESS

## Descripción General

Sistema de gestión logística que conecta mensajeros autónomos con empresas de mensajería y centros logísticos. El backend proporciona autenticación via Supabase Auth, gestión de campañas y presupuestos personalizados.

---

## Stack Tecnológico

- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth (única fuente de identidad)
- **Storage**: Supabase Storage (logos de campañas)
- **Email**: Edge Function + Resend
- **API**: REST (Supabase PostgREST)

---

## Esquema de Base de Datos

### 1. Tabla: `campaigns`

Ofertas de trabajo para mensajeros.

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ciudad VARCHAR(100) NOT NULL,
  tarifa VARCHAR(255) NOT NULL,
  cliente VARCHAR(255),
  logo_url TEXT,
  vehiculos TEXT[] NOT NULL DEFAULT '{}',
  requisitos TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_active ON campaigns(is_active);
CREATE INDEX idx_campaigns_ciudad ON campaigns(ciudad);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Notas**:
- `vehiculos`: array de tipos de vehículo aceptados
- `requisitos`: array de documentos/requisitos necesarios
- Solo campañas con `is_active = true` son visibles a mensajeros
- Logos se almacenan en Supabase Storage: `campaign-logos/{id}.{ext}`

---

### 2. Tabla: `postulaciones`

Registro de postulaciones de mensajeros a campañas.

```sql
CREATE TABLE postulaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  mensaje TEXT,
  estado VARCHAR(20) DEFAULT 'pending' CHECK (estado IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_postulaciones_user ON postulaciones(user_id);
CREATE INDEX idx_postulaciones_campaign ON postulaciones(campaign_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX idx_postulaciones_created_at ON postulaciones(created_at DESC);

-- Validación: no permitir nueva postulación si existe una en estado pending o accepted
CREATE OR REPLACE FUNCTION check_postulacion_duplicada()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM postulaciones 
    WHERE user_id = NEW.user_id 
    AND campaign_id = NEW.campaign_id 
    AND estado IN ('pending', 'accepted')
  ) THEN
    RAISE EXCEPTION 'Ya existe una postulación activa para esta campaña';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_duplicate_postulacion
  BEFORE INSERT ON postulaciones
  FOR EACH ROW
  EXECUTE FUNCTION check_postulacion_duplicada();
```

**Reglas de Negocio**:
- Un mensajero NO puede postularse si ya tiene una postulación en estado `pending` o `accepted`
- Un mensajero PUEDE volver a postularse si su postulación anterior fue `rejected`
- Estados:
  - `pending`: En revisión (estado inicial)
  - `accepted`: Aceptado
  - `rejected`: Rechazado
- **No hay emails automáticos** de notificación
- Gestión de estados: manual en Supabase dashboard

**Identidad**:
- `user_id` referencia directamente a `auth.users` de Supabase Auth
- No existe tabla espejo de mensajeros

---

### 3. Tabla: `contactos`

Formularios de contacto general recibidos.

```sql
CREATE TABLE contactos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  telefono VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contactos_email ON contactos(email);
CREATE INDEX idx_contactos_created_at ON contactos(created_at DESC);
```

**Notas**:
- Datos guardados sin procesamiento
- Sin UI de gestión web
- Gestión: directa en Supabase dashboard

---

### 4. Tabla: `solicitudes_mensajeros`

Formularios "Quiero trabajar con ONUS" recibidos.

```sql
CREATE TABLE solicitudes_mensajeros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  ciudad VARCHAR(100),
  experiencia TEXT,
  procesado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_solicitudes_email ON solicitudes_mensajeros(email);
CREATE INDEX idx_solicitudes_procesado ON solicitudes_mensajeros(procesado);
CREATE INDEX idx_solicitudes_created_at ON solicitudes_mensajeros(created_at DESC);
```

**Notas**:
- `procesado = false`: pendiente de revisar
- `procesado = true`: ya convertido a mensajero o descartado
- Sin UI de gestión web
- Proceso manual: revisar en Supabase → crear usuario en Supabase Auth

---

## Autenticación (Supabase Auth Exclusivo)

### Diferenciación de Tipos de Usuario

**Sistema**: `app_metadata.role` en Supabase Auth

**Roles válidos**:
- `mensajero`: Acceso a campañas y postulaciones
- `cliente`: Acceso a tarifarios y presupuestos

**Gestión de roles**:
- Se asigna manualmente al crear el usuario en Supabase Auth dashboard
- Ejemplo SQL para asignar rol:
  ```sql
  UPDATE auth.users 
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "mensajero"}'::jsonb
  WHERE email = 'usuario@ejemplo.com';
  ```

**Notas**:
- **No se crean tablas de roles ni perfiles**
- Toda diferenciación se hace por `app_metadata.role`
- El frontend debe leer el rol de la sesión: `session.user.app_metadata.role`

---

### Mensajeros

**Método**: Magic Link (OTP)

**Flujo**:
1. Usuario ingresa email en `/mensajeros/acceso`
2. Frontend llama: `supabase.auth.signInWithOtp({ email })`
3. Supabase envía email con magic link
4. Usuario hace click en link
5. Redirige a `/mensajeros` con sesión establecida

**Gestión**:
- Altas manuales: crear usuario en Supabase Auth dashboard con `role = 'mensajero'`
- O desde formulario "Quiero trabajar con ONUS" → revisión manual → crear en Auth

**Sin tabla espejo**: La identidad está en `auth.users` de Supabase

---

### Clientes

**Método**: Email + Password

**Flujo**:
1. Usuario ingresa email y password en `/clientes`
2. Frontend llama: `supabase.auth.signInWithPassword({ email, password })`
3. Supabase valida credenciales
4. Redirige a área de tarifarios con sesión establecida

**Gestión**:
- Altas manuales: crear usuario en Supabase Auth dashboard con `role = 'cliente'`
- Asignar password inicial

**Sin tabla espejo**: La identidad está en `auth.users` de Supabase

---

### Admin

**No existe autenticación web para admin**.

**Gestión de campañas**:
- Acceso directo a Supabase dashboard
- O implementación interna con service role key (no documentada aquí)

**El frontend admin (`/admin`) es solo una UI interna de ONUS**, no un sistema público de autenticación.

---

## Row Level Security (RLS)

### Campañas (solo mensajeros autenticados)

```sql
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Solo mensajeros pueden ver campañas activas
CREATE POLICY "Solo mensajeros ven campañas activas"
  ON campaigns FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND is_active = true 
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'mensajero'
  );
```

**Notas**:
- Requiere que el usuario tenga `app_metadata.role = 'mensajero'`
- Filtra automáticamente por `is_active = true`

---

### Postulaciones (solo mensajeros)

```sql
ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;

-- Los mensajeros solo ven sus propias postulaciones
CREATE POLICY "Mensajeros ven solo sus postulaciones"
  ON postulaciones FOR SELECT
  USING (
    auth.uid() = user_id 
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'mensajero'
  );

-- Los mensajeros pueden crear postulaciones
CREATE POLICY "Mensajeros pueden postularse"
  ON postulaciones FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'mensajero'
  );
```

**Notas**:
- Solo usuarios con rol `mensajero` pueden acceder
- Cada mensajero solo ve/crea sus propias postulaciones

---

### Contactos (inserción pública anónima)

```sql
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT a usuarios anónimos (formulario público)
CREATE POLICY "Permitir inserción anónima de contactos"
  ON contactos FOR INSERT
  WITH CHECK (true);

-- Denegar lectura, actualización y eliminación desde frontend
-- (solo accesible desde Supabase dashboard con service role)
```

**Notas**:
- Formulario público puede insertar sin autenticación (anon key)
- **No hay policy de SELECT**: nadie puede leer desde frontend
- Datos solo accesibles desde Supabase dashboard

---

### Solicitudes de Mensajeros (inserción pública anónima)

```sql
ALTER TABLE solicitudes_mensajeros ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT a usuarios anónimos (formulario público)
CREATE POLICY "Permitir inserción anónima de solicitudes"
  ON solicitudes_mensajeros FOR INSERT
  WITH CHECK (true);

-- Denegar lectura, actualización y eliminación desde frontend
-- (solo accesible desde Supabase dashboard con service role)
```

**Notas**:
- Formulario "Quiero trabajar con ONUS" puede insertar sin autenticación
- **No hay policy de SELECT**: nadie puede leer desde frontend
- Datos solo accesibles desde Supabase dashboard

---

## API Endpoints

### 🔓 Endpoints Públicos

#### 1. POST `/rest/v1/contactos`

Guardar formulario de contacto general.

**Request Body**:
```json
{
  "nombre": "Juan Pérez",
  "empresa": "Transportes ABC",
  "telefono": "600123456",
  "email": "juan@transportes.com",
  "mensaje": "Necesito información sobre..."
}
```

**Response**: `201 Created`

---

#### 2. POST `/rest/v1/solicitudes_mensajeros`

Guardar formulario "Quiero trabajar con ONUS".

**Request Body**:
```json
{
  "nombre": "María García",
  "email": "maria@ejemplo.com",
  "telefono": "600654321",
  "ciudad": "Madrid",
  "experiencia": "3 años en reparto..."
}
```

**Response**: `201 Created`

---

### 🔐 Endpoints Mensajeros (Autenticados)

#### 3. POST `/auth/v1/otp`

Magic link para login de mensajeros (Supabase Auth nativo).

**Request Body**:
```json
{
  "email": "mensajero@ejemplo.com",
  "options": {
    "emailRedirectTo": "https://onusexpress.com/mensajeros"
  }
}
```

**Response**: `200 OK`

**Notas**:
- Supabase Auth gestiona todo el flujo
- No requiere validación adicional de "usuario activo"

---

#### 4. GET `/rest/v1/campaigns?is_active=eq.true`

Listar campañas activas.

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "titulo": "Reparto Urgente Madrid Centro",
    "descripcion": "Buscamos mensajeros...",
    "ciudad": "Madrid",
    "tarifa": "12€/hora",
    "cliente": "Empresa XYZ",
    "logo_url": "https://...",
    "vehiculos": ["Moto", "Coche"],
    "requisitos": ["DNI", "Carnet B"],
    "created_at": "2025-01-30T12:00:00Z"
  }
]
```

---

#### 5. POST `/rest/v1/postulaciones`

Postularse a una campaña.

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "campaign_id": "uuid",
  "mensaje": "Me interesa esta campaña porque..."
}
```

**Response**: `201 Created`

**Errores**:
- `409 Conflict`: Ya existe postulación en estado `pending` o `accepted`

**Validación automática**: El trigger `check_postulacion_duplicada` se ejecuta antes del INSERT

---

#### 6. GET `/rest/v1/postulaciones?user_id=eq.{auth.uid()}&select=*,campaigns(titulo)`

Ver mis postulaciones con nombre de campaña.

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "campaign_id": "uuid",
    "campaigns": {
      "titulo": "Reparto Madrid Centro"
    },
    "estado": "pending",
    "created_at": "2025-01-30T12:00:00Z"
  }
]
```

---

### 🔐 Endpoints Clientes (Autenticados)

#### 7. POST `/auth/v1/token?grant_type=password`

Login de cliente con email + password (Supabase Auth nativo).

**Request Body**:
```json
{
  "email": "cliente@empresa.com",
  "password": "password123"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "cliente@empresa.com"
  }
}
```

---

#### 8. POST `/functions/v1/send-presupuesto-email`

Enviar detalle de presupuesto por email (Edge Function).

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "cliente_email": "cliente@empresa.com",
  "cliente_nombre": "Juan Pérez",
  "tipo_tarifario": "ultima-milla",
  "items": [
    {
      "concepto": "Reparto zona 1",
      "cantidad": 100,
      "precio_unitario": 2.5,
      "subtotal": 250
    }
  ],
  "total": 250
}
```

**Response**: `200 OK`

**Lógica de la Edge Function**:
```typescript
// /supabase/functions/send-presupuesto-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  const { cliente_email, cliente_nombre, tipo_tarifario, items, total } = await req.json()
  
  // Generar HTML del presupuesto
  const itemsHTML = items.map(item => `
    <tr>
      <td>${item.concepto}</td>
      <td>${item.cantidad}</td>
      <td>${item.precio_unitario}€</td>
      <td>${item.subtotal}€</td>
    </tr>
  `).join('')
  
  const emailHTML = `
    <h2>Nuevo presupuesto solicitado</h2>
    <p><strong>Cliente:</strong> ${cliente_nombre} (${cliente_email})</p>
    <p><strong>Tarifario:</strong> ${tipo_tarifario}</p>
    <h3>Detalle:</h3>
    <table border="1" cellpadding="10">
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Cantidad</th>
          <th>Precio Unit.</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    <p><strong>TOTAL: ${total}€</strong></p>
  `
  
  await resend.emails.send({
    from: 'noreply@onusexpress.com',
    to: 'info@onusexpress.com',
    subject: `Nuevo presupuesto - ${tipo_tarifario}`,
    html: emailHTML
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Notas**:
- **NO se adjunta PDF**, solo detalle en HTML en el cuerpo del email
- **NO se guarda el presupuesto en BD**
- El PDF se descarga en el navegador del cliente
- Cada vez que el cliente descarga un PDF, se envía este email

---

## Variables de Entorno

### Frontend (Vercel)

```env
# Supabase
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Códigos demo (desarrollo local - opcional)
VITE_DEMO_CLIENT_EMAIL=cliente@demo.com
VITE_DEMO_CLIENT_PASSWORD=demo123
```

### Backend (Supabase Edge Functions)

```env
# Resend para envío de emails
RESEND_API_KEY=re_...

# Supabase (auto-inyectado)
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Flujos Completos

### Flujo 1: Mensajero solicita acceso

1. Usuario completa formulario "Quiero trabajar con ONUS"
2. Frontend: `POST /rest/v1/solicitudes_mensajeros`
3. Registro guardado con `procesado = false`
4. ONUS revisa manualmente en Supabase dashboard
5. Si aprueba: crea usuario en Supabase Auth (dashboard o API)
6. Marca solicitud como `procesado = true`
7. Mensajero puede hacer login con magic link

---

### Flujo 2: Mensajero accede y postula

1. Mensajero ingresa email en `/mensajeros/acceso`
2. Frontend: `supabase.auth.signInWithOtp({ email })`
3. Mensajero recibe email con magic link
4. Click en link → establece sesión (Supabase Auth)
5. Redirige a `/mensajeros` (listado de campañas)
6. Aplica filtros en UI (solo visualización, no persiste)
7. Click "Me interesa" en campaña
8. Frontend: `POST /rest/v1/postulaciones` con `user_id` desde `auth.uid()`
9. Trigger valida no duplicados (bloquea si pending/accepted, permite si rejected)
10. Postulación creada con estado `pending`
11. UI marca campaña como "Ya postulado"

---

### Flujo 3: Cliente solicita acceso

1. Cliente completa formulario de contacto general
2. Frontend: `POST /rest/v1/contactos`
3. ONUS recibe solicitud y revisa
4. Si aprueba: crea usuario en Supabase Auth con email y password
5. Envía credenciales al cliente por email (manual)

---

### Flujo 4: Cliente genera presupuesto

1. Cliente hace login: `supabase.auth.signInWithPassword({ email, password })`
2. Accede a `/clientes` (área de tarifarios)
3. Selecciona tarifario y configura items
4. Introduce su nombre en formulario
5. Click "Descargar presupuesto"
6. Frontend genera PDF dinámicamente (jsPDF)
7. PDF se descarga en navegador
8. **Simultáneamente**: Frontend llama `POST /functions/v1/send-presupuesto-email`
9. Edge Function envía email a `info@onusexpress.com` con:
   - Email del cliente (from auth session)
   - Nombre introducido
   - Detalle completo en HTML (tabla con items y total)
10. **NO se guarda nada en BD**

---

### Flujo 5: Admin gestiona campañas

**No existe flujo de login web documentado.**

La gestión de campañas se asume como:
- Acceso directo a Supabase dashboard
- O implementación interna no expuesta públicamente

El frontend `/admin` es una herramienta interna de ONUS, no un sistema de autenticación.

---

## Tareas de Implementación

### Fase 1: Setup Supabase

- [ ] Crear proyecto en Supabase
- [ ] Ejecutar SQL de creación de tablas (`campaigns`, `postulaciones`, `contactos`, `solicitudes_mensajeros`)
- [ ] Configurar RLS policies
- [ ] Configurar Storage bucket `campaign-logos` (público)
- [ ] Configurar Supabase Auth (magic link habilitado, email/password habilitado)
- [ ] Crear usuarios iniciales en Supabase Auth (mensajeros y clientes de prueba)

### Fase 2: Edge Functions

- [ ] Crear function `send-presupuesto-email`
- [ ] Configurar secrets (RESEND_API_KEY)
- [ ] Desplegar function

### Fase 3: Frontend Integration

- [ ] Instalar `@supabase/supabase-js`
- [ ] Configurar Supabase client en frontend
- [ ] Reemplazar localStorage por llamadas a Supabase
- [ ] Implementar magic link flow para mensajeros
- [ ] Implementar login email/password para clientes
- [ ] Conectar envío de presupuestos a Edge Function
- [ ] Actualizar postulaciones para usar `auth.uid()`

### Fase 4: Testing

- [ ] Probar registro y login de mensajeros
- [ ] Probar postulaciones y validación de duplicados
- [ ] Probar generación y envío de presupuestos
- [ ] Probar gestión de campañas desde Supabase dashboard

---

## Resumen de Entidades

| Entidad | Propósito | Identidad |
|---------|-----------|-----------|
| `campaigns` | Ofertas de trabajo | - |
| `postulaciones` | Mensajeros → Campañas | `auth.users` (Supabase Auth) |
| `contactos` | Formulario contacto | - |
| `solicitudes_mensajeros` | Formulario mensajeros | - |

**NO existen**:
- Tabla de mensajeros
- Tabla de clientes
- Tabla de admin_users
- Sistema de autenticación custom (PIN, JWT paralelo, bcrypt)

**Toda identidad se gestiona en `auth.users` de Supabase Auth.**

---

## Notas Finales

- **Sin tablas espejo de usuarios**: Todo en Supabase Auth
- **Diferenciación por app_metadata.role**: Mensajeros vs Clientes (sin tablas de roles)
- **RLS con validación de roles**: Campañas y postulaciones solo para mensajeros
- **Formularios públicos con RLS**: Solo INSERT permitido, sin SELECT desde frontend
- **Sin panel de gestión de Leads/Contactos/Mensajeros**: Todo se gestiona directo en Supabase dashboard
- **Sin emails automáticos de notificación**: Todo se gestiona manualmente
- **Presupuestos no persisten**: Solo se envían por email con detalle en HTML
- **Filtros de mensajeros no persisten**: Solo filtrado en UI
- **Admin no tiene login web**: Acceso interno no documentado

---

## Seguridad y Roles - Resumen

### Control de Acceso por Rol

| Recurso | Mensajeros | Clientes | Anónimos |
|---------|-----------|----------|----------|
| `campaigns` (SELECT) | ✅ Solo activas | ❌ | ❌ |
| `postulaciones` (SELECT/INSERT) | ✅ Solo propias | ❌ | ❌ |
| `contactos` (INSERT) | ✅ | ✅ | ✅ |
| `solicitudes_mensajeros` (INSERT) | ✅ | ✅ | ✅ |
| `contactos` (SELECT) | ❌ | ❌ | ❌ |
| `solicitudes_mensajeros` (SELECT) | ❌ | ❌ | ❌ |
| Edge Function presupuestos | ❌ | ✅ | ❌ |

**Implementación**:
- Roles: `app_metadata.role` en Supabase Auth
- RLS: `(auth.jwt() -> 'app_metadata' ->> 'role') = 'mensajero'`
- Formularios públicos: RLS habilitado + policy solo INSERT
- Datos de formularios: solo accesibles desde Supabase dashboard (service role)