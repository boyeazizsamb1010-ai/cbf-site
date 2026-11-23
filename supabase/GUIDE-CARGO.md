# Cheikh Baye Fall Cargo : guide d'installation et d'utilisation

Ce module ajoute au site le service de fret Guangzhou → Sénégal :

- **Côté clients**
  - une page `cargo.html` avec les tarifs, un simulateur de prix, les prochains départs, la réservation, le suivi de colis et les produits importés ;
  - un champ « Suivre mon colis » sur l'accueil ;
  - un lien « Cargo » dans le menu.
- **Côté admin** : un onglet **Cargo** pour gérer les colis, les départs, les demandes, les produits et les tarifs.

## 1. Installation (une seule fois)

1. Dans Supabase, ouvrez **SQL Editor → New query**, collez tout le fichier `supabase/4-cargo.sql`, puis cliquez sur **Run**.
   - Vous pouvez le relancer sans danger.
   - Il ne touche ni aux véhicules ni aux commandes.
2. Copiez les fichiers du zip dans le dossier `auto-distribution` (en remplaçant les anciens), puis faites `git add .`, `git commit -m "Module Cargo"` et `git push`.
3. Ouvrez `cbf-guangzhou.com/cargo.html` et l'espace admin, onglet **Cargo**.

Les tarifs de départ sont déjà en place : **Standard 7 800 FCFA/kg (7 jours)** et **Express 10 500 FCFA/kg (3 jours)**. Le numéro WhatsApp du service Cargo (+221 77 839 37 21) se trouve dans `js/config.js`, partie `cargo`. C'est aussi là qu'on peut écrire l'adresse de dépôt à Guangzhou (`adresseDepot`). Si elle reste vide, le site indique au client que CBF lui envoie l'adresse sur WhatsApp.

## 2. Utilisation au quotidien (onglet Cargo)

| Moment | Ce que fait Cheikh |
|---|---|
| Nouveau départ prévu | **Départs → Publier un départ** : date limite de dépôt, date de départ, modes. Il apparaît tout de suite sur le site et les clients peuvent réserver. |
| Un client réserve sur le site | La demande arrive dans **Demandes** (pastille rouge). Bouton **Répondre sur WhatsApp**. |
| Le client dépose ses bagages | Dans la demande : **Bagages reçus → créer le colis**. Ou, sans demande : **Colis & suivi → Enregistrer un colis reçu**. Il pèse, saisit le poids : le prix se calcule tout seul et le **code de suivi** (ex. CBF-7K3M-Q9XA) est créé. Bouton **Envoyer le code au client sur WhatsApp**. |
| Le convoi part, passe la douane, arrive | **Départs** : changez l'étape (En transit → Dédouanement → Arrivé à Dakar → Disponible pour retrait). **Tous les colis du convoi avancent d'un coup** et le compte à rebours des clients se met à jour. |
| Cas particulier d'un colis | **Colis & suivi** : changez son étape, ou **Modifier** pour forcer une date d'arrivée, changer le délai ou ajouter un message visible par le client. |
| Le client récupère son colis | Étape **Retiré par le client**. |
| Arrivage à vendre (GPS…) | **Produits importés → Ajouter** : photo, prix, description. Il s'affiche sur la page Cargo avec un bouton de commande WhatsApp. |
| Changer un prix ou un délai | **Tarifs**. Le site change tout de suite ; les colis déjà enregistrés gardent leur prix. |

### Comment est calculée la date d'arrivée annoncée

Le site prend la première date disponible dans cet ordre :

1. la date forcée sur le colis ;
2. la date d'arrivée prévue du départ ;
3. la date d'expédition + le délai (3 ou 7 jours) ;
4. la date de départ prévue + le délai.

La date d'expédition se remplit automatiquement quand le colis passe « En transit ».

## 3. Sécurité

- Les visiteurs **ne peuvent pas** lire la liste des colis ni les demandes, ni modifier un prix ou une étape. La base le vérifie elle-même, même si quelqu'un trafique la page.
- Le suivi public ne montre que l'avancement, le poids et les dates : **jamais le nom, le contenu ni le prix**.
- Les codes de suivi sont aléatoires (8 caractères), donc impossibles à deviner.
- La recherche par téléphone ne renvoie que les colis pas encore retirés (10 au maximum).
- Le prix d'une réservation est recalculé par la base : un client ne peut pas envoyer un faux prix.
- Une réservation est refusée si le départ est clôturé, si sa date limite est passée ou si le mode n'est pas proposé.

## 4. Limites actuelles (évolutions possibles)

- Le prix est calculé sur le **poids réel**. Le poids volumétrique (gros colis légers) n'est pas géré : on peut l'ajouter si CBF l'applique.
- Pas d'envoi automatique de SMS ou WhatsApp : les messages s'ouvrent pré-remplis et Cheikh appuie sur Envoyer.
- Pas de paiement en ligne du fret : le paiement se note dans le colis (À payer / Payé en partie / Payé).
