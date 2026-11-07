// Commande en ligne avec acompte de 50 % (fiche véhicule).
// Le client envoie sa commande ; CBF la voit dans l'espace admin (onglet « Commandes »).
// L'acompte est payé par virement / Wave / Orange Money vers les coordonnées de js/paiement.js
// (aucun paiement n'est pris sur le site : aucune donnée bancaire ne transite ici).
(function () {
  const S = window.SITE, P = S.paiement || {};
  const IDX = { fr: 0, en: 1, zh: 2 };
  const L = () => IDX[window.LANG] !== undefined ? window.LANG : "fr";
  const D = {
    btn: ["Commander (acompte 50 %)", "Order (50 % deposit)", "下单（预付 50%）"],
    titre: ["Commander ce véhicule", "Order this vehicle", "订购此车辆"],
    prix: ["Prix du véhicule", "Vehicle price", "车辆价格"],
    acompte: ["Acompte à payer (50 %)", "Deposit to pay (50 %)", "需支付预付款（50%）"],
    solde: ["Solde restant", "Remaining balance", "尾款"],
    indic: ["Montants en FCFA.", "Amounts in FCFA (converted values are indicative).", "金额以 FCFA 为准（换算金额仅供参考）。"],
    nom: ["Nom complet", "Full name", "姓名"],
    tel: ["Téléphone / WhatsApp", "Phone / WhatsApp", "电话 / WhatsApp"],
    email: ["Email (facultatif)", "Email (optional)", "邮箱（选填）"],
    ville: ["Ville / pays (facultatif)", "City / country (optional)", "城市 / 国家（选填）"],
    msg: ["Message (facultatif)", "Message (optional)", "留言（选填）"],
    envoyer: ["Envoyer ma commande", "Send my order", "提交订单"],
    envoi: ["Envoi…", "Sending…", "发送中…"],
    cond: ["Rien n'est débité maintenant : après votre commande, vous recevez les instructions pour payer l'acompte de 50 %. Le véhicule est confirmé une fois l'acompte reçu et vérifié par CBF.",
      "Nothing is charged now: after your order you receive the instructions to pay the 50 % deposit. The vehicle is confirmed once CBF has received and checked the deposit.",
      "现在不会扣款：下单后您将收到支付 50% 预付款的说明。CBF 收到并核实预付款后，车辆才算确认。"],
    errChamps: ["Merci d'indiquer votre nom et un numéro de téléphone valide.", "Please enter your name and a valid phone number.", "请填写姓名和有效的电话号码。"],
    errIndispo: ["Ce véhicule n'est plus disponible à la commande en ligne. Écrivez-nous sur WhatsApp.", "This vehicle is no longer available for online ordering. Please message us on WhatsApp.", "此车辆已无法在线订购，请通过 WhatsApp 联系我们。"],
    errGen: ["Impossible d'envoyer la commande pour le moment. Écrivez-nous sur WhatsApp, nous vous répondons vite.", "We could not send the order right now. Please message us on WhatsApp.", "暂时无法提交订单，请通过 WhatsApp 联系我们。"],
    okTitre: ["Commande envoyée ✓", "Order sent ✓", "订单已提交 ✓"],
    ref: ["Votre référence", "Your reference", "您的订单编号"],
    payer: ["Pour réserver ce véhicule, payez l'acompte de {x} :", "To reserve this vehicle, pay the deposit of {x}:", "要预订此车辆，请支付预付款 {x}："],
    aucune: ["CBF va vous contacter sur WhatsApp avec les instructions pour payer l'acompte de {x}.", "CBF will contact you on WhatsApp with the instructions to pay the deposit of {x}.", "CBF 将通过 WhatsApp 联系您，告知支付预付款 {x} 的方式。"],
    preuve: ["Après le paiement, envoyez la preuve (capture d'écran ou numéro de transaction) avec votre référence sur WhatsApp.", "After paying, send the proof (screenshot or transaction number) with your reference on WhatsApp.", "付款后，请通过 WhatsApp 发送付款凭证（截图或交易号）和您的订单编号。"],
    soldeDef: ["Le solde ({y}) se règle ensuite, selon les modalités que CBF vous communiquera.", "The balance ({y}) is paid afterwards, as CBF will explain.", "尾款（{y}）之后按 CBF 告知的方式支付。"],
    waBtn: ["Envoyer la preuve sur WhatsApp", "Send proof on WhatsApp", "通过 WhatsApp 发送凭证"],
    moyens: ["Paiement de l'acompte par :", "Pay the deposit by:", "预付款支付方式："],
    virement: ["Virement bancaire", "Bank transfer", "银行转账"],
    fermer: ["Fermer", "Close", "关闭"],
    benef: ["Bénéficiaire", "Beneficiary", "收款人"], banque: ["Banque", "Bank", "银行"], rib: ["RIB / IBAN", "Account / IBAN", "账号 / IBAN"],
    swift: ["SWIFT / BIC", "SWIFT / BIC", "SWIFT / BIC"], wave: ["Wave", "Wave", "Wave"], om: ["Orange Money", "Orange Money", "Orange Money"],
    waMsg: ["Bonjour, je viens de passer la commande {ref} ({n}). Acompte : {x}. Voici ma preuve de paiement :", "Hello, I have just placed order {ref} ({n}). Deposit: {x}. Here is my proof of payment:", "您好，我刚提交了订单 {ref}（{n}）。预付款：{x}。这是我的付款凭证："],
    waMsg0: ["Bonjour, j'aimerais commander : {n}.", "Hello, I would like to order: {n}.", "您好，我想订购：{n}。"]
  };
  const tr = (k, vars) => (D[k][IDX[L()]] || D[k][0]).replace(/\{(\w+)\}/g, (m, x) => (vars && vars[x] !== undefined ? vars[x] : m));
  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const pick = x => (x && typeof x === "object") ? (x[L()] || x.fr || "") : (x || "");
  const fcfa = n => new Intl.NumberFormat("fr-FR").format(n).replace(/[\u202f\u00a0]/g, " ") + " FCFA";

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const h = "0123456789abcdef"; let s = "";
    for (let i = 0; i < 32; i++) s += h[Math.floor(Math.random() * 16)];
    return s.slice(0, 8) + "-" + s.slice(8, 12) + "-4" + s.slice(13, 16) + "-8" + s.slice(17, 20) + "-" + s.slice(20);
  }
  const entetes = () => Object.assign({ apikey: window.sb.cle, "Content-Type": "application/json", Prefer: "return=minimal" }, /^eyJ/.test(window.sb.cle || "") ? { Authorization: "Bearer " + window.sb.cle } : {});

  // Moyens de paiement acceptés (logos dans images/paiement/ ; sans fichier, le nom s'affiche en texte)
  function puces() {
    const m = [["wave", P.wave, "Wave"], ["orange-money", P.orangeMoney, "Orange Money"], ["virement", P.rib, ""]].filter(x => x[1]);
    if (!m.length) return "";
    return '<div class="cmd-moyens"><span>' + esc(tr("moyens")) + "</span>" + m.map(x => x[2]
      ? '<b class="cmd-logo"><img src="images/paiement/' + x[0] + '.png" alt="' + x[2] + '" height="24" onerror="this.parentNode.textContent=this.alt"></b>'
      : '<b class="cmd-logo">' + esc(tr("virement")) + "</b>").join("") + "</div>";
  }

  let fond = null;
  function fermer() { if (fond) { fond.hidden = true; document.body.style.overflow = ""; } }
  function ouvrirBoite(html) {
    if (!fond) {
      fond = document.createElement("div"); fond.className = "cmd-fond"; fond.hidden = true;
      fond.innerHTML = '<div class="cmd-boite" role="dialog" aria-modal="true"><button class="cmd-fermer" type="button" aria-label="' + esc(tr("fermer")) + '">×</button><div id="cmd-contenu"></div></div>';
      document.body.appendChild(fond);
      fond.addEventListener("click", e => { if (e.target === fond || e.target.closest(".cmd-fermer")) fermer(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") fermer(); });
    }
    document.getElementById("cmd-contenu").innerHTML = html;
    fond.hidden = false; document.body.style.overflow = "hidden";
    fond.querySelector(".cmd-boite").scrollTop = 0;
  }

  function init(v) {
    const zone = document.querySelector(".fiche-actions");
    if (!zone || !window.sb || !window.sb.actif || !v.prix || v.statut === "vendu" || zone.querySelector(".btn-commande")) return;
    const nom = (window.nomArticle ? nomArticle(v) : [v.marque, v.modele].filter(Boolean).join(" ")) + (v.annee ? " " + v.annee : "");
    const acompte = Math.ceil(v.prix / 2), solde = v.prix - acompte;
    const aff = n => fcfa(n) + (L() !== "fr" && window.fmtPrixAffiche ? " (" + fmtPrixAffiche(n) + ")" : "");

    const b = document.createElement("button");
    b.type = "button"; b.className = "btn btn-commande"; b.textContent = tr("btn");
    zone.insertBefore(b, zone.firstChild);

    function formulaire() {
      ouvrirBoite(
        "<h2>" + esc(tr("titre")) + '</h2><div class="cmd-veh">' + esc(nom) + (v.notePrix ? " · " + esc(window.tv ? tv(v.notePrix) : v.notePrix) : "") + "</div>" +
        '<div class="cmd-prix"><div><span>' + esc(tr("prix")) + "</span><span>" + esc(aff(v.prix)) + '</span></div><div class="acompte"><span>' + esc(tr("acompte")) + "</span><span>" + esc(aff(acompte)) + "</span></div><div><span>" + esc(tr("solde")) + "</span><span>" + esc(aff(solde)) + "</span></div>" +
        (L() !== "fr" ? "<small>" + esc(tr("indic")) + "</small>" : "") + "</div>" +
        puces() +
        '<form class="cmd-form" id="cmd-form" novalidate>' +
        '<label for="cmd-nom">' + esc(tr("nom")) + '</label><input id="cmd-nom" autocomplete="name" maxlength="200">' +
        '<label for="cmd-tel">' + esc(tr("tel")) + '</label><input id="cmd-tel" type="tel" autocomplete="tel" maxlength="60" placeholder="+221 …">' +
        '<label for="cmd-email">' + esc(tr("email")) + '</label><input id="cmd-email" type="email" autocomplete="email" maxlength="200">' +
        '<label for="cmd-ville">' + esc(tr("ville")) + '</label><input id="cmd-ville" autocomplete="address-level2" maxlength="200">' +
        '<label for="cmd-msg">' + esc(tr("msg")) + '</label><textarea id="cmd-msg" maxlength="3000"></textarea>' +
        '<input class="cmd-hp" id="cmd-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<div class="cmd-cond">' + esc(tr("cond")) + (pick(P.conditions) ? "<br><br>" + esc(pick(P.conditions)) : "") + "</div>" +
        '<div id="cmd-err"></div><button class="btn btn-commande" id="cmd-envoyer" type="submit">' + esc(tr("envoyer")) + "</button></form>");
      document.getElementById("cmd-form").addEventListener("submit", envoyer);
      setTimeout(() => { const i = document.getElementById("cmd-nom"); if (i) i.focus(); }, 50);
    }

    async function envoyer(e) {
      e.preventDefault();
      const g = id => document.getElementById(id), val = id => g(id).value.trim();
      const err = g("cmd-err"); err.innerHTML = "";
      ["cmd-nom", "cmd-tel"].forEach(i => g(i).classList.remove("err"));
      if (g("cmd-hp").value) return; // robot
      const chiffres = val("cmd-tel").replace(/\D/g, "");
      if (!val("cmd-nom") || chiffres.length < 6) {
        if (!val("cmd-nom")) g("cmd-nom").classList.add("err");
        if (chiffres.length < 6) g("cmd-tel").classList.add("err");
        err.innerHTML = '<div class="cmd-erreur">' + esc(tr("errChamps")) + "</div>"; return;
      }
      const id = uuid(), ref = "CBF-" + id.replace(/-/g, "").slice(0, 6).toUpperCase();
      const corps = { id, vehicule_id: v.id, nom: val("cmd-nom"), telephone: val("cmd-tel"), email: val("cmd-email") || null, ville: val("cmd-ville") || null, message: val("cmd-msg") || null, langue: L() };
      const btn = g("cmd-envoyer"); btn.disabled = true; btn.textContent = tr("envoi");
      const ctl = new AbortController(), minuterie = setTimeout(() => ctl.abort(), 12000);
      try {
        const rep = await fetch(window.sb.url + "/rest/v1/commandes", { method: "POST", headers: entetes(), body: JSON.stringify(corps), signal: ctl.signal });
        clearTimeout(minuterie);
        if (!rep.ok) {
          let m = ""; try { m = (await rep.json()).message || ""; } catch (x) {}
          throw new Error(/disponible/i.test(m) ? "indispo" : "gen");
        }
        confirmation(ref);
      } catch (x) {
        clearTimeout(minuterie);
        btn.disabled = false; btn.textContent = tr("envoyer");
        const lien = window.lienWA ? lienWA(tr("waMsg0", { n: nom })) : "#";
        err.innerHTML = '<div class="cmd-erreur">' + esc(tr(x.message === "indispo" ? "errIndispo" : "errGen")) + '</div><a class="btn btn-wa" target="_blank" rel="noopener" href="' + lien + '">' + esc(window.t ? t("btn.wa") : "WhatsApp") + "</a>";
      }
    }

    function confirmation(ref) {
      const lignes = [["benef", P.beneficiaire], ["banque", P.banque], ["rib", P.rib], ["swift", P.swift], ["wave", P.wave], ["om", P.orangeMoney]].filter(l => l[1]);
      const lien = window.lienWA ? lienWA(tr("waMsg", { ref, n: nom, x: fcfa(acompte) })) : "#";
      ouvrirBoite(
        "<h2>" + esc(tr("okTitre")) + '</h2><div class="cmd-veh">' + esc(nom) + "</div>" +
        "<div class=\"cmd-note\">" + esc(tr("ref")) + '</div><div class="cmd-ok-ref">' + esc(ref) + "</div>" +
        "<p><strong>" + esc(lignes.length ? tr("payer", { x: fcfa(acompte) }) : tr("aucune", { x: fcfa(acompte) })) + "</strong></p>" +
        (lignes.length ? '<div class="cmd-coord">' + lignes.map(l => "<div><span>" + esc(tr(l[0])) + "</span><b>" + esc(l[1]) + "</b></div>").join("") + "<div><span>" + esc(tr("ref")) + "</span><b>" + esc(ref) + "</b></div></div>" : "") +
        '<p class="cmd-note">' + esc(tr("preuve")) + "</p>" +
        '<p class="cmd-note">' + esc(pick(P.texteSolde) ? pick(P.texteSolde).replace(/\{y\}/g, fcfa(solde)) : tr("soldeDef", { y: fcfa(solde) })) + "</p>" +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + lien + '">' + esc(tr("waBtn")) + '</a><button class="btn btn-ligne" type="button" id="cmd-ferme">' + esc(tr("fermer")) + "</button>");
      document.getElementById("cmd-ferme").addEventListener("click", fermer);
    }

    b.addEventListener("click", formulaire);
  }

  if (window.FICHE_COURANTE) init(window.FICHE_COURANTE);
  document.addEventListener("fiche:prete", e => init(e.detail));
})();
