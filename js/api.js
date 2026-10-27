// ============================================================
//  Lien avec la base de données (Supabase).
//  - Si config.js > supabase est rempli : les véhicules viennent de la base (modifiables depuis /admin.html).
//  - Sinon, ou si la base ne répond pas : le site utilise js/data.js (il ne tombe jamais en panne).
// ============================================================
(function () {
  const cfg = (window.SITE && window.SITE.supabase) || {};
  const actif = !!(cfg.url && cfg.anonKey);
  const URL_BASE = (cfg.url || "").replace(/\/$/, "");
  // la clé "anon" (JWT, commence par eyJ) s'envoie aussi en Authorization ; la nouvelle clé "publishable" (sb_publishable_…) seulement en apikey
  const entetes = extra => Object.assign({ apikey: cfg.anonKey }, /^eyJ/.test(cfg.anonKey || "") ? { Authorization: "Bearer " + cfg.anonKey } : {}, extra || {});
  window.sb = { actif, url: URL_BASE, cle: cfg.anonKey };

  // ligne de la base -> objet véhicule tel que le site l'utilise
  const nettoie = o => { Object.keys(o).forEach(k => { if (o[k] === null || o[k] === undefined) delete o[k]; }); return o; };
  window.sb.depuisLigne = r => nettoie({
    id: r.id, type: r.type, marque: r.marque, modele: r.modele, annee: r.annee, categorie: r.categorie, etat: r.etat,
    prix: r.prix, ancienPrix: r.ancien_prix, notePrix: r.note_prix, km: r.km, carburant: r.carburant, transmission: r.transmission,
    couleur: r.couleur, puissance: r.puissance, portes: r.portes, stock: r.stock, statut: r.statut, vedette: r.vedette, teinte: r.teinte,
    photos: r.photos || [], specs: r.specs || [], description: r.description
  });

  function appliquer(lignes) {
    const liste = lignes.map(window.sb.depuisLigne);
    const desc = {};
    lignes.forEach(r => { if (r.description_en || r.description_zh) desc[r.id] = { en: r.description_en || undefined, zh: r.description_zh || undefined }; });
    window.DESCRIPTIONS = desc;
    // les véhicules vendus passent après ceux en stock
    window.VEHICULES = liste.filter(v => v.statut !== "vendu").concat(liste.filter(v => v.statut === "vendu"));
  }

  const CLE = "cbf_vehicules_v1", DUREE = 60 * 1000;
  async function charger() {
    try {
      const c = JSON.parse(sessionStorage.getItem(CLE) || "null");
      if (c && Date.now() - c.t < DUREE) { appliquer(c.d); return; }
    } catch (e) {}
    const ctl = new AbortController();
    const minuterie = setTimeout(() => ctl.abort(), 5000);
    try {
      const rep = await fetch(URL_BASE + "/rest/v1/vehicules?select=*&order=ordre.asc,created_at.desc", { headers: entetes(), signal: ctl.signal });
      if (!rep.ok) throw new Error(rep.status);
      const lignes = await rep.json();
      if (!Array.isArray(lignes) || !lignes.length) throw new Error("vide");
      appliquer(lignes);
      try { sessionStorage.setItem(CLE, JSON.stringify({ t: Date.now(), d: lignes })); } catch (e) {}
    } catch (e) { /* on garde js/data.js */ }
    clearTimeout(minuterie);
  }

  // Exécute fn quand les véhicules sont prêts
  window.avecDonnees = function (fn) {
    if (!actif) { fn(); return; }
    charger().then(fn, fn);
  };

  function envoyer(table, corps) {
    if (!actif) return;
    try {
      fetch(URL_BASE + "/rest/v1/" + table, { method: "POST", keepalive: true, headers: entetes({ "Content-Type": "application/json", Prefer: "return=minimal" }), body: JSON.stringify(corps) }).catch(() => {});
    } catch (e) {}
  }
  window.sb.envoyerMessage = m => envoyer("messages", m);

  // Statistiques de visites (anonymes : pas de cookie, pas d'adresse IP enregistrée)
  try {
    if (actif && !localStorage.getItem("cbf_admin") && !/^(localhost|127\.)/.test(location.hostname)) {
      const page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
      if (page !== "admin") {
        const idv = window.VEHICULE_ID || new URLSearchParams(location.search).get("id") || null;
        const marque = "v:" + page + ":" + (idv || "");
        if (!sessionStorage.getItem(marque)) {
          sessionStorage.setItem(marque, "1");
          let ref = "";
          try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
          if (ref === location.hostname) ref = "";
          envoyer("visites", {
            page: page === "vehicule" ? "vehicule" : page, vehicule_id: page === "vehicule" ? idv : null,
            langue: (window.LANG || "fr"),
            appareil: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "ordinateur",
            referent: ref || null
          });
        }
      }
    }
  } catch (e) {}
})();
