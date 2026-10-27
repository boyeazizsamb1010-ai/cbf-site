// Transforme js/data.js + js/descriptions.js en un fichier SQL à coller dans Supabase.
// Usage : node outils/exporter-sql.js   -> crée supabase/2-donnees.sql
const fs = require("fs"), path = require("path");
const racine = path.join(__dirname, "..");
global.window = {};
require(path.join(racine, "js", "data.js"));
try { require(path.join(racine, "js", "descriptions.js")); } catch (e) {}
const D = window.DESCRIPTIONS || {};
const q = v => v === undefined || v === null ? "null" : typeof v === "number" ? String(v) : typeof v === "boolean" ? String(v)
  : "'" + String(v).replace(/'/g, "''") + "'";
const j = v => "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";
let sql = "-- Véhicules actuels du site, à coller dans Supabase > SQL Editor > Run\n-- (relançable : met à jour les véhicules existants)\n\n";
window.VEHICULES.forEach((v, i) => {
  const d = D[v.id] || {};
  sql += "insert into public.vehicules (id,type,marque,modele,annee,categorie,etat,prix,ancien_prix,note_prix,km,carburant,transmission,couleur,puissance,portes,stock,statut,vedette,teinte,photos,specs,description,description_en,description_zh,ordre) values (" +
    [q(v.id), q(v.type || "voiture"), q(v.marque), q(v.modele), q(v.annee), q(v.categorie), q(v.etat), q(v.prix), q(v.ancienPrix), q(v.notePrix), q(v.km),
     q(v.carburant), q(v.transmission), q(v.couleur), q(v.puissance), q(v.portes), q(v.stock === undefined ? 1 : v.stock), q("en_stock"), q(!!v.vedette), q(v.teinte),
     j(v.photos || []), j(v.specs || []), q(v.description), q(d.en), q(d.zh), q(i)].join(",") +
    ")\non conflict (id) do update set type=excluded.type, marque=excluded.marque, modele=excluded.modele, annee=excluded.annee, categorie=excluded.categorie, etat=excluded.etat, prix=excluded.prix, ancien_prix=excluded.ancien_prix, note_prix=excluded.note_prix, km=excluded.km, carburant=excluded.carburant, transmission=excluded.transmission, couleur=excluded.couleur, puissance=excluded.puissance, portes=excluded.portes, stock=excluded.stock, vedette=excluded.vedette, teinte=excluded.teinte, photos=excluded.photos, specs=excluded.specs, description=excluded.description, description_en=excluded.description_en, description_zh=excluded.description_zh, ordre=excluded.ordre;\n\n";
});
fs.writeFileSync(path.join(racine, "supabase", "2-donnees.sql"), sql);
console.log(window.VEHICULES.length + " véhicules exportés dans supabase/2-donnees.sql");
