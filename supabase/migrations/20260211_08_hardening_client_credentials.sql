-- 20260211_08_hardening_client_credentials.sql
-- Seguridad: elimina almacenamiento de contraseñas visibles y deja solo auditoria.

begin;

-- 1) Auditoria sin password
create table if not exists public.clientes_credenciales_audit (
  user_id uuid primary key,
  email text not null,
  action text not null,
  source text,
  source_id text,
  origen_formulario text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_clientes_cred_audit_email on public.clientes_credenciales_audit (lower(email));
create index if not exists idx_clientes_cred_audit_updated_at on public.clientes_credenciales_audit (updated_at desc);

create or replace function public.set_updated_at_clientes_credenciales_audit()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_clientes_credenciales_audit_updated_at on public.clientes_credenciales_audit;
create trigger trg_clientes_credenciales_audit_updated_at
before update on public.clientes_credenciales_audit
for each row
execute function public.set_updated_at_clientes_credenciales_audit();

-- 2) Si existe tabla legacy con password en claro, destruirla para evitar fugas
-- (ajusta si quieres hacer backup fuera de BD antes de ejecutar)
drop table if exists public.clientes_credenciales;

-- 3) Endurecer acceso (solo service role/backoffice)
alter table public.clientes enable row level security;
alter table public.clientes_credenciales_audit enable row level security;

revoke all on table public.clientes from anon, authenticated;
revoke all on table public.clientes_credenciales_audit from anon, authenticated;

commit;
