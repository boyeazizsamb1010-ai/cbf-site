// ============================================================
//  Fonctions communes : en-tête, pied de page, helpers
// ============================================================
(function () {
  const S = window.SITE;
  const page = location.pathname.split("/").pop() || "index.html";

  const ICO = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2zm5.8 14.1c-.25.7-1.4 1.3-1.95 1.35-.5.05-1.1.07-1.75-.12a15 15 0 0 1-1.6-.6c-2.8-1.2-4.6-4-4.75-4.2-.14-.2-1.1-1.5-1.1-2.8s.7-2 .95-2.25c.25-.27.55-.33.73-.33h.5c.17 0 .4-.07.6.45.25.55.8 1.9.87 2.05.07.13.1.3.02.47-.1.2-.15.3-.3.47l-.45.5c-.15.15-.3.3-.13.6.17.3.75 1.25 1.6 2 1.1 1 2.05 1.3 2.35 1.45.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.7.8 2 .95.3.15.5.22.57.35.07.1.07.7-.17 1.4z"/></svg>'
  };

  // ---------- Helpers globaux ----------
  window.fmtPrix = n => !n ? "Prix sur demande" : new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ") + " " + S.devise;
  window.fmtKm = n => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ") + " km";
  window.lienWA = msg => "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(msg);

  // Rubriques : le type d'un article (voiture par défaut)
  window.typeDe = v => v.type || "voiture";
  window.rubriqueDe = v => S.rubriques.find(r => r.type === typeDe(v) && (!r.etat || r.etat === v.etat)) || S.rubriques.find(r => r.type === typeDe(v));
  window.nomArticle = v => [v.marque, v.modele].filter(Boolean).join(" ");
  window.ICONES = {
    voiture: '<path d="M3 17h18M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v4H3z"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/>',
    moteur: '<path d="M4 9h3l2-2h6l2 2h3v7h-3l-2 2H9l-2-2H4z"/><path d="M2 12v2M22 12v2M12 4v3"/>',
    tracteur: '<circle cx="7" cy="16" r="3.5"/><circle cx="18" cy="17.5" r="2"/><path d="M10.5 16H16M3.5 12.5V7h6l2 5h6.5l2 3.5"/>',
    camion: '<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>',
    machine: '<path d="M3 20V9l6 4V9l6 4V5h4v15z"/><path d="M3 20h18"/>',
    arachide: '<path d="M9 3.5a3.5 3.5 0 0 1 5.5 4.5c-.8 1.2-.2 2.3.8 3a3.5 3.5 0 0 1-5.8 4c-1-.9-2.4-.4-3.2.4A3.5 3.5 0 0 1 4 9c1.2-1 1.6-2.2 2.4-3.4A3.5 3.5 0 0 1 9 3.5z"/>'
  };
  window.icone = n => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONES[n] || ICONES.voiture) + "</svg>";
  window.lienRubrique = r => "vehicules.html?type=" + r.type + (r.etat ? "&etat=" + r.etat : "");

  // Image par défaut quand le client n'a pas encore mis de photo
  window.imagePlaceholder = function (v, transparent) {
    const c = v.teinte || "#9aa7a0";
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef2ef"/><stop offset="1" stop-color="#cfd8d2"/></linearGradient></defs>' +
      (transparent ? "" : '<rect width="800" height="600" fill="url(#g)"/>') + '<ellipse cx="400" cy="440" rx="270" ry="22" fill="#000" opacity=".12"/>' +
      '<path d="M130 400c0-30 10-50 40-58l70-95c15-20 35-30 60-30h220c28 0 50 12 66 33l62 80c40 6 62 28 62 70v20c0 12-8 20-20 20H150c-12 0-20-8-20-20z" fill="' + c + '"/>' +
      '<path d="M270 262l-48 80h160V232h-70c-18 0-32 10-42 30zm160-30v110h170l-52-70c-8-26-30-40-56-40z" fill="#fff" opacity=".5"/>' +
      '<circle cx="250" cy="420" r="52" fill="#1b1f1d"/><circle cx="250" cy="420" r="24" fill="#aab3ae"/>' +
      '<circle cx="570" cy="420" r="52" fill="#1b1f1d"/><circle cx="570" cy="420" r="24" fill="#aab3ae"/></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
  window.photosDe = v => (v.photos && v.photos.length ? v.photos.map(p => "images/vehicules/" + p) : [window.imagePlaceholder(v)]);
  // si une photo est introuvable, on remet l'image par défaut
  window.imgSecours = (img, id) => {
    const v = window.VEHICULES.find(x => x.id === id);
    img.onerror = null;
    img.src = window.imagePlaceholder(v);
  };

  window.carteVehicule = function (v) {
    const photo = photosDe(v)[0];
    return (
      '<a class="carte" href="vehicule.html?id=' + v.id + '">' +
      '<div class="carte-img"><img src="' + photo + '" alt="' + nomArticle(v) + '" loading="lazy" onerror="imgSecours(this,\'' + v.id + '\')">' +
      '<span class="badge ' + (v.etat === "Neuf" ? "neuf" : "") + '">' + (v.etat || "") + "</span></div>" +
      '<div class="carte-corps"><span class="carte-cat">' + v.categorie + "</span>" +
      '<span class="carte-titre">' + nomArticle(v) + (v.annee ? " " + v.annee : "") + "</span>" +
      '<span class="carte-prix">' + fmtPrix(v.prix) + (v.ancienPrix ? "<s>" + fmtPrix(v.ancienPrix) + "</s>" : "") + "</span>" +
      (v.notePrix ? '<span class="carte-meta" style="font-size:.78rem">' + v.notePrix + "</span>" : "") +
      '<span class="carte-meta">' + [v.carburant, v.transmission, v.km ? fmtKm(v.km) : ""].filter(Boolean).join(" · ") + "</span>" +
      '<span class="carte-lien">Voir la fiche →</span></div></a>'
    );
  };

  // ---------- En-tête ----------
  const lien = (href, txt) => '<a href="' + href + '"' + (page === href ? ' class="actif"' : "") + ">" + txt + "</a>";
  const header = document.getElementById("site-header");
  if (header) {
    const surHero = header.dataset.hero === "true";
    header.className = "header" + (surHero ? " sur-hero" : "");
    header.innerHTML =
      '<div class="container header-in">' +
      '<a class="logo" href="index.html"><img src="images/logo-emblem.png" alt=""><span>' + S.nom + "<small>" + S.slogan + "</small></span></a>" +
      '<button class="burger" aria-label="Menu">' + ICO.menu + "</button>" +
      '<nav class="nav">' +
      lien("index.html", "Accueil") + lien("vehicules.html", "Catalogue") + lien("a-propos.html", "À propos") + lien("contact.html", "Contact") +
      '<a class="btn" href="' + lienWA("Bonjour, je souhaite prendre rendez-vous.") + '" target="_blank" rel="noopener">Prendre RDV</a>' +
      "</nav></div>";
    header.querySelector(".burger").addEventListener("click", () => header.querySelector(".nav").classList.toggle("ouvert"));
  }

  // ---------- Pied de page ----------
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "footer";
    footer.innerHTML =
      '<div class="container"><div class="footer-grille">' +
      '<div><div class="logo" style="margin-bottom:12px"><img src="images/logo-emblem.png" alt=""><span>' + S.nom + "</span></div><p>" + S.slogan + ". Achat de véhicules et de machines en Chine, import-export de qualité.</p></div>" +
      '<div><h4>Navigation</h4><a href="index.html">Accueil</a><a href="vehicules.html">Véhicules</a><a href="a-propos.html">À propos</a><a href="contact.html">Contact</a></div>' +
      '<div><h4>Nos produits</h4>' + S.rubriques.map(r => '<a href="' + lienRubrique(r) + '">' + r.nom + "</a>").join("") + "</div>" +
      '' +
      '<div><h4>Contact</h4><a href="' + lienWA("Bonjour") + '" target="_blank" rel="noopener">WhatsApp : ' + S.whatsappAffiche + "</a>" +
      (S.email ? '<a href="mailto:' + S.email + '">' + S.email + "</a>" : "") + "<p>" + S.adresse + "</p>" + (S.horaires ? "<p>" + S.horaires + "</p>" : "") + "</div>" +
      '</div><div class="footer-bas">© ' + new Date().getFullYear() + " " + S.nom + ". Tous droits réservés.</div></div>";
  }

  // ---------- Bouton WhatsApp flottant ----------
  const wa = document.createElement("a");
  wa.className = "wa-flottant";
  wa.href = lienWA("Bonjour, je souhaite des informations.");
  wa.target = "_blank";
  wa.rel = "noopener";
  wa.setAttribute("aria-label", "Écrire sur WhatsApp");
  wa.innerHTML = ICO.wa;
  document.body.appendChild(wa);

  document.title = document.title.replace("{{nom}}", S.nom);
})();
