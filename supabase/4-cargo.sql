-- ============================================================
--  CBF — Module « Cheikh Baye Fall Cargo » : départs, colis, suivi, réservations, produits importés
--  À coller dans Supabase > SQL Editor > New query > Run
--  (peut être relancé sans danger ; ne touche pas aux véhicules ni aux commandes)
-- ============================================================

-- ---------- 1. Tarifs (modifiables depuis l'espace admin) ----------
create table if not exists public.cargo_tarifs (
  mode         text primary key check (mode in ('standard','express')),
  prix_kg      bigint not null check (prix_kg > 0),        -- FCFA par kg
  delai_jours  int    not null check (delai_jours between 1 and 120),
  actif        boolean not null default true,
  updated_at   timestamptz not null default now()
);
insert into public.cargo_tarifs (mode, prix_kg, delai_jours) values
  ('standard', 7800, 7),
  ('express', 10500, 3)
on conflict (mode) do nothing;

-- ---------- 2. Départs (convois / sessions d'expédition) ----------
create table if not exists public.cargo_departs (
  id                 uuid primary key default gen_random_uuid(),
  titre              text check (char_length(titre) <= 120),          -- ex. « Départ du 5 décembre »
  origine            text not null default 'Guangzhou' check (char_length(origine) <= 80),
  destination        text not null default 'Dakar' check (char_length(destination) <= 80),
  modes              text[] not null default array['standard','express']
                     check (modes <@ array['standard','express'] and cardinality(modes) >= 1),
  date_limite_depot  date,                                            -- dernier jour pour déposer à Guangzhou
  date_depart        date,
  arrivee_prevue     date,                                            -- facultatif : remplace le calcul automatique
  statut             text not null default 'ouvert'
                     check (statut in ('ouvert','cloture','en_transit','dedouanement','arrive','disponible','termine','annule')),
  note               text check (char_length(note) <= 1000),          -- texte public (français)
  note_en            text check (char_length(note_en) <= 1000),
  note_zh            text check (char_length(note_zh) <= 1000),
  visible            boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists cargo_departs_date_idx on public.cargo_departs (date_depart);

-- ---------- 3. Colis (enregistrés par CBF à la réception à Guangzhou) ----------
create table if not exists public.cargo_colis (
  id                uuid primary key default gen_random_uuid(),
  code              text unique,                                     -- code de suivi, ex. CBF-7K3M-Q9XA (automatique)
  code_norm         text generated always as (regexp_replace(upper(coalesce(code,'')), '[^A-Z0-9]', '', 'g')) stored,
  depart_id         uuid references public.cargo_departs(id) on delete set null,
  demande_id        uuid,
  client_nom        text not null check (char_length(client_nom) between 1 and 200),
  client_telephone  text not null check (char_length(client_telephone) between 5 and 60),
  telephone_norm    text generated always as (regexp_replace(coalesce(client_telephone,''), '[^0-9]', '', 'g')) stored,
  destinataire      text check (char_length(destinataire) <= 300),    -- qui retire au Sénégal (facultatif)
  contenu           text check (char_length(contenu) <= 1000),        -- nature des marchandises
  nb_colis          int not null default 1 check (nb_colis between 1 and 999),
  poids             numeric(10,2) not null check (poids > 0 and poids <= 100000),  -- kg facturés
  mode              text not null check (mode in ('standard','express')),
  prix_kg           bigint check (prix_kg > 0),                       -- vide = tarif du moment (rempli automatiquement)
  frais_supp        bigint not null default 0,                        -- emballage, livraison… (peut être négatif pour une remise)
  montant           bigint,                                           -- calculé automatiquement : poids × prix/kg + frais
  paiement          text not null default 'a_payer' check (paiement in ('a_payer','partiel','paye')),
  statut            text not null default 'depot_valide'
                    check (statut in ('depot_valide','en_transit','dedouanement','arrive','disponible','retire')),
  date_depot        date not null default current_date,
  date_expedition   date,                                             -- rempli automatiquement au passage « En transit »
  delai_jours       int check (delai_jours between 1 and 120),        -- vide = délai du mode (3 ou 7 jours)
  arrivee_manuelle  date,                                             -- facultatif : force la date d'arrivée annoncée
  message_public    text check (char_length(message_public) <= 500),  -- visible par le client dans le suivi
  note_admin        text check (char_length(note_admin) <= 3000),     -- privé
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists cargo_colis_code_idx on public.cargo_colis (code_norm);
create index if not exists cargo_colis_tel_idx on public.cargo_colis (telephone_norm);
create index if not exists cargo_colis_depart_idx on public.cargo_colis (depart_id);

-- Historique des étapes (affiché dans le suivi)
create table if not exists public.cargo_evenements (
  id         bigint generated always as identity primary key,
  colis_id   uuid not null references public.cargo_colis(id) on delete cascade,
  statut     text not null,
  created_at timestamptz not null default now()
);
create index if not exists cargo_evenements_colis_idx on public.cargo_evenements (colis_id, created_at);

-- ---------- 4. Demandes d'expédition (envoyées par les clients depuis le site) ----------
create table if not exists public.cargo_demandes (
  id              uuid primary key default gen_random_uuid(),
  reference       text,                                              -- ex. RES-3FA9C2 (automatique)
  depart_id       uuid references public.cargo_departs(id) on delete set null,
  mode            text not null check (mode in ('standard','express')),
  nature          text not null check (char_length(nature) between 1 and 1000),
  poids_estime    numeric(10,2) not null check (poids_estime > 0 and poids_estime <= 100000),
  nb_colis        int not null default 1 check (nb_colis between 1 and 999),
  nom             text not null check (char_length(nom) between 1 and 200),
  telephone       text not null check (char_length(telephone) between 5 and 60),
  ville           text check (char_length(ville) <= 200),
  message         text check (char_length(message) <= 2000),
  langue          text check (char_length(langue) <= 5),
  montant_estime  bigint,                                            -- rempli automatiquement
  statut          text not null default 'nouvelle' check (statut in ('nouvelle','contactee','deposee','annulee')),
  colis_id        uuid references public.cargo_colis(id) on delete set null,
  note_admin      text check (char_length(note_admin) <= 3000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists cargo_demandes_date_idx on public.cargo_demandes (created_at desc);

-- ---------- 5. Produits importés (ex. traceurs GPS) ----------
create table if not exists public.cargo_produits (
  id              uuid primary key default gen_random_uuid(),
  nom             text not null check (char_length(nom) between 1 and 200),
  nom_en          text check (char_length(nom_en) <= 200),
  nom_zh          text check (char_length(nom_zh) <= 200),
  description     text check (char_length(description) <= 3000),
  description_en  text check (char_length(description_en) <= 3000),
  description_zh  text check (char_length(description_zh) <= 3000),
  prix            bigint check (prix > 0),                           -- FCFA, vide = prix sur demande
  photos          jsonb not null default '[]'::jsonb,
  statut          text not null default 'disponible' check (statut in ('disponible','epuise','masque')),
  ordre           int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- 6. Calculs automatiques ----------
-- updated_at (la fonction maj_updated_at existe déjà grâce à 1-schema.sql ; on la recrée au cas où)
create or replace function public.maj_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$ declare t text; begin
  foreach t in array array['cargo_tarifs','cargo_departs','cargo_colis','cargo_demandes','cargo_produits'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_maj', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.maj_updated_at()', t || '_maj', t);
  end loop;
end $$;

-- Rang d'une étape (pour ne jamais faire reculer un colis)
create or replace function public.cargo_rang(s text) returns int
language sql immutable as $$
  select case s when 'depot_valide' then 1 when 'en_transit' then 2 when 'dedouanement' then 3
                when 'arrive' then 4 when 'disponible' then 5 when 'retire' then 6 else 0 end
$$;

-- Code de suivi aléatoire et impossible à deviner : CBF-XXXX-XXXX (sans 0/O ni 1/I pour éviter les confusions)
create or replace function public.cargo_nouveau_code() returns text
language plpgsql volatile as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  octets bytea; c text; i int;
begin
  loop
    octets := uuid_send(gen_random_uuid());
    c := '';
    for i in 0..7 loop
      c := c || substr(alphabet, (get_byte(octets, i) % 32) + 1, 1);
    end loop;
    c := 'CBF-' || substr(c, 1, 4) || '-' || substr(c, 5, 4);
    exit when not exists (select 1 from public.cargo_colis where code = c);
  end loop;
  return c;
end $$;

-- Colis : code, prix/kg du moment, délai, montant
create or replace function public.cargo_colis_remplir() returns trigger
language plpgsql security definer set search_path = public as $$
declare tf public.cargo_tarifs%rowtype;
begin
  if tg_op = 'INSERT' then
    if new.code is null or new.code = '' then new.code := public.cargo_nouveau_code(); end if;
  else
    new.code := old.code;  -- le code ne change jamais
  end if;
  select * into tf from public.cargo_tarifs where mode = new.mode;
  if new.prix_kg is null or (tg_op = 'UPDATE' and new.mode <> old.mode and new.prix_kg = old.prix_kg) then
    new.prix_kg := tf.prix_kg;
  end if;
  if new.delai_jours is null or (tg_op = 'UPDATE' and new.mode <> old.mode and new.delai_jours = old.delai_jours) then
    new.delai_jours := tf.delai_jours;
  end if;
  new.montant := ceil(new.poids * new.prix_kg)::bigint + coalesce(new.frais_supp, 0);
  if new.montant < 0 then new.montant := 0; end if;
  if new.statut <> 'depot_valide' and new.date_expedition is null then new.date_expedition := current_date; end if;
  return new;
end $$;
drop trigger if exists cargo_colis_remplir on public.cargo_colis;
create trigger cargo_colis_remplir before insert or update on public.cargo_colis
  for each row execute function public.cargo_colis_remplir();

-- Historique : une ligne à chaque changement d'étape
create or replace function public.cargo_colis_historique() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.statut is distinct from old.statut then
    insert into public.cargo_evenements (colis_id, statut) values (new.id, new.statut);
  end if;
  return null;
end $$;
drop trigger if exists cargo_colis_historique on public.cargo_colis;
create trigger cargo_colis_historique after insert or update of statut on public.cargo_colis
  for each row execute function public.cargo_colis_historique();

-- Départ : changer le statut du convoi fait avancer tous ses colis (jamais en arrière)
create or replace function public.cargo_depart_propager() returns trigger
language plpgsql security definer set search_path = public as $$
declare cible text;
begin
  if new.statut is not distinct from old.statut then return null; end if;
  cible := case new.statut when 'en_transit' then 'en_transit' when 'dedouanement' then 'dedouanement'
                           when 'arrive' then 'arrive' when 'disponible' then 'disponible' else null end;
  if cible is null then return null; end if;
  update public.cargo_colis c
     set statut = cible,
         date_expedition = coalesce(c.date_expedition,
                             case when new.date_depart is not null and new.date_depart <= current_date then new.date_depart else current_date end)
   where c.depart_id = new.id and public.cargo_rang(c.statut) < public.cargo_rang(cible);
  return null;
end $$;
drop trigger if exists cargo_depart_propager on public.cargo_departs;
create trigger cargo_depart_propager after update of statut on public.cargo_departs
  for each row execute function public.cargo_depart_propager();

-- Date d'arrivée annoncée d'un colis
--  1) date forcée sur le colis  2) date prévue du départ  3) date d'expédition + délai  4) date de départ prévue + délai
create or replace function public.cargo_eta(c public.cargo_colis, d public.cargo_departs) returns date
language sql stable as $$
  select coalesce(c.arrivee_manuelle, d.arrivee_prevue,
                  c.date_expedition + c.delai_jours,
                  d.date_depart + c.delai_jours)
$$;

-- Demandes : référence, montant estimé, vérification du départ
create or replace function public.cargo_demandes_remplir() returns trigger
language plpgsql security definer set search_path = public as $$
declare d public.cargo_departs%rowtype; tf public.cargo_tarifs%rowtype;
begin
  select * into tf from public.cargo_tarifs where mode = new.mode and actif;
  if not found then raise exception 'Ce mode d''expédition n''est pas disponible.'; end if;
  if new.depart_id is not null then
    select * into d from public.cargo_departs where id = new.depart_id;
    if not found or not d.visible or d.statut <> 'ouvert'
       or (d.date_limite_depot is not null and d.date_limite_depot < current_date)
       or not (new.mode = any(d.modes)) then
      raise exception 'Ce départ n''accepte plus de réservations.';
    end if;
  end if;
  new.reference      := 'RES-' || upper(substr(replace(new.id::text, '-', ''), 1, 6));  -- le site calcule la même référence
  new.montant_estime := ceil(new.poids_estime * tf.prix_kg)::bigint;
  new.statut         := 'nouvelle';
  new.colis_id       := null;
  new.note_admin     := null;
  return new;
end $$;
drop trigger if exists cargo_demandes_remplir on public.cargo_demandes;
create trigger cargo_demandes_remplir before insert on public.cargo_demandes
  for each row execute function public.cargo_demandes_remplir();

-- ---------- 7. Suivi public : code de suivi OU numéro de téléphone ----------
-- Ne renvoie que l'avancement (pas de nom, pas de contenu, pas de prix) et au plus 10 colis.
create or replace function public.cargo_suivi(q text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  norm text := regexp_replace(upper(coalesce(q, '')), '[^A-Z0-9]', '', 'g');
  chiffres text := regexp_replace(coalesce(q, ''), '[^0-9]', '', 'g');
  res jsonb;
begin
  if char_length(norm) < 8 then return '[]'::jsonb; end if;
  if norm !~ '^[0-9]+$' then
    -- code de suivi (avec ou sans « CBF- » et les tirets)
    if left(norm, 3) <> 'CBF' then norm := 'CBF' || norm; end if;
    select coalesce(jsonb_agg(x), '[]'::jsonb) into res from (
      select public.cargo_colis_public(c, d) as x
      from public.cargo_colis c left join public.cargo_departs d on d.id = c.depart_id
      where c.code_norm = norm limit 1) s;
  else
    -- téléphone : on compare les 9 derniers chiffres (marche avec ou sans +221)
    if char_length(chiffres) < 9 then return '[]'::jsonb; end if;
    select coalesce(jsonb_agg(x order by o desc), '[]'::jsonb) into res from (
      select public.cargo_colis_public(c, d) as x, c.created_at as o
      from public.cargo_colis c left join public.cargo_departs d on d.id = c.depart_id
      where right(c.telephone_norm, 9) = right(chiffres, 9) and c.statut <> 'retire'
      order by c.created_at desc limit 10) s;
  end if;
  return res;
end $$;

create or replace function public.cargo_colis_public(c public.cargo_colis, d public.cargo_departs) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'code', c.code, 'mode', c.mode, 'statut', c.statut, 'nb_colis', c.nb_colis, 'poids', c.poids,
    'origine', coalesce(d.origine, 'Guangzhou'), 'destination', coalesce(d.destination, 'Dakar'),
    'date_depot', c.date_depot, 'date_expedition', c.date_expedition, 'date_depart', d.date_depart,
    'delai_jours', c.delai_jours, 'eta', public.cargo_eta(c, d), 'message', c.message_public,
    'aujourdhui', current_date,
    'etapes', coalesce((select jsonb_agg(jsonb_build_object('statut', e.statut, 'date', e.created_at) order by e.created_at)
                        from public.cargo_evenements e where e.colis_id = c.id), '[]'::jsonb)
  )
$$;

-- ---------- 8. Sécurité (Row Level Security) ----------
alter table public.cargo_tarifs     enable row level security;
alter table public.cargo_departs    enable row level security;
alter table public.cargo_colis      enable row level security;
alter table public.cargo_evenements enable row level security;
alter table public.cargo_demandes   enable row level security;
alter table public.cargo_produits   enable row level security;

-- Visiteurs : lire les tarifs, les départs visibles et les produits non masqués ; envoyer une demande.
drop policy if exists "cargo_tarifs_public" on public.cargo_tarifs;
create policy "cargo_tarifs_public" on public.cargo_tarifs for select to anon using (actif);
drop policy if exists "cargo_departs_public" on public.cargo_departs;
create policy "cargo_departs_public" on public.cargo_departs for select to anon
  using (visible and statut not in ('termine','annule'));
drop policy if exists "cargo_produits_public" on public.cargo_produits;
create policy "cargo_produits_public" on public.cargo_produits for select to anon using (statut <> 'masque');
drop policy if exists "cargo_demandes_envoi" on public.cargo_demandes;
create policy "cargo_demandes_envoi" on public.cargo_demandes for insert to anon, authenticated with check (true);

-- Espace admin (connecté) : tout gérer.
do $$ declare t text; begin
  foreach t in array array['cargo_tarifs','cargo_departs','cargo_colis','cargo_evenements','cargo_demandes','cargo_produits'] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin', t);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', t || '_admin', t);
  end loop;
end $$;

-- Droits de l'API
revoke all on public.cargo_tarifs, public.cargo_departs, public.cargo_colis, public.cargo_evenements,
              public.cargo_demandes, public.cargo_produits from anon;
grant select on public.cargo_tarifs, public.cargo_departs, public.cargo_produits to anon;
grant insert (id, depart_id, mode, nature, poids_estime, nb_colis, nom, telephone, ville, message, langue)
  on public.cargo_demandes to anon;
grant select, insert, update, delete on public.cargo_tarifs, public.cargo_departs, public.cargo_colis,
  public.cargo_evenements, public.cargo_demandes, public.cargo_produits to authenticated;

revoke all on function public.cargo_suivi(text) from public;
grant execute on function public.cargo_suivi(text) to anon, authenticated;
revoke all on function public.cargo_colis_public(public.cargo_colis, public.cargo_departs) from public, anon;
revoke all on function public.cargo_nouveau_code() from public, anon;
