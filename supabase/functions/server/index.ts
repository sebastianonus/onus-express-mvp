import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const adminPanelPin = Deno.env.get("ADMIN_PANEL_PIN") ?? Deno.env.get("ADMIN_PIN") ?? "";

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const isAdminPinValid = (pin?: string) =>
  Boolean(adminPanelPin) && Boolean(pin) && secureCompare(String(pin), adminPanelPin);

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const generateTemporaryPassword = (length = 14): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

const persistClientCredentialAudit = async (
  action: "created" | "reset",
  userId: string,
  email: string,
  source: string,
  sourceId: string,
  origenFormulario: string,
) => {
  const payload = {
    action,
    user_id: userId,
    email,
    source: source || null,
    source_id: sourceId || null,
    origen_formulario: origenFormulario || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("clientes_credenciales_audit")
    .upsert(payload, { onConflict: "user_id" });

  if (!error) return;

  const code = String((error as { code?: string }).code ?? "");
  // 42P01: relation does not exist, 42703: missing column
  if (code === "42P01" || code === "42703") return;

  throw new Error(error.message);
};

const handlePendingProfiles = async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const pin = body?.pin as string | undefined;

  if (!isAdminPinValid(pin)) return json({ error: "PIN invalido" }, 401);

  // Try with origen_formulario first, fallback if column does not exist
  let solicitudesRes = await supabase
    .from("solicitudes_mensajeros")
    .select("id,nombre,email,telefono,ciudad,created_at,procesado,origen_formulario")
    .order("created_at", { ascending: false })
    .limit(200);

  if (solicitudesRes.error && String((solicitudesRes.error as { code?: string }).code ?? "") === "42703") {
    solicitudesRes = await supabase
      .from("solicitudes_mensajeros")
      .select("id,nombre,email,telefono,ciudad,created_at,procesado")
      .order("created_at", { ascending: false })
      .limit(200);
  }

  let contactosRes = await supabase
    .from("contactos")
    .select("id,nombre,email,telefono,created_at,origen_formulario")
    .order("created_at", { ascending: false })
    .limit(200);

  if (contactosRes.error && String((contactosRes.error as { code?: string }).code ?? "") === "42703") {
    contactosRes = await supabase
      .from("contactos")
      .select("id,nombre,email,telefono,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
  }

  if (solicitudesRes.error) return json({ error: solicitudesRes.error.message }, 500);
  if (contactosRes.error) return json({ error: contactosRes.error.message }, 500);

  const solicitudes = (solicitudesRes.data ?? []).map((row: Record<string, unknown>) => ({
    source: "solicitudes_mensajeros",
    id: row.id,
    nombre: row.nombre ?? "",
    email: row.email ?? "",
    telefono: row.telefono ?? "",
    ciudad: row.ciudad ?? "",
    created_at: row.created_at ?? null,
    procesado: Boolean(row.procesado ?? false),
    origen_formulario: row.origen_formulario ?? "solicitudes_mensajeros",
  }));

  const contactos = (contactosRes.data ?? []).map((row: Record<string, unknown>) => ({
    source: "contactos",
    id: row.id,
    nombre: row.nombre ?? "",
    email: row.email ?? "",
    telefono: row.telefono ?? "",
    ciudad: "",
    created_at: row.created_at ?? null,
    procesado: false,
    origen_formulario: row.origen_formulario ?? "contactos",
  }));

  return json({
    success: true,
    profiles: [...solicitudes, ...contactos].sort(
      (a, b) => new Date(String(b.created_at ?? 0)).getTime() - new Date(String(a.created_at ?? 0)).getTime(),
    ),
  });
};

const handleCreateUser = async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const pin = body?.pin as string | undefined;

  if (!isAdminPinValid(pin)) return json({ error: "PIN invalido" }, 401);

  const email = String(body?.email ?? "").trim().toLowerCase();
  const nombre = String(body?.nombre ?? "").trim();
  const telefono = String(body?.telefono ?? "").trim();
  const role = String(body?.role ?? "mensajero").trim();
  const source = String(body?.source ?? "").trim();
  const sourceId = String(body?.sourceId ?? "").trim();
  const origenFormulario = String(body?.origen_formulario ?? "").trim();
  const origenNorm = origenFormulario.toLowerCase();

  if (!email) return json({ error: "Email requerido" }, 400);
  if (!["mensajero", "cliente"].includes(role)) return json({ error: "Rol invalido" }, 400);

  // Enforce strict origin-role mapping
  if (source === "solicitudes_mensajeros" && role !== "mensajero") {
    return json({ error: "Esta fuente solo permite crear mensajeros" }, 400);
  }
  if (source === "contactos" && role !== "cliente") {
    return json({ error: "Esta fuente solo permite crear clientes" }, 400);
  }
  if (role === "cliente" && ["servicios_unete_mensajeros", "mensajeros_registro", "solicitudes_mensajeros"].includes(origenNorm)) {
    return json({ error: "El origen de mensajeros no puede convertirse en cliente" }, 400);
  }

  const userMetadata: Record<string, string> = { nombre, telefono };
  let generatedPassword: string | null = null;

  if (role === "mensajero") {
    userMetadata.codigo = Math.floor(100000 + Math.random() * 900000).toString();
  }
  if (role === "cliente") {
    generatedPassword = generateTemporaryPassword();
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    ...(generatedPassword ? { password: generatedPassword } : {}),
    app_metadata: { role },
    user_metadata: userMetadata,
  });

  if (error) {
    const msg = String(error.message ?? "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return json({ error: "El usuario ya existe" }, 409);
    }
    return json({ error: error.message }, 500);
  }

  if (source === "solicitudes_mensajeros" && sourceId) {
    await supabase.from("solicitudes_mensajeros").update({ procesado: true }).eq("id", sourceId);
  }
  if (source === "contactos" && sourceId) {
    await supabase.from("contactos").update({ procesado: true }).eq("id", sourceId);
  }

  if (data.user?.id) {
    const usersPayload: Record<string, unknown> = {
      id: data.user.id,
      email,
      nombre: nombre || null,
      telefono: telefono || null,
      role,
      source: source || null,
      source_id: sourceId || null,
      ...(origenFormulario ? { origen_formulario: origenFormulario } : {}),
    };

    const upsertRes = await supabase.from("users").upsert(usersPayload, { onConflict: "id" });

    // Fallback if users table does not have origen_formulario yet
    if (upsertRes.error && String((upsertRes.error as { code?: string }).code ?? "") === "42703") {
      const { origen_formulario: _omit, ...fallbackPayload } = usersPayload as { origen_formulario?: unknown } & Record<string, unknown>;
      await supabase.from("users").upsert(fallbackPayload, { onConflict: "id" });
    }

    if (role === "cliente") {
      const clientePayload: Record<string, unknown> = {
        id: data.user.id,
        email,
        nombre: nombre || null,
        telefono: telefono || null,
        source: source || null,
        source_id: sourceId || null,
        origen_formulario: origenFormulario || null,
        estado: "activo",
      };

      const clienteUpsert = await supabase.from("clientes").upsert(clientePayload, { onConflict: "id" });
      if (clienteUpsert.error) {
        const code = String((clienteUpsert.error as { code?: string }).code ?? "");
        if (code !== "42P01" && code !== "42703") {
          return json({ error: clienteUpsert.error.message }, 500);
        }
      }

      try {
        await persistClientCredentialAudit(
          "created",
          data.user.id,
          email,
          source,
          sourceId,
          origenFormulario,
        );
      } catch (persistErr) {
        return json({ error: (persistErr as Error).message }, 500);
      }
    }
  }

  return json({
    success: true,
    user: {
      id: data.user?.id ?? null,
      email: data.user?.email ?? email,
      role,
    },
    generatedPassword,
  });
};

