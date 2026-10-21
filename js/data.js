// ============================================================
//  LISTE DES VÉHICULES — pour en ajouter un, copier un bloc
//  Photos : mettre les fichiers dans images/vehicules/ et les
//  lister dans "photos". Sans photo, une image par défaut s'affiche.
// ============================================================
window.VEHICULES = [
  {
    id: "changan-cs75",
    marque: "Changan", modele: "CS75", annee: 2022,
    categorie: "SUV / 4x4", etat: "Neuf",
    prix: 14500000, ancienPrix: null,
    km: 0, carburant: "Essence", transmission: "Automatique",
    couleur: "Blanc", puissance: "1.5T", portes: 5, stock: 3,
    vedette: true, teinte: "#d9dedb",
    photos: [],
    description: "SUV 5 places spacieux, finitions soignées, écran tactile et caméra de recul."
  },
  {
    id: "haval-h6",
    marque: "Haval", modele: "H6", annee: 2022,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 8000000, ancienPrix: 9500000,
    km: 35000, carburant: "Essence", transmission: "Automatique",
    couleur: "Noir", puissance: "1.5T", portes: 5, stock: 1,
    vedette: true, teinte: "#2b2f33",
    photos: [],
    description: "Intérieur cuir, grand écran central, très bon état général."
  },
  {
    id: "geely-gs-2017",
    marque: "Geely", modele: "GS", annee: 2017,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 3500000, ancienPrix: null,
    km: 98000, carburant: "Essence", transmission: "Manuelle",
    couleur: "Orange", puissance: "1.8L", portes: 5, stock: 1,
    vedette: false, teinte: "#c8622b",
    photos: [],
    description: "Économique et robuste, idéal pour la ville."
  },
  {
    id: "toyota-corolla-2017",
    marque: "Toyota", modele: "Corolla Hybride", annee: 2017,
    categorie: "Berline", etat: "Occasion",
    prix: 5000000, ancienPrix: null,
    km: 87000, carburant: "Hybride", transmission: "Automatique",
    couleur: "Gris foncé", puissance: "1.8L", portes: 4, stock: 2,
    vedette: true, teinte: "#4a4f55",
    photos: [],
    description: "Faible consommation, fiabilité Toyota."
  },
  {
    id: "toyota-chr",
    marque: "Toyota", modele: "C-HR", annee: 2020,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 9500000, ancienPrix: null,
    km: 42000, carburant: "Hybride", transmission: "Automatique",
    couleur: "Rouge", puissance: "1.8L", portes: 5, stock: 1,
    vedette: false, teinte: "#b3262e",
    photos: [],
    description: "Look moderne, parfait pour un usage quotidien."
  },
  {
    id: "honda-crv",
    marque: "Honda", modele: "CR-V", annee: 2019,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 10500000, ancienPrix: null,
    km: 60000, carburant: "Essence", transmission: "Automatique",
    couleur: "Noir", puissance: "1.5T", portes: 5, stock: 1,
    vedette: false, teinte: "#22272b",
    photos: [],
    description: "Idéal pour la famille : spacieux et confortable."
  },
  {
    id: "jetour-x70-2020",
    marque: "Jetour", modele: "X70", annee: 2020,
    categorie: "SUV / 4x4", etat: "Occasion",
    prix: 6500000, ancienPrix: null,
    km: 55000, carburant: "Essence", transmission: "Automatique",
    couleur: "Noir", puissance: "1.5T", portes: 5, stock: 1,
    vedette: false, teinte: "#2a2e33",
    photos: [],
    description: "7 places, grand coffre, bon rapport qualité/prix."
  },
  {
    id: "howo-camion",
    marque: "Howo", modele: "Camion benne", annee: 2021,
    categorie: "Camion / Engin", etat: "Occasion",
    prix: 28000000, ancienPrix: null,
    km: 70000, carburant: "Diesel", transmission: "Manuelle",
    couleur: "Blanc", puissance: "371 ch", portes: 2, stock: 1,
    vedette: false, teinte: "#cfd4d1",
    photos: [],
    description: "Camion robuste pour chantiers et transport de matériaux."
  }
];
