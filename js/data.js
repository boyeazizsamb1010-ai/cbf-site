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
  },
  {
    id: "haval-h6s",
    marque: "Haval", modele: "H6S 2.0T", annee: 2019,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 7500000, ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 83397, carburant: "Essence", transmission: "Automatique",
    couleur: "Blanc", puissance: "2.0T · 160 kW", portes: 5, stock: 1,
    vedette: true, teinte: "#e8e8e8",
    photos: [
      "haval-h6s-avant-1.jpg",
      "haval-h6s-avant-2.jpg",
      "haval-h6s-avant-3.jpg",
      "haval-h6s-arriere-1.jpg",
      "haval-h6s-arriere-2.jpg",
      "haval-h6s-arriere-3.jpg",
      "haval-h6s-interieur-avant.jpg",
      "haval-h6s-interieur-cote.jpg",
      "haval-h6s-sieges-arriere.jpg",
      "haval-h6s-tableau-de-bord.jpg",
      "haval-h6s-volant.jpg",
      "haval-h6s-interieur-angle.jpg",
      "haval-h6s-compteur.jpg"
    ],
    description: "Moteur 2.0T de 160 kW, silhouette de SUV coupé. Intérieur cuir noir avec touches jaunes, toit panoramique, instrumentation numérique et climatisation arrière. 83 397 km au compteur."
  },
  {
    id: "changan-unik-2022",
    marque: "Changan", modele: "UNI-K iDD 1.5T", annee: 2022,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 9800000, ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 19000, carburant: "Hybride rechargeable", transmission: "Automatique",
    couleur: "Bleu clair", puissance: "1.5T hybride", portes: 5, stock: 1,
    vedette: false, teinte: "#9db4d6",
    photos: [
      "changan-unik-avant-1.jpg",
      "changan-unik-avant-2.jpg",
      "changan-unik-arriere.jpg",
      "changan-unik-tableau-de-bord.jpg",
      "changan-unik-interieur-avant.jpg",
      "changan-unik-interieur-cote.jpg",
      "changan-unik-sieges-arriere-1.jpg",
      "changan-unik-sieges-arriere-2.jpg",
      "changan-unik-console-arriere.jpg",
      "changan-unik-planche-de-bord.jpg",
      "changan-unik-porte-sony.jpg",
      "changan-unik-appui-tete-sony.jpg",
      "changan-unik-commandes.jpg",
      "changan-unik-chargeur-sans-fil.jpg"
    ],
    description: "Hybride rechargeable (iDD) 1.5T, autonomie électrique annoncée de 130 km. Sièges en cuir clair, toit panoramique, audio Sony, triple écran numérique, chargeur de téléphone sans fil. Très bon état."
  },
  {
    id: "haval-beast-2022",
    marque: "Haval", modele: "Beast 1.5T", annee: 2022,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 7500000, ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 17129, carburant: "Essence", transmission: "Automatique",
    couleur: "Gris", puissance: "1.5T · 130 kW", portes: 5, stock: 1,
    vedette: false, teinte: "#9a9c98",
    photos: [
      "haval-beast-avant-1.jpg",
      "haval-beast-avant-2.jpg",
      "haval-beast-avant-3.jpg",
      "haval-beast-profil.jpg",
      "haval-beast-arriere-1.jpg",
      "haval-beast-arriere-2.jpg",
      "haval-beast-arriere-3.jpg",
      "haval-beast-coffre.jpg",
      "haval-beast-interieur-avant.jpg",
      "haval-beast-interieur-cote.jpg",
      "haval-beast-tableau-de-bord.jpg",
      "haval-beast-planche-de-bord.jpg",
      "haval-beast-console.jpg",
      "haval-beast-sieges-arriere.jpg",
      "haval-beast-console-arriere.jpg",
      "haval-beast-compteur.jpg"
    ],
    description: "Moteur 1.5T de 130 kW, version intelligente. Sièges en cuir noir surpiqués orange, toit panoramique, grand écran incurvé, climatisation et prises USB à l'arrière. 17 129 km au compteur."
  },
  {
    id: "peugeot-4008-2017",
    marque: "Peugeot", modele: "4008 350THP Deluxe", annee: 2017,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 5000000, ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 39800, carburant: "Essence", transmission: "Automatique",
    couleur: "Gris foncé", puissance: "1.6T · 123 kW", portes: 5, stock: 1,
    vedette: false, teinte: "#4a4b4d",
    photos: [
      "peugeot-4008-avant-1.jpg",
      "peugeot-4008-avant-2.jpg",
      "peugeot-4008-arriere-1.jpg",
      "peugeot-4008-arriere-2.jpg",
      "peugeot-4008-arriere-3.jpg",
      "peugeot-4008-coffre.jpg",
      "peugeot-4008-interieur-avant.jpg",
      "peugeot-4008-interieur-cote.jpg",
      "peugeot-4008-tableau-de-bord.jpg",
      "peugeot-4008-ecran.jpg",
      "peugeot-4008-volant.jpg",
      "peugeot-4008-console.jpg",
      "peugeot-4008-sieges-arriere-1.jpg",
      "peugeot-4008-sieges-arriere-2.jpg",
      "peugeot-4008-console-arriere.jpg"
    ],
    description: "Peugeot 4008 350THP Édition Deluxe, moteur 1.6T de 123 kW. Sièges en cuir noir, toit panoramique, i-Cockpit avec instrumentation numérique, grand écran tactile, palettes au volant, climatisation et prise USB à l'arrière. 39 800 km."
  }
];
