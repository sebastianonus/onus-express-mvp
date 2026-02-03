import * as kv from "./kv_store.tsx";

// Genera código único alfanumérico
function generateUniqueCode(): string {
  const prefix = "EXT";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin letras/números confusos (0,O,1,I)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

// Verifica si un código ya existe
async function isCodeUnique(code: string): Promise<boolean> {
  try {
    const existing = await kv.get(`mensajero_externo:${code}`);
    return !existing;
  } catch {
    return true;
  }
}

// Genera código único garantizado
export async function generateCode(): Promise<string> {
  let code = generateUniqueCode();
  let attempts = 0;
  
  while (!(await isCodeUnique(code)) && attempts < 10) {
    code = generateUniqueCode();
    attempts++;
  }
  
  return code;
}

// Registra un nuevo mensajero externo
export async function registerMensajero(data: {
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  radio: number;
  vehiculo: string;
  horario: string;
  jornada: string;
}) {
  const codigo = await generateCode();
  
  const mensajero = {
    codigo,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    ciudad: data.ciudad,
    radio_km: data.radio,
    vehiculo: data.vehiculo,
    horario: data.horario,
    jornada: data.jornada,
    fecha_registro: new Date().toISOString(),
    activo: true,
  };
  
  await kv.set(`mensajero_externo:${codigo}`, mensajero);
  
  return { success: true, codigo, mensajero };
}

// Verifica un código de acceso
export async function verifyCode(codigo: string) {
  try {
    const mensajero = await kv.get(`mensajero_externo:${codigo}`);
    
    if (!mensajero) {
      return { success: false, error: "Código de acceso incorrecto" };
    }
    
    if (!mensajero.activo) {
      return { success: false, error: "Este código ha sido desactivado" };
    }
    
    return { success: true, mensajero };
  } catch (error) {
    console.error("Error verifying code:", error);
    return { success: false, error: "Error al verificar código" };
  }
}

// Obtiene todos los mensajeros (para admin)
export async function getAllMensajeros() {
  try {
    const mensajeros = await kv.getByPrefix("mensajero_externo:");
    return { success: true, mensajeros };
  } catch (error) {
    console.error("Error fetching mensajeros:", error);
    return { success: false, error: "Error al obtener mensajeros" };
  }
}

// Actualiza estado de un mensajero
export async function updateMensajeroStatus(codigo: string, activo: boolean) {
  try {
    const mensajero = await kv.get(`mensajero_externo:${codigo}`);
    
    if (!mensajero) {
      return { success: false, error: "Mensajero no encontrado" };
    }
    
    const updated = {
      ...mensajero,
      activo,
      fecha_actualizacion: new Date().toISOString(),
    };
    
    await kv.set(`mensajero_externo:${codigo}`, updated);
    
    return { success: true, mensajero: updated };
  } catch (error) {
    console.error("Error updating mensajero:", error);
    return { success: false, error: "Error al actualizar mensajero" };
  }
}