// Catalogue : rubriques (voitures neuves, moteurs, camions…) + recherche + filtres + tri
(function () {
  const S = window.SITE;
  const all = window.VEHICULES;
  const params = new URLSearchParams(location.search);

  // rubrique de départ, lue dans l'adresse : ?type=moteur  ou  ?type=voiture&etat=Neuf
  let rub = "tout";
  const rDepart = S.rubriques.find(r => r.type === params.get("type") && (r.etat || null) === (params.get("etat") || null))
    || S.rubriques.find(r => r.type === params.get("type"));
  if (rDepart) rub = rDepart.cle;

  const etat = { q: "", cat: "Toutes catégories", tri: "" };
  const dansRubrique = (v, r) => typeDe(v) === r.type && (!r.etat || v.etat === r.etat);
  const articlesDe = cle => cle === "tout" ? all : all.filter(v => dansRubrique(v, S.rubriques.find(r => r.cle === cle)));

  function rubriques() {
    const zone = document.getElementById("rubriques");
    const items = [{ cle: "tout", nom: "Tout", n: all.length }].concat(S.rubriques.map(r => ({ cle: r.cle, nom: r.nom, n: articlesDe(r.cle).length })));
    zone.innerHTML = items.map(i => '<button class="pastille' + (rub === i.cle ? " actif" : "") + '" data-cle="' + i.cle + '">' + i.nom + ' <span class="nb">' + i.n + "</span></button>").join("");
    zone.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      rub = b.dataset.cle; etat.cat = "Toutes catégories";
      const r = S.rubriques.find(x => x.cle === rub);
      history.replaceState(null, "", r ? lienRubrique(r) : "vehicules.html");
      rubriques(); categories(); rendre();
    }));
  }

  function categories() {
    const zone = document.getElementById("categories");
    const liste = ["Toutes catégories", ...new Set(articlesDe(rub).map(v => v.categorie).filter(Boolean))];
    zone.hidden = liste.length < 3;
    zone.innerHTML = liste.map(c => '<button class="pastille' + (etat.cat === c ? " actif" : "") + '">' + c + "</button>").join("");
    zone.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { etat.cat = b.textContent; categories(); rendre(); }));
  }

  function titre() {
    const r = S.rubriques.find(x => x.cle === rub);
    document.getElementById("titre").textContent = r ? r.nom : "Tout le catalogue, en ligne.";
    document.getElementById("sous-titre").textContent = r ? r.texte : "Voitures, moteurs, tracteurs, camions et machines : choisissez une rubrique, puis contactez-nous sur WhatsApp.";
    document.title = (r ? r.nom : "Catalogue") + " – " + S.nom;
  }

  function rendre() {
    titre();
    const q = etat.q.trim().toLowerCase();
    let r = articlesDe(rub).filter(v =>
      (etat.cat === "Toutes catégories" || v.categorie === etat.cat) &&
      (!q || (nomArticle(v) + " " + (v.annee || "") + " " + (v.couleur || "")).toLowerCase().includes(q))
    );
    if (etat.tri === "prix-asc") r.sort((a, b) => a.prix - b.prix);
    if (etat.tri === "prix-desc") r.sort((a, b) => b.prix - a.prix);
    if (etat.tri === "annee-desc") r.sort((a, b) => (b.annee || 0) - (a.annee || 0));
    document.getElementById("liste").innerHTML = r.map(carteVehicule).join("");
    document.getElementById("compteur").textContent = r.length + (r.length > 1 ? " articles disponibles" : " article disponible");
    const vide = document.getElementById("vide");
    vide.hidden = r.length > 0;
    const rb = S.rubriques.find(x => x.cle === rub);
    const aucun = articlesDe(rub).length === 0;
    const sujet = rb ? rb.nom.toLowerCase() : "ce que vous cherchez";
    vide.innerHTML = aucun
      ? "<h2>Bientôt disponible</h2><p style=\"margin:8px 0 18px\">Nous n'avons pas encore de " + sujet + " en ligne, mais nous pouvons en trouver pour vous en Chine.</p>" +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + lienWA("Bonjour, je cherche : " + (rb ? rb.nom : "un article") + ".") + '">Demander sur WhatsApp</a>'
      : "Aucun article ne correspond à votre recherche.";
  }

  document.getElementById("q").addEventListener("input", e => { etat.q = e.target.value; rendre(); });
  document.getElementById("tri").addEventListener("change", e => { etat.tri = e.target.value; rendre(); });
  rubriques(); categories(); rendre();
})();
