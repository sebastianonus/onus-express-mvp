-- Alinear public.users con campos del formulario de registro de mensajero
-- Formulario: email, nombre, telefono, ciudad, vehiculo, flotista
-- Mantiene compatibilidad y hace backfill desde solicitudes_mensajeros por email.

begin;

create table if not exists public.users (
  id uuid primary key,
  email text,
  nombre text,
  telefono text,
  ciudad text,
  vehiculo text,
  flotista text,
  role text default 'mensajero',
  source text,
  source_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users
  add column if not exists ciudad text,
  add column if not exists vehiculo text,
  add column if not exists flotista text;

create index if not exists idx_users_ciudad on public.users (ciudad);
create index if not exists idx_users_vehiculo on public.users (vehiculo);

do $$
declare
  has_col_experiencia boolean;
  has_col_vehiculo boolean;
  has_col_flotista boolean;
  has_col_created_at boolean;
  has_col_id boolean;
  experiencia_expr text;
  vehiculo_expr text;
  flotista_expr text;
  order_created_expr text;
  order_id_expr text;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes_mensajeros'
      and column_name = 'experiencia'
  ) into has_col_experiencia;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes_mensajeros'
      and column_name = 'vehiculo'
  ) into has_col_vehiculo;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes_mensajeros'
      and column_name = 'flotista'
  ) into has_col_flotista;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes_mensajeros'
      and column_name = 'created_at'
  ) into has_col_created_at;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes_mensajeros'
      and column_name = 'id'
  ) into has_col_id;

  if has_col_experiencia then
    experiencia_expr := 'coalesce(s.experiencia, '''')';
  else
    experiencia_expr := '''''';
  end if;

  if has_col_vehiculo then
    vehiculo_expr := format(
      'coalesce(nullif(trim(s.vehiculo), ''''), nullif(trim((regexp_match(%s, ''(?i)veh[íi]culo:\\s*([^\\n\\r]+)''))[1]), ''''))',
      experiencia_expr
    );
  else
    vehiculo_expr := format(
      'nullif(trim((regexp_match(%s, ''(?i)veh[íi]culo:\\s*([^\\n\\r]+)''))[1]), '''')',
      experiencia_expr
    );
  end if;

  if has_col_flotista then
    flotista_expr := format(
      'coalesce(nullif(trim(s.flotista), ''''), nullif(trim((regexp_match(%s, ''(?i)flotista:\\s*([^\\n\\r]+)''))[1]), ''''))',
      experiencia_expr
    );
  else
    flotista_expr := format(
      'nullif(trim((regexp_match(%s, ''(?i)flotista:\\s*([^\\n\\r]+)''))[1]), '''')',
      experiencia_expr
    );
  end if;

  if has_col_created_at then
    order_created_expr := 's.created_at desc nulls last';
  else
    order_created_expr := 'now() desc';
  end if;

  if has_col_id then
    order_id_expr := 's.id desc';
  else
    order_id_expr := 's.email desc';
  end if;

  execute format(
    $sql$
      with solicitudes_norm as (
        select distinct on (lower(s.email))
          lower(s.email) as email_key,
          nullif(trim(s.ciudad), '') as ciudad,
          %1$s as vehiculo,
          %2$s as flotista
        from public.solicitudes_mensajeros s
        where s.email is not null
          and trim(s.email) <> ''
        order by lower(s.email), %3$s, %4$s
      )
      update public.users u
      set
        ciudad = coalesce(nullif(u.ciudad, ''), sn.ciudad),
        vehiculo = coalesce(nullif(u.vehiculo, ''), sn.vehiculo),
        flotista = coalesce(nullif(u.flotista, ''), sn.flotista),
        updated_at = now()
      from solicitudes_norm sn
      where lower(coalesce(u.email, '')) = sn.email_key
    $sql$,
    vehiculo_expr,
    flotista_expr,
    order_created_expr,
    order_id_expr
  );
end $$;

commit;
