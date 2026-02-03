import { Hono } from "npm:hono";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as mensajeros from "./mensajeros.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

app.use("*", async (c, next) => {
  const origin = c.req.header("origin") ?? "*";

  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "authorization,apikey,content-type",
      },
    });
  }

  const res = await next();

  c.header("Access-Control-Allow-Origin", origin);
  c.header("Vary", "Origin");

  return res;
});

app.use("*", logger(console.log));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

app.get("/make-server-372a0974/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/make-server-372a0974/seed-campaigns", async (c) => {
  try {
    const campaigns = [
      {
        id: crypto.randomUUID(),
        titulo: "Mensajero Express Nacional (FICTICIA)",
        ciudad: "Nacional",
        tarifa: "16-18€/hora",
        descripcion: "Buscamos mensajeros para reparto express en todas las ciudades de España. Rutas estables y buen ambiente de trabajo.",
        vehiculos: ["Moto", "Coche"],
        flotista: ["DNI/NIE (en vigor)", "Permiso de conducir (en vigor)", "Puntos de la DGT"],
        mensajero: ["Alta de Autónomo", "DNI/NIE (en vigor)", "Permiso de conducir (en vigor)"],
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        titulo: "Conductor Furgoneta - Última Milla (FICTICIA)",
        ciudad: "Nacional",
        tarifa: "1.200-1.500€/mes",
        descripcion: "Campaña nacional para reparto de última milla con furgoneta. Incluye rutas planificadas y soporte logístico completo.",
        vehiculos: ["Furgoneta"],
        flotista: ["DNI/NIE (en vigor)", "Permiso de conducir (en vigor)", "Alta de la Seguridad Social", "ITA"],
        mensajero: ["Último recibo de pago de Autónomos", "Alta de Autónomo", "DNI/NIE (en vigor)", "Permiso de conducir (en vigor)"],
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        titulo: "Repartidor Multi-Plataforma (FICTICIA)",
        ciudad: "Nacional",
        tarifa: "Según experiencia",
        descripcion: "Oportunidad para trabajar con múltiples plataformas de reparto. Flexibilidad horaria y compensación competitiva.",
        vehiculos: ["Moto", "Bicicleta"],
        flotista: ["DNI/NIE (en vigor)", "Permiso de conducir (en vigor)"],
        mensajero: ["Alta de Autónomo", "DNI/NIE (en vigor)"],
        createdAt: new Date().toISOString(),
        isActive: false,
      },
      {
        id: crypto.randomUUID(),
        titulo: "Mensajero Zona Barcelona (FICTICIA)",
        ciudad: "Barcelona",
        tarifa: "17-20€/hora",
        descripcion: "Campaña específica para el área metropolitana de Barcelona. Rutas urbanas optimizadas y horario diurno.",
        vehiculos: ["Moto", "Coche"],
        flotista: ["DNI/NIE (en vigor)", "Permiso de conducir (en vigor)", "Puntos de la DGT", "Alta de la Seguridad Social"],
        mensajero: ["Alta de Autónomo", "Certificado IAE", "DNI/NIE (en vigor)", "Permiso de conducir (en vigor)"],
        createdAt: new Date().toISOString(),
        isActive: false,
      },
      {
        id: crypto.randomUUID(),
        titulo: "Conductor Urgente Madrid Centro (FICTICIA)",
        ciudad: "Madrid",
        tarifa: "18-22€/hora",
        descripcion: "Buscamos mensajeros para entregas urgentes en Madrid capital y zona centro. Conocimiento de la ciudad imprescindible.",
        vehiculos: ["Moto"],
        flotista: ["DNI/NIE (en vigor)", "Permiso de conducir (en vigor)", "Puntos de la DGT", "Formación PRL"],
        mensajero: ["Último recibo de pago de Autónomos", "Alta de Autónomo", "DNI/NIE (en vigor)", "Permiso de conducir (en vigor)", "Puntos de la DGT"],
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ];

    for (const campaign of campaigns) {
      await kv.set(`campaign:${campaign.id}`, campaign);
    }

    return c.json({ success: true, message: "Campañas de ejemplo creadas", count: campaigns.length });
  } catch (error) {
    console.error("Error seeding campaigns:", error);
    return c.json({ error: "Failed to seed campaigns" }, 500);
  }
});

app.get("/make-server-372a0974/campaigns", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data, error } = await supabase
      .from("kv_store_372a0974")
      .select("key, value")
      .like("key", "campaign:%");
    
    if (error) {
      console.error("Error fetching campaigns from database:", error);
      return c.json({ error: "Failed to fetch campaigns" }, 500);
    }
    
    return c.json({ campaigns: data || [] });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return c.json({ error: "Failed to fetch campaigns", details: error.message }, 500);
  }
});

