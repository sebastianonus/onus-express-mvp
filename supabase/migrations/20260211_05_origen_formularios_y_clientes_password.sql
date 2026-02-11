-- 20260211_05_origen_formularios_y_clientes_password.sql
-- Objetivo:
-- 1) Trazabilidad estricta del origen de formularios.
-- 2) Dejar columnas listas para que admin-create-user persista origen en users.

begin;

alter table public.solicitudes_mensajeros
  add column if not exists origen_formulario text;

alter table public.contactos
  add column if not exists origen_formulario text;

alter table public.users
  add column if not exists origen_formulario text;

-- Backfill defensivo para registros existentes
update public.solicitudes_mensajeros
set origen_formulario = coalesce(nullif(origen_formulario, ''), 'mensajeros_registro')
where coalesce(origen_formulario, '') = '';

update public.contactos
set origen_formulario = coalesce(nullif(origen_formulario, ''), 'contacto_general')
where coalesce(origen_formulario, '') = '';

update public.users
set origen_formulario = coalesce(
  nullif(origen_formulario, ''),
  case
    when source = 'solicitudes_mensajeros' then 'mensajeros_registro'
    when source = 'contactos' then 'contacto_general'
    else null
  end
)
where coalesce(origen_formulario, '') = '';

create index if not exists idx_solicitudes_origen_formulario on public.solicitudes_mensajeros (origen_formulario);
create index if not exists idx_contactos_origen_formulario on public.contactos (origen_formulario);
create index if not exists idx_users_origen_formulario on public.users (origen_formulario);

commit;
