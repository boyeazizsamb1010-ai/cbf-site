// Accueil : carrousel + véhicules vedettes
window.avecDonnees(function () {
  const vedettes = window.VEHICULES.filter(v => v.vedette && v.statut !== "vendu");
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
  const fondTuile = (r, articles) => {
    if (r.image) { const f = String(r.image).replace(/\.(webp|jpe?g|png)$/i, ""); return { src: "images/vehicules/m/" + f + ".webp", srcset: "images/vehicules/m/" + f + ".webp 600w, images/vehicules/g/" + f + ".webp 1200w" }; }
    const v = articles.find(x => x.photos && x.photos.length);
    return v ? { src: miniDe(v)[0], srcset: "" } : null;
  };
  document.getElementById("rubriques").innerHTML = S.rubriques.map(r => {
    const articles = window.VEHICULES.filter(v => typeDe(v) === r.type && (!r.etat || v.etat === r.etat));
    const n = articles.length, f = fondTuile(r, articles);
    const img = f ? '<img src="' + f.src + '"' + (f.srcset ? ' srcset="' + f.srcset + '" sizes="(min-width: 1200px) 25vw, (min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"' : "") +
      ' alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'sans-photo\');this.remove()">' : "";
    return '<a class="tuile apparait' + (f ? "" : " sans-photo") + '" href="' + lienRubrique(r) + '">' + img +
      "<h3>" + rubNom(r) + "</h3><p>" + rubTexte(r) + '</p><span class="tuile-nb' + (n ? "" : " bientot") + '">' + (n ? t(n > 1 ? "tile.n" : "tile.1", { n }) : t("tile.soon")) + " →</span></a>";
  }).join("");

  // FAQ (modifier les textes ici)
  const faq = [1, 2, 3, 4, 5].map(i => [t("faq" + i + ".q"), t("faq" + i + ".a")]);
  document.getElementById("faq").innerHTML = faq.map(q => "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>").join("");

  document.getElementById("vedettes").innerHTML = window.VEHICULES.slice(0, 4).map(carteVehicule).join("");
  document.getElementById("cta-wa").href = lienWA(t("wa.cars"));
  apparitions();
});

// Bloc « Cheikh Baye Fall Cargo » de l'accueil : tarifs (de la base si possible, sinon de config.js)
(function () {
  const zone = document.getElementById("home-cargo-tarifs");
  if (!zone) return;
  const C = window.SITE.cargo || {}, T = Object.assign({}, C.tarifs || {});
  const ico = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>';
  const dessiner = () => {
    zone.innerHTML = ["standard", "express"].filter(m => T[m]).map(m =>
      '<a class="cg-tarif ' + m + '" href="cargo.html#tarifs"><div class="cg-tarif-tete">' + ico + t("cg.mode." + m) + '</div><div class="cg-tarif-corps">' +
      '<span class="cg-delai">' + (T[m].delai_jours === 1 ? t("cg.jour") : t("cg.jours", { n: T[m].delai_jours })) + '</span>' +
      '<div class="cg-prix">' + fmtNombre(T[m].prix_kg) + '</div><span class="cg-unite">FCFA ' + t("cg.parkg") + "</span></div></a>").join("");
  };
  dessiner();
  const sb = window.sb || {};
  if (!sb.actif) return;
  fetch(sb.url + "/rest/v1/cargo_tarifs?select=mode,prix_kg,delai_jours", { headers: Object.assign({ apikey: sb.cle }, /^eyJ/.test(sb.cle || "") ? { Authorization: "Bearer " + sb.cle } : {}) })
    .then(r => r.ok ? r.json() : null).then(l => {
      if (!Array.isArray(l) || !l.length) return;
      Object.keys(T).forEach(k => delete T[k]);
      l.forEach(x => { T[x.mode] = { prix_kg: +x.prix_kg, delai_jours: +x.delai_jours }; });
      dessiner();
    }).catch(() => {});
})();
