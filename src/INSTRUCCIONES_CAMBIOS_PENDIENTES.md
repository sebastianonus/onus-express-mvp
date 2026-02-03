# INSTRUCCIONES PARA COMPLETAR CAMBIOS PENDIENTES

## Objetivo

Completar los 3 cambios finales para tener el frontend 100% listo para integración con backend.

---

## Cambio 1: Eliminar guardado de filtros en MensajerosSesion

### Archivo: `/components/MensajerosSesion.tsx`

### Modificaciones necesarias:

#### 1.1 Eliminar inicialización de filtros desde localStorage

**Buscar líneas 176-183**:
```typescript
// Initialize filter states with saved values
if (parsedAuth.filtros) {
  setCiudad(parsedAuth.filtros.ciudad || '');
  setRadioKm([parsedAuth.filtros.radioKm || 50]);
  setVehiculo(parsedAuth.filtros.vehiculo || '');
  setHorario(parsedAuth.filtros.horario || '');
  setJornada(parsedAuth.filtros.jornada || '');
}
```

**ELIMINAR** ese bloque completo.

#### 1.2 Eliminar guardado de filtros en handleBuscarCampanas

**Buscar líneas 253-270**:
```typescript
const nuevosFiltros = {
  ciudad: ciudad || 'Todas',
  radioKm: radioKm[0],
  vehiculo: vehiculo || 'Todos',
  horario: horario || 'Todos',
  jornada: jornada || 'Todas'
};

// Update mensajero auth with new filters
if (mensajero) {
  const updatedAuth = {
    ...mensajero,
    filtros: nuevosFiltros
  };
  localStorage.setItem('mensajero_auth', JSON.stringify(updatedAuth));
  setMensajero(updatedAuth);
}
```

**REEMPLAZAR** con:
```typescript
const nuevosFiltros = {
  ciudad: ciudad || 'Todas',
  radioKm: radioKm[0],
  vehiculo: vehiculo || 'Todos',
  horario: horario || 'Todos',
  jornada: jornada || 'Todas'
};

// Los filtros NO se guardan, solo se usan para filtrar en UI
```

#### 1.3 Actualizar interface MensajeroAuth

**Buscar líneas 57-71**:
```typescript
interface MensajeroAuth {
  codigo: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  fechaLogin: string;
  filtros?: {
    ciudad: string;
    radioKm: number;
    vehiculo: string;
    horario: string;
    jornada: string;
  };
}
```

**ELIMINAR** el campo `filtros?` (opcional) de la interface:
```typescript
interface MensajeroAuth {
  codigo: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  fechaLogin: string;
  // filtros eliminados - no se persisten
}
```

---

## Cambio 2: Actualizar envío de presupuestos en tarifarios

### Archivos afectados (3):
- `/components/tarifarios/TarifarioUltimaMilla.tsx`
- `/components/tarifarios/TarifarioMensajeriaExpress.tsx`
- `/components/tarifarios/TarifarioAlmacenLogistica.tsx`

### Modificaciones necesarias (aplicar a los 3 archivos):

#### 2.1 Cambiar imports

**Buscar**:
```typescript
import { enviarPDFporEmail, blobToBase64, obtenerEmailUsuarioActual } from '../../utils/emailService';
```

**REEMPLAZAR** con:
```typescript
import { enviarPresupuestoPorEmail, obtenerEmailCliente, obtenerNombreCliente } from '../../utils/emailPresupuesto';
```

#### 2.2 Cambiar lógica de envío de email

**Buscar** (aproximadamente líneas 299-329 en cada archivo):
```typescript
// Enviar PDF por email a info@onusexpress.com si no es admin
if (!isAdmin) {
  try {
    const userEmail = obtenerEmailUsuarioActual();
    if (userEmail) {
      // Convertir PDF a base64 para envío
      const pdfBlob = pdf.output('blob');
      const pdfBase64 = await blobToBase64(pdfBlob);
      
      const clienteActual = JSON.parse(localStorage.getItem('onus_cliente_actual') || '{}');
      const userName = clienteActual.nombre || 'Cliente';

      const resultado = await enviarPDFporEmail({
        userEmail,
        userName,
        pdfBase64,
        pdfFileName: fileName,
        tarifarioType: 'ultima-milla' // o 'mensajeria-express' o 'almacen-logistica'
      });

      if (resultado.success) {
        toast.success('PDF descargado y enviado a ONUS EXPRESS', {
          description: 'Recibirás una copia de confirmación en tu email'
        });
      }
    }
  } catch (emailError) {
    console.error('Error al enviar email:', emailError);
    // No mostramos error al usuario, el PDF ya se descargó correctamente
  }
}
```