app.get("/make-server-372a0974/campaigns/filtered", async (c) => {
  try {
    const city = c.req.query("city");
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data, error } = await supabase
      .from("kv_store_372a0974")
      .select("key, value")
      .like("key", "campaign:%");
    
    if (error) {
      console.error("Error fetching campaigns from database:", error);
      return c.json({ error: "Failed to fetch campaigns" }, 500);
    }
    
    const filteredCampaigns = city 
      ? (data || []).filter((campaign: any) => 
          campaign.value.ciudad === "Nacional" || campaign.value.ciudad === city
        )
      : (data || []);
    
    return c.json({ campaigns: filteredCampaigns });
  } catch (error) {
    console.error("Error filtering campaigns:", error);
    return c.json({ error: "Failed to filter campaigns" }, 500);
  }
});

app.post("/make-server-372a0974/campaigns", async (c) => {
  try {
    const body = await c.req.json();
    const campaignId = crypto.randomUUID();
    const campaign = {
      id: campaignId,
      ...body,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`campaign:${campaignId}`, campaign);
    return c.json({ success: true, campaign });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return c.json({ error: "Failed to create campaign", details: error.message }, 500);
  }
});

app.post("/make-server-372a0974/campaigns-delete-all", async (c) => {
  try {
    const campaigns = await kv.getByPrefix("campaign:");
    
    if (campaigns.length === 0) {
      return c.json({ success: true, message: "No hay campañas", deleted: 0 });
    }
    
    let deleted = 0;
    for (const campaign of campaigns) {
      try {
        await kv.del(`campaign:${campaign.id}`);
        deleted++;
      } catch (err) {
        console.error(`Error eliminando ${campaign.id}:`, err);
      }
    }
    
    return c.json({ 
      success: true, 
      message: `${deleted} campañas eliminadas`,
      deleted: deleted
    });
  } catch (error) {
    console.error("Error crítico:", error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get("/make-server-372a0974/debug-database", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data, error } = await supabase
      .from("kv_store_372a0974")
      .select("*");
    
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ 
      total: data?.length || 0,
      rows: data 
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/make-server-372a0974/nuclear-delete", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data, error } = await supabase
      .from("kv_store_372a0974")
      .delete()
      .like('key', 'campaign:%')
      .select();
    
    if (error) {
      console.error('Error Supabase:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ 
      success: true,
      deleted: data?.length || 0,
      message: `${data?.length || 0} registros eliminados` 
    });
  } catch (error) {
    console.error('Error crítico:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put("/make-server-372a0974/campaigns/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existing = await kv.get(`campaign:${id}`);
    if (!existing) {
      return c.json({ error: "Campaign not found" }, 404);
    }
    
    const updatedCampaign = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`campaign:${id}`, updatedCampaign);
    return c.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return c.json({ error: "Failed to update campaign" }, 500);
  }
});

app.delete("/make-server-372a0974/campaigns/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`campaign:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return c.json({ error: "Failed to delete campaign" }, 500);
  }
});

