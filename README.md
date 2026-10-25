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

## Limites de la version 1
Les véhicules sont dans un fichier : le client ne peut pas les modifier seul. La version 2 ajoutera un back-office avec base de données.