**REEMPLAZAR** con:
```typescript
// Enviar detalle del presupuesto por email (sin adjunto PDF)
if (!isAdmin) {
  try {
    const clienteEmail = obtenerEmailCliente();
    const clienteNombre = state.nombreCliente || obtenerNombreCliente() || 'Cliente';
    
    if (clienteEmail) {
      // Extraer items del presupuesto
      // NOTA: Necesitas adaptar esto según la estructura de cada tarifario
      const items = [
        // EJEMPLO - Adaptar según el tarifario específico:
        {
          concepto: 'Servicio Ejemplo',
          cantidad: 1,
          precio_unitario: 100,
          subtotal: 100
        }
        // ... más items según el tarifario
      ];

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      const resultado = await enviarPresupuestoPorEmail({
        cliente_email: clienteEmail,
        cliente_nombre: clienteNombre,
        tipo_tarifario: 'ultima-milla', // o 'mensajeria-express' o 'almacen-logistica'
        items,
        total
      });

      if (resultado.success) {
        toast.success('Presupuesto generado y enviado', {
          description: 'Hemos notificado a ONUS EXPRESS con el detalle completo'
        });
      }
    }
  } catch (emailError) {
    console.error('Error al enviar presupuesto:', emailError);
    // No mostramos error al usuario, el PDF ya se descargó correctamente
  }
}
```

#### 2.3 Extracción de items por tarifario

**Para cada tarifario, necesitas extraer los items según su estructura:**

##### TarifarioUltimaMilla.tsx
```typescript
// Ejemplo de extracción de items (adaptar según campos del tarifario)
const items = [
  {
    concepto: 'Reparto Zona 1',
    cantidad: parseInt(state.zona1 || '0'),
    precio_unitario: 2.5,
    subtotal: parseFloat(state.zona1 || '0') * 2.5
  },
  {
    concepto: 'Reparto Zona 2',
    cantidad: parseInt(state.zona2 || '0'),
    precio_unitario: 3.0,
    subtotal: parseFloat(state.zona2 || '0') * 3.0
  }
  // ... más zonas/servicios
].filter(item => item.cantidad > 0);
```

##### TarifarioMensajeriaExpress.tsx
```typescript
// Ejemplo de extracción de items
const items = [
  {
    concepto: 'Envío Express Nacional',
    cantidad: parseInt(state.enviosNacional || '0'),
    precio_unitario: 5.0,
    subtotal: parseFloat(state.enviosNacional || '0') * 5.0
  },
  {
    concepto: 'Envío Express Internacional',
    cantidad: parseInt(state.enviosInternacional || '0'),
    precio_unitario: 15.0,
    subtotal: parseFloat(state.enviosInternacional || '0') * 15.0
  }
  // ... más tipos de envío
].filter(item => item.cantidad > 0);
```

##### TarifarioAlmacenLogistica.tsx
```typescript
// Ejemplo de extracción de items
const items = [
  {
    concepto: 'Almacenamiento m²',
    cantidad: parseInt(state.metrosCuadrados || '0'),
    precio_unitario: 10.0,
    subtotal: parseFloat(state.metrosCuadrados || '0') * 10.0
  },
  {
    concepto: 'Picking Unidades',
    cantidad: parseInt(state.unidadesPicking || '0'),
    precio_unitario: 0.5,
    subtotal: parseFloat(state.unidadesPicking || '0') * 0.5
  }
  // ... más servicios logísticos
].filter(item => item.cantidad > 0);
```

**IMPORTANTE**: Necesitas revisar la estructura `state` de cada tarifario para extraer correctamente los campos y precios.

---

## Cambio 3: Simplificar vista de postulaciones

### Archivo: `/components/MensajerosPostulaciones.tsx`

### Modificaciones necesarias:

#### 3.1 Simplificar interface Postulacion

**Buscar líneas 18-31**:
```typescript
interface Postulacion {
  id: string;
  mensajeroCodigo: string;
  mensajeroNombre: string;
  mensajeroEmail: string;
  mensajeroTelefono: string;
  campanaId: string;
  campanaNombre: string;
  fecha: string;
  estado: 'En revisión' | 'Aceptado' | 'Rechazado';
  motivacion?: string;
  experiencia?: string;
  disponibilidad?: string;
}
```

**MANTENER** (no cambiar), solo eliminar el uso de campos opcionales en el render.

#### 3.2 Simplificar vista de postulación

**Buscar** (aproximadamente líneas 100-150, el bloque de render de cada postulación):
```typescript
<div key={post.id} className="...">
  {/* Muestra todos los detalles: motivacion, experiencia, disponibilidad */}
</div>
```

**REEMPLAZAR** con una vista simplificada que solo muestre:
- Nombre de la campaña
- Estado (badge con color)
- Fecha de postulación

```typescript
<div 
  key={post.id} 
  className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#00C9CE] transition-colors"
>
  <div className="flex items-start justify-between mb-4">
    <div className="flex-1">
      <h3 className="text-lg mb-2" style={{ color: '#000935', fontWeight: 500 }}>
        {post.campanaNombre}
      </h3>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>
          {new Date(post.fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </span>
      </div>
    </div>
    <div>
      {getEstadoBadge(post.estado)}
    </div>
  </div>
</div>
```

