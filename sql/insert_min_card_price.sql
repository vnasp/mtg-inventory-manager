-- Insertar o actualizar el precio mínimo de carta en CLP
-- Este valor se usa para garantizar un precio mínimo cuando USD × TC es muy bajo

insert into public.settings (key, value)
values (
  'min_card_price_clp',
  jsonb_build_object('amount', 100) -- 100 pesos CLP por defecto
)
on conflict (key) do update
set value = excluded.value,
    updated_at = now();
