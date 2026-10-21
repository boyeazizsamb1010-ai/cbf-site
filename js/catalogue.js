// Catalogue : recherche + filtres + tri
(function () {
  const all = window.VEHICULES;
  const etat = { q: "", cat: "Toutes catégories", etat: "Tous", tri: "" };
  const cats = ["Toutes catégories", ...new Set(all.map(v => v.categorie))];
  const etats = ["Tous", ...new Set(all.map(v => v.etat))];

  function pastilles(id, liste, cle) {
    const zone = document.getElementById(id);
    zone.innerHTML = liste.map(c => '<button class="pastille' + (etat[cle] === c ? " actif" : "") + '">' + c + "</button>").join("");
    zone.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { etat[cle] = b.textContent; pastilles(id, liste, cle); rendre(); }));
  }

  function rendre() {
    const q = etat.q.trim().toLowerCase();
    let r = all.filter(v =>
      (etat.cat === "Toutes catégories" || v.categorie === etat.cat) &&
      (etat.etat === "Tous" || v.etat === etat.etat) &&
      (!q || (v.marque + " " + v.modele + " " + v.annee + " " + v.couleur).toLowerCase().includes(q))
    );
    if (etat.tri === "prix-asc") r.sort((a, b) => a.prix - b.prix);
    if (etat.tri === "prix-desc") r.sort((a, b) => b.prix - a.prix);
    if (etat.tri === "annee-desc") r.sort((a, b) => b.annee - a.annee);
    document.getElementById("liste").innerHTML = r.map(carteVehicule).join("");
    document.getElementById("compteur").textContent = r.length + (r.length > 1 ? " véhicules disponibles" : " véhicule disponible");
    document.getElementById("vide").hidden = r.length > 0;
  }

  document.getElementById("q").addEventListener("input", e => { etat.q = e.target.value; rendre(); });
  document.getElementById("tri").addEventListener("change", e => { etat.tri = e.target.value; rendre(); });
  pastilles("categories", cats, "cat");
  pastilles("etats", etats, "etat");
  rendre();
})();
