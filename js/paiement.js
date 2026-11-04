// ============================================================
//  COORDONNÉES DE PAIEMENT DE L'ACOMPTE (50 %) — à remplir avec les infos que le client vous envoie.
//  Laissez "" pour ce qui n'existe pas : seuls les champs remplis s'affichent au client.
//  Tant que TOUT est vide, le site dit simplement au client que CBF le contacte sur WhatsApp avec les instructions.
//  (Ce fichier est public : n'y mettez JAMAIS de mot de passe ni de code secret. Un RIB/IBAN de réception est fait pour être communiqué.)
// ============================================================
window.SITE.paiement = {
  beneficiaire: "",   // nom exact du titulaire du compte, ex. "Cheikh Baye Fall"
  banque: "",         // ex. "Ecobank Sénégal"
  rib: "",            // RIB / IBAN du compte qui reçoit l'acompte
  swift: "",          // (facultatif) code SWIFT/BIC, utile pour un virement depuis l'étranger
  wave: "",           // (facultatif) numéro Wave qui reçoit, ex. "+221 77 000 00 00"
  orangeMoney: "",    // (facultatif) numéro Orange Money qui reçoit
  // (facultatif) texte sur le solde, affiché après la commande. Vide = texte par défaut.
  texteSolde: "",
  // (facultatif) conditions de l'acompte (remboursement, délai…), affichées dans le formulaire. À faire valider par le client.
  conditions: ""
};
