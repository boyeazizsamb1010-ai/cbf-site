// ============================================================
//  Cheikh Baye Fall Cargo : tarifs, simulateur, départs, réservation, suivi de colis, produits importés.
//  Les données viennent de Supabase (tables cargo_*, voir supabase/4-cargo.sql).
//  Si la base ne répond pas, la page reste utilisable : tarifs de config.js et réservation par WhatsApp.
// ============================================================
(function () {
  const S = window.SITE, C = S.cargo || {};
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const LANG = window.LANG || "fr";
  const LOC = { fr: "fr-FR", en: "en-GB", zh: "zh-CN" }[LANG] || "fr-FR";
  const MODES = ["standard", "express"];
  const ETAPES = ["depot_valide", "en_transit", "dedouanement", "arrive", "disponible"];
  const RANG = { depot_valide: 0, en_transit: 1, dedouanement: 2, arrive: 3, disponible: 4, retire: 5 };

  const waCargo = msg => "https://wa.me/" + (C.whatsapp || S.whatsapp) + "?text=" + encodeURIComponent(msg);
  const cfa = n => fmtNombre(Math.round(n)) + " FCFA";
  // conversion indicative en $ / ¥ (précise aussi pour les petits montants comme le prix au kilo)
  const TAUX = Object.assign({ en: 584.5, zh: 87.8 }, S.taux || {});
  const conv = n => {
    if (LANG === "fr" || !TAUX[LANG]) return "";
    const v = n / TAUX[LANG];
    const txt = v < 100 ? v.toLocaleString(LOC, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : fmtNombre(v < 10000 ? Math.round(v) : Math.round(v / 10) * 10);
    return (LANG === "en" ? "≈ $" : "约 ¥") + txt;
  };
  const kg = n => fmtNombre(Math.round(n * 100) / 100);
  const nomMode = m => t("cg.mode." + m);
  const jours = n => n === 1 ? t("cg.jour") : t("cg.jours", { n });

  // ---------- Dates (les dates de la base sont des jours "AAAA-MM-JJ") ----------
  const enJour = s => { if (!s) return null; const p = String(s).slice(0, 10).split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); };
  const aujourdhui = () => { const d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); };
  const ecart = (a, b) => Math.round((enJour(a) - (typeof b === "number" ? b : enJour(b))) / 864e5);
  const plusJours = (s, n) => { const d = new Date(enJour(s) + n * 864e5); return d.toISOString().slice(0, 10); };
  const fmtDate = (s, court) => s ? new Intl.DateTimeFormat(LOC, court ? { day: "numeric", month: "short" } : { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date(enJour(s))).replace(/^./, c => c.toUpperCase()) : "";
  const fmtDateHeure = s => new Intl.DateTimeFormat(LOC, { day: "numeric", month: "short" }).format(new Date(s));

  // ---------- Accès à la base ----------
  const sb = window.sb || {};
  const entetes = extra => Object.assign({ apikey: sb.cle }, /^eyJ/.test(sb.cle || "") ? { Authorization: "Bearer " + sb.cle } : {}, extra || {});
  async function lire(chemin) {
    if (!sb.actif) throw new Error("hors ligne");
    const ctl = new AbortController(), m = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(sb.url + "/rest/v1/" + chemin, { headers: entetes(), signal: ctl.signal });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } finally { clearTimeout(m); }
  }
  async function envoyer(chemin, corps, prefer) {
    const ctl = new AbortController(), m = setTimeout(() => ctl.abort(), 12000);
    try {
      return await fetch(sb.url + "/rest/v1/" + chemin, { method: "POST", headers: entetes({ "Content-Type": "application/json", Prefer: prefer || "return=minimal" }), body: JSON.stringify(corps), signal: ctl.signal });
    } finally { clearTimeout(m); }
  }

  // ---------- État ----------
  const T = {};   // tarifs actifs : { standard: { prix_kg, delai_jours }, express: {...} }
  MODES.forEach(m => { if (C.tarifs && C.tarifs[m]) T[m] = Object.assign({}, C.tarifs[m]); });
  let departs = [];

  const ICO_AVION = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>';
  const ICO_COLIS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>';
  const ICO_CAMION = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/></svg>';
  const ICO_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  const ICO_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';

  // ============================================================
  //  TARIFS + SIMULATEUR
  // ============================================================
  function dessinerTarifs() {
    $("cg-tarifs").innerHTML = MODES.filter(m => T[m]).map(m =>
      '<div class="cg-tarif ' + m + ' apparait"><div class="cg-tarif-tete">' + (m === "express" ? ICO_CAMION : ICO_COLIS) + esc(nomMode(m)) + "</div>" +
      '<div class="cg-tarif-corps"><span class="cg-delai">' + ICO_CAL + esc(jours(T[m].delai_jours)) + "</span>" +
      '<div class="cg-prix">' + esc(fmtNombre(T[m].prix_kg)) + '</div><span class="cg-unite">FCFA ' + esc(t("cg.parkg")) + "</span>" +
      (LANG !== "fr" ? '<span class="cg-conv">' + esc(conv(T[m].prix_kg)) + " " + esc(t("cg.parkg")) + " · " + esc(t("cg.conv")) + "</span>" : "") +
      "</div></div>").join("");
    simuler();
    if (window.apparitions) apparitions();
  }
  function simuler() {
    const p = parseFloat(String($("cg-sim-kg").value).replace(",", ".")) || 0;
    $("cg-sim-res").innerHTML = MODES.filter(m => T[m]).map(m =>
      '<div class="' + m + '"><small>' + esc(nomMode(m)) + " · " + esc(jours(T[m].delai_jours)) + "</small><b>" + esc(cfa(Math.ceil(p * T[m].prix_kg))) + "</b>" +
      (LANG !== "fr" ? "<small>" + esc(conv(Math.ceil(p * T[m].prix_kg))) + "</small>" : "") + "</div>").join("");
  }
  $("cg-sim-kg").addEventListener("input", simuler);
  document.querySelector(".cg-poids").addEventListener("click", e => {
    const b = e.target.closest("button[data-pas]"); if (!b) return;
    const v = parseFloat($("cg-sim-kg").value) || 0;
    $("cg-sim-kg").value = Math.max(0.5, Math.round((v + (+b.dataset.pas)) * 2) / 2);
    simuler();
  });

  // ============================================================
  //  DÉPARTS
  // ============================================================
  const ouvert = d => d.statut === "ouvert" && (!d.date_limite_depot || ecart(d.date_limite_depot, aujourdhui()) >= 0);
  const noteDe = d => (LANG !== "fr" && d["note_" + LANG]) || d.note || "";
  const titreDe = d => d.titre || ((d.origine || "Guangzhou") + " → " + (d.destination || "Dakar"));
  const arriveeDe = (d, m) => d.arrivee_prevue || (d.date_depart && T[m] ? plusJours(d.date_depart, T[m].delai_jours) : null);

  function dessinerDeparts() {
    const zone = $("cg-departs");
    if (!departs.length) { zone.innerHTML = '<div class="cg-info" style="grid-column:1/-1">' + esc(t("cg.dep.aucun")) + '<br><a class="btn btn-wa" target="_blank" rel="noopener" href="' + waCargo(t("cg.wa.info")) + '">WhatsApp ' + esc(C.whatsappAffiche || "") + "</a></div>"; return; }
    zone.innerHTML = departs.map(d => {
      const modes = (d.modes || MODES).filter(m => T[m]);
      const peut = ouvert(d) && modes.length;
      const reste = d.date_limite_depot ? ecart(d.date_limite_depot, aujourdhui()) : null;
      const arr = modes.map(m => arriveeDe(d, m)).filter(Boolean);
      const arrTxt = d.arrivee_prevue ? fmtDate(d.arrivee_prevue) : modes.filter(m => arriveeDe(d, m)).map(m => t("cg.mode." + m + ".c") + (LANG === "fr" ? " : " : ": ") + fmtDate(arriveeDe(d, m), true)).join(" · ");
      return '<article class="cg-depart' + (peut ? " ouvert" : "") + ' apparait">' +
        '<div class="cg-depart-tete"><h3>' + esc(titreDe(d)) + "<small>" + esc((d.origine || "Guangzhou") + " → " + (d.destination || "Dakar")) + "</small></h3>" +
        '<span class="cg-statut ' + esc(d.statut) + '">' + esc(t("cg.st." + d.statut)) + "</span></div>" +
        '<div class="cg-dates">' +
        "<div><span>" + esc(t("cg.dep.limite")) + "</span><b>" + esc(d.date_limite_depot ? fmtDate(d.date_limite_depot) : t("cg.dep.adate")) + "</b></div>" +
        "<div><span>" + esc(t("cg.dep.depart")) + "</span><b>" + esc(d.date_depart ? fmtDate(d.date_depart) : t("cg.dep.adate")) + "</b></div>" +
        (arr.length ? "<div><span>" + esc(t("cg.dep.arrivee")) + "</span><b>" + esc(arrTxt) + "</b></div>" : "") + "</div>" +
        '<div class="cg-modes">' + modes.map(m => '<span class="' + m + '">' + esc(nomMode(m)) + " · " + esc(fmtNombre(T[m].prix_kg)) + " FCFA/kg</span>").join("") + "</div>" +
        (peut && reste !== null ? '<div class="cg-reste' + (reste <= 2 ? " urgent" : "") + '">' + esc(reste === 0 ? t("cg.dep.reste0") : reste === 1 ? t("cg.dep.reste1") : t("cg.dep.reste", { n: reste })) + "</div>" : "") +
        (noteDe(d) ? '<p class="note-dep">' + esc(noteDe(d)) + "</p>" : "") +
        (peut ? '<a class="btn btn-rouge" href="#reserver" data-depart="' + esc(d.id) + '">' + esc(t("cg.dep.reserver")) + "</a>" : "") +
        "</article>";
    }).join("");
    if (window.apparitions) apparitions();
  }
  $("cg-departs").addEventListener("click", e => {
    const b = e.target.closest("[data-depart]"); if (!b) return;
    const sel = $("cg-f-depart");
    if (sel) { sel.value = b.dataset.depart; sel.dispatchEvent(new Event("change")); }
  });

  // ============================================================
  //  RÉSERVATION
  // ============================================================
  function formulaire(departChoisi) {
    const ouverts = departs.filter(ouvert);
    const zone = $("cg-res-zone");
    zone.innerHTML =
      '<form id="cg-form" novalidate>' +
      '<div class="champ"><label for="cg-f-depart">' + esc(t("cg.f.depart")) + '</label><select id="cg-f-depart">' +
      ouverts.map(d => '<option value="' + esc(d.id) + '">' + esc(titreDe(d) + (d.date_limite_depot ? " — " + t("cg.dep.limite") + " " + fmtDate(d.date_limite_depot, true) : "")) + "</option>").join("") +
      '<option value="">' + esc(t("cg.f.prochain")) + "</option></select></div>" +
      '<div class="champ"><label>' + esc(t("cg.f.mode")) + '</label><div class="cg-choix" id="cg-f-modes"></div></div>' +
      '<div class="champ"><label for="cg-f-nature">' + esc(t("cg.f.nature")) + ' *</label><input id="cg-f-nature" maxlength="1000" placeholder="' + esc(t("cg.f.nature.ph")) + '"></div>' +
      '<div class="ligne2"><div class="champ"><label for="cg-f-poids">' + esc(t("cg.f.poids")) + ' *</label><input id="cg-f-poids" type="number" inputmode="decimal" min="0.1" step="0.1" max="100000"></div>' +
      '<div class="champ"><label for="cg-f-nb">' + esc(t("cg.f.nb")) + '</label><input id="cg-f-nb" type="number" inputmode="numeric" min="1" max="999" value="1"></div></div>' +
      '<div class="cg-estim" id="cg-f-estim" hidden></div>' +
      '<div class="ligne2"><div class="champ"><label for="cg-f-nom">' + esc(t("cg.f.nom")) + ' *</label><input id="cg-f-nom" autocomplete="name" maxlength="200"></div>' +
      '<div class="champ"><label for="cg-f-tel">' + esc(t("cg.f.tel")) + ' *</label><input id="cg-f-tel" type="tel" autocomplete="tel" maxlength="60" placeholder="+221 …"></div></div>' +
      '<div class="champ"><label for="cg-f-ville">' + esc(t("cg.f.ville")) + '</label><input id="cg-f-ville" maxlength="200"></div>' +
      '<div class="champ"><label for="cg-f-msg">' + esc(t("cg.f.msg")) + '</label><textarea id="cg-f-msg" rows="3" maxlength="2000"></textarea></div>' +
      '<input class="cg-hp" id="cg-f-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="btn btn-rouge btn-block" type="submit" id="cg-f-btn">' + esc(t("cg.f.envoyer")) + "</button>" +
      '<p class="note">' + esc(t("cg.f.cond")) + "</p><div id=\"cg-f-err\"></div></form>";

    const sel = $("cg-f-depart");
    if (departChoisi && ouverts.some(d => d.id === departChoisi)) sel.value = departChoisi;
    const majModes = () => {
      const d = departs.find(x => x.id === sel.value);
      const dispo = MODES.filter(m => T[m] && (!d || (d.modes || MODES).includes(m)));
      const avant = (document.querySelector('input[name="cg-mode"]:checked') || {}).value;
      $("cg-f-modes").innerHTML = dispo.map((m, i) =>
        '<label><input type="radio" name="cg-mode" value="' + m + '"' + ((avant ? avant === m : i === 0) ? " checked" : "") + ">" +
        "<span>" + esc(nomMode(m)) + "<small>" + esc(jours(T[m].delai_jours)) + " · " + esc(fmtNombre(T[m].prix_kg)) + " FCFA/kg</small></span></label>").join("");
      if (!document.querySelector('input[name="cg-mode"]:checked') && dispo.length) document.querySelector('input[name="cg-mode"]').checked = true;
      estimer();
    };
    const estimer = () => {
      const m = (document.querySelector('input[name="cg-mode"]:checked') || {}).value;
      const p = parseFloat(String($("cg-f-poids").value).replace(",", "."));
      const e = $("cg-f-estim");
      if (!m || !(p > 0)) { e.hidden = true; return; }
      e.hidden = false;
      e.textContent = t("cg.f.estim", { x: cfa(Math.ceil(p * T[m].prix_kg)) + (LANG !== "fr" ? " (" + conv(Math.ceil(p * T[m].prix_kg)) + ")" : "") });
    };
    sel.addEventListener("change", majModes);
    $("cg-f-modes").addEventListener("change", estimer);
    $("cg-f-poids").addEventListener("input", estimer);
    majModes();
    $("cg-form").addEventListener("submit", envoyerDemande);
  }

  function lireFormulaire() {
    const v = id => $(id).value.trim();
    return {
      depart_id: $("cg-f-depart").value || null,
      mode: (document.querySelector('input[name="cg-mode"]:checked') || {}).value,
      nature: v("cg-f-nature"), poids_estime: parseFloat(v("cg-f-poids").replace(",", ".")),
      nb_colis: Math.max(1, Math.min(999, parseInt(v("cg-f-nb"), 10) || 1)),
      nom: v("cg-f-nom"), telephone: v("cg-f-tel"), ville: v("cg-f-ville") || null, message: v("cg-f-msg") || null, langue: LANG
    };
  }
  const nomDepart = id => { const d = departs.find(x => x.id === id); return d ? titreDe(d) + (d.date_depart ? " (" + fmtDate(d.date_depart, true) + ")" : "") : t("cg.f.prochain"); };
  const lienManuel = f => waCargo(t("cg.wa.manuel", { n: f.nature, k: kg(f.poids_estime || 0), m: nomMode(f.mode || "standard"), d: nomDepart(f.depart_id), nom: f.nom, tel: f.telephone }));
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)));

  async function envoyerDemande(e) {
    e.preventDefault();
    const f = lireFormulaire(), err = $("cg-f-err");
    err.innerHTML = "";
    document.querySelectorAll("#cg-form .err").forEach(x => x.classList.remove("err"));
    if ($("cg-f-hp").value) return;   // robot
    const fautes = [];
    if (!f.nature) fautes.push("cg-f-nature");
    if (!(f.poids_estime > 0 && f.poids_estime <= 100000)) fautes.push("cg-f-poids");
    if (!f.nom) fautes.push("cg-f-nom");
    if ((f.telephone.match(/\d/g) || []).length < 8) fautes.push("cg-f-tel");
    if (!f.mode || fautes.length) {
      fautes.forEach(id => $(id).classList.add("err"));
      err.innerHTML = '<div class="cg-erreur">' + esc(t("cg.err.champs")) + "</div>";
      if (fautes[0]) $(fautes[0]).focus();
      return;
    }
    if (!sb.actif) { window.open(lienManuel(f), "_blank", "noopener"); return; }
    const btn = $("cg-f-btn"); btn.disabled = true; btn.textContent = t("cg.f.envoi");
    const id = uuid();
    try {
      const r = await envoyer("cargo_demandes", Object.assign({ id }, f));
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(/accepte plus/i.test(txt) ? "depart" : "gen");
      }
      confirmation("RES-" + id.replace(/-/g, "").slice(0, 6).toUpperCase(), f);
    } catch (x) {
      btn.disabled = false; btn.textContent = t("cg.f.envoyer");
      err.innerHTML = '<div class="cg-erreur">' + esc(t(x.message === "depart" ? "cg.err.depart" : "cg.err.gen")) +
        '<br><a class="btn btn-wa" target="_blank" rel="noopener" href="' + lienManuel(f) + '">' + esc(t("cg.err.wa")) + "</a></div>";
      if (x.message === "depart") chargerDeparts();
    }
  }

  function confirmation(ref, f) {
    const d = departs.find(x => x.id === f.depart_id);
    const montant = Math.ceil(f.poids_estime * T[f.mode].prix_kg);
    const msg = t("cg.wa.demande", { ref, m: nomMode(f.mode), k: kg(f.poids_estime), n: f.nature, d: nomDepart(f.depart_id), nom: f.nom });
    $("cg-res-zone").innerHTML =
      '<div class="cg-ok"><h2>' + esc(t("cg.ok.h")) + "</h2>" +
      '<div class="note" style="text-align:left">' + esc(t("cg.ok.ref")) + '</div><div class="cg-ok-ref">' + esc(ref) + "</div>" +
      "<p><strong>" + esc(t("cg.ok.recap", { m: nomMode(f.mode), k: kg(f.poids_estime), x: cfa(montant) })) + "</strong></p>" +
      "<h3 style=\"margin-top:16px\">" + esc(t("cg.ok.etapes")) + "</h3><ol>" +
      "<li>" + esc(t("cg.ok.e1")) + "</li>" +
      "<li>" + esc(C.adresseDepot ? t("cg.ok.e2a", { a: C.adresseDepot }) : t("cg.ok.e2b")) + (d && d.date_limite_depot ? " <strong>" + esc(t("cg.ok.limite", { d: fmtDate(d.date_limite_depot) })) + "</strong>" : "") + "</li>" +
      "<li>" + esc(t("cg.ok.e3")) + "</li></ol>" +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waCargo(msg) + '">' + esc(t("cg.ok.wa")) + "</a>" +
      '<button class="btn btn-ligne" type="button" id="cg-autre">' + esc(t("cg.ok.autre")) + "</button></div>";
    $("cg-autre").addEventListener("click", () => formulaire(f.depart_id));
    $("cg-res-zone").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ============================================================
  //  SUIVI DE COLIS
  // ============================================================
  async function suivre(q) {
    const zone = $("cg-suivi-res"), sec = $("resultats");
    sec.hidden = false;
    const brut = String(q || "").trim();
    const lettres = brut.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const chiffres = brut.replace(/\D/g, "");
    const estTel = /^\d+$/.test(lettres);
    if ((estTel && chiffres.length < 9) || (!estTel && lettres.replace(/^CBF/, "").length < 8)) {
      zone.innerHTML = '<div class="cg-info">' + esc(t("cg.suivi.court")) + "</div>"; return;
    }
    zone.innerHTML = '<div class="cg-info">' + esc(t("cg.suivi.charge")) + "</div>";
    try {
      if (!sb.actif) throw new Error("hors ligne");
      const r = await envoyer("rpc/cargo_suivi", { q: brut }, "return=representation");
      if (!r.ok) throw new Error(r.status);
      const liste = await r.json();
      if (!Array.isArray(liste) || !liste.length) {
        zone.innerHTML = '<div class="cg-info">' + esc(t("cg.suivi.rien")) + '<br><a class="btn btn-wa" target="_blank" rel="noopener" href="' + waCargo(t("cg.wa.colis", { c: brut })) + '">WhatsApp</a></div>';
      } else {
        zone.innerHTML = (liste.length > 1 ? "<h2>" + esc(t("cg.suivi.plusieurs", { n: liste.length })) + "</h2>" : "") + liste.map(carteColis).join("");
      }
    } catch (x) {
      zone.innerHTML = '<div class="cg-info">' + esc(t("cg.suivi.err")) + '<br><a class="btn btn-wa" target="_blank" rel="noopener" href="' + waCargo(t("cg.wa.colis", { c: brut })) + '">WhatsApp</a></div>';
    }
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function carteColis(c) {
    const rang = RANG[c.statut] !== undefined ? RANG[c.statut] : 0;
    const today = c.aujourdhui ? enJour(c.aujourdhui) : aujourdhui();
    // date de chaque étape (dernière fois que le colis y est passé)
    const quand = {};
    (c.etapes || []).forEach(e => { quand[e.statut] = e.date; });

    // ----- compte à rebours -----
    let gros, titre, sous = "", fini = false, barre = null;
    if (rang >= 3) {
      fini = true;
      gros = '<span class="cg-nb">' + ICO_OK + "</span>";
      titre = t(c.statut === "retire" ? "cg.suivi.retire" : c.statut === "disponible" ? "cg.suivi.dispo" : "cg.suivi.arrive");
      sous = (c.destination || "Dakar");
    } else if (c.eta) {
      const n = ecart(c.eta, today);
      const avantDepart = c.statut === "depot_valide" && !c.date_expedition;
      gros = n >= 0 ? '<span class="cg-nb"><b>' + n + "</b><small>" + esc(n === 1 ? t("cg.jour").replace(/^1\s*/, "") : t("cg.jours", { n: "" }).trim()) + "</small></span>" : '<span class="cg-nb">' + ICO_AVION.replace('stroke="currentColor"', 'stroke="#d11f2e"') + "</span>";
      titre = n > 1 ? t("cg.suivi.dans", { n }) : n === 1 ? t("cg.suivi.dans1") : n === 0 ? t("cg.suivi.dans0") : t("cg.suivi.imminent");
      sous = (avantDepart && c.date_depart ? t("cg.suivi.departle", { d: fmtDate(c.date_depart) }) + " · " : "") + t("cg.suivi.prevue", { d: fmtDate(c.eta) });
      if (c.date_expedition) {
        const total = ecart(c.eta, c.date_expedition), fait = Math.round((today - enJour(c.date_expedition)) / 864e5);
        barre = total > 0 ? Math.max(4, Math.min(100, Math.round(fait / total * 100))) : 100;
      }
    } else {
      gros = '<span class="cg-nb">' + ICO_COLIS.replace('stroke="currentColor"', 'stroke="#0b1f4d"') + "</span>";
      titre = t("cg.suivi.attente");
      sous = c.date_depart ? t("cg.suivi.departle", { d: fmtDate(c.date_depart) }) : "";
    }

    const etapes = ETAPES.map((s, i) => {
      const cls = (rang >= 5 || i < rang) ? "fait" : i === rang ? (rang >= 4 ? "fait" : "actuel") : "";
      return '<li class="' + cls + '"><span class="rond">' + (cls === "fait" ? ICO_OK : "") + "</span><span>" + esc(t("cg.et." + s)) +
        (quand[s] && cls ? "<time>" + esc(fmtDateHeure(quand[s])) + "</time>" : "") + "</span></li>";
    }).join("");

    return '<article class="cg-colis">' +
      '<div class="cg-colis-tete"><div><small>' + esc(t("cg.suivi.eyebrow")) + '</small><div class="cg-code">' + esc(c.code) + "</div></div>" +
      '<div style="text-align:right"><small>' + esc((c.origine || "Guangzhou") + " → " + (c.destination || "Dakar")) + "</small><strong>" + esc(nomMode(c.mode)) + "</strong> · " + esc(t("cg.suivi.colis", { n: c.nb_colis, k: kg(+c.poids) })) + "</div></div>" +
      '<div class="cg-compte' + (fini ? " fini" : "") + '">' + gros + "<div><h3>" + esc(titre) + "</h3>" + (sous ? "<p>" + esc(sous) + "</p>" : "") +
      (barre !== null ? '<div class="cg-barre"><i style="width:' + barre + '%"></i></div>' : "") + "</div></div>" +
      '<ol class="cg-etapes">' + etapes + "</ol>" +
      '<div class="cg-colis-pied">' + (c.message ? '<div class="msg">' + esc(c.message) + "</div>" : "") +
      "<span>" + esc(t("cg.suivi.question")) + '</span><a class="btn btn-wa" target="_blank" rel="noopener" href="' + waCargo(t("cg.wa.colis", { c: c.code })) + '">WhatsApp</a></div></article>';
  }

  $("cg-suivi-form").addEventListener("submit", e => {
    e.preventDefault();
    const q = $("cg-suivi-q").value;
    try { const u = new URL(location.href); u.searchParams.set("suivi", q.trim()); history.replaceState(null, "", u); } catch (x) {}
    suivre(q);
  });

  // ============================================================
  //  PRODUITS IMPORTÉS
  // ============================================================
  async function chargerProduits() {
    let liste = [];
    try { liste = await lire("cargo_produits?select=*&order=ordre.asc,created_at.desc"); } catch (e) { return; }
    if (!liste.length) return;
    const champ = (p, k) => (LANG !== "fr" && p[k + "_" + LANG]) || p[k] || "";
    $("produits").hidden = false;
    $("cg-produits").innerHTML = liste.map(p => {
      const photo = (p.photos || [])[0];
      const nom = champ(p, "nom");
      return '<article class="cg-produit apparait"><div class="img">' + (photo ? '<img src="' + esc(String(photo).replace("/g/", "/m/")) + '" alt="' + esc(nom) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + esc(photo) + '\'">' : "") +
        (p.statut === "epuise" ? '<span class="badge vendu">' + esc(t("cg.prod.epuise")) + "</span>" : "") + "</div>" +
        '<div class="corps"><h3>' + esc(nom) + '</h3><div class="prix">' + esc(fmtPrix(p.prix)) + "</div>" +
        (champ(p, "description") ? "<p>" + esc(champ(p, "description")) + "</p>" : "") +
        (p.statut !== "epuise" ? '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waCargo(t("cg.wa.produit", { n: nom + (p.prix ? " – " + fmtPrixCFA(p.prix) : "") })) + '">' + esc(t("cg.prod.commander")) + "</a>" : "") +
        "</div></article>";
    }).join("");
    if (window.apparitions) apparitions();
  }

  // ============================================================
  //  CHARGEMENT
  // ============================================================
  async function chargerTarifs() {
    try {
      const l = await lire("cargo_tarifs?select=mode,prix_kg,delai_jours");
      if (Array.isArray(l) && l.length) { MODES.forEach(m => delete T[m]); l.forEach(x => { T[x.mode] = { prix_kg: +x.prix_kg, delai_jours: +x.delai_jours }; }); }
    } catch (e) { /* tarifs de config.js */ }
  }
  async function chargerDeparts() {
    try {
      const l = await lire("cargo_departs?select=*&order=date_depart.asc.nullslast,created_at.asc");
      const ordre = { ouvert: 0, cloture: 1, en_transit: 2, dedouanement: 3, arrive: 4, disponible: 5 };
      departs = (l || []).filter(d => ordre[d.statut] !== undefined)
        .sort((a, b) => (ouvert(b) - ouvert(a)) || (ordre[a.statut] - ordre[b.statut]));
    } catch (e) { departs = []; }
    dessinerDeparts();
  }

  const params = new URLSearchParams(location.search);
  $("cg-wa-hero").href = waCargo(t("cg.wa.info"));
  $("cg-wa-hero").textContent = "WhatsApp " + (C.whatsappAffiche || "");
  $("cg-cta-wa").href = waCargo(t("cg.wa.info"));
  $("cg-cta-wa").textContent = "WhatsApp " + (C.whatsappAffiche || "");
  $("cg-cta-p").textContent = t("cg.contact", { w: C.whatsappAffiche || "" });
  if (location.hash === "#suivi") setTimeout(() => $("cg-suivi-q").focus(), 300);

  dessinerTarifs();
  formulaire();
  (async () => {
    await chargerTarifs();
    dessinerTarifs();
    await chargerDeparts();
    // on redessine le formulaire avec les départs, sauf si le visiteur a déjà commencé à le remplir
    const touche = ["cg-f-nature", "cg-f-poids", "cg-f-nom", "cg-f-tel"].some(id => $(id) && $(id).value.trim());
    if (!touche) formulaire(params.get("depart"));
    chargerProduits();
  })();
  if (params.get("suivi")) { $("cg-suivi-q").value = params.get("suivi"); suivre(params.get("suivi")); }
})();