app.post("/make-server-372a0974/campaigns/upload-logo", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("logo") as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const bucketName = "make-372a0974-campaign-logos";
    
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading logo:", error);
      return c.json({ error: "Failed to upload logo" }, 500);
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return c.json({ success: true, url: urlData.publicUrl });
  } catch (error) {
    console.error("Error in upload endpoint:", error);
    return c.json({ error: "Failed to upload logo" }, 500);
  }
});

app.post("/make-server-372a0974/mensajeros/register", async (c) => {
  try {
    const body = await c.req.json();
    const { nombre, email, telefono } = body;

    if (!nombre || !email || !telefono) {
      return c.json({ error: "Todos los campos son obligatorios" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Email inválido" }, 400);
    }

    try {
      const existing = await kv.get(`mensajero:${email}`);
      if (existing) {
        return c.json({ error: "Este email ya está registrado" }, 400);
      }
    } catch (kvError) {
      console.error('Error checking existing email:', kvError);
    }

    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    const mensajero = {
      nombre,
      email,
      telefono,
      accessCode,
      createdAt: new Date().toISOString(),
    };

    try {
      await kv.set(`mensajero:${email}`, mensajero);
    } catch (kvError) {
      console.error('Error saving mensajero:', kvError);
      return c.json({ error: "Error al guardar el registro" }, 500);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
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
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ONUS EXPRESS <onboarding@resend.dev>',
          to: email,
          subject: 'Tu código de acceso a ONUS EXPRESS',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #000935;">Bienvenido a ONUS EXPRESS</h1>
              <p>Hola ${nombre},</p>
              <p>Tu registro ha sido exitoso. Aquí está tu código de acceso:</p>
              <div style="background-color: #00C9CE; color: #000935; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${accessCode}
              </div>
              <p>Usa este código para acceder al área de mensajeros y ver las campañas disponibles en tu zona.</p>
              <p>Si no has solicitado este código, por favor ignora este email.</p>
              <br>
              <p>Saludos,<br><strong>Equipo ONUS EXPRESS</strong></p>
            </div>
          `,
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

app.post("/make-server-372a0974/mensajeros/verify", async (c) => {
  try {
    const body = await c.req.json();
    const { codigo } = body;

    if (!codigo) {
      return c.json({ error: "Código requerido" }, 400);
    }

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

// ============= NUEVOS ENDPOINTS MENSAJEROS EXTERNOS =============

// Registro de mensajero externo (simplificado)
app.post("/make-server-372a0974/mensajeros-externos/register", async (c) => {
  try {
    const body = await c.req.json();
    const { nombre, email, telefono, ciudad, radio, vehiculo, horario, jornada } = body;

    if (!nombre || !email || !telefono || !ciudad || !radio || !vehiculo || !horario || !jornada) {
      return c.json({ error: "Todos los campos son obligatorios" }, 400);
    }

    const result = await mensajeros.registerMensajero({
      nombre,
      email,
      telefono,
      ciudad,
      radio,
      vehiculo,
      horario,
      jornada,
    });

    return c.json(result);
  } catch (error) {
    console.error("Error registering mensajero externo:", error);
    return c.json({ error: "Error al registrar mensajero: " + error.message }, 500);
  }
});

// Verificar código de mensajero externo
app.post("/make-server-372a0974/mensajeros-externos/verify", async (c) => {
  try {
    const body = await c.req.json();
    const { codigo } = body;

    if (!codigo) {
      return c.json({ error: "Código requerido" }, 400);
    }

    const result = await mensajeros.verifyCode(codigo);
    
    if (!result.success) {
      return c.json({ error: result.error }, 401);
    }

    return c.json(result);
  } catch (error) {
    console.error("Error verifying mensajero externo code:", error);
    return c.json({ error: "Error al verificar código" }, 500);
  }
});

// Obtener todos los mensajeros (admin)
app.get("/make-server-372a0974/mensajeros-externos", async (c) => {
  try {
    const result = await mensajeros.getAllMensajeros();
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json(result);
  } catch (error) {
    console.error("Error fetching mensajeros externos:", error);
    return c.json({ error: "Error al obtener mensajeros" }, 500);
  }
});

// Actualizar estado de mensajero (activar/desactivar)
app.patch("/make-server-372a0974/mensajeros-externos/:codigo", async (c) => {
  try {
    const codigo = c.req.param("codigo");
    const body = await c.req.json();
    const { activo } = body;

    if (activo === undefined) {
      return c.json({ error: "Campo 'activo' requerido" }, 400);
    }

    const result = await mensajeros.updateMensajeroStatus(codigo, activo);
    
    if (!result.success) {
      return c.json({ error: result.error }, 404);
    }

    return c.json(result);
  } catch (error) {
    console.error("Error updating mensajero externo status:", error);
    return c.json({ error: "Error al actualizar mensajero" }, 500);
  }
});

// ========== CONTACTOS ==========

// Guardar formulario de contacto
app.post("/make-server-372a0974/contactos", async (c) => {
  try {
    const body = await c.req.json();
    const { nombre, empresa, telefono, email, mensaje } = body;

    if (!nombre || !telefono || !email || !mensaje) {
      return c.json({ error: "Campos requeridos: nombre, telefono, email, mensaje" }, 400);
    }

    const contactoId = `contacto:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const contacto = {
      id: contactoId,
      nombre,
      empresa: empresa || '',
      telefono,
      email,
      mensaje,
      fecha: new Date().toISOString(),
      leido: false
    };

    await kv.set(contactoId, contacto);

    console.log("Contacto guardado:", contactoId);

    return c.json({ 
      success: true, 
      message: "Contacto guardado exitosamente",
      contacto 
    });
  } catch (error) {
    console.error("Error guardando contacto:", error);
    return c.json({ error: "Error al guardar contacto" }, 500);
  }
});

// Obtener todos los contactos (admin)
app.get("/make-server-372a0974/contactos", async (c) => {
  try {
    const contactos = await kv.getByPrefix("contacto:");
    
    return c.json({ 
      success: true, 
      contactos: contactos.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
    });
  } catch (error) {
    console.error("Error obteniendo contactos:", error);
    return c.json({ error: "Error al obtener contactos" }, 500);
  }
});

// Marcar contacto como leído
app.patch("/make-server-372a0974/contactos/:id/leido", async (c) => {
  try {
    const id = c.req.param("id");
    const contacto = await kv.get(id);
    
    if (!contacto) {
      return c.json({ error: "Contacto no encontrado" }, 404);
    }

    contacto.leido = true;
    await kv.set(id, contacto);

    return c.json({ success: true, contacto });
  } catch (error) {
    console.error("Error actualizando contacto:", error);
    return c.json({ error: "Error al actualizar contacto" }, 500);
  }
});

// ========== SOLICITUDES DE MENSAJEROS ==========

// Guardar solicitud de mensajero (formulario "Únete a Nosotros")
app.post("/make-server-372a0974/solicitudes", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      nombre, 
      telefono, 
      email, 
      zona, 
      experiencia, 
      tipoVehiculo, 
      caracteristicasVehiculo,
      fechaInicio,
      horarioDisponible,
      autonomo,
      comentarios
    } = body;

    if (!nombre || !telefono || !email || !zona) {
      return c.json({ error: "Campos requeridos: nombre, telefono, email, zona" }, 400);
    }

    const solicitudId = `solicitud:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const solicitud = {
      id: solicitudId,
      nombre,
      telefono,
      email,
      zona,
      experiencia: experiencia || '',
      tipoVehiculo: tipoVehiculo || '',
      caracteristicasVehiculo: caracteristicasVehiculo || '',
      fechaInicio: fechaInicio || '',
      horarioDisponible: horarioDisponible || '',
      autonomo: autonomo || '',
      comentarios: comentarios || '',
      fecha: new Date().toISOString(),
      estado: 'pendiente', // pendiente, revisado, aceptado, rechazado
      leido: false
    };

    await kv.set(solicitudId, solicitud);

    console.log("Solicitud guardada:", solicitudId);

    return c.json({ 
      success: true, 
      message: "Solicitud guardada exitosamente",
      solicitud 
    });
  } catch (error) {
    console.error("Error guardando solicitud:", error);
    return c.json({ error: "Error al guardar solicitud" }, 500);
  }
});

// Obtener todas las solicitudes (admin)
app.get("/make-server-372a0974/solicitudes", async (c) => {
  try {
    const solicitudes = await kv.getByPrefix("solicitud:");
    
    return c.json({ 
      success: true, 
      solicitudes: solicitudes.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
    });
  } catch (error) {
    console.error("Error obteniendo solicitudes:", error);
    return c.json({ error: "Error al obtener solicitudes" }, 500);
  }
});

// Actualizar estado de solicitud
app.patch("/make-server-372a0974/solicitudes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { estado, leido } = body;
    
    const solicitud = await kv.get(id);
    
    if (!solicitud) {
      return c.json({ error: "Solicitud no encontrada" }, 404);
    }

    if (estado !== undefined) {
      solicitud.estado = estado;
    }
    if (leido !== undefined) {
      solicitud.leido = leido;
    }

    await kv.set(id, solicitud);

    return c.json({ success: true, solicitud });
  } catch (error) {
    console.error("Error actualizando solicitud:", error);
    return c.json({ error: "Error al actualizar solicitud" }, 500);
  }
});

// ========== LEADS (SISTEMA UNIFICADO) ==========

// Guardar lead desde formulario de contacto
app.post("/make-server-372a0974/leads", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      nombre, 
      empresa, 
      telefono, 
      email, 
      mensaje,
      lead_type,  // 'messenger' o 'client'
      service,    // 'fleet', 'logistics_staff', 'general_contact'
      source      // 'services' o 'contact_page'
    } = body;

    if (!nombre || !telefono || !email) {
      return c.json({ error: "Campos requeridos: nombre, telefono, email" }, 400);
    }

    const leadId = `lead:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const lead = {
      id: leadId,
      // Campos visibles
      nombre,
      empresa: empresa || '',
      telefono,
      email,
      mensaje: mensaje || '',
      // Metadatos internos
      lead_type: lead_type || 'client',
      service: service || 'general_contact',
      source: source || 'contact_page',
      status: 'new', // new, contacted, qualified, onboarded, discarded
      internal_notes: '',
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(leadId, lead);

    console.log("Lead guardado:", leadId);

    return c.json({ 
      success: true, 
      message: "Lead guardado exitosamente",
      lead 
    });
  } catch (error) {
    console.error("Error guardando lead:", error);
    return c.json({ error: "Error al guardar lead" }, 500);
  }
});

// Obtener todos los leads (admin)
app.get("/make-server-372a0974/leads", async (c) => {
  try {
    const leads = await kv.getByPrefix("lead:");
    
    return c.json({ 
      success: true, 
      leads: leads.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    });
  } catch (error) {
    console.error("Error obteniendo leads:", error);
    return c.json({ error: "Error al obtener leads" }, 500);
  }
});

// Actualizar lead (estado, notas, tags)
app.patch("/make-server-372a0974/leads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status, internal_notes, tags } = body;
    
    const lead = await kv.get(id);
    
    if (!lead) {
      return c.json({ error: "Lead no encontrado" }, 404);
    }

    if (status !== undefined) {
      lead.status = status;
    }
    if (internal_notes !== undefined) {
      lead.internal_notes = internal_notes;
    }
    if (tags !== undefined) {
      lead.tags = tags;
    }

    lead.updated_at = new Date().toISOString();

    await kv.set(id, lead);

    return c.json({ success: true, lead });
  } catch (error) {
    console.error("Error actualizando lead:", error);
    return c.json({ error: "Error al actualizar lead" }, 500);
  }
});

Deno.serve(app.fetch);