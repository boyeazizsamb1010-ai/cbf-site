// Génère une page par véhicule (v/<id>.html) avec l'aperçu de partage WhatsApp/Facebook,
// plus sitemap.xml et robots.txt. Lancé automatiquement par Netlify à chaque mise en ligne.
// À la main : node outils/generer-pages.js
const fs = require("fs");
const path = require("path");
const racine = path.join(__dirname, "..");
global.window = {};
require(path.join(racine, "js", "config.js"));
require(path.join(racine, "js", "data.js"));
const S = window.SITE; let V = window.VEHICULES;
(async () => {
// Si la base de données est configurée, on lit les véhicules dedans (sinon js/data.js)
const cfg = S.supabase || {};
if (cfg.url && cfg.anonKey) {
  try {
    const r = await fetch(cfg.url.replace(/\/$/, "") + "/rest/v1/vehicules?select=*&order=ordre.asc,created_at.desc", { headers: Object.assign({ apikey: cfg.anonKey }, /^eyJ/.test(cfg.anonKey) ? { Authorization: "Bearer " + cfg.anonKey } : {}) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const lignes = await r.json();
    if (!Array.isArray(lignes) || !lignes.length) throw new Error("aucun véhicule");
    V = lignes.map(x => ({ id: x.id, marque: x.marque, modele: x.modele, annee: x.annee, prix: x.prix, notePrix: x.note_prix, description: x.description, photos: x.photos || [] }));
    console.log("Véhicules lus dans la base de données : " + V.length);
  } catch (e) { console.log("Base de données non lue (" + e.message + ") : js/data.js utilisé à la place."); }
}
const site = (process.env.URL || S.siteUrl || "").replace(/\/$/, "");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const base = p => p.replace(/\.[a-z0-9]+$/i, "");
const prix = n => !n ? "Prix sur demande" : new Intl.NumberFormat("fr-FR").format(n).replace(/[  ]/g, " ") + " " + S.devise;

const modele = fs.readFileSync(path.join(racine, "vehicule.html"), "utf8");
fs.mkdirSync(path.join(racine, "v"), { recursive: true });
for (const f of fs.readdirSync(path.join(racine, "v"))) if (f.endsWith(".html")) fs.unlinkSync(path.join(racine, "v", f));

for (const v of V) {
  const nom = [v.marque, v.modele].filter(Boolean).join(" ") + (v.annee ? " " + v.annee : "");
  const titre = nom + " – " + S.nom;
  const desc = nom + " : " + prix(v.prix) + ". " + (v.notePrix ? v.notePrix + ". " : "") + (v.description || "");
  const image = v.photos && v.photos.length && /^https?:/i.test(v.photos[0]) ? v.photos[0] : site + "/" + (v.photos && v.photos.length ? "images/vehicules/og/" + base(v.photos[0]) + ".jpg" : "images/logo-complet.jpg");
  const url = site + "/v/" + v.id + ".html";
  const meta =
    `<link rel="canonical" href="${url}">\n` +
    `  <meta name="description" content="${esc(desc.slice(0, 200))}">\n` +
    `  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="${esc(S.nom)}">\n` +
    `  <meta property="og:title" content="${esc(nom + " – " + prix(v.prix))}">\n` +
    `  <meta property="og:description" content="${esc(desc.slice(0, 200))}">\n` +
    `  <meta property="og:url" content="${url}">\n  <meta property="og:image" content="${image}">\n` +
    `  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n` +
    `  <meta name="twitter:card" content="summary_large_image">\n`;
  let html = modele
    .replace(/<title>.*<\/title>/, "<title>" + esc(titre) + "</title>")
    .replace(/\s*<meta name="description"[^>]*>/, "")
    .replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n  <base href="/">')
    .replace("</head>", "  " + meta + "</head>")
    .replace('<script src="js/config.js">', `<script>window.VEHICULE_ID = ${JSON.stringify(v.id)};</script>\n  <script src="js/config.js">`);
  fs.writeFileSync(path.join(racine, "v", v.id + ".html"), html);
}

const pages = ["", "vehicules.html", "a-propos.html", "contact.html"];
const urls = pages.map(p => site + "/" + p).concat(V.map(v => site + "/v/" + v.id + ".html"));
fs.writeFileSync(path.join(racine, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => "  <url><loc>" + u + "</loc></url>").join("\n") + "\n</urlset>\n");
fs.writeFileSync(path.join(racine, "robots.txt"), "User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: " + site + "/sitemap.xml\n");
console.log(V.length + " pages de véhicules générées, sitemap.xml et robots.txt mis à jour (" + site + ")");
})();
