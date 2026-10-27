# Cheikh Baye Fall Cargo (CBF) — site vitrine véhicules et machines

Site statique (HTML / CSS / JavaScript), sans installation ni base de données.

## Ouvrir le site
Double-cliquer sur `index.html`, ou lancer un petit serveur : `python3 -m http.server 8000` puis ouvrir http://localhost:8000

## Modifier les informations du client
- `js/config.js` : nom de l'entreprise, numéro WhatsApp (format `221770000000`, sans `+`), email, adresse, horaires.
- `images/logo-emblem.png` (petit logo de l'en-tête) et `images/logo-complet.jpg` (page À propos) : à remplacer par les logos du client, même nom de fichier.
- `css/style.css` : les couleurs sont tout en haut (`--vert`, `--vert-fonce`, …).

## Ajouter / modifier un véhicule
Ouvrir `js/data.js`, copier un bloc `{ ... }`, changer l'`id` (unique, sans espace) et les valeurs.
Photos : mettre les fichiers dans `images/vehicules/` et écrire leurs noms dans `photos: ["haval-1.jpg", "haval-2.jpg"]`.
Sans photo, une image par défaut s'affiche. Pour retirer un véhicule vendu, supprimer son bloc.

## Mettre en ligne gratuitement
1. Créer un compte sur Netlify (ou Cloudflare Pages / Vercel / GitHub Pages).
2. Glisser-déposer le dossier du site.
3. Plus tard, brancher le nom de domaine du client (au nom du client).

## Version 2 : espace admin (Supabase)
`admin.html` permet au client de gérer véhicules, photos, statut vendu/en stock, messages et statistiques. Installation : `supabase/GUIDE-INSTALLATION.md`. Tant que `supabase` est vide dans `js/config.js`, le site lit `js/data.js` (version 1). Si la base ne répond pas, le site se rabat aussi sur `js/data.js`.

## Photos (version rapide)
Le site utilise des photos WebP en deux tailles : `images/vehicules/m/` (cartes) et `images/vehicules/g/` (fiche), plus `images/vehicules/og/` (aperçu WhatsApp de la 1re photo).
Dans `js/data.js`, les noms de photos restent `xxx.jpg` : le site cherche automatiquement `m/xxx.webp` et `g/xxx.webp`.
Pour préparer de nouvelles photos : `python3 outils/preparer-photos.py dossier_des_photos premiere-photo.jpg`.

## Partage WhatsApp / Facebook
À chaque mise en ligne, Netlify lance `outils/generer-pages.js` (réglé dans `netlify.toml`) : il crée une page par véhicule dans `v/` avec son aperçu (photo + prix), plus `sitemap.xml` et `robots.txt`.
Adresse à partager pour un véhicule : `https://<le-site>/v/<id>.html`. Quand le nom de domaine sera acheté, changer `siteUrl` dans `js/config.js`.

## Textes à faire confirmer par le client
Section « Comment ça marche » (accueil) et « Questions fréquentes » : textes généraux à valider (délais, paiement, dédouanement). Les modifier dans `index.html` et `js/home.js`.
