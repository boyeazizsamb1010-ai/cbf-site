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
  window.fmtPrix = n => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ") + " " + S.devise;
  window.fmtKm = n => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ") + " km";
  window.lienWA = msg => "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(msg);

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
      '<div class="carte-img"><img src="' + photo + '" alt="' + v.marque + " " + v.modele + '" loading="lazy" onerror="imgSecours(this,\'' + v.id + '\')">' +
      '<span class="badge ' + (v.etat === "Neuf" ? "neuf" : "") + '">' + v.etat + "</span></div>" +
      '<div class="carte-corps"><span class="carte-cat">' + v.categorie + "</span>" +
      '<span class="carte-titre">' + v.marque + " " + v.modele + " " + v.annee + "</span>" +
      '<span class="carte-prix">' + fmtPrix(v.prix) + (v.ancienPrix ? "<s>" + fmtPrix(v.ancienPrix) + "</s>" : "") + "</span>" +
      (v.notePrix ? '<span class="carte-meta" style="font-size:.78rem">' + v.notePrix + "</span>" : "") +
      '<span class="carte-meta">' + v.carburant + " · " + v.transmission + (v.km ? " · " + fmtKm(v.km) : "") + "</span>" +
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
      lien("index.html", "Accueil") + lien("vehicules.html", "Véhicules") + lien("a-propos.html", "À propos") + lien("contact.html", "Contact") +
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
      '<div><h4>Services</h4><p>Achat professionnel</p><p>Confiance &amp; partenariat</p><p>Import – Export qualité</p></div>' +
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
