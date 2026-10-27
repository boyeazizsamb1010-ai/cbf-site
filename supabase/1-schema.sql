-- ============================================================
--  CBF — Version 2 : base de données Supabase
--  À coller dans Supabase > SQL Editor > New query > Run
--  (peut être relancé sans danger : "if not exists" partout)
-- ============================================================

-- ---------- 1. Véhicules ----------
create table if not exists public.vehicules (
  id            text primary key,                 -- ex. "toyota-rav4-2020" (sert dans l'adresse de la fiche)
  type          text not null default 'voiture',  -- voiture, moteur, tracteur, camion, machine, arachide
  marque        text,
  modele        text,
  annee         int,
  categorie     text,                             -- ex. "SUV / 4x4"
  etat          text,                             -- "Neuf" ou "Occasion"
  prix          bigint,                           -- en FCFA, rendu Port de Dakar (vide = prix sur demande)
  ancien_prix   bigint,
  note_prix     text,
  km            int,
  carburant     text,
  transmission  text,
  couleur       text,
  puissance     text,
  portes        int,
  stock         int  not null default 1,
  statut        text not null default 'en_stock'
                check (statut in ('en_stock','vendu','masque')),
  vedette       boolean not null default false,   -- affiché en grand sur l'accueil
  teinte        text,                             -- couleur de l'image par défaut
  photos        jsonb not null default '[]'::jsonb,   -- liste de photos (voir guide)
  specs         jsonb not null default '[]'::jsonb,   -- [["Transmission intégrale","4x4"]]
  description     text,                           -- français
  description_en  text,
  description_zh  text,
  ordre         int not null default 0,           -- plus petit = plus haut dans la liste
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.maj_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists vehicules_maj on public.vehicules;
create trigger vehicules_maj before update on public.vehicules
  for each row execute function public.maj_updated_at();

-- ---------- 2. Messages des clients (formulaire de contact) ----------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null check (char_length(nom) between 1 and 200),
  telephone   text check (char_length(telephone) <= 60),
  email       text check (char_length(email) <= 200),
  message     text not null check (char_length(message) between 1 and 3000),
  vehicule_id text,
  langue      text check (char_length(langue) <= 5),
  lu          boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- 3. Visites (statistiques anonymes, sans aucune donnée personnelle) ----------
create table if not exists public.visites (
  id          bigint generated always as identity primary key,
  page        text not null check (char_length(page) <= 120),
  vehicule_id text check (char_length(vehicule_id) <= 120),
  langue      text check (char_length(langue) <= 5),
  appareil    text check (appareil in ('mobile','ordinateur')),
  referent    text check (char_length(referent) <= 120),
  created_at  timestamptz not null default now()
);
create index if not exists visites_date_idx on public.visites (created_at desc);
create index if not exists vehicules_ordre_idx on public.vehicules (ordre, created_at desc);

-- ---------- 4. Sécurité (Row Level Security) ----------
-- Visiteurs du site (clé "anon") : lire les véhicules visibles, écrire un message ou une visite.
-- Client connecté à l'espace admin (rôle "authenticated") : tout gérer.
alter table public.vehicules enable row level security;
alter table public.messages  enable row level security;
alter table public.visites   enable row level security;

drop policy if exists "vehicules_lecture_publique" on public.vehicules;
create policy "vehicules_lecture_publique" on public.vehicules
  for select to anon using (statut <> 'masque');

drop policy if exists "vehicules_admin" on public.vehicules;
create policy "vehicules_admin" on public.vehicules
  for all to authenticated using (true) with check (true);

drop policy if exists "messages_envoi_public" on public.messages;
create policy "messages_envoi_public" on public.messages
  for insert to anon, authenticated with check (true);

drop policy if exists "messages_admin_lecture" on public.messages;
create policy "messages_admin_lecture" on public.messages
  for select to authenticated using (true);

drop policy if exists "messages_admin_maj" on public.messages;
create policy "messages_admin_maj" on public.messages
  for update to authenticated using (true) with check (true);

drop policy if exists "messages_admin_suppr" on public.messages;
create policy "messages_admin_suppr" on public.messages
  for delete to authenticated using (true);

drop policy if exists "visites_envoi_public" on public.visites;
create policy "visites_envoi_public" on public.visites
  for insert to anon, authenticated with check (true);

drop policy if exists "visites_admin_lecture" on public.visites;
create policy "visites_admin_lecture" on public.visites
  for select to authenticated using (true);

-- ---------- 5. Stockage des photos ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_lecture_publique" on storage.objects;
create policy "photos_lecture_publique" on storage.objects
  for select to anon, authenticated using (bucket_id = 'photos');

drop policy if exists "photos_admin_ecriture" on storage.objects;
create policy "photos_admin_ecriture" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');

drop policy if exists "photos_admin_maj" on storage.objects;
create policy "photos_admin_maj" on storage.objects
  for update to authenticated using (bucket_id = 'photos') with check (bucket_id = 'photos');

drop policy if exists "photos_admin_suppr" on storage.objects;
create policy "photos_admin_suppr" on storage.objects
  for delete to authenticated using (bucket_id = 'photos');

-- ---------- 6. Droits d'accès à l'API (nécessaires pour que le site puisse lire/écrire) ----------
grant usage on schema public to anon, authenticated;
grant select on public.vehicules to anon;
grant select, insert, update, delete on public.vehicules to authenticated;
grant insert on public.messages to anon;
grant select, insert, update, delete on public.messages to authenticated;
grant insert on public.visites to anon;
grant select, insert, update, delete on public.visites to authenticated;

-- ---------- 7. Statistiques de visites (utilisées par l'espace admin) ----------
create or replace function public.stats_visites(jours int default 30)
returns jsonb
language sql
stable
security invoker
as $$
  with v as (select * from public.visites where created_at >= now() - make_interval(days => greatest(1, least(jours, 365))))
  select jsonb_build_object(
    'total', (select count(*) from v),
    'par_jour', coalesce((select jsonb_agg(jsonb_build_object('jour', j, 'n', n) order by j)
        from (select (created_at at time zone 'UTC')::date as j, count(*) as n from v group by 1) x), '[]'::jsonb),
    'par_page', coalesce((select jsonb_agg(jsonb_build_object('k', page, 'n', n) order by n desc)
        from (select page, count(*) n from v group by 1) x), '[]'::jsonb),
    'top_vehicules', coalesce((select jsonb_agg(jsonb_build_object('k', vehicule_id, 'n', n) order by n desc)
        from (select vehicule_id, count(*) n from v where vehicule_id is not null group by 1 order by 2 desc limit 10) x), '[]'::jsonb),
    'par_appareil', coalesce((select jsonb_agg(jsonb_build_object('k', appareil, 'n', n) order by n desc)
        from (select appareil, count(*) n from v where appareil is not null group by 1) x), '[]'::jsonb),
    'par_langue', coalesce((select jsonb_agg(jsonb_build_object('k', langue, 'n', n) order by n desc)
        from (select langue, count(*) n from v where langue is not null group by 1) x), '[]'::jsonb),
    'par_referent', coalesce((select jsonb_agg(jsonb_build_object('k', referent, 'n', n) order by n desc)
        from (select referent, count(*) n from v where referent is not null group by 1 order by 2 desc limit 8) x), '[]'::jsonb)
  );
$$;
revoke all on function public.stats_visites(int) from public, anon;
grant execute on function public.stats_visites(int) to authenticated;
