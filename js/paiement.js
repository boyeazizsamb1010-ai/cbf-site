// ============================================================
//  COORDONNÉES DE PAIEMENT DE L'ACOMPTE (50 %) — à remplir avec les infos que le client vous envoie.
//  Laissez "" pour ce qui n'existe pas : seuls les champs remplis s'affichent au client.
//  Tant que TOUT est vide, le site dit simplement au client que CBF le contacte sur WhatsApp avec les instructions.
//  (Ce fichier est public : n'y mettez JAMAIS de mot de passe ni de code secret. Un RIB/IBAN de réception est fait pour être communiqué.)
// ============================================================
window.SITE.paiement = {
  beneficiaire: "Cheikh Baye Fall",   // nom exact du titulaire du compte, ex. "Cheikh Baye Fall"
  banque: "",         // ex. "Ecobank Sénégal"
  rib: "",            // RIB / IBAN du compte qui reçoit l'acompte
  swift: "",          // (facultatif) code SWIFT/BIC, utile pour un virement depuis l'étranger
  wave: "+221 77 839 37 21",           // (facultatif) numéro Wave qui reçoit, ex. "+221 77 000 00 00"
  orangeMoney: "+221 77 839 37 21",    // (facultatif) numéro Orange Money qui reçoit
  // LIENS DE PAIEMENT (facultatifs) : si rempli, un bouton "Payer l'acompte avec Wave" s'affiche après la commande et ouvre Wave du client.
  // Doit commencer par https://. {montant} est remplacé par l'acompte (si le lien le supporte).
  // Wave : lien du compte Wave Business de CBF, ex. "https://pay.wave.com/m/M_sn_XXXXXXXX/c/sn/?amount={montant}"
  waveLien: "https://pay.wave.com/m/M_sn_PN_kgicgKkdE/c/sn/.",
  orangeMoneyLien: "",
  // Texte sur le solde (affiché après la commande). {y} = montant du solde. Texte simple, ou { fr, en, zh } pour les 3 langues.
  texteSolde: {
    fr: "Le solde ({y}) se règle à l'arrivée du véhicule au Port autonome de Dakar, par virement bancaire ou en espèces.",
    en: "The balance ({y}) is paid when the vehicle arrives at the Port Autonome de Dakar, by bank transfer or in cash.",
    zh: "尾款（{y}）在车辆抵达达喀尔自治港时支付，可银行转账或现金支付。"
  },
  // Conditions de l'acompte (affichées dans le formulaire). Texte simple, ou { fr, en, zh }.
  conditions: {
    fr: "L'acompte est remboursable si vous n'êtes pas satisfait du véhicule, ou si vous acceptez d'échanger contre un autre véhicule.",
    en: "The deposit is refundable if you are not satisfied with the vehicle, or if you agree to exchange it for another vehicle.",
    zh: "如果您对车辆不满意，或同意更换其他车辆，预付款可退还。"
  }
};
