# RESUMEN DE LIMPIEZA FRONTEND - ONUS EXPRESS

## ✅ Cambios Completados

### 1. `/components/Clientes.tsx`
**ANTES**: Código de 6 dígitos  
**AHORA**: Email + Password

- ✅ Eliminado campo `clientCode`
- ✅ Añadidos campos `email` y `password`
- ✅ Validación contra variables de entorno demo
- ✅ Preparado para Supabase Auth (`supabase.auth.signInWithPassword`)

**Variables de entorno necesarias**:
```env
VITE_DEMO_CLIENT_EMAIL=cliente@demo.com
VITE_DEMO_CLIENT_PASSWORD=demo123
```

---

### 2. `/components/MensajerosLogin.tsx`
**ANTES**: Código de 6 dígitos + filtros guardados  
**AHORA**: Magic link sin filtros persistentes

- ✅ Eliminado sistema de código de 6 dígitos
- ✅ Implementado input de email para magic link
- ✅ Eliminado guardado de filtros en localStorage
- ✅ Mantenido formulario "Quiero trabajar con ONUS" (modal)
- ✅ Preparado para Supabase Auth (`supabase.auth.signInWithOtp`)

**Formulario "Quiero trabajar con ONUS"**:
- ✅ Guarda en `onus_leads` (localStorage) con tag `['Solicitud Código']`
- ✅ Listo para migrar a tabla `solicitudes_mensajeros`

---

### 3. `/BACKEND_SPECIFICATIONS.md`
**ACCIÓN**: Reescrito desde cero

- ✅ Refleja únicamente el alcance definitivo
- ✅ Sin referencias a funcionalidades no implementadas
- ✅ Esquemas de BD alineados con flujos reales
- ✅ APIs documentadas sin suposiciones
- ✅ Incluye lógica de validación de postulaciones (no duplicar si pending/accepted)
- ✅ Edge Function para envío de presupuestos (detalle en cuerpo HTML, sin adjuntos)

---

## ⏳ Cambios Pendientes

### 4. `/components/MensajerosSesion.tsx`
**REQUIERE**: Eliminar guardado de filtros

**Cambios necesarios**:
- ❌ Eliminar guardado de filtros en `localStorage.setItem('mensajero_auth', ...)`
- ❌ Filtros solo para visualización en UI
- ❌ Eliminar lógica de persistencia en `handleBuscarCampanas()`
- ✅ Mantener filtrado en UI (estados locales)

**Líneas a modificar**:
- L176-183: Eliminar inicialización de filtros desde `parsedAuth.filtros`
- L253-270: Eliminar guardado de filtros en `handleBuscarCampanas`

---

### 5. `/components/MensajerosPostulaciones.tsx`
**REQUIERE**: Simplificar visualización

**Cambios necesarios**:
- ❌ Eliminar campos de formulario (motivación, experiencia, disponibilidad)
- ✅ Mostrar solo: nombre de campaña + estado
- ✅ Mantener lógica de carga desde localStorage

---

### 6. `/components/tarifarios/*.tsx` (3 archivos)
**REQUIERE**: Cambiar envío de email

**Archivos afectados**:
- `/components/tarifarios/TarifarioUltimaMilla.tsx`
- `/components/tarifarios/TarifarioMensajeriaExpress.tsx`
- `/components/tarifarios/TarifarioAlmacenLogistica.tsx`

**Cambios necesarios**:
- ❌ Eliminar envío de PDF como adjunto
- ✅ Enviar detalle completo en cuerpo del email (HTML)
- ✅ Incluir: email cliente, nombre introducido, tabla de items, total
- ❌ NO guardar presupuesto en BD

**Nueva lógica**:
```typescript
// En lugar de enviar PDF:
await fetch('/functions/v1/send-presupuesto-email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cliente_email: currentUser.email,
    cliente_nombre: nombreIntroducido,
    tipo_tarifario: 'ultima-milla',
    items: [
      { concepto: 'Item 1', cantidad: 100, precio_unitario: 2.5, subtotal: 250 }
    ],
    total: 250
  })
})
```

---

### 7. `/utils/emailService.ts`
**REQUIERE**: Redefinir lógica

