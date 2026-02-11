-- 20260211_07_clientes_password_visible.sql
-- WARNING: guarda contraseña visible para operación interna.
-- Solo usar en entorno controlado.

begin;

create table if not exists public.clientes_credenciales (
  user_id uuid primary key,
  email text not null,
  password_visible text not null,
  source text,
  source_id text,
  origen_formulario text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_clientes_credenciales_email on public.clientes_credenciales (lower(email));
create index if not exists idx_clientes_credenciales_updated_at on public.clientes_credenciales (updated_at desc);

create or replace function public.set_updated_at_clientes_credenciales()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_clientes_credenciales_updated_at on public.clientes_credenciales;
create trigger trg_clientes_credenciales_updated_at
before update on public.clientes_credenciales
for each row
execute function public.set_updated_at_clientes_credenciales();

commit;
