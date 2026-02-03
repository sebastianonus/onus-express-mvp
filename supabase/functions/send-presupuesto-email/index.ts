// Supabase Edge Function: send-presupuesto-email
// Requiere sesión válida y role = cliente
// Envía email HTML con el presupuesto
// NO guarda datos en base de datos
// NO adjunta PDFs

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Email (se configurará como Secret después)
const EMAIL_TO = Deno.env.get("EMAIL_TO")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async (req) => {
  // Solo POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "METHOD_NOT_ALLOWED" }),
      { status: 405 }
    );
  }

  // Auth header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ ok: false, error: "NO_AUTH_HEADER" }),
      { status: 401 }
    );
  }

  // Crear cliente Supabase con el JWT del usuario
  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  // Validar sesión
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(
      JSON.stringify({ ok: false, error: "INVALID_SESSION" }),
      { status: 401 }
    );
  }

  // Validar rol cliente
  const role = user.app_metadata?.role;
  if (role !== "cliente") {
    return new Response(
      JSON.stringify({ ok: false, error: "FORBIDDEN_ROLE" }),
      { status: 403 }
    );
  }

  // Leer payload
  const payload = await req.json();

  const {
    cliente_nombre,
    cliente_email,
    items,
    total,
  } = payload;

  if (!cliente_nombre || !cliente_email || !items || !total) {
    return new Response(
      JSON.stringify({ ok: false, error: "INVALID_PAYLOAD" }),
      { status: 400 }
    );
  }

  // Construir HTML del email
  const itemsHtml = items
    .map(
      (i: any) =>
        `<tr>
          <td style="padding:6px 8px;">${i.nombre}</td>
          <td style="padding:6px 8px;">${i.cantidad}</td>
          <td style="padding:6px 8px;">€${i.precio}</td>
        </tr>`
    )
    .join("");

  const html = `
    <h2>Nuevo presupuesto solicitado</h2>
    <p><strong>Cliente:</strong> ${cliente_nombre}</p>
    <p><strong>Email:</strong> ${cliente_email}</p>

    <table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:6px 8px;">Servicio</th>
          <th style="padding:6px 8px;">Cantidad</th>
          <th style="padding:6px 8px;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <p style="margin-top:16px;"><strong>Total:</strong> €${total}</p>
  `;

  // Envío de email (ejemplo genérico vía fetch)
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${EMAIL_PROVIDER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: "Nuevo presupuesto ONUS Express",
      html,
    }),
  });

  if (!emailResponse.ok) {
    return new Response(
      JSON.stringify({ ok: false, error: "EMAIL_SEND_FAILED" }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200 }
  );
});
