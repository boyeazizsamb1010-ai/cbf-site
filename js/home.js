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
        "<p>" + [v.annee, v.carburant, v.transmission].filter(Boolean).join(" · ") + " — " + fmtPrix(v.prix) + "</p>" +
        '<div class="slide-actions">' +
        '<a class="btn btn-blanc" href="vehicule.html?id=' + v.id + '">Voir la fiche</a>' +
        '<a class="btn btn-contour" target="_blank" rel="noopener" href="' + lienWA("Bonjour, je suis intéressé par : " + nom + (v.annee ? " " + v.annee : "") + ".") + '">Contacter sur WhatsApp</a>' +
        "</div></div></div></div>"
      );
    }).join("") +
    '<div class="points"><div class="container">' +
    slides.map((_, i) => '<button class="point' + (i === 0 ? " actif" : "") + '" aria-label="Diapositive ' + (i + 1) + '"></button>').join("") +
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
      "<h3>" + r.nom + "</h3><p>" + r.texte + '</p><span class="tuile-nb' + (n ? "" : " bientot") + '">' + (n ? n + (n > 1 ? " articles" : " article") : "Bientôt") + " →</span></a>";
  }).join("");

  // FAQ (modifier les textes ici)
  const faq = [
    ["Que veut dire « prix une fois arrivé au Port autonome de Dakar » ?", "C'est le prix annoncé pour un article arrivé au Port autonome de Dakar. Pour le détail des frais après l'arrivée au port (dédouanement, transport), demandez-nous sur WhatsApp."],
    ["Comment commander ou réserver ?", "Ouvrez la fiche de l'article, puis cliquez sur « Contacter sur WhatsApp ». Nous échangeons ensuite sur les détails et les étapes."],
    ["Puis-je voir plus de photos ou une vidéo ?", "Oui. Nous sommes sur place à Guangzhou : demandez-nous des photos ou une vidéo de l'article sur WhatsApp."],
    ["Vendez-vous autre chose que des voitures ?", "Oui : moteurs, tracteurs, camions, machines industrielles et décortiqueuses d'arachides. Si vous ne trouvez pas ce que vous cherchez, demandez-le nous."],
    ["Comment vous joindre ?", "Par WhatsApp au " + S.whatsappAffiche + (S.horaires ? " (" + S.horaires.toLowerCase() + ")" : "") + ", ou depuis la page Contact."]
  ];
  document.getElementById("faq").innerHTML = faq.map(q => "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>").join("");

  document.getElementById("vedettes").innerHTML = window.VEHICULES.slice(0, 4).map(carteVehicule).join("");
  document.getElementById("cta-wa").href = lienWA("Bonjour, je souhaite des informations sur vos véhicules.");
  apparitions();
})();
