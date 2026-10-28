// ============================================================
//  CONFIGURATION DU SITE — infos du client
// ============================================================
window.SITE = {
  nom: "Cheikh Baye Fall Cargo",
  sigle: "CBF",
  slogan: "Votre partenaire de confiance en Chine",
  // Numéro WhatsApp au format international, SANS "+" ni espaces
  whatsapp: "221711261483",
  whatsappAffiche: "+221 71 126 14 83",
  email: "cfall1046@gmail.com",
  adresse: "Guangzhou, Chine",
  horaires: "Tous les jours : 9h – 23h",
  devise: "FCFA",
  // Taux de change pour l'affichage en anglais ($) et en chinois (¥) : combien de FCFA pour 1 $ et pour 1 ¥.
  // Taux du 25 octobre 2026 (à mettre à jour de temps en temps). Les montants affichés sont indicatifs.
  taux: { en: 584.5, zh: 87.8 },
  // Base de données (Supabase) : remplir après la création du projet (voir supabase/GUIDE-INSTALLATION.md).
  // Laisser vide = le site utilise js/data.js. La clé "anonKey" est publique par conception (la sécurité est dans la base).
  supabase: { url: "https://eixkzrusoswayoimprry.supabase.co", anonKey: "sb_publishable_n5bRd0y8SKsxgTXDkMusTg_iFX_7Gv0" },
  // (facultatif) lien "Build hook" Netlify : sert au bouton "Mettre à jour les aperçus de partage" de l'espace admin
  buildHook: "https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/f88f5f02-f7b8-4574-b07e-54d3292f2997",
  // Adresse du site (nom de domaine du client) : sert aux aperçus de partage
  siteUrl: "https://cbf-guangzhou.com",
  // Autres numéros du flyer du client (affichés sur la page Contact)
  autresNumeros: [
    { label: "Chine", num: "+86 195 7486 4821" },
    { label: "Sénégal", num: "+221 77 839 37 21" }
  ],
  // ----- Rubriques du site (accueil + catalogue) -----
  // "type" = valeur du champ type dans data.js (par défaut : "voiture")
  // "etat" = filtre facultatif (Neuf / Occasion)
  rubriques: [
    { cle: "voitures-neuves", nom: "Voitures neuves", type: "voiture", etat: "Neuf", icone: "voiture", texte: "Voitures neuves, directement de Chine." },
    { cle: "voitures-occasion", nom: "Voitures d'occasion", type: "voiture", etat: "Occasion", icone: "voiture", texte: "Occasions contrôlées, photos et kilométrage réels." },
    { cle: "moteurs", nom: "Moteurs", type: "moteur", icone: "moteur", texte: "Moteurs et pièces mécaniques." },
    { cle: "tracteurs", nom: "Tracteurs", type: "tracteur", icone: "tracteur", texte: "Tracteurs et matériel agricole." },
    { cle: "camions", nom: "Camions", type: "camion", icone: "camion", texte: "Camions et véhicules de transport." },
    { cle: "machines", nom: "Machines industrielles", type: "machine", icone: "machine", texte: "Engins et machines pour l'industrie." },
    { cle: "arachides", nom: "Décortiqueuses d'arachides", type: "arachide", icone: "arachide", texte: "Machines de décorticage pour arachides." }
  ]
};
