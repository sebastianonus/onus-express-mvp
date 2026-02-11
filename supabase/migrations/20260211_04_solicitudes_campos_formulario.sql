-- Alinear solicitudes_mensajeros con el formulario de acceso a campanas
-- Campos del formulario: email, nombre, telefono, ciudad, vehiculo, flotista

begin;

alter table public.solicitudes_mensajeros
  add column if not exists vehiculo text,
  add column if not exists flotista text;

create index if not exists idx_solicitudes_vehiculo on public.solicitudes_mensajeros (vehiculo);
create index if not exists idx_solicitudes_flotista on public.solicitudes_mensajeros (flotista);

-- Backfill opcional desde experiencia cuando venga concatenado:
-- "Vehículo: ...\nFlotista: ..."
do $$
declare
  has_col_experiencia boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes_mensajeros'
      and column_name = 'experiencia'
  ) into has_col_experiencia;

  if has_col_experiencia then
    update public.solicitudes_mensajeros
    set
      vehiculo = coalesce(
        nullif(trim(vehiculo), ''),
        nullif(trim((regexp_match(coalesce(experiencia, ''), '(?i)veh[íi]culo:\s*([^\n\r]+)'))[1]), '')
      ),
      flotista = coalesce(
        nullif(trim(flotista), ''),
        nullif(trim((regexp_match(coalesce(experiencia, ''), '(?i)flotista:\s*([^\n\r]+)'))[1]), '')
      )
    where true;
  end if;
end $$;

commit;
