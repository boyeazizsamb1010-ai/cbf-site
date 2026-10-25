// Fiche véhicule : galerie + agrandissement, partage, favoris, barre WhatsApp mobile, articles similaires
(function () {
  const zone = document.getElementById("fiche-zone");
  const id = window.VEHICULE_ID || new URLSearchParams(location.search).get("id");
  const v = window.VEHICULES.find(x => x.id === id);

  if (!v) {
    zone.innerHTML = '<div class="vide"><h2>Véhicule introuvable</h2><p style="margin:10px 0 20px">Il a peut-être été vendu.</p><a class="btn btn-vert" href="vehicules.html">Retour au catalogue</a></div>';
    return;
  }

  const nom = nomArticle(v);
  const nomAn = nom + (v.annee ? " " + v.annee : "");
  const rub = rubriqueDe(v);
  document.title = nomAn + " – " + window.SITE.nom;
  const grandes = photosDe(v), petites = miniDe(v);
  const msgWA = "Bonjour, je suis intéressé par : " + nomAn + (v.prix ? " à " + fmtPrix(v.prix) : "") + ". Est-il toujours disponible ?";
  const lienWhats = lienWA(msgWA);

  // lignes du tableau : seulement celles qui existent ; "specs" (facultatif) : [["Capacité", "5 t"]]
  const lignes = [
    ["Marque", v.marque], ["Modèle", v.modele], ["Année", v.annee],
    ["Kilométrage", v.km === undefined ? "" : (v.km ? fmtKm(v.km) : "0 km")], ["Carburant", v.carburant],
    ["Transmission", v.transmission], ["Couleur", v.couleur],
    ["Puissance", v.puissance], ["Portes", v.portes], ["État", v.etat]
  ].concat(v.specs || []).filter(l => l[1] !== undefined && l[1] !== "" && l[1] !== null);
  const points = [v.annee, v.km ? fmtKm(v.km) : "", v.carburant, v.transmission].filter(Boolean);

  const ICO_PARTAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.600 13.500l6.800 4M15.400 6.500l-6.800 4"/></svg>';
  const ICO_COEUR = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.500-4.600-9.500-9.200C1.200 8.600 3 5 6.400 5c2 0 3.600 1.100 4.600 2.700C12 6.100 13.600 5 15.600 5 19 5 20.800 8.600 19.500 11.800 17.500 16.400 12 21 12 21z"/></svg>';

  zone.innerHTML =
    '<nav class="fil"><a href="index.html">Accueil</a> / <a href="vehicules.html">Catalogue</a> / ' + (rub ? '<a href="' + lienRubrique(rub) + '">' + rub.nom + "</a> / " : "") + nom + "</nav>" +
    '<div class="fiche"><div>' +
    '<div class="galerie-principale" id="gp"><img id="grande" src="' + grandes[0] + '" alt="' + nomAn + '" fetchpriority="high" onerror="imgSecours(this,\'' + v.id + '\')">' +
    (grandes.length > 1 ? '<button class="gp-nav prec" aria-label="Photo précédente">‹</button><button class="gp-nav suiv" aria-label="Photo suivante">›</button><span class="gp-compte" id="gp-compte"></span>' : "") +
    '<span class="gp-zoom">Agrandir</span></div>' +
    (grandes.length > 1
      ? '<div class="miniatures">' + petites.map((p, i) => '<button class="' + (i === 0 ? "actif" : "") + '" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + p + '" alt="" loading="lazy" decoding="async"></button>').join("") + "</div>"
      : "") +
    '</div><div class="fiche-infos">' +
    '<div class="carte-cat">' + v.categorie + "</div>" +
    "<h1>" + nomAn + "</h1>" +
    '<div class="fiche-prix">' + fmtPrix(v.prix) + (v.ancienPrix ? "<s>" + fmtPrix(v.ancienPrix) + "</s>" : "") + "</div>" +
    (v.notePrix ? '<div class="carte-meta" style="margin-bottom:6px">' + v.notePrix + "</div>" : "") +
    (points.length ? '<div class="points-cles">' + points.map(p => "<span>" + p + "</span>").join("") + "</div>" : "") +
    (v.stock ? '<div class="stock">✓ En stock (' + v.stock + " disponible" + (v.stock > 1 ? "s" : "") + ")</div>" : "") +
    '<p class="fiche-desc">' + v.description + "</p>" +
    '<div class="fiche-actions">' +
    '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + lienWhats + '">Contacter sur WhatsApp</a>' +
    '<button class="btn btn-ligne" id="btn-partager" type="button">' + ICO_PARTAGE + " Partager</button>" +
    '<button class="btn btn-ligne coeur-btn' + (favoris.est(v.id) ? " actif" : "") + '" data-fav="' + v.id + '" type="button" aria-pressed="' + favoris.est(v.id) + '">' + ICO_COEUR + " Favori</button></div>" +
    '<div class="carac"><h3>Caractéristiques</h3>' +
    lignes.map(l => "<div><span>" + l[0] + "</span><span>" + l[1] + "</span></div>").join("") +
    "</div></div></div>" +
    '<div id="similaires"></div>' +
    '<div class="barre-wa"><div><strong>' + fmtPrix(v.prix) + '</strong><small>' + nom + '</small></div><a class="btn btn-wa" target="_blank" rel="noopener" href="' + lienWhats + '">WhatsApp</a></div>';

  // ---------- Galerie ----------
  const grande = document.getElementById("grande");
  const compte = document.getElementById("gp-compte");
  const thumbs = zone.querySelectorAll(".miniatures button");
  let cur = 0;
  function aller(n) {
    cur = (n + grandes.length) % grandes.length;
    grande.src = grandes[cur];
    thumbs.forEach((x, i) => x.classList.toggle("actif", i === cur));
    if (thumbs[cur]) thumbs[cur].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    if (compte) compte.textContent = (cur + 1) + " / " + grandes.length;
    if (grandes.length > 1) new Image().src = grandes[(cur + 1) % grandes.length]; // prépare la suivante
    if (lb.ouvert) lb.montrer();
  }
  thumbs.forEach(b => b.addEventListener("click", () => aller(+b.dataset.i)));
  zone.querySelector(".prec")?.addEventListener("click", e => { e.stopPropagation(); aller(cur - 1); });
  zone.querySelector(".suiv")?.addEventListener("click", e => { e.stopPropagation(); aller(cur + 1); });
  if (compte) compte.textContent = "1 / " + grandes.length;

  // ---------- Agrandissement plein écran ----------
  const lb = { ouvert: false };
  const boite = document.createElement("div");
  boite.className = "lightbox"; boite.hidden = true;
  boite.innerHTML = '<button class="lb-fermer" aria-label="Fermer">×</button>' +
    (grandes.length > 1 ? '<button class="lb-nav prec" aria-label="Précédente">‹</button><button class="lb-nav suiv" aria-label="Suivante">›</button>' : "") +
    '<img alt=""><span class="lb-compte"></span>';
  document.body.appendChild(boite);
  const lbImg = boite.querySelector("img");
  lb.montrer = () => { lbImg.src = grandes[cur]; boite.querySelector(".lb-compte").textContent = (cur + 1) + " / " + grandes.length; };
  lb.ouvrir = () => { lb.ouvert = true; boite.hidden = false; document.body.style.overflow = "hidden"; lb.montrer(); };
  lb.fermer = () => { lb.ouvert = false; boite.hidden = true; document.body.style.overflow = ""; };
  document.getElementById("gp").addEventListener("click", lb.ouvrir);
  boite.querySelector(".lb-fermer").addEventListener("click", lb.fermer);
  boite.addEventListener("click", e => { if (e.target === boite) lb.fermer(); });
  boite.querySelector(".prec")?.addEventListener("click", () => aller(cur - 1));
  boite.querySelector(".suiv")?.addEventListener("click", () => aller(cur + 1));
  document.addEventListener("keydown", e => {
    if (!lb.ouvert) return;
    if (e.key === "Escape") lb.fermer();
    if (e.key === "ArrowLeft") aller(cur - 1);
    if (e.key === "ArrowRight") aller(cur + 1);
  });
  // balayage au doigt (galerie et plein écran)
  [document.getElementById("gp"), boite].forEach(el => {
    let x0 = null;
    el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", e => {
      if (x0 === null || grandes.length < 2) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { aller(dx < 0 ? cur + 1 : cur - 1); el.dataset.balaye = "1"; setTimeout(() => delete el.dataset.balaye, 300); }
    }, { passive: true });
  });
  document.getElementById("gp").addEventListener("click", e => { if (e.currentTarget.dataset.balaye) e.stopImmediatePropagation(); }, true);

  document.getElementById("btn-partager").addEventListener("click", () => partager(v));

  // ---------- Articles similaires ----------
  const autres = window.VEHICULES.filter(x => x.id !== v.id);
  const memes = autres.filter(x => typeDe(x) === typeDe(v));
  const sim = (memes.length ? memes.concat(autres.filter(x => !memes.includes(x))) : autres).slice(0, 4);
  if (sim.length) {
    document.getElementById("similaires").innerHTML =
      '<section class="similaires"><h2>Vous aimerez aussi</h2><div class="grille">' + sim.map(carteVehicule).join("") + "</div></section>";
  }
})();
