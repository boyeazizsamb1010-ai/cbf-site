-- ============================================================
--  CBF — Commandes avec acompte de 50 %
--  À coller dans Supabase > SQL Editor > New query > Run
--  (peut être relancé sans danger)
-- ============================================================

-- ---------- 1. Table des commandes ----------
create table if not exists public.commandes (
  id            uuid primary key default gen_random_uuid(),
  reference     text,                       -- ex. CBF-3FA9C2 (calculée automatiquement)
  vehicule_id   text not null,
  vehicule_nom  text,                       -- rempli automatiquement
  prix          bigint,                     -- prix du véhicule au moment de la commande (rempli automatiquement)
  acompte       bigint,                     -- 50 % du prix (rempli automatiquement)
  nom           text not null check (char_length(nom) between 1 and 200),
  telephone     text not null check (char_length(telephone) between 5 and 60),
  email         text check (char_length(email) <= 200),
  ville         text check (char_length(ville) <= 200),
  message       text check (char_length(message) <= 3000),
  langue        text check (char_length(langue) <= 5),
  statut        text not null default 'nouvelle'
                check (statut in ('nouvelle','contactee','acompte_recu','expediee','terminee','annulee')),
  note_admin    text check (char_length(note_admin) <= 3000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists commandes_date_idx on public.commandes (created_at desc);

drop trigger if exists commandes_maj on public.commandes;
create trigger commandes_maj before update on public.commandes
  for each row execute function public.maj_updated_at();

-- ---------- 2. Le prix et l'acompte viennent TOUJOURS de la base, jamais du navigateur du client ----------
create or replace function public.commandes_remplir() returns trigger
language plpgsql security definer set search_path = public as $$
declare v public.vehicules%rowtype;
begin
  select * into v from public.vehicules where id = new.vehicule_id;
  if not found or v.statut <> 'en_stock' or coalesce(v.prix, 0) <= 0 then
    raise exception 'Ce véhicule n''est pas disponible à la commande en ligne.';
  end if;
  new.reference    := 'CBF-' || upper(substr(replace(new.id::text, '-', ''), 1, 6));
  new.vehicule_nom := trim(concat_ws(' ', v.marque, v.modele, v.annee));
  new.prix         := v.prix;
  new.acompte      := ceil(v.prix / 2.0);
  return new;
end $$;

drop trigger if exists commandes_remplir on public.commandes;
create trigger commandes_remplir before insert on public.commandes
  for each row execute function public.commandes_remplir();

-- ---------- 3. Sécurité ----------
alter table public.commandes enable row level security;

drop policy if exists "commandes_envoi_public" on public.commandes;
create policy "commandes_envoi_public" on public.commandes
  for insert to anon, authenticated with check (true);

drop policy if exists "commandes_admin" on public.commandes;
create policy "commandes_admin" on public.commandes
  for all to authenticated using (true) with check (true);

-- Les visiteurs ne peuvent écrire QUE ces colonnes (pas le statut, pas le prix) et ne peuvent rien lire.
revoke all on public.commandes from anon;
grant insert (id, vehicule_id, nom, telephone, email, ville, message, langue) on public.commandes to anon;
grant select, insert, update, delete on public.commandes to authenticated;
