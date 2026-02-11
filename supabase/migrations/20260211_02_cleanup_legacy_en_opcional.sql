-- Limpieza opcional de columnas legacy en ingles.
-- Ejecutar SOLO cuando el frontend/backend ya use exclusivamente columnas en espanol.

begin;

-- campaigns: remover columnas legacy en ingles
alter table public.campaigns
  drop column if exists title,
  drop column if exists description,
  drop column if exists city,
  drop column if exists rate,
  drop column if exists requirements,
  drop column if exists active;

-- Mantener is_active por compatibilidad operativa actual de frontend.
-- Si mas adelante quieres 100% espanol, puedes migrar a "activa" y luego:
-- alter table public.campaigns drop column if exists is_active;

drop trigger if exists trg_sync_campaigns_bilingual_cols on public.campaigns;
drop function if exists public.sync_campaigns_bilingual_cols();

commit;
