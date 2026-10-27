# Version 2 – Espace admin : guide d'installation (≈ 20 minutes)

Après cette installation, le client ouvre **cbf-guangzhou.com/admin.html**, se connecte, et peut :
- ajouter / modifier / supprimer des véhicules et leurs photos ;
- marquer un véhicule **Vendu**, **En stock** ou **Masqué** ;
- lire les **messages** envoyés par le formulaire de contact ;
- voir les **statistiques de visites**.

Tant que les étapes ci-dessous ne sont pas faites, le site continue de fonctionner exactement comme la version 1 (il lit `js/data.js`).

---

## Étape 1 – Créer le projet Supabase (gratuit)
1. Aller sur https://supabase.com → **Start your project** → se connecter (avec GitHub ou email).
2. **New project** : nom `cbf-guangzhou`, choisir un **mot de passe de base de données** (le noter), région **Europe (Paris ou Frankfurt)** (la plus proche du Sénégal), plan **Free**.
3. Attendre 1–2 minutes que le projet soit prêt.

## Étape 2 – Créer les tables (copier-coller)
1. Menu de gauche : **SQL Editor** → **New query**.
2. Ouvrir le fichier `supabase/1-schema.sql`, tout copier, coller dans l'éditeur, cliquer **Run**. Message attendu : *Success*.
3. Nouvelle requête : ouvrir `supabase/2-donnees.sql`, tout copier, coller, **Run**. Les 16 véhicules actuels sont maintenant dans la base.

## Étape 3 – Fermer les inscriptions et créer le compte du client
1. **Authentication** → **Sign In / Providers** (ou *Providers*) → **Email** → désactiver **Allow new users to sign up** → **Save**. *(Important : sinon n'importe qui pourrait se créer un compte.)*
2. **Authentication** → **Users** → **Add user** → **Create new user** : email du client + mot de passe solide, cocher **Auto Confirm User** → **Create user**.
3. Créer de la même façon un compte pour vous si vous voulez aussi accéder à l'admin.

## Étape 4 – Relier le site à la base
1. Dans Supabase : **Project Settings** → **API** (ou bouton **Connect**). Copier :
   - **Project URL** (ex. `https://abcdefgh.supabase.co`)
   - la clé **anon public** (longue, commence par `eyJ…`) — ou la clé **publishable** (`sb_publishable_…`) si c'est la seule proposée. Les deux fonctionnent.
2. Ouvrir `js/config.js` et remplir :
   ```js
   supabase: { url: "https://VOTRE-PROJET.supabase.co", anonKey: "LA_CLE_COPIEE" },
   ```
   La clé *anon/publishable* est publique par conception : la sécurité est dans les règles de la base (déjà créées par `1-schema.sql`).
   ⚠️ **Ne jamais** copier la clé **service_role** / **secret** dans le site.
3. Envoyer sur GitHub comme d'habitude (`git add .`, `git commit`, `git push`). Netlify met le site à jour.

## Étape 5 – Premier test
1. Ouvrir `https://cbf-guangzhou.com/admin.html` → se connecter.
2. Vérifier : la liste montre les 16 véhicules ; changer un statut en **Vendu** → le site public affiche le badge *Vendu* (attendre jusqu'à 1 minute, les pages sont gardées en mémoire 60 s) ; remettre **En stock**.
3. Ajouter un véhicule de test avec une photo, vérifier sur le site, puis le supprimer.
4. Envoyer un message depuis la page Contact du site : il apparaît dans l'onglet **Messages** de l'admin.

## Étape 6 (facultative mais conseillée) – Aperçus de partage WhatsApp/Facebook
Un véhicule ajouté depuis l'admin est visible tout de suite sur le site. Mais l'**aperçu quand on partage son lien** (photo + prix) est fabriqué à chaque mise en ligne du site. Pour le mettre à jour sans GitHub :
1. Netlify → votre site → **Site configuration** → **Build & deploy** → **Build hooks** → **Add build hook** (nom : `admin`) → copier l'adresse.
2. La coller dans `js/config.js` : `buildHook: "https://api.netlify.com/build_hooks/…"`.
3. Dans l'admin, un bouton **Mettre à jour les aperçus de partage** apparaît : à cliquer après avoir ajouté de nouveaux véhicules (≈ 1 minute).

---

## Utilisation au quotidien
- **Photos** : choisir plusieurs photos d'un coup ; elles sont réduites automatiquement. La 1re est la photo principale ; flèches ← → pour changer l'ordre, ✕ pour retirer. **Floutez les numéros de téléphone du fournisseur avant d'envoyer.**
- **Prix** : laisser vide = « Prix sur demande ».
- **Descriptions anglais / chinois** : facultatives. Si elles sont vides, le français s'affiche.
- **Caractéristiques supplémentaires** : une ligne = `Libellé : valeur`. Les libellés nouveaux restent en français dans les autres langues.
- **Ordre** : flèches ↑ ↓ dans la liste (le premier apparaît en premier sur le site).
- **Vendu** : le véhicule reste visible, grisé, avec le badge *Vendu*, et passe après les véhicules en stock. **Masqué** : disparaît du site sans être supprimé.

## Bon à savoir
- **Plan gratuit Supabase** : un projet sans aucune activité pendant 7 jours est mis en pause (on le réactive en un clic depuis le tableau de bord). Pendant la pause, **le site public continue de marcher** (il se rabat sur `js/data.js`), mais l'admin et les messages ne fonctionnent plus. Les visites du site comptent comme activité.
- **Sauvegarde** : de temps en temps, Supabase → **Table Editor** → `vehicules` → Export CSV.
- **Mot de passe oublié** : Supabase → Authentication → Users → ⋯ → Send password recovery, ou recréer l'utilisateur.
- **Statistiques** : une visite = une page ouverte (comptée une fois par session). Aucune adresse IP ni cookie n'est enregistré. Vos propres visites depuis l'ordinateur où vous vous êtes connecté à l'admin ne sont pas comptées.
- Pour revenir à la version 1 à tout moment : vider `url` et `anonKey` dans `js/config.js`.
