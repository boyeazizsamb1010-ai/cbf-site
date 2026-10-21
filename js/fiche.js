// Fiche véhicule : lit ?id=... dans l'adresse
(function () {
  const zone = document.getElementById("fiche-zone");
  const id = new URLSearchParams(location.search).get("id");
  const v = window.VEHICULES.find(x => x.id === id);

  if (!v) {
    zone.innerHTML = '<div class="vide"><h2>Véhicule introuvable</h2><p style="margin:10px 0 20px">Il a peut-être été vendu.</p><a class="btn btn-vert" href="vehicules.html">Retour au catalogue</a></div>';
    return;
  }

  const nom = v.marque + " " + v.modele;
  document.title = nom + " " + v.annee + " – " + window.SITE.nom;
  const photos = photosDe(v);
  const lignes = [
    ["Marque", v.marque], ["Modèle", v.modele], ["Année", v.annee],
    ["Kilométrage", v.km ? fmtKm(v.km) : "0 km"], ["Carburant", v.carburant],
    ["Transmission", v.transmission], ["Couleur", v.couleur],
    ["Puissance", v.puissance], ["Portes", v.portes], ["État", v.etat]
  ];

  zone.innerHTML =
    '<nav class="fil"><a href="index.html">Accueil</a> / <a href="vehicules.html">Véhicules</a> / ' + nom + "</nav>" +
    '<div class="fiche"><div>' +
    '<div class="galerie-principale"><img id="grande" src="' + photos[0] + '" alt="' + nom + '" onerror="imgSecours(this,\'' + v.id + '\')"></div>' +
    (photos.length > 1
      ? '<div class="miniatures">' + photos.map((p, i) => '<button class="' + (i === 0 ? "actif" : "") + '" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + p + '" alt=""></button>').join("") + "</div>"
      : "") +
    '</div><div class="fiche-infos">' +
    '<div class="carte-cat">' + v.categorie + "</div>" +
    "<h1>" + nom + " " + v.annee + "</h1>" +
    '<div class="fiche-prix">' + fmtPrix(v.prix) + (v.ancienPrix ? "<s>" + fmtPrix(v.ancienPrix) + "</s>" : "") + "</div>" +
    (v.notePrix ? '<div class="carte-meta" style="margin-bottom:6px">' + v.notePrix + "</div>" : "") +
    '<div class="stock">✓ En stock (' + v.stock + " disponible" + (v.stock > 1 ? "s" : "") + ")</div>" +
    '<p class="fiche-desc">' + v.description + "</p>" +
    '<div class="fiche-actions">' +
    '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + lienWA("Bonjour, je suis intéressé par le " + nom + " " + v.annee + " à " + fmtPrix(v.prix) + ". Est-il toujours disponible ?") + '">Contacter sur WhatsApp</a>' +
    '<a class="btn btn-ligne" href="contact.html">Voir les coordonnées de contact</a></div>' +
    '<div class="carac"><h3>Caractéristiques</h3>' +
    lignes.map(l => "<div><span>" + l[0] + "</span><span>" + l[1] + "</span></div>").join("") +
    "</div></div></div>";

  const grande = document.getElementById("grande");
  zone.querySelectorAll(".miniatures button").forEach(b =>
    b.addEventListener("click", () => {
      grande.src = photos[b.dataset.i];
      zone.querySelectorAll(".miniatures button").forEach(x => x.classList.remove("actif"));
      b.classList.add("actif");
    })
  );
})();
