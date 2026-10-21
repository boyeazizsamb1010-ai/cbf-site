// Accueil : carrousel + véhicules vedettes
(function () {
  const vedettes = window.VEHICULES.filter(v => v.vedette);
  const slides = vedettes.length ? vedettes : window.VEHICULES.slice(0, 3);
  const hero = document.getElementById("hero");

  hero.innerHTML =
    slides.map((v, i) => {
      const nom = v.marque + " " + v.modele;
      return (
        '<div class="slide' + (i === 0 ? " actif" : "") + '">' +
        (v.photos && v.photos.length
          ? '<img class="fond" src="' + photosDe(v)[0] + '" alt="' + nom + '" onerror="imgSecours(this,\'' + v.id + '\')">'
          : '<img class="fond defaut" src="' + imagePlaceholder(v, true) + '" alt="' + nom + '">') +
        '<div class="container"><div class="slide-contenu">' +
        '<h1>' + nom + "</h1>" +
        "<p>" + v.annee + " · " + v.carburant + " · " + v.transmission + " — " + fmtPrix(v.prix) + "</p>" +
        '<div class="slide-actions">' +
        '<a class="btn btn-blanc" href="vehicule.html?id=' + v.id + '">Voir la fiche</a>' +
        '<a class="btn btn-contour" target="_blank" rel="noopener" href="' + lienWA("Bonjour, je suis intéressé par le " + nom + " " + v.annee + ".") + '">Contacter sur WhatsApp</a>' +
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

  document.getElementById("vedettes").innerHTML = window.VEHICULES.slice(0, 4).map(carteVehicule).join("");
  document.getElementById("cta-wa").href = lienWA("Bonjour, je souhaite des informations sur vos véhicules.");
})();
