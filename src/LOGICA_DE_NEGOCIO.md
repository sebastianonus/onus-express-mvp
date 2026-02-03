# LÓGICA DE NEGOCIO - ONUS EXPRESS

## Tabla de Contenidos
1. [Visión General del Sistema](#visión-general-del-sistema)
2. [Bases de Datos LocalStorage](#bases-de-datos-localstorage)
3. [Formularios y Flujos de Datos](#formularios-y-flujos-de-datos)
4. [Sistema de Autenticación](#sistema-de-autenticación)
5. [Sistema de Gestión de Leads (CRM)](#sistema-de-gestión-de-leads-crm)
6. [Sistema de Campañas](#sistema-de-campañas)
7. [Flujos de Usuario](#flujos-de-usuario)

---

## Visión General del Sistema

ONUS EXPRESS es una plataforma web que conecta tres tipos de usuarios:
- **Mensajeros Autónomos**: Buscan rutas de reparto
- **Empresas de Mensajería**: Necesitan flota operativa
- **Centros Logísticos**: Requieren apoyo en almacén y última milla

El sistema funciona **100% offline** usando `localStorage` como base de datos, con capacidad de migración futura a Supabase mediante variables de entorno configurables desde Vercel.

---

## Bases de Datos LocalStorage

### 1. `onus_leads` - Gestión Completa de Leads (CRM)

**Descripción**: Base de datos principal de gestión comercial que almacena todos los contactos entrantes desde formularios web.

**Estructura de Campos**:
```typescript
interface Lead {
  id: string;                    // UUID generado automáticamente
  nombre: string;                // Nombre completo del contacto
  empresa: string;               // Nombre de la empresa (opcional para mensajeros)
  telefono: string;              // Teléfono de contacto (formato libre)
  email: string;                 // Email de contacto
  mensaje: string;               // Mensaje o consulta del usuario
  
  // Metadatos de clasificación
  lead_type: 'messenger' | 'client';  // Tipo de lead
  service: 'fleet' | 'logistics_staff' | 'general_contact';  // Servicio solicitado
  source: 'services' | 'contact_page' | 'messenger_access';  // Origen del lead
  
  // Gestión CRM
  status: 'new' | 'contacted' | 'qualified' | 'onboarded' | 'discarded';
  internal_notes: string;        // Notas internas del equipo comercial
  tags: string[];                // Etiquetas para clasificación (ej: "Solicitud Código")
  
  // Campos adicionales para mensajeros
  ciudad?: string;               // Ciudad del mensajero (solo para messenger)
  experiencia?: string;          // Experiencia previa (solo para messenger)
  
  // Timestamps
  created_at: string;            // Fecha de creación (ISO 8601)
  updated_at: string;            // Última actualización (ISO 8601)
}
```

**Acciones del Sistema**:
- **CREATE**: Al enviar formulario de contacto o solicitud de código
- **READ**: Panel de administración, vista de leads
- **UPDATE**: Cambio de estado, agregar notas internas, agregar tags
- **DELETE**: No implementado (se mantiene histórico)

**Conversión a Mensajero**: Leads tipo `messenger` pueden convertirse en mensajeros activos desde el panel de administración.

---

### 2. `onus_contactos` - Histórico de Formularios de Contacto

**Descripción**: Registro simplificado de contactos desde la página de contacto general.

**Estructura de Campos**:
```typescript
interface Contacto {
  id: string;              // UUID generado automáticamente
  nombre: string;          // Nombre completo
  empresa: string;         // Nombre de empresa (opcional)
  telefono: string;        // Teléfono de contacto
  email: string;           // Email de contacto
  mensaje: string;         // Mensaje del formulario
  fecha: string;           // Timestamp ISO 8601
  leido: boolean;          // Marcador de lectura para panel admin
}
```

**Acciones del Sistema**:
- **CREATE**: Al enviar formulario de contacto desde `/contacto`
- **READ**: Panel de administración → Vista "Contactos"
- **UPDATE**: Marcar como leído/no leído
- **DELETE**: Eliminar contacto individual

**Nota**: Los contactos también se guardan en `onus_leads` con información extendida.

---

### 3. `onus_mensajeros` - Registro de Mensajeros Activos

**Descripción**: Base de datos de mensajeros que han sido dados de alta en el sistema.

**Estructura de Campos**:
```typescript
interface Mensajero {
  codigo: string;          // Código único de 6 dígitos generado por admin
  nombre: string;          // Nombre completo del mensajero
  email: string;           // Email de contacto
  telefono: string;        // Teléfono de contacto
  fechaRegistro: string;   // Fecha de alta en el sistema (ISO 8601)
  activo: boolean;         // Estado activo/inactivo del mensajero
}
```

**Acciones del Sistema**:
- **CREATE**: Panel de administración → Convertir lead a mensajero
- **READ**: Login de mensajeros, panel de administración
- **UPDATE**: Activar/desactivar mensajero
- **DELETE**: Eliminar mensajero del sistema

**Flujo de Creación**:
1. Lead tipo `messenger` llega al sistema
2. Admin genera código de 6 dígitos único
3. Se crea entrada en `onus_mensajeros`
4. Se envía código al mensajero (vía email/WhatsApp)

---

### 4. `mensajero_auth` - Sesión Activa de Mensajero

**Descripción**: Datos de sesión del mensajero logueado, incluyendo filtros de búsqueda personalizados.

**Estructura de Campos**:
```typescript
interface MensajeroAuth {
  codigo: string;          // Código de mensajero autenticado
  nombre: string;          // Nombre del mensajero
  email: string;           // Email del mensajero
  telefono: string;        // Teléfono del mensajero
  activo: boolean;         // Estado de activación
  fechaLogin: string;      // Timestamp del último login (ISO 8601)
  
  // Filtros de búsqueda personalizados
  filtros?: {
    ciudad: string;        // Ciudad seleccionada o "Todas"
    radioKm: number;       // Radio de búsqueda (20-80 km)
    vehiculo: string;      // Tipo de vehículo o "Todos"
    horario: string;       // Franja horaria o "Todos"
    jornada: string;       // Tipo de jornada o "Todas"
  };
}
```

**Acciones del Sistema**:
- **CREATE**: Al hacer login exitoso con código válido
- **READ**: En cada carga de `/mensajeros` (área privada)
- **UPDATE**: Al modificar filtros de búsqueda
- **DELETE**: Al hacer logout

**Código Demo**: Variable de entorno `VITE_DEMO_MESSENGER_CODE` (default: `123456`)

---

### 5. `onus_postulaciones` - Postulaciones a Campañas

**Descripción**: Registro de postulaciones de mensajeros a campañas específicas.

**Estructura de Campos**:
```typescript
interface Postulacion {
  id: string;                    // UUID generado automáticamente
  
  // Datos del mensajero
  mensajeroCodigo: string;       // Código del mensajero
  mensajeroNombre: string;       // Nombre del mensajero
  mensajeroEmail: string;        // Email del mensajero
  mensajeroTelefono: string;     // Teléfono del mensajero
  
  // Datos de la campaña
  campanaId: string;             // ID de la campaña
  campanaNombre: string;         // Nombre de la campaña
  
  // Información de la postulación
  motivacion?: string;           // Motivación del mensajero
  experiencia?: string;          // Experiencia relacionada
  disponibilidad?: string;       // Disponibilidad horaria
  
  // Gestión administrativa
  fecha: string;                 // Fecha de postulación (ISO 8601)
  estado: 'En revisión' | 'Aceptado' | 'Rechazado';
}
```

**Acciones del Sistema**:
- **CREATE**: Mensajero postula a una campaña desde `/mensajeros`
- **READ**: Vista de postulaciones del mensajero, panel admin
- **UPDATE**: Admin acepta/rechaza postulación
- **DELETE**: No implementado

**Estados del Flujo**:
1. **En revisión**: Estado inicial al postular
2. **Aceptado**: Admin aprueba la postulación
3. **Rechazado**: Admin rechaza la postulación

---

### 6. `onus_campaigns` - Campañas Activas

**Descripción**: Ofertas de trabajo/rutas publicadas por empresas clientes.

**Estructura de Campos**:
```typescript
interface Campaign {
  id: string;              // UUID generado automáticamente
  titulo: string;          // Título de la campaña
  logoUrl?: string;        // URL del logo de la empresa (Base64 o URL)
  ciudad: string;          // Ciudad de la campaña
  tarifa: string;          // Tarifa o compensación (texto libre)
  descripcion?: string;    // Descripción detallada de la campaña
  createdAt: string;       // Fecha de creación (ISO 8601)
  
  // Requisitos
  vehiculos: string[];     // Tipos de vehículos aceptados
  flotista: string[];      // Requisitos para flotista
  mensajero: string[];     // Requisitos para mensajero
  
  // Gestión
  isActive: boolean;       // Estado activo/inactivo
  cliente?: string;        // Nombre del cliente que publica
}
```

**Acciones del Sistema**:
- **CREATE**: Panel admin → Crear nueva campaña
- **READ**: Vista de campañas para mensajeros, panel admin
- **UPDATE**: Editar campaña, activar/desactivar
- **DELETE**: Eliminar campaña

**Filtrado para Mensajeros**:
Las campañas se filtran según:
- Ciudad del mensajero (y radio en km)
- Tipo de vehículo disponible
- Horario preferido
- Tipo de jornada

---

### 7. `adminAuth` - Sesión de Administrador

**Descripción**: Sesión activa del panel de administración.

**Estructura**:
```typescript
// Almacenado en sessionStorage (no localStorage)
sessionStorage.setItem('adminAuth', 'true');
```

**Código PIN**: Variable de entorno `VITE_ADMIN_PIN` (default: `1234`)

**Acciones**:
- **CREATE**: Login exitoso con PIN correcto
- **READ**: Verificación en cada carga del panel
- **DELETE**: Al cerrar sesión o cerrar navegador

---

## Formularios y Flujos de Datos

### FORMULARIO 1: Contacto General (`/contacto`)

**Ubicación**: Página `/contacto`

**Campos Visibles**:
```typescript
{
  nombre: string;      // Campo obligatorio
  empresa: string;     // Campo opcional
  telefono: string;    // Campo obligatorio
  email: string;       // Campo obligatorio (validación email)
  mensaje: string;     // Campo obligatorio (textarea)
}
```

**Campos Ocultos (Metadatos)**:
```typescript
{
  lead_type: 'client',           // Siempre 'client' desde contacto
  service: string,               // Detectado desde URL params (?service=)
  source: 'contact_page'         // Siempre 'contact_page'
}
```

**Valores de `service`**:
- `'fleet'`: Flota Operativa para Empresas
- `'logistics_staff'`: Apoyo en Almacén/Logística
- `'general_contact'`: Contacto general (default)

**Flujo de Datos**:
1. Usuario completa formulario
2. Frontend genera:
   ```javascript
   const nuevoLead = {
     ...formData,
     id: crypto.randomUUID(),
     lead_type: 'client',
     service: params.get('service') || 'general_contact',
     source: 'contact_page',
     status: 'new',
     internal_notes: '',
     tags: [],
     created_at: new Date().toISOString(),
     updated_at: new Date().toISOString()
   };
   ```
3. Guarda en: `onus_leads` (push)
4. Guarda también en: `onus_contactos` (formato simplificado)
5. Muestra mensaje de éxito
6. Resetea formulario tras 3 segundos

**Validaciones**:
- Nombre: Requerido
- Teléfono: Requerido, formato tel
- Email: Requerido, formato email
- Mensaje: Requerido, mínimo 1 carácter

---

### FORMULARIO 2: Solicitud de Código de Mensajero (`/mensajeros/acceso`)

**Ubicación**: Modal en página `/mensajeros/acceso` (botón "Solicitar código")

**Campos Visibles**:
```typescript
{
  nombre: string;          // Campo obligatorio
  email: string;           // Campo obligatorio (validación email)
  telefono: string;        // Campo obligatorio
  ciudad: string;          // Campo obligatorio
  experiencia: string;     // Campo obligatorio (años o descripción)
}
```

**Campos Ocultos (Metadatos)**:
```typescript
{
  lead_type: 'messenger',
  service: 'fleet',
  source: 'messenger_access',
  tags: ['Solicitud Código']
}
```

**Flujo de Datos**:
1. Usuario hace clic en "Solicitar código de acceso"
2. Se abre modal con formulario
3. Usuario completa datos
4. Frontend genera:
   ```javascript
   const newLead = {
     id: `lead_${Date.now()}`,
     nombre: formData.nombre,
     empresa: '',
     email: formData.email,
     telefono: formData.telefono,
     ciudad: formData.ciudad,
     experiencia: formData.experiencia,
     mensaje: `Ciudad: ${formData.ciudad}, Experiencia: ${formData.experiencia}`,
     lead_type: 'messenger',
     service: 'fleet',
     source: 'messenger_access',
     status: 'new',
     internal_notes: '',
     tags: ['Solicitud Código'],
     created_at: new Date().toISOString(),
     updated_at: new Date().toISOString()
   };
   ```
5. Guarda en: `onus_leads` (push)
6. Cierra modal
7. Muestra toast de éxito

**Validaciones**:
- Todos los campos son obligatorios
- Email debe tener formato válido

**Siguiente Paso Manual**:
1. Admin ve solicitud en panel
2. Admin genera código de 6 dígitos
3. Admin crea entrada en `onus_mensajeros`
4. Admin envía código al mensajero

---

### FORMULARIO 3: Login de Mensajero (`/mensajeros/acceso`)

**Ubicación**: Página `/mensajeros/acceso`

**Campos del Formulario**:
```typescript
{
  // Autenticación
  codigo: string;          // Código de 6 dígitos (obligatorio)
  
  // Filtros de búsqueda
  ciudad: string;          // Select de ciudades (opcional)
  radioKm: number;         // Slider 20-80 km (default: 50)
  vehiculo: string;        // Select: Todos|Moto|Coche|Furgoneta|Bicicleta|A pie
  horario: string;         // Select: Todos|Mañana|Tarde|Noche|24h
  jornada: string;         // Select: Todas|Media jornada|Jornada completa|Por horas|Fines de semana
}
```

**Flujo de Autenticación**:
1. Usuario ingresa código + filtros opcionales
2. Sistema verifica:
   ```javascript
   // Verificar código demo
   if (codigo === VITE_DEMO_MESSENGER_CODE) {
     // Crear sesión demo
   } else {
     // Verificar contra onus_mensajeros
     const mensajeros = JSON.parse(localStorage.getItem('onus_mensajeros'));
     const mensajero = mensajeros.find(m => m.codigo === codigo && m.activo);
   }
   ```
3. Si válido, guarda en `mensajero_auth`:
   ```javascript
   localStorage.setItem('mensajero_auth', JSON.stringify({
     codigo: mensajero.codigo,
     nombre: mensajero.nombre,
     email: mensajero.email,
     telefono: mensajero.telefono,
     activo: true,
     fechaLogin: new Date().toISOString(),
     filtros: {
       ciudad: ciudad || 'Todas',
       radioKm: radioKm[0],
       vehiculo: vehiculo || 'Todos',
       horario: horario || 'Todos',
       jornada: jornada || 'Todas'
     }
   }));
   ```
4. Redirige a `/mensajeros`

**Errores Posibles**:
- Código no existe: "Código inválido o inactivo"
- Mensajero inactivo: "Código inválido o inactivo"
- Error de verificación: "Error al verificar código"

---

### FORMULARIO 4: Postulación a Campaña (`/mensajeros`)

**Ubicación**: Modal en área privada de mensajeros

**Campos del Formulario**:
```typescript
{
  motivacion: string;        // Campo opcional (textarea)
  experiencia: string;       // Campo opcional (textarea)
  disponibilidad: string;    // Campo opcional (input text)
}
```

**Flujo de Postulación**:
1. Mensajero autenticado ve campañas filtradas
2. Hace clic en "Me interesa" en una campaña
3. Se abre modal con formulario
4. Completa información opcional
5. Frontend genera:
   ```javascript
   const nuevaPostulacion = {
     id: crypto.randomUUID(),
     mensajeroCodigo: mensajero.codigo,
     mensajeroNombre: mensajero.nombre,
     mensajeroEmail: mensajero.email,
     mensajeroTelefono: mensajero.telefono,
     campanaId: campana.id,
     campanaNombre: campana.nombre,
     motivacion: formData.motivacion,
     experiencia: formData.experiencia,
     disponibilidad: formData.disponibilidad,
     fecha: new Date().toISOString(),
     estado: 'En revisión'
   };
   ```
6. Guarda en: `onus_postulaciones` (push)
7. Actualiza UI (botón cambia a "Ya postulado")
8. Cierra modal

**Validaciones**:
- Todos los campos son opcionales
- No permite postular dos veces a la misma campaña

---

### FORMULARIO 5: Crear/Editar Campaña (Panel Admin)

**Ubicación**: Panel de administración `/admin`

**Campos del Formulario**:
```typescript
{
  titulo: string;              // Obligatorio
  ciudad: string;              // Obligatorio
  tarifa: string;              // Obligatorio (texto libre)
  descripcion: string;         // Opcional (textarea)
  cliente: string;             // Opcional
  logoUrl?: File;              // Opcional (upload de imagen)
  
  // Requisitos (checkboxes múltiples)
  vehiculos: string[];         // Array: Moto, Coche, Furgoneta, Bicicleta, A pie
  flotista: string[];          // Array de requisitos para flotista
  mensajero: string[];         // Array de requisitos para mensajero
}
```

**Flujo de Creación**:
1. Admin hace clic en "Nueva Campaña"
2. Se abre modal con formulario
3. Completa datos y sube logo (opcional)
4. Si hay logo, se convierte a Base64:
   ```javascript
   const reader = new FileReader();
   reader.readAsDataURL(logoFile);
   // logoUrl = 'data:image/png;base64,...'
   ```
5. Frontend genera:
   ```javascript
   const nuevaCampana = {
     id: crypto.randomUUID(),
     titulo: formData.titulo,
     ciudad: formData.ciudad,
     tarifa: formData.tarifa,
     descripcion: formData.descripcion,
     cliente: formData.cliente,
     logoUrl: logoBase64 || undefined,
     vehiculos: formData.vehiculos,
     flotista: formData.flotista,
     mensajero: formData.mensajero,
     isActive: true,
     createdAt: new Date().toISOString()
   };
   ```
6. Guarda en: `onus_campaigns` (push)
7. Actualiza lista de campañas
8. Cierra modal

**Flujo de Edición**:
1. Admin hace clic en icono de edición
2. Modal se abre con datos pre-cargados
3. Modifica campos necesarios
4. Al guardar, actualiza campaña existente:
   ```javascript
   campaigns.map(c => c.id === editingCampaign.id ? updatedCampaign : c)
   ```
5. Guarda en localStorage
6. Actualiza UI

**Validaciones**:
- Título: Obligatorio
- Ciudad: Obligatorio
- Tarifa: Obligatorio

---

## Sistema de Autenticación

### Autenticación de Mensajeros

**Método**: Código de 6 dígitos único por mensajero

**Códigos Disponibles**:
1. **Código Demo**: Variable `VITE_DEMO_MESSENGER_CODE` (default: `123456`)
   - Siempre válido
   - Datos hardcodeados: "Demo Mensajero"
   - Email: demo@onusexpress.com

2. **Códigos Reales**: Generados desde panel admin
   - Almacenados en `onus_mensajeros`
   - Verifican campo `activo: true`

**Flujo de Login**:
```
Usuario ingresa código
    ↓
¿Es código demo? → SÍ → Crear sesión demo
    ↓ NO
Buscar en onus_mensajeros
    ↓
¿Existe y activo? → SÍ → Crear sesión
    ↓ NO
Mostrar error
```

**Sesión**:
- Almacenada en: `localStorage.mensajero_auth`
- Duración: Hasta logout manual
- Incluye: Datos del mensajero + filtros de búsqueda

**Protección de Rutas**:
```javascript
// En /mensajeros
useEffect(() => {
  const auth = localStorage.getItem('mensajero_auth');
  if (!auth) navigate('/mensajeros/acceso');
}, []);
```

---

### Autenticación de Administradores

**Método**: PIN numérico de 4 dígitos

**PIN Configurado**:
- Variable: `VITE_ADMIN_PIN`
- Default: `1234`
- Configurable desde variables de entorno de Vercel

**Flujo de Login**:
```
Admin ingresa PIN
    ↓
¿PIN correcto?
    ↓ SÍ
Guardar en sessionStorage
Acceso concedido
    ↓ NO
Mostrar error
```

**Sesión**:
- Almacenada en: `sessionStorage.adminAuth`
- Duración: Hasta cerrar navegador
- Valor: `'true'`

**Protección**:
```javascript
useEffect(() => {
  const auth = sessionStorage.getItem('adminAuth');
  if (auth !== 'true') {
    // Mostrar formulario de login
  }
}, []);
```

---

## Sistema de Gestión de Leads (CRM)

### Estados del Lead

```
┌──────────────┐
│     NEW      │ ← Lead entra al sistema
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  CONTACTED   │ ← Primer contacto realizado
└──────┬───────┘
       │
       ├→ ┌──────────────┐
       │  │  QUALIFIED   │ ← Lead calificado como oportunidad
       │  └──────┬───────┘
       │         │
       │         ↓
       │  ┌──────────────┐
       │  │  ONBOARDED   │ ← Lead convertido a cliente/mensajero
       │  └──────────────┘
       │
       └→ ┌──────────────┐
          │  DISCARDED   │ ← Lead descartado
          └──────────────┘
```

### Filtros Disponibles

**Panel de Leads** (`/admin` → Vista Leads):
1. **Búsqueda de texto**: Busca en nombre, email, teléfono, empresa
2. **Tipo de Lead**:
   - Todos
   - Mensajeros (`messenger`)
   - Clientes (`client`)
3. **Servicio**:
   - Todos
   - Flota (`fleet`)
   - Personal Logística (`logistics_staff`)
   - Contacto General (`general_contact`)
4. **Estado**:
   - Todos
   - Nuevo (`new`)
   - Contactado (`contacted`)
   - Calificado (`qualified`)
   - Convertido (`onboarded`)
   - Descartado (`discarded`)

### Acciones sobre Leads

**Vista de Lista**:
- Ver detalle completo
- Copiar teléfono
- Copiar email
- Abrir WhatsApp con mensaje pre-rellenado

**Vista de Detalle**:
- Editar notas internas
- Cambiar estado
- Agregar/eliminar tags
- Convertir a mensajero (solo tipo `messenger`)

### Conversión de Lead a Mensajero

**Requisitos**:
- Lead debe ser tipo `messenger`
- Estado recomendado: `qualified` o `new`

**Proceso**:
1. Admin hace clic en "Convertir a mensajero"
2. Sistema genera código de 6 dígitos único
3. Verifica que no exista en `onus_mensajeros`
4. Crea nuevo registro:
   ```javascript
   {
     codigo: codigoGenerado,
     nombre: lead.nombre,
     email: lead.email,
     telefono: lead.telefono,
     fechaRegistro: new Date().toISOString(),
     activo: true
   }
   ```
5. Actualiza estado del lead a `onboarded`
6. Muestra código generado para enviar al mensajero
7. Permite copiar código al portapapeles

---

## Sistema de Campañas

### Ciclo de Vida de una Campaña

```
┌─────────────────┐
│ Admin crea      │
│ campaña         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ isActive: true  │ ← Visible para mensajeros
└────────┬────────┘
         │
         ├→ Mensajeros postulan
         │
         ├→ Admin gestiona postulaciones
         │
         ↓
┌─────────────────┐
│ isActive: false │ ← Oculta de mensajeros
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Admin elimina   │ ← Borrado permanente
└─────────────────┘
```

### Filtros de Campañas (Vista Mensajero)

Las campañas se filtran automáticamente según los filtros guardados en `mensajero_auth.filtros`:

**Lógica de Filtrado**:
```javascript
function filterCampanas(campanas, filtros) {
  return campanas.filter(campana => {
    // Solo campañas activas
    if (!campana.isActive) return false;
    
    // Filtro de ciudad
    if (filtros.ciudad !== 'Todas' && campana.ciudad !== filtros.ciudad) {
      return false;
    }
    
    // Filtro de vehículo
    if (filtros.vehiculo !== 'Todos') {
      if (!campana.vehiculos.includes(filtros.vehiculo)) {
        return false;
      }
    }
    
    // Filtro de horario
    if (filtros.horario !== 'Todos' && campana.horario !== 'Todos') {
      if (campana.horario !== filtros.horario) {
        return false;
      }
    }
    
    // Filtro de jornada
    if (filtros.jornada !== 'Todas' && campana.jornada !== 'Todas') {
      if (campana.jornada !== filtros.jornada) {
        return false;
      }
    }
    
    return true;
  });
}
```

### Gestión de Postulaciones

**Vista Admin** (`/admin` → Vista Solicitudes):
- Ver todas las postulaciones
- Filtrar por campaña
- Ver datos completos del mensajero
- Ver motivación, experiencia y disponibilidad
- Aceptar/rechazar postulaciones

**Vista Mensajero** (`/mensajeros/postulaciones`):
- Ver sus propias postulaciones
- Ver estado (En revisión/Aceptado/Rechazado)
- Ver detalles de la campaña postulada
- Estadísticas: Total, Aceptadas, En revisión

---

## Flujos de Usuario

### Flujo 1: Empresa busca Flota Operativa

```
1. Empresa visita web → /
2. Hace clic en "Soy Empresa" → Dropdown
3. Selecciona "Empresas de Mensajería"
4. Redirige a /servicios#empresas
5. Lee información del servicio
6. Hace clic en "Contratar este servicio"
7. Redirige a /contacto?lead_type=client&service=fleet
8. Completa formulario:
   - Nombre: "Juan Pérez"
   - Empresa: "LogiRapid S.L."
   - Teléfono: "654321987"
   - Email: "juan@logirapid.com"
   - Mensaje: "Necesito 10 mensajeros para Barcelona"
9. Envía formulario
10. Sistema guarda en:
    - onus_leads (lead_type: 'client', service: 'fleet')
    - onus_contactos
11. Muestra mensaje de confirmación
12. Equipo comercial ve lead en panel admin
13. Contacta a la empresa
```

### Flujo 2: Mensajero busca Rutas de Reparto

```
1. Mensajero visita web → /
2. Hace clic en "Soy Mensajero"
3. Redirige a /servicios#mensajeros
4. Lee información del servicio
5. Hace clic en "Accede a nuestra plataforma"
6. Redirige a /mensajeros/acceso
7. No tiene código → Clic en "Solicitar código de acceso"
8. Se abre modal, completa:
   - Nombre: "María García"
   - Email: "maria@gmail.com"
   - Teléfono: "612345678"
   - Ciudad: "Madrid"
   - Experiencia: "3 años como repartidora"
9. Envía formulario
10. Sistema guarda en onus_leads:
    - lead_type: 'messenger'
    - service: 'fleet'
    - source: 'messenger_access'
    - tags: ['Solicitud Código']
11. Muestra toast de confirmación
12. Admin ve solicitud en panel
13. Admin genera código "345678"
14. Admin crea mensajero en onus_mensajeros
15. Admin envía código por email/WhatsApp
16. Mensajero recibe código
17. Vuelve a /mensajeros/acceso
18. Ingresa:
    - Código: "345678"
    - Ciudad: "Madrid"
    - Radio: 50 km
    - Vehículo: "Moto"
    - Horario: "Mañana"
    - Jornada: "Media jornada"
19. Sistema verifica código en onus_mensajeros
20. Crea sesión en mensajero_auth
21. Redirige a /mensajeros
22. Ve campañas filtradas por sus preferencias
```

### Flujo 3: Mensajero Postula a Campaña

```
1. Mensajero autenticado en /mensajeros
2. Ve campaña "Reparto Farmacéutico - Madrid"
3. Hace clic en "Me interesa"
4. Se abre modal con formulario
5. Completa:
   - Motivación: "Tengo experiencia con productos sensibles"
   - Experiencia: "2 años en reparto farmacéutico con otra empresa"
   - Disponibilidad: "Lunes a viernes, 8:00 - 14:00"
6. Envía postulación
7. Sistema guarda en onus_postulaciones:
   - mensajeroCodigo: "345678"
   - campanaId: "uuid-campana"
   - estado: "En revisión"
   - fecha: timestamp
8. Botón cambia a "Ya postulado"
9. Puede ver postulación en /mensajeros/postulaciones
10. Admin ve postulación en panel
11. Admin revisa datos y acepta
12. Estado cambia a "Aceptado"
13. Mensajero ve actualización en su panel
14. Admin contacta al mensajero para siguiente paso
```

### Flujo 4: Admin Crea Campaña

```
1. Admin hace login en /admin con PIN
2. Vista por defecto: Campañas
3. Hace clic en "+ Nueva Campaña"
4. Se abre modal con formulario
5. Completa:
   - Título: "Reparto Alimentación - Barcelona"
   - Cliente: "FreshFood BCN"
   - Ciudad: "Barcelona"
   - Tarifa: "12€/hora + km"
   - Descripción: "Reparto de comida preparada en zona centro"
   - Logo: Sube imagen (PNG)
   - Vehículos: [✓] Moto, [✓] Coche
   - Requisitos Mensajero: [✓] Carnet B, [✓] Vehículo propio
6. Hace clic en "Crear Campaña"
7. Sistema:
   - Convierte logo a Base64
   - Genera ID único
   - Crea campaña con isActive: true
   - Guarda en onus_campaigns
8. Campaña aparece en lista del admin
9. Campaña está visible para mensajeros de Barcelona con moto/coche
10. Admin puede:
    - Editar campaña
    - Activar/desactivar con toggle
    - Ver postulaciones recibidas
    - Eliminar campaña
```

### Flujo 5: Admin Gestiona Leads

```
1. Admin en panel → Selecciona vista "Leads"
2. Ve lista de todos los leads
3. Aplica filtros:
   - Tipo: "Mensajeros"
   - Estado: "Nuevo"
4. Ve lead de "María García"
5. Hace clic en "Ver detalle"
6. Se abre panel lateral con:
   - Datos completos del lead
   - Historial de notas
   - Tags aplicados
7. Admin actualiza:
   - Estado: "new" → "contacted"
   - Notas internas: "Llamada realizada 15/01. Interesada en zonas norte Madrid"
   - Agrega tag: "Zona Norte"
8. Hace clic en "Guardar cambios"
9. Lead se actualiza en onus_leads
10. Admin decide convertir a mensajero
11. Hace clic en "Convertir a mensajero"
12. Sistema genera código "456789"
13. Muestra modal con código
14. Admin copia código
15. Mensajero se crea en onus_mensajeros
16. Lead cambia a estado "onboarded"
17. Admin envía código a María por WhatsApp
```

---

## Diagramas de Relaciones

### Relación entre Bases de Datos

```
┌─────────────────┐
│  onus_leads     │
│                 │
│  - id           │
│  - nombre       │
│  - email        │◄──────┐
│  - telefono     │       │
│  - lead_type    │       │ Conversión
│  - status       │       │
└─────────────────┘       │
                          │
                          │
                    ┌─────┴──────────┐
                    │ onus_mensajeros │
                    │                 │
                    │ - codigo        │◄──────────┐
                    │ - nombre        │           │
                    │ - email         │           │
                    │ - activo        │           │ Autenticación
                    └─────────────────┘           │
                                                  │
                                                  │
                                          ┌───────┴────────┐
                                          │ mensajero_auth  │
                                          │                 │
                                          │ - codigo        │
                                          │ - filtros       │
                                          └───────┬─────────┘
                                                  │
                                                  │ Sesión activa
                                                  │
                                                  ↓
                    ┌─────────────────────────────┴──────┐
                    │                                     │
            ┌───────▼──────────┐          ┌──────────────▼─────┐
            │ onus_campaigns    │          │ onus_postulaciones │
            │                   │          │                    │
            │ - id              │◄─────────┤ - campanaId        │
            │ - titulo          │  Relación│ - mensajeroCodigo  │
            │ - ciudad          │          │ - estado           │
            │ - isActive        │          │ - motivacion       │
            └───────────────────┘          └────────────────────┘
```

### Flujo de Datos Completo

```
┌──────────────┐
│   PÚBLICO    │
│              │
│  Formularios │
└──────┬───────┘
       │
       │ Envío de datos
       ↓
┌──────────────────┐
│  onus_leads      │ ← Base de datos central
│  onus_contactos  │
└──────┬───────────┘
       │
       │ Admin gestiona
       ↓
┌──────────────────┐
│  PANEL ADMIN     │
│                  │
│  - Conversión    │──→ onus_mensajeros
│  - Generación    │
│  - Gestión CRM   │
└──────┬───────────┘
       │
       │ Crea campañas
       ↓
┌──────────────────┐
│ onus_campaigns   │ ← Campañas publicadas
└──────┬───────────┘
       │
       │ Mensajeros ven
       ↓
┌──────────────────┐
│  MENSAJEROS      │
│                  │
│  Login con       │
│  código          │──→ mensajero_auth
│                  │
│  Filtran         │
│  campañas        │
│                  │
│  Postulan        │──→ onus_postulaciones
└──────────────────┘
       │
       │ Admin gestiona
       ↓
┌──────────────────┐
│  PANEL ADMIN     │
│                  │
│  Acepta/Rechaza  │
│  postulaciones   │
└──────────────────┘
```

---

## Resumen de Variables de Entorno

```env
# Autenticación Admin
VITE_ADMIN_PIN=1234                    # PIN del panel de administración

# Autenticación Mensajeros
VITE_DEMO_MESSENGER_CODE=123456        # Código demo para pruebas

# Supabase (configuración futura)
VITE_SUPABASE_PROJECT_ID=              # ID del proyecto Supabase
VITE_SUPABASE_ANON_KEY=                # Clave anónima de Supabase
```

**Notas**:
- Todas las variables son editables desde el panel de Vercel
- El sistema funciona 100% offline sin Supabase
- Los códigos demo facilitan pruebas y demostraciones

---

## Notas Técnicas Importantes

### Persistencia de Datos
- **Tecnología**: localStorage del navegador
- **Formato**: JSON strings
- **Límite**: ~5-10MB por dominio
- **Persistencia**: Permanente hasta borrado manual o limpieza de navegador

### IDs Únicos
- **Método**: `crypto.randomUUID()`
- **Formato**: UUID v4 (ej: `"550e8400-e29b-41d4-a716-446655440000"`)
- **Garantía**: Colisiones prácticamente imposibles

### Timestamps
- **Formato**: ISO 8601 (ej: `"2024-01-15T10:30:00.000Z"`)
- **Generación**: `new Date().toISOString()`
- **Zona horaria**: UTC

### Imágenes (Logos de Campañas)
- **Método**: Conversión a Base64
- **Almacenamiento**: Dentro del objeto JSON en localStorage
- **Formato**: `"data:image/png;base64,iVBORw0KGgoAAAA..."`
- **Limitación**: Afecta al límite de localStorage

### Seguridad
- **Nivel**: Cliente (navegador)
- **Protección**: PIN para admin, código único para mensajeros
- **Advertencia**: NO usar para datos sensibles o PII críticos
- **Recomendación**: Migrar a Supabase para producción con datos reales

---

## Migración Futura a Supabase

El sistema está diseñado para migración transparente a Supabase:

**Estructura de Tablas Sugerida**:
- `leads` → tabla principal CRM
- `contactos` → tabla de contactos
- `mensajeros` → tabla de mensajeros activos
- `postulaciones` → tabla de postulaciones
- `campaigns` → tabla de campañas

**Configuración**:
1. Crear proyecto en Supabase
2. Crear tablas con estructuras documentadas
3. Configurar variables de entorno en Vercel
4. El código ya lee `VITE_SUPABASE_PROJECT_ID` y `VITE_SUPABASE_ANON_KEY`
5. Implementar endpoints de funciones Edge existentes en `/supabase/functions/`

---

*Documento generado automáticamente para ONUS EXPRESS*
*Fecha: 22 de enero de 2026*
*Versión: 1.0*