**ELIMINAR** todos los campos de detalles adicionales (motivación, experiencia, disponibilidad) del render.

---

## Validación de Cambios

### Checklist de testing:

#### Cambio 1 (Filtros)
- [ ] Mensajero hace login
- [ ] Ve listado de campañas
- [ ] Aplica filtros en UI
- [ ] Campañas se filtran visualmente
- [ ] Hacer logout y login de nuevo
- [ ] **Verificar**: Los filtros NO se mantienen (vuelven a valores por defecto)
- [ ] Revisar localStorage: `mensajero_auth` NO debe tener campo `filtros`

#### Cambio 2 (Presupuestos)
- [ ] Cliente hace login
- [ ] Accede a un tarifario
- [ ] Completa formulario
- [ ] Descarga PDF
- [ ] **Verificar**: PDF se descarga correctamente
- [ ] **Verificar**: Toast muestra "Presupuesto generado y enviado"
- [ ] Revisar localStorage: `onus_presupuestos_queue` contiene:
  - cliente_email
  - cliente_nombre
  - tipo_tarifario
  - items (array con conceptos, cantidades, precios)
  - total
- [ ] **NO debe haber**: campo `pdfBase64` ni `attachmentName`

#### Cambio 3 (Postulaciones)
- [ ] Mensajero postula a una campaña
- [ ] Accede a "Mis postulaciones"
- [ ] **Verificar**: Se muestra:
  - Nombre de campaña
  - Estado (badge con color)
  - Fecha
- [ ] **Verificar**: NO se muestra:
  - Motivación
  - Experiencia
  - Disponibilidad

---

## Comandos útiles para testing

```javascript
// Limpiar localStorage
localStorage.clear()

// Ver mensajero_auth actual
console.log(JSON.parse(localStorage.getItem('mensajero_auth')))

// Ver cola de presupuestos
console.log(JSON.parse(localStorage.getItem('onus_presupuestos_queue')))

// Ver postulaciones
console.log(JSON.parse(localStorage.getItem('onus_postulaciones')))
```

---

## Resumen de Archivos a Modificar

1. `/components/MensajerosSesion.tsx` 
   - Eliminar guardado/carga de filtros
   - Eliminar campo `filtros` de interface

2. `/components/tarifarios/TarifarioUltimaMilla.tsx`
   - Cambiar import de emailService a emailPresupuesto
   - Cambiar lógica de envío de email
   - Extraer items del tarifario

3. `/components/tarifarios/TarifarioMensajeriaExpress.tsx`
   - Cambiar import de emailService a emailPresupuesto
   - Cambiar lógica de envío de email
   - Extraer items del tarifario

4. `/components/tarifarios/TarifarioAlmacenLogistica.tsx`
   - Cambiar import de emailService a emailPresupuesto
   - Cambiar lógica de envío de email
   - Extraer items del tarifario

5. `/components/MensajerosPostulaciones.tsx`
   - Simplificar render de postulaciones
   - Eliminar campos de detalle

---

## Archivos Nuevos Creados

- ✅ `/utils/emailPresupuesto.ts` - Servicio nuevo para envío de presupuestos
- ✅ `/BACKEND_SPECIFICATIONS.md` - Reescrito desde cero
- ✅ `/FRONTEND_CLEANUP_SUMMARY.md` - Resumen de limpieza
- ✅ `/ESTADO_FINAL_PROYECTO.md` - Estado completo
- ✅ `/INSTRUCCIONES_CAMBIOS_PENDIENTES.md` - Este documento

---

## ⚠️ Advertencias Importantes

1. **NO modificar la UI**: Solo cambiar lógica interna
2. **NO cambiar textos visibles**: Mantener todos los TEXTS tal cual
3. **NO tocar estilos**: Mantener todos los className y styles
4. **NO eliminar funcionalidades visibles**: Solo simplificar o cambiar implementación
5. **Todos los TODOs deben quedar claros**: Para facilitar integración con backend

---

## 🎯 Resultado Esperado

Después de completar estos 3 cambios:

✅ Frontend 100% funcional offline  
✅ Código limpio sin lógica muerta  
✅ Preparado para integración directa con Supabase  
✅ Todos los TODOs claramente marcados  
✅ Sin dependencias de código antiguo  

**Tiempo estimado**: 2-3 horas de desarrollo + 1 hora de testing

---

## 💡 Notas Finales

- Si encuentras dificultades con la extracción de items de los tarifarios, puedes usar datos simplificados de ejemplo temporalmente
- Los TODOs en el código deben estar con el formato:
  ```typescript
  // TODO: Cuando tengamos Supabase Auth:
  // await supabase.auth.signInWithOtp({ email })
  ```
- Mantén la simulación local funcionando hasta tener backend real
- No te preocupes por optimizaciones de rendimiento ahora, enfócate en completar la funcionalidad

¡Éxito con los cambios! 🚀
