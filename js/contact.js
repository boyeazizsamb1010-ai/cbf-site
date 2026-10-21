// Contact : affiche les infos et envoie le formulaire vers WhatsApp
(function () {
  const S = window.SITE;
  document.getElementById("c-adresse").textContent = S.adresse;
  if (S.horaires) document.getElementById("c-horaires").textContent = S.horaires; else document.getElementById("c-horaires").closest(".info-ligne").remove();
  const em = document.getElementById("c-email");
  if (S.email) { em.textContent = S.email; em.href = "mailto:" + S.email; } else { em.closest(".info-ligne").remove(); }
  document.getElementById("c-wa").textContent = S.whatsappAffiche;
  document.getElementById("c-btn").href = lienWA("Bonjour,");

  document.getElementById("form").addEventListener("submit", e => {
    e.preventDefault();
    const nom = document.getElementById("nom"), msg = document.getElementById("msg");
    [nom, msg].forEach(c => (c.style.outline = ""));
    if (!nom.value.trim() || !msg.value.trim()) {
      [nom, msg].forEach(c => { if (!c.value.trim()) c.style.outline = "2px solid #c0392b"; });
      return;
    }
    const email = document.getElementById("email").value.trim();
    const tel = document.getElementById("tel").value.trim();
    const texte = "Bonjour, je suis " + nom.value.trim() + "." + (tel ? "\nTéléphone : " + tel : "") + (email ? "\nEmail : " + email : "") + "\n\n" + msg.value.trim();
    window.open(lienWA(texte), "_blank", "noopener");
  });
})();
