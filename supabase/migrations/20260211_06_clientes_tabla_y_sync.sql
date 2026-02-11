-- 20260211_06_clientes_tabla_y_sync.sql
-- Crea DB de clientes y deja compatibilidad con flujo admin/create-user

begin;

create table if not exists public.clientes (
  id uuid primary key,
  email text not null,
  nombre text,
  telefono text,
  source text,
  source_id text,
  origen_formulario text,
  estado text not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_clientes_email_unique on public.clientes (lower(email));
create index if not exists idx_clientes_estado on public.clientes (estado);
create index if not exists idx_clientes_origen on public.clientes (origen_formulario);

-- Trigger updated_at
create or replace function public.set_updated_at_clientes()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_clientes_updated_at on public.clientes;
create trigger trg_clientes_updated_at
before update on public.clientes
for each row
execute function public.set_updated_at_clientes();

-- Backfill desde public.users (solo role=cliente)
insert into public.clientes (id, email, nombre, telefono, source, source_id, origen_formulario, estado)
select
  u.id,
  u.email,
  u.nombre,
  u.telefono,
  u.source,
  u.source_id,
  coalesce(u.origen_formulario, case when u.source = 'contactos' then 'contacto_general' else null end),
  'activo'
from public.users u
where lower(coalesce(u.role, '')) = 'cliente'
on conflict (id) do update
set
  email = excluded.email,
  nombre = coalesce(excluded.nombre, public.clientes.nombre),
  telefono = coalesce(excluded.telefono, public.clientes.telefono),
  source = coalesce(excluded.source, public.clientes.source),
  source_id = coalesce(excluded.source_id, public.clientes.source_id),
  origen_formulario = coalesce(excluded.origen_formulario, public.clientes.origen_formulario),
  estado = coalesce(excluded.estado, public.clientes.estado),
  updated_at = now();

commit;
