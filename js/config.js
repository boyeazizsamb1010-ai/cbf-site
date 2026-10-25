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