**Cambios necesarios**:
- ❌ Eliminar lógica de `enviarPDFporEmail` (con adjuntos)
- ✅ Crear nueva función `enviarDetallePresupuesto` que llame a Edge Function
- ❌ Eliminar conversión de Blob a Base64
- ✅ Preparar datos en formato JSON para Edge Function

---

### 8. Limpieza de código muerto

**Archivos/referencias a eliminar o limpiar**:
- ✅ `/components/AdminPanel.tsx` - Ya está limpio (solo Campañas)
- ❌ Buscar y eliminar referencias a:
  - `onus_mensajeros` (localStorage) - Reemplazar por Supabase Auth
  - Guardado de filtros en auth
  - Código de 6 dígitos de mensajeros
  - Código de 6 dígitos de clientes

**Storage keys de localStorage a migrar**:
- `onus_leads` → tabla `contactos` + `solicitudes_mensajeros`
- `onus_campaigns` → tabla `campaigns`
- `onus_postulaciones` → tabla `postulaciones`
- `onus_cliente_actual` → Supabase Auth session
- `mensajero_auth` → Supabase Auth session
- `adminAuth` → Admin JWT custom

---

## 📋 Checklist de Migración

### Autenticación

- [ ] Mensajeros: Implementar magic link con Supabase Auth
- [ ] Clientes: Implementar email+password con Supabase Auth
- [ ] Admin: Implementar validación de PIN con Edge Function

### Formularios

- [ ] Contacto general → `POST /rest/v1/contactos`
- [ ] Quiero trabajar con ONUS → `POST /rest/v1/solicitudes_mensajeros`

### Campañas

- [ ] Listar campañas activas → `GET /rest/v1/campaigns?is_active=eq.true`
- [ ] Postularse → `POST /rest/v1/postulaciones` (con validación de duplicados)
- [ ] Mis postulaciones → `GET /rest/v1/postulaciones?mensajero_id=eq.{id}`
- [ ] CRUD admin → Supabase PostgREST con RLS

### Presupuestos

- [ ] Mantener generación de PDF en frontend (jsPDF)
- [ ] Enviar detalle por email → `POST /functions/v1/send-presupuesto-email`
- [ ] NO guardar en BD

---

## 🎯 Prioridades de Implementación

### Prioridad 1 (Crítico)
1. Limpiar filtros de mensajeros (no persistir)
2. Actualizar envío de presupuestos (detalle en email, no adjunto)
3. Simplificar postulaciones

### Prioridad 2 (Importante)
4. Eliminar código muerto (referencias a códigos antiguos)
5. Limpiar localStorage (keys no usados)

### Prioridad 3 (Preparación backend)
6. Preparar todas las llamadas a API de Supabase (con comentarios TODO)
7. Configurar variables de entorno de Vercel

---

## 🔧 Comandos para Testing Local

```bash
# Limpiar localStorage
localStorage.clear()

# Verificar variables de entorno
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_DEMO_CLIENT_EMAIL)

# Simular magic link (desarrollo)
// En MensajerosLogin.tsx, añadir botón temporal:
<button onClick={() => {
  localStorage.setItem('supabase_auth_token', 'demo-token')
  navigate('/mensajeros')
}}>
  Login Demo (dev only)
</button>
```

---

## 📝 Notas Finales

- **UI no se modifica**: Solo lógica interna
- **Todos los textos visibles se mantienen**: No cambiar TEXTS
- **Diseño intacto**: No tocar estilos, colores, layouts
- **Funcionalidades eliminadas**: Sin UI de Leads/Contactos/Mensajeros en admin
- **Edge Functions pendientes**: Crear después de tener Supabase configurado

---

## ✅ Estado Actual del Proyecto

| Componente | Estado | Acción |
|-----------|--------|--------|
| Clientes (Auth) | ✅ Actualizado | Listo |
| Mensajeros Login | ✅ Actualizado | Listo |
| Mensajeros Sesión | ⏳ Pendiente | Eliminar guardado filtros |
| Postulaciones | ⏳ Pendiente | Simplificar vista |
| Tarifarios (3) | ⏳ Pendiente | Cambiar envío email |
| Email Service | ⏳ Pendiente | Redefinir función |
| Admin Panel | ✅ Limpio | Listo |
| Backend Specs | ✅ Reescrito | Listo |

**Progreso total**: 4/8 (50%)
