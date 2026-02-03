# GUÍA DE MIGRACIÓN A SUPABASE

## 📋 Archivos Eliminados (Limpieza Completada)

### Componentes Duplicados/No Utilizados
- ✅ `/components/Mensajeros.tsx` - Componente contenedor viejo no usado
- ✅ `/components/MensajerosAcceso.tsx` - Duplicado de MensajerosLogin
- ✅ `/components/MensajerosBoard.tsx` - Funcionalidad movida a MensajerosSesion
- ✅ `/components/MensajerosRegister.tsx` - Registro integrado en MensajerosLogin

### Tarifarios Duplicados
- ✅ `/components/TarifarioAlmacenLogistica.tsx` - Viejo (migrado a `/tarifarios`)
- ✅ `/components/TarifarioEnviosExpress.tsx` - Viejo (migrado a `/tarifarios`)
- ✅ `/components/TarifarioUltimaMilla.tsx` - Viejo (migrado a `/tarifarios`)

### Documentación Redundante
- ✅ `/IMAGENES_NECESARIAS.md` - No esencial
- ✅ `/MENSAJEROS_README.md` - No esencial
- ✅ `/STATUS_CHECK.md` - No esencial

---

## 🗄️ MIGRACIÓN DE localStorage A SUPABASE

### Estado Actual
La aplicación usa **100% localStorage** para persistencia de datos:
- `onus_campaigns` - Campañas creadas por admin
- `onus_mensajeros` - Mensajeros registrados con códigos
- `onus_leads` - Leads desde formularios
- `onus_postulaciones` - Postulaciones de mensajeros a campañas
- `mensajero_auth` - Sesión del mensajero autenticado

### Arquitectura Backend Disponible

#### Backend Supabase Edge Functions
**Ubicación**: `/supabase/functions/server/`
- ✅ `index.tsx` - Servidor Hono con rutas configuradas
- ✅ `kv_store.tsx` - Utilidad para tabla kv_store (NO MODIFICAR)
- ✅ `mensajeros.tsx` - Lógica de mensajeros externos

#### Endpoints Disponibles (Base URL: `/make-server-372a0974/`)

**Campañas**:
- `POST /campaigns` - Crear campaña
- `GET /campaigns` - Listar campañas
- `GET /campaigns/filtered?city=X` - Filtrar por ciudad
- `PUT /campaigns/:id` - Actualizar campaña
- `DELETE /campaigns/:id` - Eliminar campaña
- `POST /campaigns/upload-logo` - Subir logo (Supabase Storage)

**Mensajeros Externos**:
- `POST /mensajeros-externos/register` - Registrar mensajero
- `POST /mensajeros-externos/verify` - Verificar código
- `GET /mensajeros-externos` - Listar todos (admin)
- `PATCH /mensajeros-externos/:codigo` - Activar/Desactivar

**Leads**:
- `POST /leads` - Crear lead
- `GET /leads` - Listar leads
- `PATCH /leads/:id` - Actualizar estado/notas/tags

**Contactos**:
- `POST /contactos` - Guardar contacto
- `GET /contactos` - Listar contactos
- `PATCH /contactos/:id/leido` - Marcar como leído

**Solicitudes**:
- `POST /solicitudes` - Guardar solicitud mensajero
- `GET /solicitudes` - Listar solicitudes
- `PATCH /solicitudes/:id` - Actualizar estado

---

## 📊 PLAN DE MIGRACIÓN PASO A PASO

### 1️⃣ Crear Tablas en Supabase

Además de la tabla `kv_store` existente, crear:

```sql
-- Tabla de Campañas
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  logo_url TEXT,
  ciudad TEXT NOT NULL,
  tarifa TEXT NOT NULL,
  descripcion TEXT,
  vehiculos TEXT[] NOT NULL,
  flotista TEXT[] NOT NULL,
  mensajero TEXT[] NOT NULL,
  cliente TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Mensajeros
CREATE TABLE mensajeros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT NOT NULL,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activo BOOLEAN DEFAULT true
);

-- Tabla de Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  empresa TEXT,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  mensaje TEXT,
  lead_type TEXT CHECK (lead_type IN ('messenger', 'client')),
  service TEXT CHECK (service IN ('fleet', 'logistics_staff', 'general_contact')),
  source TEXT CHECK (source IN ('services', 'contact_page', 'messenger_access')),
  status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'onboarded', 'discarded')),
  internal_notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Postulaciones
CREATE TABLE postulaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mensajero_codigo TEXT NOT NULL REFERENCES mensajeros(codigo),
  campana_id UUID NOT NULL REFERENCES campaigns(id),
  estado TEXT CHECK (estado IN ('En revisión', 'Aceptado', 'Rechazado')) DEFAULT 'En revisión',
  motivacion TEXT,
  experiencia TEXT,
  disponibilidad TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_campaigns_ciudad ON campaigns(ciudad);
CREATE INDEX idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX idx_mensajeros_codigo ON mensajeros(codigo);
CREATE INDEX idx_mensajeros_email ON mensajeros(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_lead_type ON leads(lead_type);
CREATE INDEX idx_postulaciones_mensajero ON postulaciones(mensajero_codigo);
CREATE INDEX idx_postulaciones_campana ON postulaciones(campana_id);
```

