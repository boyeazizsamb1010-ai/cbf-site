// Accueil : carrousel + véhicules vedettes
(function () {
  const vedettes = window.VEHICULES.filter(v => v.vedette);
  const slides = vedettes.length ? vedettes : window.VEHICULES.slice(0, 3);
  const hero = document.getElementById("hero");

  hero.innerHTML =
    slides.map((v, i) => {
      const nom = nomArticle(v);
      return (
        '<div class="slide' + (i === 0 ? " actif" : "") + '">' +
        (v.photos && v.photos.length
          ? '<img class="fond" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' src="' + photosDe(v)[0] + '" alt="' + nom + '" onerror="imgSecours(this,\'' + v.id + '\')">'
          : '<img class="fond defaut" src="' + imagePlaceholder(v, true) + '" alt="' + nom + '">') +
        '<div class="container"><div class="slide-contenu">' +
        '<h1>' + nom + "</h1>" +
        "<p>" + [v.annee, tv(v.carburant), tv(v.transmission)].filter(Boolean).join(" · ") + " — " + fmtPrix(v.prix) + "</p>" +
        '<div class="slide-actions">' +
        '<a class="btn btn-blanc" href="vehicule.html?id=' + v.id + '">' + t("slide.view") + '</a>' +
        '<a class="btn btn-contour" target="_blank" rel="noopener" href="' + lienWA(t("wa.interest.short", { n: nom + (v.annee ? " " + v.annee : "") })) + '">' + t("btn.wa") + '</a>' +
        "</div></div></div></div>"
      );
    }).join("") +
    '<div class="points"><div class="container">' +
    slides.map((_, i) => '<button class="point' + (i === 0 ? " actif" : "") + '" aria-label="' + t("slide.n", { n: i + 1 }) + '"></button>').join("") +
    "</div></div>";

  const els = hero.querySelectorAll(".slide");
  const pts = hero.querySelectorAll(".point");
  let cur = 0, timer;
  function aller(n) {
    els[cur].classList.remove("actif"); pts[cur].classList.remove("actif");
    cur = (n + els.length) % els.length;
    els[cur].classList.add("actif"); pts[cur].classList.add("actif");
  }
  function lancer() { clearInterval(timer); timer = setInterval(() => aller(cur + 1), 5500); }
  pts.forEach((p, i) => p.addEventListener("click", () => { aller(i); lancer(); }));
  lancer();

  // Tuiles « Que recherchez-vous ? »
  const S = window.SITE;
  document.getElementById("rubriques").innerHTML = S.rubriques.map(r => {
    const n = window.VEHICULES.filter(v => typeDe(v) === r.type && (!r.etat || v.etat === r.etat)).length;
    return '<a class="tuile apparait" href="' + lienRubrique(r) + '"><div class="ico">' + icone(r.icone) + "</div>" +
      "<h3>" + rubNom(r) + "</h3><p>" + rubTexte(r) + '</p><span class="tuile-nb' + (n ? "" : " bientot") + '">' + (n ? t(n > 1 ? "tile.n" : "tile.1", { n }) : t("tile.soon")) + " →</span></a>";
  }).join("");

  // FAQ (modifier les textes ici)
  const faq = [1, 2, 3, 4, 5].map(i => [t("faq" + i + ".q"), t("faq" + i + ".a")]);
  document.getElementById("faq").innerHTML = faq.map(q => "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>").join("");

  document.getElementById("vedettes").innerHTML = window.VEHICULES.slice(0, 4).map(carteVehicule).join("");
  document.getElementById("cta-wa").href = lienWA(t("wa.cars"));
  apparitions();
})();
