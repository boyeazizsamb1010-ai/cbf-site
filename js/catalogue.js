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

  const TOUTES = "Toutes catégories"; // valeur interne (non traduite)
  const etat = { q: "", cat: TOUTES, tri: "", budget: "", carb: "", fav: false };
  const dansRubrique = (v, r) => typeDe(v) === r.type && (!r.etat || v.etat === r.etat);
  const articlesDe = cle => cle === "tout" ? all : all.filter(v => dansRubrique(v, S.rubriques.find(r => r.cle === cle)));

  function rubriques() {
    const zone = document.getElementById("rubriques");
    const items = [{ cle: "tout", nom: t("all"), n: all.length }].concat(S.rubriques.map(r => ({ cle: r.cle, nom: rubNom(r), n: articlesDe(r.cle).length })));
    zone.innerHTML = items.map(i => '<button class="pastille' + (rub === i.cle ? " actif" : "") + '" data-cle="' + i.cle + '">' + i.nom + ' <span class="nb">' + i.n + "</span></button>").join("");
    zone.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      rub = b.dataset.cle; etat.cat = TOUTES;
      const r = S.rubriques.find(x => x.cle === rub);
      history.replaceState(null, "", r ? lienRubrique(r) : "vehicules.html");
      rubriques(); categories(); carburants(); rendre();
    }));
  }

  function categories() {
    const zone = document.getElementById("categories");
    const liste = [TOUTES, ...new Set(articlesDe(rub).map(v => v.categorie).filter(Boolean))];
    zone.hidden = liste.length < 3;
    zone.innerHTML = liste.map(c => '<button class="pastille' + (etat.cat === c ? " actif" : "") + '" data-c="' + c.replace(/"/g, "&quot;") + '">' + (c === TOUTES ? t("cat.allcats") : tv(c)) + "</button>").join("");
    zone.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { etat.cat = b.dataset.c; categories(); rendre(); }));
  }

  function carburants() {
    const sel = document.getElementById("carb");
    const liste = [...new Set(articlesDe(rub).map(v => v.carburant).filter(Boolean))];
    sel.hidden = liste.length < 2;
    sel.innerHTML = '<option value="">' + t("carb.all") + '</option>' + liste.map(c => '<option value="' + c + '">' + tv(c) + "</option>").join("");
    if (!liste.includes(etat.carb)) etat.carb = "";
    sel.value = etat.carb;
  }

  function titre() {
    const r = S.rubriques.find(x => x.cle === rub);
    document.getElementById("titre").textContent = r ? rubNom(r) : t("cat.title");
    document.getElementById("sous-titre").textContent = r ? rubTexte(r) : t("cat.sub");
    document.title = (r ? rubNom(r) : t("nav.catalog")) + " – " + S.nom;
  }

  function rendre() {
    titre();
    const q = etat.q.trim().toLowerCase();
    let r = articlesDe(rub).filter(v =>
      (etat.cat === TOUTES || v.categorie === etat.cat) &&
      (!etat.carb || v.carburant === etat.carb) &&
      (!etat.fav || favoris.est(v.id)) &&
      (!etat.budget || (v.prix >= (+etat.budget.split("-")[0] || 0) && (!etat.budget.split("-")[1] || v.prix < +etat.budget.split("-")[1]))) &&
      (!q || (nomArticle(v) + " " + (v.annee || "") + " " + (v.couleur || "") + " " + (tv(v.couleur) || "")).toLowerCase().includes(q))
    );
    if (etat.tri === "prix-asc") r.sort((a, b) => a.prix - b.prix);
    if (etat.tri === "prix-desc") r.sort((a, b) => b.prix - a.prix);
    if (etat.tri === "annee-desc") r.sort((a, b) => (b.annee || 0) - (a.annee || 0));
    document.getElementById("liste").innerHTML = r.map(carteVehicule).join("");
    document.getElementById("compteur").textContent = t(r.length > 1 ? "count.n" : "count.1", { n: r.length });
    document.getElementById("nb-fav").textContent = favoris.liste().length;
    document.getElementById("btn-fav").classList.toggle("actif", etat.fav);
    apparitions();
    const vide = document.getElementById("vide");
    vide.hidden = r.length > 0;
    const rb = S.rubriques.find(x => x.cle === rub);
    const aucun = articlesDe(rub).length === 0 && !etat.fav;
    const sujet = rb ? rubNom(rb).toLowerCase() : t("empty.any");
    vide.innerHTML = aucun
      ? "<h2>" + t("empty.h") + "</h2><p style=\"margin:8px 0 18px\">" + t("empty.p", { sujet }) + "</p>" +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + lienWA(t("wa.looking", { x: rb ? rubNom(rb) : t("wa.anitem") })) + '">' + t("empty.btn") + '</a>'
      : (etat.fav ? t("empty.fav") : t("empty.none"));
  }

  document.getElementById("q").addEventListener("input", e => { etat.q = e.target.value; rendre(); });
  document.getElementById("tri").addEventListener("change", e => { etat.tri = e.target.value; rendre(); });
  document.getElementById("budget").addEventListener("change", e => { etat.budget = e.target.value; rendre(); });
  document.getElementById("carb").addEventListener("change", e => { etat.carb = e.target.value; rendre(); });
  document.getElementById("btn-fav").addEventListener("click", () => { etat.fav = !etat.fav; rendre(); });
  document.addEventListener("favoris-change", () => { if (etat.fav) rendre(); else document.getElementById("nb-fav").textContent = favoris.liste().length; });
  rubriques(); categories(); carburants(); rendre();
})();
