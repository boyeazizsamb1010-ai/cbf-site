# Commandes avec acompte de 50 % — mise en route

## 1. Dans Supabase (une seule fois)
SQL Editor > New query > coller tout `supabase/3-commandes.sql` > Run. Résultat attendu : « Success. No rows returned ».

## 2. Sur votre ordinateur
Copiez ces fichiers dans `auto-distribution` (en remplaçant ceux qui existent) :
`admin.html`, `vehicule.html`, `css/commande.css`, `js/admin.js`, `js/fiche.js`, `js/commande.js`, `js/paiement.js`, le dossier `v/` et `sitemap.xml`.
**Ne touchez pas à `js/config.js`** (vos clés y sont).
Puis : `git add .` · `git commit -m "Commande avec acompte"` · `git push`.

## 3. Quand le client envoie ses coordonnées de réception
Ouvrez `js/paiement.js` et remplissez seulement ce qui existe (nom du titulaire, banque, RIB/IBAN, numéro Wave / Orange Money). Les champs vides ne s'affichent pas. Puis `git add/commit/push`.
Ne mettez jamais de mot de passe ni de code secret dans ce fichier : il est public.

## Comment ça marche
- Un bouton rouge « Commander (acompte 50 %) » apparaît sur les véhicules qui ont un prix et ne sont pas vendus.
- Le client remplit nom + téléphone ; il reçoit une référence (ex. CBF-3FA9C2), le montant de l'acompte et les coordonnées de paiement, puis envoie sa preuve sur WhatsApp.
- Vous voyez la commande dans l'admin > onglet **Commandes** (pastille rouge = nouvelles). Vous changez son statut : Nouvelle → Client contacté → Acompte reçu → Expédiée → Terminée (ou Annulée).
- Quand l'acompte est reçu, le bouton « Marquer le véhicule vendu » retire le véhicule de la vente.
- Le prix et l'acompte sont calculés par la base de données, pas par le navigateur du client : impossible de les falsifier.
- Rien n'est débité sur le site. Vous vérifiez vous-même la réception de l'argent avant de passer en « Acompte reçu ».

## À savoir
- Plusieurs clients peuvent commander le même véhicule : c'est vous qui décidez qui a l'acompte en premier.
- Pour un paiement automatique par carte / mobile money, il faudra plus tard un prestataire de paiement (compte à ouvrir par CBF).
