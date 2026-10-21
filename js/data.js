// ============================================================
//  LISTE DES VÉHICULES — pour en ajouter un, copier un bloc
//  Photos : mettre les fichiers dans images/vehicules/ et les
//  lister dans "photos". Sans photo, une image par défaut s'affiche.
//  "notePrix" (facultatif) : précision affichée sous le prix.
// ============================================================
window.VEHICULES = [
  {
    id: "changan-unit-2022",
    marque: "Changan", modele: "UNI-T Premium Sports", annee: 2022,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 7500000, ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 18112, carburant: "Essence", transmission: "Automatique",
    couleur: "Noir", puissance: "1.5L · 133 kW", portes: 5, stock: 1,
    vedette: true, teinte: "#15161a",
    photos: [
      "changan-unit-avant-1.jpg",
      "changan-unit-avant-2.jpg",
      "changan-unit-arriere-1.jpg",
      "changan-unit-arriere-2.jpg",
      "changan-unit-interieur-avant.jpg",
      "changan-unit-tableau-de-bord.jpg",
      "changan-unit-interieur-cote.jpg",
      "changan-unit-sieges-arriere.jpg",
      "changan-unit-compteur.jpg"
    ],
    description: "Fabriquée en juillet 2022, 18 112 km au compteur. Look sportif avec kit carrosserie orange, sièges sport en cuir, toit panoramique et triple écran numérique. Très bon état."
  }
];