### 2️⃣ Actualizar Backend (Edge Functions)

**Modificar `/supabase/functions/server/index.tsx`**:

Reemplazar las rutas que usan `kv` con queries directas a las nuevas tablas:

```typescript
// Ejemplo: Crear campaña
app.post("/make-server-372a0974/campaigns", async (c) => {
  try {
    const body = await c.req.json();
    
    const { data, error } = await supabase
      .from('campaigns')
      .insert([body])
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json({ success: true, campaign: data });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});
```

### 3️⃣ Migrar Frontend (React Components)

#### AdminPanel.tsx
Reemplazar:
```typescript
// VIEJO (localStorage)
const campaigns = localStorage.getItem('onus_campaigns');

// NUEVO (Supabase)
const response = await fetch(`${serverUrl}/campaigns`, {
  headers: { 'Authorization': `Bearer ${publicAnonKey}` }
});
const { campaigns } = await response.json();
```

#### MensajerosLogin.tsx
Reemplazar:
```typescript
// VIEJO (localStorage)
const storedMensajeros = localStorage.getItem('onus_mensajeros');

// NUEVO (Supabase)
const response = await fetch(`${serverUrl}/mensajeros-externos/verify`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ codigo })
});
```

#### LeadsView.tsx
Reemplazar todas las operaciones localStorage con llamadas a la API.

### 4️⃣ Mantener Sesión (localStorage SOLO para auth)

Es válido mantener `localStorage` para:
- ✅ `mensajero_auth` - Token/sesión del usuario
- ✅ Preferencias UI (filtros, vista, etc.)

**NO usar localStorage para**:
- ❌ Datos persistentes de campañas
- ❌ Registros de mensajeros
- ❌ Leads
- ❌ Postulaciones

---

## 🔐 Variables de Entorno

Ya configuradas en Supabase:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

En el frontend:
```typescript
import { projectId, publicAnonKey } from './utils/supabase/info';
const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-372a0974`;
```

---

## ✅ Checklist de Migración

### Fase 1: Preparación
- [x] Eliminar archivos duplicados/innecesarios
- [ ] Crear tablas en Supabase SQL Editor
- [ ] Configurar Row Level Security (RLS) policies

### Fase 2: Backend
- [ ] Actualizar rutas de campañas para usar tabla `campaigns`
- [ ] Actualizar rutas de mensajeros para usar tabla `mensajeros`
- [ ] Actualizar rutas de leads para usar tabla `leads`
- [ ] Actualizar rutas de postulaciones para usar tabla `postulaciones`
- [ ] Probar endpoints con Postman/Thunder Client

### Fase 3: Frontend
- [ ] Migrar AdminPanel.tsx
- [ ] Migrar MensajerosView.tsx
- [ ] Migrar LeadsView.tsx
- [ ] Migrar CampanaDetalleView.tsx
- [ ] Migrar MensajerosLogin.tsx
- [ ] Migrar MensajerosSesion.tsx
- [ ] Migrar MensajerosPostulaciones.tsx

### Fase 4: Testing
- [ ] Probar creación de campañas
- [ ] Probar registro de mensajeros
- [ ] Probar postulaciones
- [ ] Probar gestión de leads
- [ ] Probar exportación CSV
- [ ] Probar conversión Lead → Mensajero

### Fase 5: Deploy
- [ ] Hacer backup de datos localStorage existentes
- [ ] Migrar datos existentes a Supabase
- [ ] Deploy a producción
- [ ] Monitorear logs y errores

---

## 🚀 Próximos Pasos Inmediatos

1. **Crear las tablas SQL en Supabase** (copiar queries de arriba)
2. **Configurar RLS policies** para seguridad
3. **Actualizar una ruta de prueba** (ej: /campaigns)
4. **Actualizar componente correspondiente** (ej: AdminPanel)
5. **Probar el flujo completo** antes de migrar todo

---

## 📝 Notas Importantes

- **NO MODIFICAR** `/supabase/functions/server/kv_store.tsx` (protegido)
- El servidor ya tiene CORS configurado correctamente
- Usar `Authorization: Bearer ${publicAnonKey}` en frontend
- Usar `SUPABASE_SERVICE_ROLE_KEY` solo en backend
- Los Edge Functions se ejecutan en Deno, no Node.js
- Imports en backend deben usar `npm:` o `jsr:` prefix

---

## 🔗 Referencias

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Hono Framework](https://hono.dev/)

---

**Última actualización**: ${new Date().toISOString()}
