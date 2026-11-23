// ============================================================
//  Espace admin — onglet « Cargo » (Cheikh Baye Fall Cargo)
//  Colis (réception, code de suivi, étapes), départs, demandes des clients, produits importés, tarifs.
//  Utilise les outils de js/admin.js (window.CBF_ADMIN) et les tables de supabase/4-cargo.sql.
// ============================================================
(function () {
  const $ = id => document.getElementById(id);
  const A = () => window.CBF_ADMIN;
  const esc = s => A().esc(s);
  const api = (c, o) => A().api(c, o);
  const flash = (t, ok) => A().flash(t, ok);
  const S = window.SITE, C = S.cargo || {};
  const SITE_URL = (S.siteUrl || location.origin).replace(/\/$/, "");

  const MODES = { standard: "Standard", express: "Express" };
  const ST_COLIS = { depot_valide: "Dépôt validé", en_transit: "En transit", dedouanement: "Dédouanement", arrive: "Arrivé au Sénégal", disponible: "Disponible pour retrait", retire: "Retiré par le client" };
  const ST_DEPART = { ouvert: "Ouvert aux dépôts", cloture: "Dépôts clôturés", en_transit: "En transit", dedouanement: "Dédouanement", arrive: "Arrivé à Dakar", disponible: "Disponible pour retrait", termine: "Terminé (archivé)", annule: "Annulé" };
  const ST_DEMANDE = { nouvelle: "Nouvelle", contactee: "Contactée", deposee: "Bagages déposés", annulee: "Annulée" };
  const PAIEMENT = { a_payer: "À payer", partiel: "Payé en partie", paye: "Payé" };
  const ST_PRODUIT = { disponible: "Disponible", epuise: "Épuisé", masque: "Masqué" };

  const nb = n => new Intl.NumberFormat("fr-FR").format(n).replace(/[  ]/g, " ");
  const cfa = n => n == null ? "—" : nb(n) + " FCFA";
  const kg = n => nb(Math.round(+n * 100) / 100) + " kg";
  const opts = (o, v) => Object.keys(o).map(k => '<option value="' + k + '"' + (k === v ? " selected" : "") + ">" + esc(o[k]) + "</option>").join("");
  const jour = s => s ? new Date(String(s).slice(0, 10) + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const auj = () => new Date().toISOString().slice(0, 10);
  const plus = (s, n) => { const d = new Date(String(s).slice(0, 10) + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const ecart = s => Math.round((Date.parse(String(s).slice(0, 10) + "T00:00:00Z") - Date.parse(auj() + "T00:00:00Z")) / 864e5);
  // numéro pour wa.me : 9 chiffres commençant par 7 ou 3 = Sénégal ; 11 chiffres commençant par 1 = Chine
  const numWA = tel => { let d = String(tel || "").replace(/\D/g, "").replace(/^00/, ""); if (d.length === 9 && /^[37]/.test(d)) d = "221" + d; if (d.length === 11 && d[0] === "1") d = "86" + d; return d; };
  const lienWA = (tel, msg) => "https://wa.me/" + numWA(tel) + "?text=" + encodeURIComponent(msg);
  const lienSuivi = code => SITE_URL + "/cargo.html?suivi=" + encodeURIComponent(code);

  let tarifs = {}, departs = [], colis = [], demandes = [], produits = [];
  let vue = "colis", filtre = { q: "", depart: "", statut: "encours" };

  // Date d'arrivée annoncée (même règle que la base : supabase/4-cargo.sql > cargo_eta)
  const etaDe = c => {
    const d = departs.find(x => x.id === c.depart_id) || {};
    if (c.arrivee_manuelle) return c.arrivee_manuelle;
    if (d.arrivee_prevue) return d.arrivee_prevue;
    if (c.date_expedition) return plus(c.date_expedition, c.delai_jours || 7);
    if (d.date_depart) return plus(d.date_depart, c.delai_jours || 7);
    return null;
  };
  const nomDepart = id => { const d = departs.find(x => x.id === id); return d ? (d.titre || (d.origine + " → " + d.destination)) + (d.date_depart ? " · " + jour(d.date_depart) : "") : "Sans départ"; };

  async function charger() {
    const r = await Promise.all([
      api("/rest/v1/cargo_tarifs?select=*"),
      api("/rest/v1/cargo_departs?select=*&order=date_depart.desc.nullsfirst,created_at.desc"),
      api("/rest/v1/cargo_colis?select=*&order=created_at.desc&limit=1000"),
      api("/rest/v1/cargo_demandes?select=*&order=created_at.desc&limit=500"),
      api("/rest/v1/cargo_produits?select=*&order=ordre.asc,created_at.desc")
    ]);
    tarifs = {}; r[0].forEach(t => { tarifs[t.mode] = t; });
    departs = r[1]; colis = r[2]; demandes = r[3]; produits = r[4];
    pastille();
  }
  function pastille() {
    const n = demandes.filter(d => d.statut === "nouvelle").length;
    const p = $("p-cargo"); if (!p) return;
    p.textContent = n; p.classList.toggle("cache", !n);
  }

  async function ouvrir(v) {
    if (v) vue = v;
    $("o-cargo").innerHTML = '<div class="adm-box">Chargement…</div>';
    try { await charger(); } catch (e) {
      $("o-cargo").innerHTML = '<div class="adm-box"><div class="adm-msg err">Impossible de charger le Cargo : ' + esc(e.message) + "</div>" +
        "<p>Si c'est la première fois, exécutez <code>supabase/4-cargo.sql</code> dans Supabase (voir <code>supabase/GUIDE-CARGO.md</code>).</p></div>";
      return;
    }
    dessiner();
  }

  function dessiner() {
    const enCours = colis.filter(c => c.statut !== "retire");
    const aEncaisser = colis.filter(c => c.paiement !== "paye").reduce((s, c) => s + (+c.montant || 0), 0);
    const nouv = demandes.filter(d => d.statut === "nouvelle").length;
    $("o-cargo").innerHTML =
      '<div class="adm-kpis">' +
      "<div><small>Colis en cours</small><b>" + enCours.length + "</b></div>" +
      "<div><small>Poids en cours</small><b>" + nb(Math.round(enCours.reduce((s, c) => s + (+c.poids || 0), 0))) + " kg</b></div>" +
      "<div><small>Demandes à traiter</small><b>" + nouv + "</b></div>" +
      "<div><small>Reste à encaisser</small><b style=\"font-size:1.25rem\">" + cfa(aEncaisser) + "</b></div></div>" +
      '<nav class="cg-sous" id="cg-sous">' +
      [["colis", "Colis & suivi"], ["departs", "Départs"], ["demandes", "Demandes" + (nouv ? " (" + nouv + ")" : "")], ["produits", "Produits importés"], ["tarifs", "Tarifs"]]
        .map(x => '<button data-v="' + x[0] + '"' + (vue === x[0] ? ' class="actif"' : "") + ">" + esc(x[1]) + "</button>").join("") + "</nav>" +
      '<div id="cg-vue"></div>';
    $("cg-sous").onclick = e => { const b = e.target.closest("button[data-v]"); if (!b) return; vue = b.dataset.v; dessiner(); };
    ({ colis: vueColis, departs: vueDeparts, demandes: vueDemandes, produits: vueProduits, tarifs: vueTarifs })[vue]();
  }

  // ============================================================
  //  COLIS
  // ============================================================
  function vueColis(nouveau) {
    const q = filtre.q.toLowerCase().replace(/[^a-z0-9]/g, "");
    const liste = colis.filter(c =>
      (!filtre.depart || (filtre.depart === "aucun" ? !c.depart_id : c.depart_id === filtre.depart)) &&
      (filtre.statut === "tous" || (filtre.statut === "encours" ? c.statut !== "retire" : c.statut === filtre.statut)) &&
      (!q || [c.code, c.client_nom, c.client_telephone, c.contenu].join(" ").toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)));
    const totalKg = liste.reduce((s, c) => s + (+c.poids || 0), 0), totalM = liste.reduce((s, c) => s + (+c.montant || 0), 0);
    $("cg-vue").innerHTML =
      (nouveau ? encadreNouveau(nouveau) : "") +
      '<div class="cg-outils"><button class="adm-btn" id="cg-c-ajout">+ Enregistrer un colis reçu</button>' +
      '<input id="cg-c-q" placeholder="Rechercher : code, nom, téléphone…" value="' + esc(filtre.q) + '">' +
      '<select id="cg-c-dep"><option value="">Tous les départs</option><option value="aucun"' + (filtre.depart === "aucun" ? " selected" : "") + ">Sans départ</option>" +
      departs.map(d => '<option value="' + d.id + '"' + (filtre.depart === d.id ? " selected" : "") + ">" + esc(nomDepart(d.id)) + "</option>").join("") + "</select>" +
      '<select id="cg-c-st"><option value="encours">En cours</option><option value="tous"' + (filtre.statut === "tous" ? " selected" : "") + ">Tous</option>" + opts(ST_COLIS, filtre.statut) + "</select></div>" +
      '<div class="adm-box">' + (liste.length ?
        '<table class="cg-table"><thead><tr><th>Code</th><th>Client</th><th>Départ</th><th>Poids · prix</th><th>Étape</th><th>Arrivée</th><th></th></tr></thead><tbody>' +
        liste.map(c => {
          const eta = etaDe(c), n = eta ? ecart(eta) : null;
          return '<tr data-id="' + c.id + '"><td><span class="cg-code-a">' + esc(c.code) + '</span><small>Reçu le ' + jour(c.date_depot) + "</small></td>" +
            "<td><strong>" + esc(c.client_nom) + "</strong><small>" + esc(c.client_telephone) + "</small>" + (c.contenu ? "<small>" + esc(c.contenu) + "</small>" : "") + "</td>" +
            "<td>" + esc(nomDepart(c.depart_id)) + '<small><span class="cg-pill ' + c.mode + '">' + MODES[c.mode] + "</span></small></td>" +
            "<td>" + kg(c.poids) + " · " + c.nb_colis + " colis<small>" + cfa(c.montant) + ' <span class="cg-pill ' + c.paiement + '">' + PAIEMENT[c.paiement] + "</span></small></td>" +
            '<td><select data-act="statut">' + opts(ST_COLIS, c.statut) + "</select></td>" +
            "<td>" + (eta ? jour(eta) + "<small>" + (c.statut === "retire" || ["arrive", "disponible"].includes(c.statut) ? "Arrivé" : n > 0 ? "dans " + n + " j" : n === 0 ? "aujourd'hui" : "dépassée de " + (-n) + " j") + "</small>" : "<small>Pas de date</small>") + "</td>" +
            '<td><div class="cg-actes"><a class="adm-btn sec petit" target="_blank" rel="noopener" href="' + lienWA(c.client_telephone, msgClient(c)) + '">WhatsApp</a>' +
            '<button class="adm-btn sec petit" data-act="modifier">Modifier</button><button class="adm-btn dang petit" data-act="suppr" title="Supprimer">✕</button></div></td></tr>';
        }).join("") + "</tbody></table>" +
        '<p style="margin-top:10px;color:var(--gris);font-size:.88rem">' + liste.length + " colis · " + nb(Math.round(totalKg * 100) / 100) + " kg · " + cfa(totalM) + "</p>"
        : "<p>Aucun colis ici. Cliquez sur « Enregistrer un colis reçu » quand un client dépose ses bagages.</p>") + "</div>";

    $("cg-c-ajout").onclick = () => formColis(null);
    $("cg-c-q").oninput = e => { filtre.q = e.target.value; const pos = e.target.selectionStart; vueColis(); const i = $("cg-c-q"); i.focus(); i.setSelectionRange(pos, pos); };
    $("cg-c-dep").onchange = e => { filtre.depart = e.target.value; vueColis(); };
    $("cg-c-st").onchange = e => { filtre.statut = e.target.value; vueColis(); };
    const zone = $("cg-vue");
    zone.onchange = async e => {
      const sel = e.target.closest('select[data-act="statut"]'); if (!sel) return;
      const id = sel.closest("tr").dataset.id;
      try {
        const r = await api("/rest/v1/cargo_colis?id=eq." + id, { method: "PATCH", json: { statut: sel.value }, headers: { Prefer: "return=representation" } });
        Object.assign(colis.find(c => c.id === id), r[0]);
        flash("Étape mise à jour : « " + ST_COLIS[sel.value] + " ». Le client le voit déjà dans son suivi.");
        vueColis();
      } catch (er) { flash("Échec : " + er.message, false); }
    };
    zone.onclick = async e => {
      const b = e.target.closest("button[data-act]"); if (!b) return;
      const c = colis.find(x => x.id === b.closest("tr").dataset.id);
      if (b.dataset.act === "modifier") formColis(c);
      if (b.dataset.act === "suppr" && confirm("Supprimer le colis " + c.code + " ? Le client ne pourra plus le suivre.")) {
        try { await api("/rest/v1/cargo_colis?id=eq." + c.id, { method: "DELETE" }); colis = colis.filter(x => x !== c); flash("Colis supprimé."); vueColis(); }
        catch (er) { flash("Échec : " + er.message, false); }
      }
    };
  }

  const msgClient = c => {
    const eta = etaDe(c);
    return "Bonjour " + c.client_nom + ", ici Cheikh Baye Fall Cargo.\n" +
      "Votre colis (" + c.nb_colis + " colis, " + kg(c.poids) + ", fret " + MODES[c.mode] + ") : " + ST_COLIS[c.statut] + ".\n" +
      "Code de suivi : " + c.code + "\n" + (c.montant != null ? "Montant : " + cfa(c.montant) + " (" + PAIEMENT[c.paiement].toLowerCase() + ")\n" : "") +
      (eta && !["arrive", "disponible", "retire"].includes(c.statut) ? "Arrivée prévue : " + jour(eta) + "\n" : "") +
      "Suivez votre colis ici : " + lienSuivi(c.code);
  };
  const encadreNouveau = c =>
    '<div class="cg-nouveau"><div>Colis enregistré. Code de suivi à donner au client :</div><div class="code">' + esc(c.code) + "</div>" +
    "<div>" + esc(c.client_nom) + " · " + kg(c.poids) + " · " + MODES[c.mode] + " · <strong>" + cfa(c.montant) + "</strong></div>" +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><a class="adm-btn" target="_blank" rel="noopener" href="' + lienWA(c.client_telephone, msgClient(c)) + '">Envoyer le code au client sur WhatsApp</a>' +
    '<a class="adm-btn sec" target="_blank" rel="noopener" href="' + lienSuivi(c.code) + '">Voir son suivi</a></div></div>';

  function formColis(c, demande) {
    const neuf = !c;
    c = c || {
      depart_id: (demande && demande.depart_id) || (departs.find(d => d.statut === "ouvert") || {}).id || "",
      client_nom: demande ? demande.nom : "", client_telephone: demande ? demande.telephone : "",
      contenu: demande ? demande.nature : "", nb_colis: demande ? demande.nb_colis : 1, poids: "",
      mode: demande ? demande.mode : "standard", frais_supp: 0, paiement: "a_payer", statut: "depot_valide", date_depot: auj(),
      destinataire: demande && demande.ville ? "Retrait : " + demande.ville : ""
    };
    const ch = (id, lab, val, type, extra) => '<div><label for="cc-' + id + '">' + lab + '</label><input id="cc-' + id + '" type="' + (type || "text") + '" value="' + esc(val == null ? "" : val) + '" ' + (extra || "") + "></div>";
    const depOpts = '<option value="">Sans départ (à attribuer plus tard)</option>' + departs.filter(d => !["termine", "annule"].includes(d.statut) || d.id === c.depart_id)
      .map(d => '<option value="' + d.id + '"' + (d.id === c.depart_id ? " selected" : "") + ">" + esc(nomDepart(d.id)) + " — " + esc(ST_DEPART[d.statut]) + "</option>").join("");
    $("cg-vue").innerHTML =
      '<form class="adm-box adm-form" id="cg-fc"><h2 style="margin:0 0 6px">' + (neuf ? "Enregistrer un colis reçu" : "Colis " + esc(c.code)) + "</h2>" +
      (demande ? '<p class="adm-msg ok">À partir de la demande ' + esc(demande.reference) + " — pesez les bagages et vérifiez les informations.</p>" : "") +
      '<div class="adm-grille">' +
      ch("nom", "Nom du client *", c.client_nom, "text", 'required maxlength="200"') + ch("tel", "Téléphone / WhatsApp du client *", c.client_telephone, "tel", 'required maxlength="60"') +
      ch("dest", "Destinataire au Sénégal (facultatif)", c.destinataire, "text", 'maxlength="300"') + ch("contenu", "Contenu", c.contenu, "text", 'maxlength="1000"') +
      '<div><label for="cc-depart">Départ</label><select id="cc-depart">' + depOpts + "</select></div>" +
      '<div><label for="cc-mode">Mode</label><select id="cc-mode">' + opts(MODES, c.mode) + "</select></div>" +
      ch("poids", "Poids pesé (kg) *", c.poids, "number", 'required min="0.01" step="0.01"') + ch("nb", "Nombre de colis", c.nb_colis, "number", 'min="1" max="999"') +
      ch("prixkg", "Prix par kg (FCFA)", c.prix_kg || (tarifs[c.mode] || {}).prix_kg, "number", 'min="1"') + ch("frais", "Frais en plus / remise (−) en FCFA", c.frais_supp || 0, "number", 'step="1"') +
      '<div><label for="cc-paiement">Paiement</label><select id="cc-paiement">' + opts(PAIEMENT, c.paiement) + "</select></div>" +
      '<div><label for="cc-statut">Étape</label><select id="cc-statut">' + opts(ST_COLIS, c.statut) + "</select></div>" +
      ch("depot", "Date de réception", c.date_depot, "date") + ch("exped", "Date d'expédition (auto au passage « En transit »)", c.date_expedition, "date") +
      ch("delai", "Délai annoncé (jours)", c.delai_jours || (tarifs[c.mode] || {}).delai_jours, "number", 'min="1" max="120"') + ch("arrivee", "Forcer la date d'arrivée (facultatif)", c.arrivee_manuelle, "date") +
      "</div>" +
      '<div class="cg-total" id="cc-total"></div>' +
      '<label for="cc-msg">Message visible par le client dans son suivi (facultatif)</label><input id="cc-msg" maxlength="500" value="' + esc(c.message_public) + '" placeholder="Ex. Retrait au dépôt de Dakar à partir de 10 h">' +
      '<label for="cc-note">Note interne (privée)</label><textarea id="cc-note" maxlength="3000">' + esc(c.note_admin) + "</textarea>" +
      '<div id="cc-err"></div><div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="adm-btn" id="cc-ok" type="submit">' + (neuf ? "Enregistrer et créer le code de suivi" : "Enregistrer") + '</button><button class="adm-btn sec" type="button" id="cc-annul">Annuler</button></div></form>';

    let prixTouche = !neuf, delaiTouche = !neuf;
    const total = () => {
      const p = parseFloat($("cc-poids").value) || 0, pk = parseFloat($("cc-prixkg").value) || 0, f = parseFloat($("cc-frais").value) || 0;
      $("cc-total").textContent = "Montant : " + kg(p) + " × " + nb(pk) + " FCFA" + (f ? (f > 0 ? " + " : " − ") + nb(Math.abs(f)) + " FCFA" : "") + " = " + cfa(Math.max(0, Math.ceil(p * pk) + f));
    };
    $("cc-prixkg").oninput = () => { prixTouche = true; total(); };
    $("cc-delai").oninput = () => { delaiTouche = true; };
    $("cc-mode").onchange = () => {
      const t = tarifs[$("cc-mode").value] || {};
      // changer de mode reprend le prix et le délai de ce mode
      $("cc-prixkg").value = t.prix_kg || ""; $("cc-delai").value = t.delai_jours || "";
      prixTouche = !neuf; delaiTouche = !neuf;
      total();
    };
    ["cc-poids", "cc-frais"].forEach(id => { $(id).oninput = total; });
    total();
    $("cc-annul").onclick = () => demande ? vueDemandes() : vueColis();
    $("cg-fc").onsubmit = async e => {
      e.preventDefault();
      const v = id => $("cc-" + id).value.trim();
      const n = id => v(id) === "" ? null : Number(v(id));
      const mode = v("mode"), t = tarifs[mode] || {};
      const ligne = {
        client_nom: v("nom"), client_telephone: v("tel"), destinataire: v("dest") || null, contenu: v("contenu") || null,
        depart_id: v("depart") || null, mode, poids: n("poids"), nb_colis: n("nb") || 1,
        prix_kg: n("prixkg") && (prixTouche || n("prixkg") !== t.prix_kg) ? n("prixkg") : (neuf ? null : n("prixkg")),
        frais_supp: n("frais") || 0, paiement: v("paiement"), statut: v("statut"),
        date_depot: v("depot") || auj(), date_expedition: v("exped") || null,
        delai_jours: n("delai") && (delaiTouche || n("delai") !== t.delai_jours) ? n("delai") : (neuf ? null : n("delai")),
        arrivee_manuelle: v("arrivee") || null, message_public: v("msg") || null, note_admin: v("note") || null
      };
      if (!ligne.client_nom || !ligne.client_telephone || !(ligne.poids > 0)) { $("cc-err").innerHTML = '<div class="adm-msg err">Nom, téléphone et poids sont obligatoires.</div>'; return; }
      if (demande) ligne.demande_id = demande.id;
      $("cc-ok").disabled = true; $("cc-err").innerHTML = "";
      try {
        const r = neuf
          ? await api("/rest/v1/cargo_colis", { method: "POST", json: ligne, headers: { Prefer: "return=representation" } })
          : await api("/rest/v1/cargo_colis?id=eq." + c.id, { method: "PATCH", json: ligne, headers: { Prefer: "return=representation" } });
        const enreg = r[0];
        if (neuf) colis.unshift(enreg); else Object.assign(c, enreg);
        if (demande) {
          await api("/rest/v1/cargo_demandes?id=eq." + demande.id, { method: "PATCH", json: { statut: "deposee", colis_id: enreg.id } });
          demande.statut = "deposee"; demande.colis_id = enreg.id; pastille();
        }
        vue = "colis";
        if (neuf) { dessiner(); vueColis(enreg); window.scrollTo({ top: 0, behavior: "smooth" }); } else { flash("Colis enregistré."); dessiner(); }
      } catch (er) { $("cc-err").innerHTML = '<div class="adm-msg err">Échec : ' + esc(er.message) + "</div>"; $("cc-ok").disabled = false; }
    };
  }

  // ============================================================
  //  DÉPARTS
  // ============================================================
  function vueDeparts() {
    const stats = id => { const l = colis.filter(c => c.depart_id === id); return { n: l.length, kg: l.reduce((s, c) => s + (+c.poids || 0), 0), m: l.reduce((s, c) => s + (+c.montant || 0), 0) }; };
    $("cg-vue").innerHTML =
      '<div class="cg-outils"><button class="adm-btn" id="cg-d-ajout">+ Publier un départ</button>' +
      '<span style="color:var(--gris);font-size:.88rem">Changer l\'étape d\'un départ fait avancer automatiquement tous ses colis (le compte à rebours des clients se met à jour).</span></div>' +
      '<div class="adm-box">' + (departs.length ? departs.map(d => {
        const s = stats(d.id), reste = d.date_limite_depot ? ecart(d.date_limite_depot) : null;
        return '<div class="cg-dep-carte" data-id="' + d.id + '"><h3>' + esc(d.titre || d.origine + " → " + d.destination) + (d.visible ? "" : ' <span class="cg-pill">Caché du site</span>') + "</h3>" +
          '<small style="color:var(--gris)">' + esc(d.origine + " → " + d.destination) + " · " + d.modes.map(m => MODES[m]).join(" + ") +
          " · Dépôt avant le " + jour(d.date_limite_depot) + (d.statut === "ouvert" && reste !== null ? (reste >= 0 ? " (J-" + reste + ")" : " (date dépassée : réservations fermées)") : "") +
          " · Départ " + jour(d.date_depart) + (d.arrivee_prevue ? " · Arrivée prévue " + jour(d.arrivee_prevue) : "") + "</small>" +
          '<div class="ligne"><select data-act="statut">' + opts(ST_DEPART, d.statut) + "</select>" +
          "<span><strong>" + s.n + "</strong> colis · " + nb(Math.round(s.kg * 100) / 100) + " kg · " + cfa(s.m) + "</span>" +
          '<button class="adm-btn sec petit" data-act="colis">Voir les colis</button><button class="adm-btn sec petit" data-act="modifier">Modifier</button><button class="adm-btn dang petit" data-act="suppr">Supprimer</button></div></div>';
      }).join("") : "<p>Aucun départ. Publiez le prochain départ pour que les clients puissent réserver.</p>") + "</div>";
    $("cg-d-ajout").onclick = () => formDepart(null);
    const zone = $("cg-vue");
    zone.onchange = async e => {
      const sel = e.target.closest('select[data-act="statut"]'); if (!sel) return;
      const d = departs.find(x => x.id === sel.closest(".cg-dep-carte").dataset.id);
      const cible = { en_transit: 1, dedouanement: 1, arrive: 1, disponible: 1 }[sel.value];
      const n = colis.filter(c => c.depart_id === d.id && c.statut !== "retire").length;
      if (cible && n && !confirm("Passer ce départ à « " + ST_DEPART[sel.value] + " » ?\nSes " + n + " colis avanceront aussi à cette étape (aucun colis ne recule).")) { sel.value = d.statut; return; }
      try {
        await api("/rest/v1/cargo_departs?id=eq." + d.id, { method: "PATCH", json: { statut: sel.value } });
        d.statut = sel.value;
        colis = await api("/rest/v1/cargo_colis?select=*&order=created_at.desc&limit=1000");
        flash("Départ : « " + ST_DEPART[sel.value] + " »" + (cible && n ? ". Les colis ont été mis à jour." : "."));
        vueDeparts();
      } catch (er) { flash("Échec : " + er.message, false); sel.value = d.statut; }
    };
    zone.onclick = async e => {
      const b = e.target.closest("button[data-act]"); if (!b) return;
      const d = departs.find(x => x.id === b.closest(".cg-dep-carte").dataset.id);
      if (b.dataset.act === "modifier") formDepart(d);
      if (b.dataset.act === "colis") { filtre = { q: "", depart: d.id, statut: "tous" }; vue = "colis"; dessiner(); }
      if (b.dataset.act === "suppr") {
        const n = colis.filter(c => c.depart_id === d.id).length;
        if (!confirm("Supprimer ce départ ?" + (n ? "\nSes " + n + " colis seront gardés, mais « sans départ »." : "") + "\nConseil : choisissez plutôt « Terminé (archivé) ».")) return;
        try { await api("/rest/v1/cargo_departs?id=eq." + d.id, { method: "DELETE" }); await charger(); flash("Départ supprimé."); dessiner(); }
        catch (er) { flash("Échec : " + er.message, false); }
      }
    };
  }

  function formDepart(d) {
    const neuf = !d;
    d = d || { origine: "Guangzhou", destination: "Dakar", modes: ["standard", "express"], statut: "ouvert", visible: true };
    const ch = (id, lab, val, type, extra) => '<div><label for="cd-' + id + '">' + lab + '</label><input id="cd-' + id + '" type="' + (type || "text") + '" value="' + esc(val == null ? "" : val) + '" ' + (extra || "") + "></div>";
    $("cg-vue").innerHTML =
      '<form class="adm-box adm-form" id="cg-fd"><h2 style="margin:0 0 6px">' + (neuf ? "Publier un départ" : "Modifier le départ") + "</h2>" +
      '<div class="adm-grille">' +
      ch("titre", "Titre (facultatif, ex. « Départ du 5 décembre »)", d.titre, "text", 'maxlength="120"') +
      ch("origine", "Ville de départ", d.origine, "text", 'maxlength="80" required') + ch("dest", "Destination", d.destination, "text", 'maxlength="80" required') +
      ch("limite", "Date limite de dépôt à Guangzhou", d.date_limite_depot, "date") + ch("depart", "Date de départ", d.date_depart, "date") +
      ch("arrivee", "Arrivée prévue (facultatif : sinon départ + 3 ou 7 jours)", d.arrivee_prevue, "date") +
      '<div><label for="cd-statut">Étape du convoi</label><select id="cd-statut">' + opts(ST_DEPART, d.statut) + "</select></div>" +
      '<div><label>Modes proposés</label><div class="cg-cases">' + Object.keys(MODES).map(m => '<label><input type="checkbox" name="cd-mode" value="' + m + '"' + (d.modes.includes(m) ? " checked" : "") + "> " + MODES[m] + "</label>").join("") + "</div></div>" +
      '<div><label>Visibilité</label><div class="cg-cases"><label><input type="checkbox" id="cd-visible"' + (d.visible ? " checked" : "") + "> Affiché sur le site</label></div></div>" +
      "</div>" +
      '<label for="cd-note">Information pour les clients (français, facultatif)</label><textarea id="cd-note" maxlength="1000" placeholder="Ex. Dépôt au magasin de Guangzhou du lundi au samedi, 10 h – 19 h">' + esc(d.note) + "</textarea>" +
      '<label for="cd-note-en">Information (anglais, facultatif)</label><textarea id="cd-note-en" maxlength="1000">' + esc(d.note_en) + "</textarea>" +
      '<label for="cd-note-zh">Information (chinois, facultatif)</label><textarea id="cd-note-zh" maxlength="1000">' + esc(d.note_zh) + "</textarea>" +
      '<div id="cd-err"></div><div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="adm-btn" id="cd-ok" type="submit">' + (neuf ? "Publier" : "Enregistrer") + '</button><button class="adm-btn sec" type="button" id="cd-annul">Annuler</button></div></form>';
    $("cd-annul").onclick = vueDeparts;
    $("cg-fd").onsubmit = async e => {
      e.preventDefault();
      const v = id => $("cd-" + id).value.trim();
      const modes = Array.from(document.querySelectorAll('input[name="cd-mode"]:checked')).map(x => x.value);
      if (!modes.length) { $("cd-err").innerHTML = '<div class="adm-msg err">Choisissez au moins un mode.</div>'; return; }
      if (v("limite") && v("depart") && v("limite") > v("depart")) { $("cd-err").innerHTML = '<div class="adm-msg err">La date limite de dépôt doit être avant la date de départ.</div>'; return; }
      const ligne = {
        titre: v("titre") || null, origine: v("origine") || "Guangzhou", destination: v("dest") || "Dakar", modes,
        date_limite_depot: v("limite") || null, date_depart: v("depart") || null, arrivee_prevue: v("arrivee") || null,
        statut: v("statut"), visible: $("cd-visible").checked, note: v("note") || null, note_en: v("note-en") || null, note_zh: v("note-zh") || null
      };
      $("cd-ok").disabled = true;
      try {
        if (neuf) await api("/rest/v1/cargo_departs", { method: "POST", json: ligne, headers: { Prefer: "return=minimal" } });
        else await api("/rest/v1/cargo_departs?id=eq." + d.id, { method: "PATCH", json: ligne });
        await charger();
        flash(neuf ? "Départ publié : il est visible sur la page Cargo." : "Départ enregistré." + (!neuf && ligne.statut !== d.statut ? " Les colis ont suivi." : ""));
        vue = "departs"; dessiner();
      } catch (er) { $("cd-err").innerHTML = '<div class="adm-msg err">Échec : ' + esc(er.message) + "</div>"; $("cd-ok").disabled = false; }
    };
  }

  // ============================================================
  //  DEMANDES DES CLIENTS
  // ============================================================
  function vueDemandes() {
    $("cg-vue").innerHTML = '<div class="adm-box">' + (demandes.length ? demandes.map(d => {
      const msg = "Bonjour " + d.nom + ", ici Cheikh Baye Fall Cargo. Nous avons bien reçu votre demande " + d.reference + " (" + d.nature + ", environ " + kg(d.poids_estime) + ", fret " + MODES[d.mode] + ")." +
        (C.adresseDepot ? "\nAdresse de dépôt à Guangzhou : " + C.adresseDepot : "");
      return '<div class="msg-carte' + (d.statut === "nouvelle" ? " nonlu" : "") + '" data-id="' + d.id + '">' +
        "<strong>" + esc(d.reference) + " · " + esc(d.nom) + "</strong> <small>" + new Date(d.created_at).toLocaleString("fr-FR") + (d.langue ? " · " + esc(d.langue) : "") + "</small>" +
        "<p><strong>" + esc(d.nature) + "</strong> — " + kg(d.poids_estime) + " estimés · " + d.nb_colis + " colis · " + MODES[d.mode] + " · ≈ " + cfa(d.montant_estime) +
        "\nDépart : " + esc(nomDepart(d.depart_id)) + (d.ville ? "\nRetrait : " + esc(d.ville) : "") + (d.message ? "\n« " + esc(d.message) + " »" : "") + "</p>" +
        "<small>📞 " + esc(d.telephone) + "</small>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center"><select data-act="statut">' + opts(ST_DEMANDE, d.statut) + "</select>" +
        '<a class="adm-btn sec petit" target="_blank" rel="noopener" href="' + lienWA(d.telephone, msg) + '">Répondre sur WhatsApp</a>' +
        (d.colis_id ? '<span class="cg-pill paye">Colis créé</span>' : '<button class="adm-btn petit" data-act="recevoir">Bagages reçus → créer le colis</button>') +
        '<button class="adm-btn dang petit" data-act="suppr">Supprimer</button></div></div>';
    }).join("") : "<p>Aucune demande pour le moment. Elles arrivent ici quand un client remplit le formulaire de la page Cargo.</p>") + "</div>";
    const zone = $("cg-vue");
    zone.onchange = async e => {
      const sel = e.target.closest('select[data-act="statut"]'); if (!sel) return;
      const d = demandes.find(x => x.id === sel.closest(".msg-carte").dataset.id);
      try { await api("/rest/v1/cargo_demandes?id=eq." + d.id, { method: "PATCH", json: { statut: sel.value } }); d.statut = sel.value; pastille(); flash("Demande : « " + ST_DEMANDE[sel.value] + " »."); }
      catch (er) { flash("Échec : " + er.message, false); sel.value = d.statut; }
    };
    zone.onclick = async e => {
      const b = e.target.closest("button[data-act]"); if (!b) return;
      const d = demandes.find(x => x.id === b.closest(".msg-carte").dataset.id);
      if (b.dataset.act === "recevoir") formColis(null, d);
      if (b.dataset.act === "suppr" && confirm("Supprimer la demande " + d.reference + " ?")) {
        try { await api("/rest/v1/cargo_demandes?id=eq." + d.id, { method: "DELETE" }); demandes = demandes.filter(x => x !== d); pastille(); vueDemandes(); }
        catch (er) { flash("Échec : " + er.message, false); }
      }
    };
  }

  // ============================================================
  //  PRODUITS IMPORTÉS
  // ============================================================
  function vueProduits() {
    $("cg-vue").innerHTML =
      '<div class="cg-outils"><button class="adm-btn" id="cg-p-ajout">+ Ajouter un produit (ex. traceur GPS)</button></div>' +
      '<div class="adm-box">' + (produits.length ? produits.map(p =>
        '<div class="adm-ligne" data-id="' + p.id + '"><img src="' + esc(p.photos && p.photos[0] ? A().miniPhoto(p.photos[0]) : "images/logo-emblem.png") + '" alt="" onerror="this.onerror=null;this.src=\'images/logo-emblem.png\'">' +
        '<div class="nom"><strong>' + esc(p.nom) + "</strong><small>" + esc(p.prix ? cfa(p.prix) : "Prix sur demande") + "</small></div>" +
        '<select data-act="statut">' + opts(ST_PRODUIT, p.statut) + "</select>" +
        '<button class="adm-btn sec petit" data-act="modifier">Modifier</button><button class="adm-btn dang petit" data-act="suppr">Supprimer</button></div>').join("")
        : "<p>Aucun produit. Ajoutez vos arrivages (traceurs GPS, etc.) : ils s'affichent sur la page Cargo avec un bouton de commande WhatsApp.</p>") + "</div>";
    $("cg-p-ajout").onclick = () => formProduit(null);
    const zone = $("cg-vue");
    zone.onchange = async e => {
      const sel = e.target.closest('select[data-act="statut"]'); if (!sel) return;
      const p = produits.find(x => x.id === sel.closest(".adm-ligne").dataset.id);
      try { await api("/rest/v1/cargo_produits?id=eq." + p.id, { method: "PATCH", json: { statut: sel.value } }); p.statut = sel.value; flash("Produit : « " + ST_PRODUIT[sel.value] + " »."); }
      catch (er) { flash("Échec : " + er.message, false); sel.value = p.statut; }
    };
    zone.onclick = async e => {
      const b = e.target.closest("button[data-act]"); if (!b) return;
      const p = produits.find(x => x.id === b.closest(".adm-ligne").dataset.id);
      if (b.dataset.act === "modifier") formProduit(p);
      if (b.dataset.act === "suppr" && confirm("Supprimer « " + p.nom + " » ?")) {
        try { await api("/rest/v1/cargo_produits?id=eq." + p.id, { method: "DELETE" }); produits = produits.filter(x => x !== p); vueProduits(); }
        catch (er) { flash("Échec : " + er.message, false); }
      }
    };
  }

  function formProduit(p) {
    const neuf = !p;
    p = p || { statut: "disponible", photos: [] };
    let photos = (p.photos || []).slice(), envoi = 0;
    const ch = (id, lab, val, type, extra) => '<div><label for="cp-' + id + '">' + lab + '</label><input id="cp-' + id + '" type="' + (type || "text") + '" value="' + esc(val == null ? "" : val) + '" ' + (extra || "") + "></div>";
    $("cg-vue").innerHTML =
      '<form class="adm-box adm-form" id="cg-fp"><h2 style="margin:0 0 6px">' + (neuf ? "Ajouter un produit" : "Modifier le produit") + "</h2>" +
      '<div class="adm-grille">' + ch("nom", "Nom (français) *", p.nom, "text", 'required maxlength="200"') + ch("nom-en", "Nom (anglais)", p.nom_en, "text", 'maxlength="200"') +
      ch("nom-zh", "Nom (chinois)", p.nom_zh, "text", 'maxlength="200"') + ch("prix", "Prix en FCFA (vide = sur demande)", p.prix, "number", 'min="1"') +
      '<div><label for="cp-statut">Statut</label><select id="cp-statut">' + opts(ST_PRODUIT, p.statut) + "</select></div>" + ch("ordre", "Ordre (plus petit = en premier)", p.ordre || 0, "number") + "</div>" +
      '<label for="cp-desc">Description (français)</label><textarea id="cp-desc" maxlength="3000">' + esc(p.description) + "</textarea>" +
      '<label for="cp-desc-en">Description (anglais)</label><textarea id="cp-desc-en" maxlength="3000">' + esc(p.description_en) + "</textarea>" +
      '<label for="cp-desc-zh">Description (chinois)</label><textarea id="cp-desc-zh" maxlength="3000">' + esc(p.description_zh) + "</textarea>" +
      '<label>Photos</label><div class="adm-photos" id="cp-photos"></div><input id="cp-fichiers" type="file" accept="image/*" multiple><div id="cp-up" style="font-size:.85rem;color:var(--gris)"></div>' +
      '<div id="cp-err"></div><div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="adm-btn" id="cp-ok" type="submit">Enregistrer</button><button class="adm-btn sec" type="button" id="cp-annul">Annuler</button></div></form>';
    const dess = () => {
      $("cp-photos").innerHTML = photos.map((u, i) => '<figure><img src="' + esc(A().miniPhoto(u)) + '" alt=""><div class="acts"><button type="button" data-i="' + i + '">✕</button></div></figure>').join("") || "<small>Aucune photo.</small>";
    };
    dess();
    $("cp-photos").onclick = e => { const b = e.target.closest("button[data-i]"); if (b) { photos.splice(+b.dataset.i, 1); dess(); } };
    $("cp-annul").onclick = vueProduits;
    $("cp-fichiers").onchange = async e => {
      const fs = Array.from(e.target.files); e.target.value = ""; envoi++; $("cp-ok").disabled = true;
      for (let i = 0; i < fs.length; i++) {
        $("cp-up").textContent = "Envoi de la photo " + (i + 1) + " / " + fs.length + "…";
        try { photos.push(await A().envoyerPhoto(fs[i])); dess(); } catch (er) { $("cp-err").innerHTML = '<div class="adm-msg err">Photo : ' + esc(er.message) + "</div>"; }
      }
      $("cp-up").textContent = ""; if (!--envoi) $("cp-ok").disabled = false;
    };
    $("cg-fp").onsubmit = async e => {
      e.preventDefault();
      const v = id => $("cp-" + id).value.trim();
      const ligne = {
        nom: v("nom"), nom_en: v("nom-en") || null, nom_zh: v("nom-zh") || null, prix: v("prix") ? Number(v("prix")) : null,
        statut: v("statut"), ordre: Number(v("ordre")) || 0, photos,
        description: v("desc") || null, description_en: v("desc-en") || null, description_zh: v("desc-zh") || null
      };
      $("cp-ok").disabled = true;
      try {
        if (neuf) await api("/rest/v1/cargo_produits", { method: "POST", json: ligne, headers: { Prefer: "return=minimal" } });
        else await api("/rest/v1/cargo_produits?id=eq." + p.id, { method: "PATCH", json: ligne });
        produits = await api("/rest/v1/cargo_produits?select=*&order=ordre.asc,created_at.desc");
        flash(neuf ? "Produit ajouté : il est visible sur la page Cargo." : "Produit enregistré.");
        vueProduits();
      } catch (er) { $("cp-err").innerHTML = '<div class="adm-msg err">Échec : ' + esc(er.message) + "</div>"; $("cp-ok").disabled = false; }
    };
  }

  // ============================================================
  //  TARIFS
  // ============================================================
  function vueTarifs() {
    $("cg-vue").innerHTML = '<form class="adm-box adm-form" id="cg-ft"><h2 style="margin:0 0 6px">Tarifs et délais</h2>' +
      '<p style="color:var(--gris);font-size:.9rem">Les nouveaux prix s\'appliquent tout de suite au site (page Cargo, simulateur, accueil) et aux prochains colis enregistrés. Les colis déjà enregistrés gardent leur prix.</p>' +
      Object.keys(MODES).map(m => {
        const t = tarifs[m] || {};
        return '<div class="adm-grille" style="align-items:end;border-bottom:1px solid #eef0f6;padding-bottom:12px;margin-bottom:6px">' +
          "<div><label>Mode</label><strong>Fret " + MODES[m] + "</strong></div>" +
          '<div><label for="ct-' + m + '-prix">Prix par kg (FCFA)</label><input id="ct-' + m + '-prix" type="number" min="1" required value="' + esc(t.prix_kg) + '"></div>' +
          '<div><label for="ct-' + m + '-delai">Délai annoncé (jours)</label><input id="ct-' + m + '-delai" type="number" min="1" max="120" required value="' + esc(t.delai_jours) + '"></div>' +
          '<div><label>Proposé aux clients</label><div class="cg-cases"><label><input type="checkbox" id="ct-' + m + '-actif"' + (t.actif !== false ? " checked" : "") + "> Oui</label></div></div></div>";
      }).join("") +
      '<div id="ct-err"></div><button class="adm-btn" id="ct-ok" type="submit" style="margin-top:12px">Enregistrer les tarifs</button></form>';
    $("cg-ft").onsubmit = async e => {
      e.preventDefault();
      $("ct-ok").disabled = true;
      try {
        for (const m of Object.keys(MODES)) {
          const ligne = { mode: m, prix_kg: Number($("ct-" + m + "-prix").value), delai_jours: Number($("ct-" + m + "-delai").value), actif: $("ct-" + m + "-actif").checked };
          await api("/rest/v1/cargo_tarifs?on_conflict=mode", { method: "POST", json: ligne, headers: { Prefer: "resolution=merge-duplicates,return=minimal" } });
          tarifs[m] = Object.assign(tarifs[m] || {}, ligne);
        }
        flash("Tarifs enregistrés : le site affiche déjà les nouveaux prix.");
      } catch (er) { $("ct-err").innerHTML = '<div class="adm-msg err">Échec : ' + esc(er.message) + "</div>"; }
      $("ct-ok").disabled = false;
    };
  }

  window.CBF_CARGO = {
    ouvrir: () => ouvrir(),
    compter: async () => { try { demandes = await api("/rest/v1/cargo_demandes?select=id,statut&statut=eq.nouvelle"); pastille(); } catch (e) {} }
  };
})();
