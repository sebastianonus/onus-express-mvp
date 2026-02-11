# Security Hardening Checklist

Date: 2026-02-11

## Implemented in code
- Secrets ignored in Git: `.env*`, logs, local Supabase artifacts.
- Admin PIN no longer persisted in browser storage.
- Edge Functions restricted by optional origin allowlist (`ALLOWED_ORIGINS`).
- Constant-time PIN comparison in admin endpoints.
- Plaintext client password persistence disabled by default (`ALLOW_PASSWORD_VISIBLE_STORAGE=false`).
- Email payload sanitized in `send-presupuesto-email` to reduce HTML injection risk.
- Vercel security headers enabled (CSP, HSTS, frame/permissions/referrer protections).

## Required platform actions (GitHub)
- Enable branch protection on `main`:
  - Require pull request.
  - Require status checks.
  - Require signed commits (optional but recommended).
- Enable GitHub Advanced Security features available to your plan:
  - Secret scanning + push protection.
  - Dependabot alerts and automated updates.
- Configure repository secrets only in GitHub Actions secrets (never in code).

## Required platform actions (Supabase)
- Set secrets in Edge Functions:
  - `ADMIN_PIN` (or `ADMIN_PANEL_PIN`) as a long random secret.
  - `ALLOWED_ORIGINS` with exact production domains (comma-separated).
  - Keep `ALLOW_PASSWORD_VISIBLE_STORAGE=false` unless strictly required.
- Rotate keys if they were ever shared in docs/chats/screenshots:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
  - `RESEND_API_KEY`
- Verify RLS is enabled and policies are strict for all sensitive tables:
  - `users`, `clientes`, `clientes_credenciales`, `contactos`, `solicitudes_mensajeros`, `postulaciones`, `campaigns`.
- Enable audit logs and periodically review auth/events.

## Required platform actions (Vercel)
- Configure Production and Preview env vars separately.
- Restrict env var access to required environments only.
- Verify custom domain uses HTTPS only and redirects HTTP -> HTTPS.
- Set `ALLOWED_ORIGINS` to exact Vercel/custom domains.

## Open risks to address next
- `src/hooks/useRequireRole.ts` is still a placeholder and does not enforce authorization by itself.
- If `ALLOW_PASSWORD_VISIBLE_STORAGE=true` is ever enabled, plaintext password storage is a high-risk exception.
- Campaign/admin write operations from frontend should be moved to server-validated endpoints (PIN/session + audit).
