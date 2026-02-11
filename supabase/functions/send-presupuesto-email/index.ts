import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const EMAIL_TO = Deno.env.get("EMAIL_TO") ?? "info@onusexpress.com";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "ONUS EXPRESS <onboarding@resend.dev>";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
};

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (!isOriginAllowed(origin)) {
    return new Response(
      JSON.stringify({ ok: false, error: "ORIGIN_NOT_ALLOWED" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "METHOD_NOT_ALLOWED" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ ok: false, error: "RESEND_NOT_CONFIGURED" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ ok: false, error: "NO_AUTH_HEADER" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(
      JSON.stringify({ ok: false, error: "INVALID_SESSION" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const role = user.app_metadata?.role;
  if (role !== "cliente") {
    return new Response(
      JSON.stringify({ ok: false, error: "FORBIDDEN_ROLE" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const payload = await req.json().catch(() => ({}));
  const { cliente_nombre, cliente_email, items, total } = payload;

  if (!cliente_nombre || !cliente_email || !Array.isArray(items) || items.length === 0 || typeof total === "undefined") {
    return new Response(
      JSON.stringify({ ok: false, error: "INVALID_PAYLOAD" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (items.length > 100) {
    return new Response(
      JSON.stringify({ ok: false, error: "TOO_MANY_ITEMS" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const itemsHtml = items
    .map(
      (item: Record<string, unknown>) =>
        `<tr>
          <td style="padding:6px 8px;">${escapeHtml(item?.nombre)}</td>
          <td style="padding:6px 8px;">${escapeHtml(item?.cantidad)}</td>
          <td style="padding:6px 8px;">EUR ${escapeHtml(item?.precio)}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <h2>Nuevo presupuesto solicitado</h2>
    <p><strong>Cliente:</strong> ${escapeHtml(cliente_nombre)}</p>
    <p><strong>Email:</strong> ${escapeHtml(cliente_email)}</p>

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

    <p style="margin-top:16px;"><strong>Total:</strong> EUR ${escapeHtml(total)}</p>
  `;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
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
    const resendError = await emailResponse.text().catch(() => "");
    console.error("Resend error:", resendError);
    return new Response(
      JSON.stringify({ ok: false, error: "EMAIL_SEND_FAILED" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