const handleUpdatePostulacionStatus = async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const pin = body?.pin as string | undefined;
  const postulacionId = String(body?.postulacionId ?? "").trim();
  const estado = String(body?.estado ?? "").trim().toLowerCase();

  if (!isAdminPinValid(pin)) return json({ error: "PIN invalido" }, 401);
  if (!postulacionId) return json({ error: "postulacionId requerido" }, 400);
  if (!["pending", "accepted", "rejected"].includes(estado)) {
    return json({ error: "Estado invalido" }, 400);
  }

  const { data, error } = await supabase
    .from("postulaciones")
    .update({ estado })
    .eq("id", postulacionId)
    .select("id, estado")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: "Postulacion no encontrada" }, 404);

  return json({ success: true, postulacion: data });
};

const handleResetClientPassword = async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const pin = body?.pin as string | undefined;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const userId = String(body?.userId ?? "").trim();

  if (!isAdminPinValid(pin)) return json({ error: "PIN invalido" }, 401);
  if (!email && !userId) return json({ error: "email o userId requerido" }, 400);

  let targetUserId = userId;
  let targetEmail = email;

  if (!targetUserId && targetEmail) {
    const { data: usersByEmail, error: listErr } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) return json({ error: listErr.message }, 500);

    const match = (usersByEmail.users ?? []).find(
      (u) => String(u.email ?? "").trim().toLowerCase() === targetEmail,
    );
    if (!match?.id) return json({ error: "Usuario no encontrado en Auth" }, 404);
    targetUserId = match.id;
    targetEmail = String(match.email ?? targetEmail);
  }

  const { data: userById, error: userErr } = await supabase.auth.admin.getUserById(targetUserId);
  if (userErr || !userById?.user) return json({ error: "Usuario no encontrado" }, 404);

  const role = String(userById.user.app_metadata?.role ?? "");
  if (role !== "cliente") return json({ error: "Solo se permite reset para rol cliente" }, 400);

  const generatedPassword = generateTemporaryPassword();
  const { error: resetErr } = await supabase.auth.admin.updateUserById(targetUserId, {
    password: generatedPassword,
  });
  if (resetErr) return json({ error: resetErr.message }, 500);

  try {
    await persistClientCredentialAudit(
      "reset",
      targetUserId,
      targetEmail || String(userById.user.email ?? ""),
      "admin_reset",
      "",
      "admin_reset",
    );
  } catch (persistErr) {
    return json({ error: (persistErr as Error).message }, 500);
  }

  await supabase
    .from("clientes")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  return json({
    success: true,
    user: {
      id: targetUserId,
      email: targetEmail || String(userById.user.email ?? ""),
      role: "cliente",
    },
    generatedPassword,
  });
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (!isOriginAllowed(origin)) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403);

  const { pathname } = new URL(req.url);

  if (req.method === "GET" && (pathname.endsWith("/health") || pathname.endsWith("/make-server-372a0974/health"))) {
    return json({ status: "ok", timestamp: new Date().toISOString() });
  }

  if (req.method === "POST" && (pathname.endsWith("/admin/pending-profiles") || pathname.endsWith("/make-server-372a0974/admin/pending-profiles"))) {
    return await handlePendingProfiles(req);
  }

  if (req.method === "POST" && (pathname.endsWith("/admin/create-user") || pathname.endsWith("/make-server-372a0974/admin/create-user"))) {
    return await handleCreateUser(req);
  }

  if (req.method === "POST" && (pathname.endsWith("/admin/update-postulacion-status") || pathname.endsWith("/make-server-372a0974/admin/update-postulacion-status"))) {
    return await handleUpdatePostulacionStatus(req);
  }

  if (req.method === "POST" && (pathname.endsWith("/admin/reset-client-password") || pathname.endsWith("/make-server-372a0974/admin/reset-client-password"))) {
    return await handleResetClientPassword(req);
  }

  return json({ error: "NOT_FOUND", path: pathname }, 404);
});
