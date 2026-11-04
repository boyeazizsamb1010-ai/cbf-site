// Espace admin : véhicules + photos, vendu / en stock, messages clients, statistiques.
// Parle directement à Supabase (REST, Auth, Storage) — aucune bibliothèque externe.
(function () {
  const $ = id => document.getElementById(id);
  const cfg = (window.SITE && window.SITE.supabase) || {};
  const URL_BASE = (cfg.url || "").replace(/\/$/, "");
  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const CLE_SESSION = "cbf_admin_session";
  let session = null;
  let vehicules = [];
  let messages = [];
  let commandes = [];

  if (!URL_BASE || !cfg.anonKey) { $("non-configure").classList.remove("cache"); return; }

  // ---------- Session ----------
  const lireSession = () => { try { return JSON.parse(localStorage.getItem(CLE_SESSION) || "null"); } catch (e) { return null; } };
  const gardeSession = s => {
    session = s;
    try { s ? localStorage.setItem(CLE_SESSION, JSON.stringify(s)) : localStorage.removeItem(CLE_SESSION); } catch (e) {}
    try { s ? localStorage.setItem("cbf_admin", "1") : 0; } catch (e) {}
  };
  const depuisToken = j => ({ access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 - 60000 });

  async function jetons(corps, type) {
    const r = await fetch(URL_BASE + "/auth/v1/token?grant_type=" + type, { method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" }, body: JSON.stringify(corps) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || "Connexion refusée");
    return depuisToken(j);
  }
  async function jetonValide() {
    if (!session) throw new Error("Non connecté");
    if (Date.now() > session.exp) {
      try { gardeSession(await jetons({ refresh_token: session.refresh }, "refresh_token")); }
      catch (e) { gardeSession(null); location.reload(); throw e; }
    }
    return session.access;
  }
  async function api(chemin, opt) {
    opt = opt || {};
    const tok = await jetonValide();
    const h = Object.assign({ apikey: cfg.anonKey, Authorization: "Bearer " + tok }, opt.headers || {});
    if (opt.json !== undefined) { h["Content-Type"] = "application/json"; opt.body = JSON.stringify(opt.json); }
    const r = await fetch(URL_BASE + chemin, { method: opt.method || "GET", headers: h, body: opt.body });
    if (!r.ok) {
      let m = r.status + "";
      try { const e = await r.json(); m = e.message || e.error || m; } catch (e) {}
      throw new Error(m);
    }
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }

  // ---------- Petits outils d'affichage ----------
  function flash(txt, ok) {
    $("flash").innerHTML = '<div class="adm-msg ' + (ok === false ? "err" : "ok") + '">' + esc(txt) + "</div>";
    if (ok !== false) setTimeout(() => { $("flash").innerHTML = ""; }, 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const fmtPrix = n => (n == null || n === "" ? "Prix sur demande" : new Intl.NumberFormat("fr-FR").format(n).replace(/[  ]/g, " ") + " FCFA");
  const base = p => p.replace(/\.[a-z0-9]+$/i, "");
  const estUrl = p => /^https?:\/\//i.test(p);
  const miniPhoto = p => (estUrl(p) ? p.replace("/g/", "/m/") : "images/vehicules/m/" + base(p) + ".webp");
  const slug = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const nomV = v => [v.marque, v.modele].filter(Boolean).join(" ") + (v.annee ? " " + v.annee : "");

  // ---------- Connexion ----------
  $("f-login").addEventListener("submit", async e => {
    e.preventDefault();
    $("l-err").innerHTML = "";
    try {
      gardeSession(await jetons({ email: $("l-email").value.trim(), password: $("l-mdp").value }, "password"));
      demarrer();
    } catch (er) {
      $("l-err").innerHTML = '<div class="adm-msg err">' + esc(/invalid/i.test(er.message) ? "Email ou mot de passe incorrect." : er.message) + "</div>";
    }
  });
  $("b-sortir").addEventListener("click", () => { gardeSession(null); location.reload(); });

  // ---------- Onglets ----------
  $("onglets").addEventListener("click", e => {
    const b = e.target.closest("button[data-o]"); if (!b) return;
    document.querySelectorAll("#onglets button").forEach(x => x.classList.toggle("actif", x === b));
    ["vehicules", "messages", "commandes", "stats"].forEach(o => $("o-" + o).classList.toggle("cache", o !== b.dataset.o));
    if (b.dataset.o === "vehicules") chargerVehicules();
    if (b.dataset.o === "messages") chargerMessages();
    if (b.dataset.o === "commandes") chargerCommandes();
    if (b.dataset.o === "stats") chargerStats(30);
    $("flash").innerHTML = "";
  });

  // ============================================================
  //  VÉHICULES
  // ============================================================
  async function chargerVehicules() {
    try { vehicules = await api("/rest/v1/vehicules?select=*&order=ordre.asc,created_at.desc"); } catch (e) { flash("Impossible de charger les véhicules : " + e.message, false); return; }
    listeVehicules();
  }

  function listeVehicules() {
    const zone = $("o-vehicules");
    zone.innerHTML =
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px"><button class="adm-btn" id="v-ajout">+ Ajouter un véhicule</button>' +
      (window.SITE.buildHook ? '<button class="adm-btn sec" id="v-hook" title="À faire après avoir ajouté de nouveaux véhicules : met à jour les aperçus quand on partage un lien sur WhatsApp/Facebook (environ 1 minute)">Mettre à jour les aperçus de partage</button>' : "") +
      '</div><div class="adm-box">' +
      (vehicules.length ? vehicules.map((v, i) =>
        '<div class="adm-ligne' + (v.statut === "vendu" ? " vendu" : "") + '" data-id="' + esc(v.id) + '">' +
        '<img src="' + esc(v.photos && v.photos[0] ? miniPhoto(v.photos[0]) : "images/logo-emblem.png") + '" alt="" onerror="this.onerror=null;this.src=\'images/logo-emblem.png\'">' +
        '<div class="nom"><strong>' + esc(nomV(v)) + '</strong><small>' + esc(fmtPrix(v.prix)) + (v.etat ? " · " + esc(v.etat) : "") + (v.km ? " · " + new Intl.NumberFormat("fr-FR").format(v.km) + " km" : "") + "</small></div>" +
        '<select data-act="statut" aria-label="Statut"><option value="en_stock"' + (v.statut === "en_stock" ? " selected" : "") + '>En stock</option><option value="vendu"' + (v.statut === "vendu" ? " selected" : "") + '>Vendu</option><option value="masque"' + (v.statut === "masque" ? " selected" : "") + '>Masqué (invisible)</option></select>' +
        '<button class="adm-btn sec petit" data-act="haut"' + (i === 0 ? " disabled" : "") + ' title="Monter">↑</button><button class="adm-btn sec petit" data-act="bas"' + (i === vehicules.length - 1 ? " disabled" : "") + ' title="Descendre">↓</button>' +
        '<button class="adm-btn sec petit" data-act="modifier">Modifier</button>' +
        '<button class="adm-btn dang petit" data-act="supprimer">Supprimer</button></div>').join("")
        : "<p>Aucun véhicule. Cliquez sur « Ajouter un véhicule ».</p>") + "</div>";
    $("v-ajout").onclick = () => formulaire(null);
    if ($("v-hook")) $("v-hook").onclick = async () => {
      try { await fetch(window.SITE.buildHook, { method: "POST", mode: "no-cors" }); flash("Mise à jour lancée : les aperçus de partage seront à jour dans environ 1 minute."); } catch (e) { flash("Impossible de lancer la mise à jour : " + e.message, false); }
    };
    zone.onchange = async e => {
      const sel = e.target.closest('select[data-act="statut"]'); if (!sel) return;
      const id = sel.closest(".adm-ligne").dataset.id;
      try { await api("/rest/v1/vehicules?id=eq." + encodeURIComponent(id), { method: "PATCH", json: { statut: sel.value } }); flash("Statut enregistré."); const v = vehicules.find(x => x.id === id); v.statut = sel.value; listeVehicules(); }
      catch (er) { flash("Échec : " + er.message, false); }
    };
    zone.onclick = async e => {
      const b = e.target.closest("button[data-act]"); if (!b) return;
      const id = b.closest(".adm-ligne").dataset.id, i = vehicules.findIndex(x => x.id === id), v = vehicules[i];
      if (b.dataset.act === "modifier") formulaire(v);
      if (b.dataset.act === "supprimer") {
        if (!confirm("Supprimer définitivement « " + nomV(v) + " » ?\n\n(Si le véhicule est seulement vendu, choisissez plutôt « Vendu » dans la liste.)")) return;
        try { await api("/rest/v1/vehicules?id=eq." + encodeURIComponent(id), { method: "DELETE" }); flash("Véhicule supprimé."); chargerVehicules(); } catch (er) { flash("Échec : " + er.message, false); }
      }
      if (b.dataset.act === "haut" || b.dataset.act === "bas") {
        const j = b.dataset.act === "haut" ? i - 1 : i + 1; if (j < 0 || j >= vehicules.length) return;
        const autre = vehicules[j];
        // on réattribue des numéros d'ordre propres à toute la liste
        const ordre = vehicules.map(x => x.id); ordre[i] = autre.id; ordre[j] = v.id;
        try {
          for (let k = 0; k < ordre.length; k++) await api("/rest/v1/vehicules?id=eq." + encodeURIComponent(ordre[k]), { method: "PATCH", json: { ordre: k } });
          chargerVehicules();
        } catch (er) { flash("Échec : " + er.message, false); }
      }
    };
  }

  // ---------- Formulaire ajout / modification ----------
  const TYPES = [["voiture", "Voiture"], ["moteur", "Moteur"], ["tracteur", "Tracteur"], ["camion", "Camion"], ["machine", "Machine industrielle"], ["arachide", "Décortiqueuse d'arachides"]];

  function formulaire(v) {
    const neuf = !v;
    v = v || { type: "voiture", etat: "Occasion", stock: 1, statut: "en_stock", photos: [], specs: [] };
    let photos = (v.photos || []).slice();
    const zone = $("o-vehicules");
    const champ = (id, lib, val, type, extra) => '<div><label for="f-' + id + '">' + lib + '</label><input id="f-' + id + '" type="' + (type || "text") + '" value="' + esc(val) + '" ' + (extra || "") + "></div>";
    zone.innerHTML =
      '<form class="adm-box adm-form" id="f-veh"><h2 style="margin-top:0">' + (neuf ? "Ajouter un véhicule" : "Modifier : " + esc(nomV(v))) + "</h2>" +
      '<div class="adm-grille">' +
      '<div><label for="f-type">Rubrique</label><select id="f-type">' + TYPES.map(t => '<option value="' + t[0] + '"' + ((v.type || "voiture") === t[0] ? " selected" : "") + ">" + t[1] + "</option>").join("") + "</select></div>" +
      '<div><label for="f-etat">État</label><select id="f-etat"><option value="">—</option><option' + (v.etat === "Neuf" ? " selected" : "") + '>Neuf</option><option' + (v.etat === "Occasion" ? " selected" : "") + ">Occasion</option></select></div>" +
      champ("marque", "Marque", v.marque, "text", "required") + champ("modele", "Modèle / version", v.modele, "text", "required") +
      champ("annee", "Année", v.annee, "number", 'min="1990" max="2035"') + champ("categorie", "Catégorie (ex. SUV / 4x4)", v.categorie) +
      champ("prix", "Prix en FCFA (vide = prix sur demande)", v.prix, "number", 'min="0" step="1000"') + champ("ancien_prix", "Ancien prix (barré, facultatif)", v.ancien_prix, "number", 'min="0"') +
      champ("note_prix", "Note sous le prix", v.note_prix || "Rendu Port autonome de Dakar") + champ("km", "Kilométrage (km)", v.km, "number", 'min="0"') +
      champ("carburant", "Carburant", v.carburant) + champ("transmission", "Transmission", v.transmission) +
      champ("couleur", "Couleur", v.couleur) + champ("puissance", "Puissance / moteur (ex. 2.0T · 140 kW)", v.puissance) +
      champ("portes", "Portes", v.portes, "number", 'min="0" max="9"') + champ("stock", "Quantité en stock", v.stock == null ? 1 : v.stock, "number", 'min="0"') +
      '<div><label for="f-statut">Statut</label><select id="f-statut"><option value="en_stock"' + (v.statut === "en_stock" ? " selected" : "") + '>En stock</option><option value="vendu"' + (v.statut === "vendu" ? " selected" : "") + '>Vendu</option><option value="masque"' + (v.statut === "masque" ? " selected" : "") + ">Masqué</option></select></div>" +
      '<div><label for="f-vedette">Page d\'accueil</label><select id="f-vedette"><option value="0">Normal</option><option value="1"' + (v.vedette ? " selected" : "") + ">Mettre en vedette (carrousel)</option></select></div>" +
      "</div>" +
      '<label for="f-specs">Autres caractéristiques (une par ligne, format « Libellé : valeur »)</label><textarea id="f-specs" placeholder="Transmission intégrale : 4x4">' + esc((v.specs || []).map(s => s[0] + " : " + s[1]).join("\n")) + "</textarea>" +
      '<label for="f-desc">Description (français)</label><textarea id="f-desc">' + esc(v.description) + "</textarea>" +
      '<label for="f-desc-en">Description (anglais, facultatif)</label><textarea id="f-desc-en">' + esc(v.description_en) + "</textarea>" +
      '<label for="f-desc-zh">Description (chinois, facultatif)</label><textarea id="f-desc-zh">' + esc(v.description_zh) + "</textarea>" +
      '<label>Photos <small>(la 1re est la photo principale ; floutez les numéros de téléphone du fournisseur avant d\'envoyer)</small></label><div class="adm-photos" id="f-photos"></div>' +
      '<input id="f-fichiers" type="file" accept="image/*" multiple><div id="f-up" style="font-size:.85rem;color:var(--gris);margin-top:4px"></div>' +
      '<div id="f-err"></div><div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="adm-btn" id="f-ok" type="submit">Enregistrer</button><button class="adm-btn sec" id="f-annul" type="button">Annuler</button></div></form>';

    const dessinePhotos = () => {
      $("f-photos").innerHTML = photos.map((p, i) =>
        '<figure class="' + (i === 0 ? "princ" : "") + '"><img src="' + esc(miniPhoto(p)) + '" alt="" onerror="this.style.opacity=.3">' + (i === 0 ? "<span>Principale</span>" : "<span>&nbsp;</span>") +
        '<div class="acts"><button type="button" data-p="g" data-i="' + i + '" title="Avancer">←</button><button type="button" data-p="d" data-i="' + i + '" title="Reculer">→</button><button type="button" data-p="x" data-i="' + i + '" title="Retirer">✕</button></div></figure>').join("") || "<small>Aucune photo.</small>";
    };
    dessinePhotos();
    $("f-photos").onclick = e => {
      const b = e.target.closest("button[data-p]"); if (!b) return;
      const i = +b.dataset.i;
      if (b.dataset.p === "x") photos.splice(i, 1);
      if (b.dataset.p === "g" && i > 0) [photos[i - 1], photos[i]] = [photos[i], photos[i - 1]];
      if (b.dataset.p === "d" && i < photos.length - 1) [photos[i + 1], photos[i]] = [photos[i], photos[i + 1]];
      dessinePhotos();
    };
    $("f-annul").onclick = () => listeVehicules();
    let envoiEnCours = 0;

    $("f-fichiers").onchange = async e => {
      const fichiers = Array.from(e.target.files); e.target.value = "";
      envoiEnCours++; $("f-ok").disabled = true;
      let n = 0;
      for (const f of fichiers) {
        $("f-up").textContent = "Envoi de la photo " + (++n) + " / " + fichiers.length + "…";
        try { photos.push(await envoyerPhoto(f)); dessinePhotos(); } catch (er) { $("f-err").innerHTML = '<div class="adm-msg err">Photo « ' + esc(f.name) + " » : " + esc(er.message) + "</div>"; }
      }
      $("f-up").textContent = ""; envoiEnCours--; if (!envoiEnCours) $("f-ok").disabled = false;
    };

    $("f-veh").onsubmit = async e => {
      e.preventDefault();
      const val = id => $("f-" + id).value.trim();
      const num = id => { const x = val(id); return x === "" ? null : Number(x); };
      const txt = id => val(id) || null;
      const marque = val("marque"), modele = val("modele");
      const specs = val("specs").split("\n").map(l => l.trim()).filter(Boolean).map(l => { const k = l.indexOf(":"); return k < 0 ? [l, ""] : [l.slice(0, k).trim(), l.slice(k + 1).trim()]; });
      const ligne = {
        type: val("type"), marque, modele, annee: num("annee"), categorie: txt("categorie"), etat: txt("etat"),
        prix: num("prix"), ancien_prix: num("ancien_prix"), note_prix: txt("note_prix"), km: num("km"),
        carburant: txt("carburant"), transmission: txt("transmission"), couleur: txt("couleur"), puissance: txt("puissance"),
        portes: num("portes"), stock: num("stock") == null ? 1 : num("stock"), statut: val("statut"), vedette: val("vedette") === "1",
        photos, specs, description: txt("desc"), description_en: txt("desc-en"), description_zh: txt("desc-zh")
      };
      $("f-ok").disabled = true; $("f-err").innerHTML = "";
      try {
        if (neuf) {
          let id = slug([marque, modele, ligne.annee].filter(Boolean).join(" ")) || "vehicule-" + Date.now();
          const pris = new Set(vehicules.map(x => x.id)); let base_ = id, k = 2; while (pris.has(id)) id = base_ + "-" + k++;
          ligne.id = id;
          ligne.ordre = vehicules.length ? Math.min.apply(null, vehicules.map(x => x.ordre || 0)) - 1 : 0;
          await api("/rest/v1/vehicules", { method: "POST", json: ligne, headers: { Prefer: "return=minimal" } });
        } else {
          await api("/rest/v1/vehicules?id=eq." + encodeURIComponent(v.id), { method: "PATCH", json: ligne });
        }
        try { sessionStorage.removeItem("cbf_vehicules_v1"); } catch (e2) {}
        flash(neuf ? "Véhicule ajouté : il est déjà visible sur le site." : "Modifications enregistrées.");
        chargerVehicules();
      } catch (er) { $("f-err").innerHTML = '<div class="adm-msg err">Échec : ' + esc(er.message) + "</div>"; $("f-ok").disabled = false; }
    };
  }

  // ---------- Photos : redimensionnement dans le navigateur puis envoi ----------
  async function redimensionner(fichier, largeurMax, qualite) {
    const bmp = await createImageBitmap(fichier, { imageOrientation: "from-image" });
    const k = Math.min(1, largeurMax / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, "image/webp", qualite));
    if (!blob) throw new Error("format d'image non géré");
    return blob;
  }
  async function televerser(chemin, blob) {
    const tok = await jetonValide();
    const r = await fetch(URL_BASE + "/storage/v1/object/photos/" + chemin, { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + tok, "Content-Type": "image/webp", "x-upsert": "true", "cache-control": "max-age=31536000" }, body: blob });
    if (!r.ok) { let m = r.status + ""; try { m = (await r.json()).message || m; } catch (e) {} throw new Error(m); }
  }
  async function envoyerPhoto(fichier) {
    const nom = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7) + ".webp";
    const grande = await redimensionner(fichier, 1200, 0.82), petite = await redimensionner(fichier, 600, 0.78);
    await televerser("g/" + nom, grande); await televerser("m/" + nom, petite);
    return URL_BASE + "/storage/v1/object/public/photos/g/" + nom;
  }

  // ============================================================
  //  MESSAGES
  // ============================================================
  async function chargerMessages() {
    try { messages = await api("/rest/v1/messages?select=*&order=created_at.desc&limit=300"); } catch (e) { flash("Impossible de charger les messages : " + e.message, false); return; }
    majPastille();
    const nomVeh = id => { const v = vehicules.find(x => x.id === id); return v ? nomV(v) : id; };
    $("o-messages").innerHTML = messages.length ? messages.map(m => {
      const tel = (m.telephone || "").replace(/[^\d]/g, "");
      return '<div class="msg-carte' + (m.lu ? "" : " nonlu") + '" data-id="' + esc(m.id) + '"><strong>' + esc(m.nom) + "</strong> <small>" + new Date(m.created_at).toLocaleString("fr-FR") + (m.langue ? " · " + esc(m.langue) : "") + (m.vehicule_id ? " · " + esc(nomVeh(m.vehicule_id)) : "") + "</small>" +
        "<p>" + esc(m.message) + "</p><small>" + [m.telephone ? "📞 " + esc(m.telephone) : "", m.email ? "✉ " + esc(m.email) : ""].filter(Boolean).join(" · ") + "</small>" +
        '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
        (tel ? '<a class="adm-btn petit" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/' + tel + '">Répondre sur WhatsApp</a>' : "") +
        (m.email ? '<a class="adm-btn sec petit" style="text-decoration:none" href="mailto:' + esc(m.email) + '">Répondre par email</a>' : "") +
        '<button class="adm-btn sec petit" data-m="lu">' + (m.lu ? "Marquer non lu" : "Marquer comme lu") + '</button><button class="adm-btn dang petit" data-m="x">Supprimer</button></div></div>';
    }).join("") : '<div class="adm-box">Aucun message pour le moment.</div>';
    $("o-messages").onclick = async e => {
      const b = e.target.closest("button[data-m]"); if (!b) return;
      const id = b.closest(".msg-carte").dataset.id, m = messages.find(x => x.id === id);
      try {
        if (b.dataset.m === "lu") await api("/rest/v1/messages?id=eq." + id, { method: "PATCH", json: { lu: !m.lu } });
        else if (confirm("Supprimer ce message définitivement ?")) await api("/rest/v1/messages?id=eq." + id, { method: "DELETE" });
        else return;
        chargerMessages();
      } catch (er) { flash("Échec : " + er.message, false); }
    };
  }
  function majPastille() {
    const n = messages.filter(m => !m.lu).length;
    $("p-msg").textContent = n; $("p-msg").classList.toggle("cache", !n);
  }
  async function compterNonLus() {
    try { const r = await api("/rest/v1/messages?select=id&lu=eq.false&limit=100"); $("p-msg").textContent = r.length; $("p-msg").classList.toggle("cache", !r.length); } catch (e) {}
  }

  // ============================================================
  //  COMMANDES (acompte 50 %)
  // ============================================================
  const STATUTS = [["nouvelle", "Nouvelle"], ["contactee", "Client contacté"], ["acompte_recu", "Acompte reçu"], ["expediee", "Expédiée"], ["terminee", "Terminée"], ["annulee", "Annulée"]];
  async function chargerCommandes() {
    try { commandes = await api("/rest/v1/commandes?select=*&order=created_at.desc&limit=300"); } catch (e) { flash("Impossible de charger les commandes : " + e.message + " (avez-vous lancé supabase/3-commandes.sql ?)", false); return; }
    majPastilleCmd();
    const zone = $("o-commandes");
    zone.innerHTML = commandes.length ? commandes.map(c => {
      const tel = (c.telephone || "").replace(/[^\d]/g, "");
      const msgWA = "Bonjour " + c.nom + ", c'est Cheikh Baye Fall Cargo au sujet de votre commande " + c.reference + " (" + (c.vehicule_nom || c.vehicule_id) + "). ";
      return '<div class="msg-carte' + (c.statut === "nouvelle" ? " nonlu" : "") + '" data-id="' + esc(c.id) + '">' +
        "<strong>" + esc(c.reference || "") + " · " + esc(c.vehicule_nom || c.vehicule_id) + "</strong> <small>" + new Date(c.created_at).toLocaleString("fr-FR") + (c.langue ? " · " + esc(c.langue) : "") + "</small>" +
        "<p><b>" + esc(c.nom) + "</b> · 📞 " + esc(c.telephone) + (c.email ? " · ✉ " + esc(c.email) : "") + (c.ville ? " · " + esc(c.ville) : "") + "</p>" +
        "<p>Prix : " + esc(fmtPrix(c.prix)) + " · <b>Acompte 50 % : " + esc(fmtPrix(c.acompte)) + "</b></p>" +
        (c.message ? "<p>« " + esc(c.message) + " »</p>" : "") +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px">' +
        '<select data-c="statut" aria-label="Statut de la commande">' + STATUTS.map(s => '<option value="' + s[0] + '"' + (c.statut === s[0] ? " selected" : "") + ">" + s[1] + "</option>").join("") + "</select>" +
        (tel ? '<a class="adm-btn petit" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/' + tel + "?text=" + encodeURIComponent(msgWA) + '">Répondre sur WhatsApp</a>' : "") +
        (c.statut === "acompte_recu" ? '<button class="adm-btn sec petit" data-c="vendu" title="Passe le véhicule en « Vendu » sur le site">Marquer le véhicule vendu</button>' : "") +
        '<button class="adm-btn dang petit" data-c="x">Supprimer</button></div>' +
        '<label style="display:block;font-size:.78rem;color:var(--gris);margin-top:8px">Note interne (visible seulement ici)</label>' +
        '<textarea data-c="note" rows="2" style="width:100%;padding:8px;border:1px solid #cfd6e6;border-radius:8px;font:inherit">' + esc(c.note_admin || "") + "</textarea></div>";
    }).join("") : '<div class="adm-box">Aucune commande pour le moment.</div>';
    zone.onchange = async e => {
      const el = e.target.closest("[data-c]"); if (!el) return;
      const id = el.closest(".msg-carte").dataset.id;
      try {
        if (el.dataset.c === "statut") { await api("/rest/v1/commandes?id=eq." + id, { method: "PATCH", json: { statut: el.value } }); flash("Statut enregistré."); chargerCommandes(); }
        if (el.dataset.c === "note") { await api("/rest/v1/commandes?id=eq." + id, { method: "PATCH", json: { note_admin: el.value.trim() || null } }); flash("Note enregistrée."); }
      } catch (er) { flash("Échec : " + er.message, false); }
    };
    zone.onclick = async e => {
      const b = e.target.closest("button[data-c]"); if (!b) return;
      const id = b.closest(".msg-carte").dataset.id, c = commandes.find(x => x.id === id);
      try {
        if (b.dataset.c === "vendu") {
          if (!confirm("Passer « " + (c.vehicule_nom || c.vehicule_id) + " » en « Vendu » sur le site ?")) return;
          await api("/rest/v1/vehicules?id=eq." + encodeURIComponent(c.vehicule_id), { method: "PATCH", json: { statut: "vendu" } });
          flash("Véhicule marqué comme vendu.");
        } else if (b.dataset.c === "x") {
          if (!confirm("Supprimer cette commande définitivement ?")) return;
          await api("/rest/v1/commandes?id=eq." + id, { method: "DELETE" });
          chargerCommandes();
        }
      } catch (er) { flash("Échec : " + er.message, false); }
    };
  }
  function majPastilleCmd() {
    const n = commandes.filter(c => c.statut === "nouvelle").length;
    $("p-cmd").textContent = n; $("p-cmd").classList.toggle("cache", !n);
  }
  async function compterCommandes() {
    try { const r = await api("/rest/v1/commandes?select=id&statut=eq.nouvelle&limit=100"); $("p-cmd").textContent = r.length; $("p-cmd").classList.toggle("cache", !r.length); } catch (e) {}
  }

  // ============================================================
  //  STATISTIQUES
  // ============================================================
  async function chargerStats(jours) {
    let s;
    try { s = await api("/rest/v1/rpc/stats_visites", { method: "POST", json: { jours } }); } catch (e) { flash("Impossible de charger les statistiques : " + e.message, false); return; }
    if (!vehicules.length) { try { vehicules = await api("/rest/v1/vehicules?select=id,marque,modele,annee&order=ordre.asc"); } catch (e) {} }
    const nomVeh = id => { const v = vehicules.find(x => x.id === id); return v ? nomV(v) : id; };
    const noms = { index: "Accueil", vehicules: "Catalogue", vehicule: "Fiches véhicules", contact: "Contact", "a-propos": "À propos" };
    const liste = (titre, arr, f) => '<div class="adm-box"><h3 style="margin-top:0">' + titre + '</h3><ul class="liste-k">' + (arr.length ? arr.map(x => "<li><span>" + esc(f ? f(x.k) : x.k) + "</span><b>" + x.n + "</b></li>").join("") : "<li><span>Pas encore de données</span></li>") + "</ul></div>";
    // jours sans visite = 0
    const parJour = {}; s.par_jour.forEach(x => { parJour[x.jour] = x.n; });
    const jj = []; for (let i = jours - 1; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10); jj.push([d, parJour[d] || 0]); }
    const max = Math.max(1, ...jj.map(x => x[1]));
    const auj = jj[jj.length - 1][1], sem = jj.slice(-7).reduce((a, x) => a + x[1], 0);
    $("o-stats").innerHTML =
      '<div style="margin-bottom:12px"><label>Période : <select id="s-jours"><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option></select></label></div>' +
      '<div class="adm-kpis"><div><b>' + s.total + "</b>visites sur la période</div><div><b>" + sem + "</b>7 derniers jours</div><div><b>" + auj + "</b>aujourd'hui</div></div>" +
      '<div class="adm-box"><h3 style="margin:0">Visites par jour</h3><div class="barres">' + jj.map(x => '<span style="height:' + Math.max(2, Math.round(x[1] / max * 100)) + '%" title="' + x[0] + " : " + x[1] + '"></span>').join("") + "</div></div>" +
      '<div class="adm-grille" style="gap:14px">' +
      liste("Véhicules les plus consultés", s.top_vehicules, nomVeh) + liste("Pages vues", s.par_page, k => noms[k] || k) +
      liste("Appareils", s.par_appareil, k => (k === "mobile" ? "Téléphone" : "Ordinateur")) + liste("Langues", s.par_langue, k => ({ fr: "Français", en: "Anglais", zh: "Chinois" }[k] || k)) +
      liste("D'où viennent les visiteurs", s.par_referent) + "</div>" +
      '<p style="font-size:.82rem;color:var(--gris)">Une visite = une page ouverte par un visiteur (comptée une fois par session). Vos propres visites depuis cet ordinateur ne sont pas comptées. Aucune donnée personnelle n\'est enregistrée.</p>';
    $("s-jours").value = String(jours); $("s-jours").onchange = e => chargerStats(+e.target.value);
  }

  // ---------- Démarrage ----------
  async function demarrer() {
    $("login").classList.add("cache"); $("app").classList.remove("cache");
    await chargerVehicules(); compterNonLus(); compterCommandes();
  }
  session = lireSession();
  if (session) demarrer(); else $("login").classList.remove("cache");
})();
