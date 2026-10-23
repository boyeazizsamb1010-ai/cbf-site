/**
 * Fichier de données des véhicules disponibles à la vente.
 * Chaque véhicule est représenté par un objet contenant ses caractéristiques et informations.
 */
window.VEHICULES = [
  {
    id: "changan-unit-2022", // Identifiant unique du véhicule
    marque: "Changan", // Marque du véhicule
    modele: "UNI-T Premium Sports", // Modèle du véhicule
    annee: 2022, // Année de fabrication
    categorie: "SUV / 4x4", // Catégorie du véhicule
    etat: "Occasion", // État du véhicule
    prix: 7500000, // Prix du véhicule
    ancienPrix: null, // Ancien prix du véhicule
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 18112, // Kilométrage du véhicule
    carburant: "Essence", // Type de carburant
    transmission: "Automatique", // Type de transmission
    couleur: "Noir", // Couleur du véhicule
    puissance: "1.5L · 133 kW", // Puissance du véhicule
    portes: 5, stock: 1, // Nombre de portes et stock disponible
    vedette: true, // Indique si le véhicule est en vedette
    teinte: "#15161a", // Couleur de teinte pour l'affichage

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
    marque: "Haval", 
    modele: "H6S 2.0T", 
    annee: 2019,
    categorie: "SUV / 4x4", 
    etat: "Occasion",
    prix: 7500000, 
    ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 83397, 
    carburant: "Essence", 
    transmission: "Automatique",
    couleur: "Blanc", 
    puissance: "2.0T · 160 kW", 
    portes: 5, 
    stock: 1,
    vedette: true, 
    teinte: "#e8e8e8",

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
    marque: "Changan", 
    modele: "UNI-K iDD 1.5T", 
    annee: 2022,
    categorie: "SUV / 4x4", 
    etat: "Occasion",
    prix: 9800000, 
    ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 19000, 
    carburant: "Hybride rechargeable", 
    transmission: "Automatique",
    couleur: "Bleu clair", 
    puissance: "1.5T hybride", 
    portes: 5, 
    stock: 1,
    vedette: false, 
    teinte: "#9db4d6",

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
    marque: "Haval", 
    modele: "Beast 1.5T", 
    annee: 2022,
    categorie: "SUV / 4x4", 
    etat: "Occasion",
    prix: 7500000, 
    ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 17129, 
    carburant: "Essence", 
    transmission: "Automatique",
    couleur: "Gris", 
    puissance: "1.5T · 130 kW", 
    portes: 5, 
    stock: 1,
    vedette: false, 
    teinte: "#9a9c98",

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
    id: "peugeot-4008-deluxe",
    nom: "Peugeot 4008 350THP Édition Deluxe",
    annee: 2017,
    kilometrage: "39 800 km",
    moteur: "1.6L Turbo (123 kW)",
    prix: "5.000.000 FCFA",
    lieu: "Port autonome de Dakar",
    description: "Édition Deluxe, intérieur cuir, toit panoramique, grand écran multimédia tactile, motorisation 1.6T performante et faible kilométrage.",
    photos: [
        "peugeot-4008-1.jpg",
      "peugeot-4008-2.jpg",
      "peugeot-4008-3.jpg",
      "peugeot-4008-4.jpg",
      "peugeot-4008-5.jpg",
      "peugeot-4008-6.jpg",
      "peugeot-4008-7.jpg",
      "peugeot-4008-8.jpg",
      "peugeot-4008-9.jpg",
      "peugeot-4008-10.jpg"

    ]
},

  {
    id: "toyota-chr-2020",
    marque: "Toyota", 
    modele: "C-HR 2.0L Elite Edition", 
    annee: 2020,
    categorie: "SUV / 4x4", 
    etat: "Occasion",
    prix: 6500000, 
    ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 95613, 
    carburant: "Essence", 
    transmission: "Automatique",
    couleur: "Blanc nacré", 
    puissance: "2.0L · 126 kW", 
    portes: 5, 
    stock: 1,
    vedette: false, 
    teinte: "#f1efe9",

    photos: [
      "toyota-chr-1.jpg",
      "toyota-chr-2.jpg",
      "toyota-chr-3.jpg",
      "toyota-chr-4.jpg",
      "toyota-chr-5.jpg",
      "toyota-chr-6.jpg",
      "toyota-chr-7.jpg",
      "toyota-chr-8.jpg",
      "toyota-chr-9.jpg",
      "toyota-chr-10.jpg"
    ],

    description: "Fabriqué en octobre 2020, mise en circulation en décembre 2020, 95 613 km au compteur. Moteur 2.0L de 126 kW, boîte automatique. Sièges en cuir noir, touches de bleu dans l'habitacle, grand écran multimédia, jantes bicolores 18 pouces et démarrage sans clé. Très bon état."
  },

    {
    id: "jetour-x70-plus-2023",
    marque: "Jetour", 
    modele: "X70 PLUS 1.5T DCT Brave PLUS", 
    annee: 2023,
    categorie: "SUV / 4x4", 
    etat: "Occasion",
    prix: 7500000, 
    ancienPrix: null,
    notePrix: "Prix une fois arrivé au Port autonome de Dakar",
    km: 32102, 
    carburant: "Essence", 
    transmission: "Automatique",
    couleur: "Noir", 
    puissance: "1.5T · 108 kW", 
    portes: 5, 
    stock: 1,
    vedette: false, 
    teinte: "#0e0f12",

    photos: [
      "jetour-x70-1.jpg",
      "jetour-x70-2.jpg",
      "jetour-x70-3.jpg",
      "jetour-x70-4.jpg",
      "jetour-x70-5.jpg",
      "jetour-x70-6.jpg",
      "jetour-x70-7.jpg",
      "jetour-x70-8.jpg",
      "jetour-x70-9.jpg",
      "jetour-x70-10.jpg"
    ],

    description: "Modèle 2023, fabriqué en octobre 2022, 32 102 km au compteur. Moteur 1.5T de 108 kW, boîte automatique à double embrayage (DCT), 5 places. Intérieur cuir bordeaux matelassé, grand écran incurvé (instrumentation et multimédia), prises USB et aérations à l'arrière, prise 120 W. Très bon état."
  }
];
 