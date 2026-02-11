-- Unificacion segura de esquema a campos en espanol (sin romper compatibilidad)
-- Ejecutar primero este archivo en Supabase SQL Editor.
-- Mantiene sincronizados campos legacy en ingles y nuevos/canonicos en espanol.

begin;

-- ============================================================================
-- 1) campaigns: asegurar columnas canonicas en espanol
-- ============================================================================

alter table public.campaigns
  add column if not exists titulo text,
  add column if not exists descripcion text,
  add column if not exists ciudad text,
  add column if not exists tarifa text,
  add column if not exists requisitos text[],
  add column if not exists activa boolean;

-- Backfill desde columnas legacy (si existen y hay null/vacio en espanol)
do $$
begin
  -- title -> titulo
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'title'
  ) then
    update public.campaigns
    set titulo = coalesce(nullif(titulo, ''), nullif(title, ''))
    where coalesce(titulo, '') = '';
  end if;

  -- nombre -> titulo (si existe)
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'nombre'
  ) then
    update public.campaigns
    set titulo = coalesce(nullif(titulo, ''), nullif(nombre, ''))
    where coalesce(titulo, '') = '';
  end if;

  -- description -> descripcion
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'description'
  ) then
    update public.campaigns
    set descripcion = coalesce(nullif(descripcion, ''), nullif(description, ''))
    where coalesce(descripcion, '') = '';
  end if;

  -- city -> ciudad
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'city'
  ) then
    update public.campaigns
    set ciudad = coalesce(nullif(ciudad, ''), nullif(city, ''))
    where coalesce(ciudad, '') = '';
  end if;

  -- rate -> tarifa
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'rate'
  ) then
    update public.campaigns
    set tarifa = coalesce(nullif(tarifa, ''), nullif(rate, ''))
    where coalesce(tarifa, '') = '';
  end if;

  -- requirements -> requisitos
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'requirements'
  ) then
    update public.campaigns
    set requisitos = coalesce(requisitos, requirements)
    where requisitos is null;
  end if;

  -- is_active/active -> activa
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'is_active'
  ) then
    update public.campaigns
    set activa = coalesce(activa, is_active, true)
    where activa is null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns' and column_name = 'active'
  ) then
    update public.campaigns
    set activa = coalesce(activa, active, true)
    where activa is null;
  end if;
end $$;

-- ============================================================================
-- 2) postulaciones: estado en espanol compatible
-- ============================================================================
-- No renombramos columna para no romper frontend actual.
-- Solo normalizamos valores mas comunes en minuscula.

alter table public.postulaciones
  alter column estado set default 'pending';

update public.postulaciones
set estado = case
  when lower(estado) in ('accepted', 'aceptado', 'aceptada') then 'accepted'
  when lower(estado) in ('rejected', 'rechazado', 'rechazada') then 'rejected'
  when lower(estado) in ('pending', 'pendiente', 'en revision', 'en revisión') then 'pending'
  else coalesce(estado, 'pending')
end
where estado is not null;

-- ============================================================================
-- 3) users: asegurar estructura minima y criterios en espanol
-- ============================================================================

create table if not exists public.users (
  id uuid primary key,
  email text,
  nombre text,
  telefono text,
  role text default 'mensajero',
  source text,
  source_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_role on public.users (role);

-- Backfill base desde auth.users
insert into public.users (id, email, nombre, telefono, role, created_at, updated_at)
select
  u.id,
  u.email,
  coalesce(nullif(u.raw_user_meta_data->>'nombre', ''), split_part(coalesce(u.email, ''), '@', 1)),
  nullif(u.raw_user_meta_data->>'telefono', ''),
  coalesce(nullif(u.raw_app_meta_data->>'role', ''), 'mensajero'),
  coalesce(u.created_at, now()),
  now()
from auth.users u
on conflict (id) do update
set
  email = excluded.email,
  nombre = coalesce(nullif(public.users.nombre, ''), excluded.nombre),
  telefono = coalesce(nullif(public.users.telefono, ''), excluded.telefono),
  role = coalesce(nullif(public.users.role, ''), excluded.role),
  updated_at = now();

commit;

-- Verificacion rapida
-- select id, titulo, ciudad, tarifa, activa from public.campaigns order by created_at desc limit 20;
-- select id, estado from public.postulaciones order by created_at desc limit 20;
-- select id, email, nombre, telefono, role from public.users order by created_at desc limit 20;
