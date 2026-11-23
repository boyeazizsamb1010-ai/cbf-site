// ============================================================
//  LANGUES : français (par défaut), anglais, chinois
//  - Tous les textes du site sont ici : [français, anglais, chinois]
//  - Dans le HTML : data-i18n="cle"  (texte), data-i18n-html="cle" (texte avec balises),
//    data-i18n-ph="cle" (placeholder), data-i18n-aria="cle" (aria-label)
//  - Dans le JS : t("cle", { variable: valeur })
//  - Les descriptions des véhicules sont dans js/descriptions.js
// ============================================================
(function () {
  const S = window.SITE;
  const LANGUES = [["fr", "FR"], ["en", "EN"], ["zh", "中文"]];
  const IDX = { fr: 0, en: 1, zh: 2 };

  // ---------- Langue choisie : ?lang=  >  mémoire du navigateur  >  langue du téléphone ----------
  function lire() {
    let q = null, m = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    try { m = localStorage.getItem("cbf-lang"); } catch (e) {}
    const nav = (navigator.language || "fr").toLowerCase();
    const auto = nav.startsWith("zh") ? "zh" : nav.startsWith("en") ? "en" : "fr";
    for (const c of [q, m]) if (c && IDX[c] !== undefined) return c;
    return auto;
  }
  const lang = lire();
  try { localStorage.setItem("cbf-lang", lang); } catch (e) {}
  document.documentElement.lang = lang;
  window.LANG = lang;

  // ---------- Dictionnaire ----------
  const D = {
    slogan: ["Votre partenaire de confiance en Chine", "Your trusted partner in China", "您在中国值得信赖的合作伙伴"],
    "nav.home": ["Accueil", "Home", "首页"],
    "nav.catalog": ["Catalogue", "Catalog", "产品目录"],
    "nav.about": ["À propos", "About us", "关于我们"],
    "nav.contact": ["Contact", "Contact", "联系我们"],
    "nav.rdv": ["Prendre RDV", "Book a visit", "预约咨询"],
    menu: ["Menu", "Menu", "菜单"],
    "lang.label": ["Langue", "Language", "语言"],
    "footer.about": ["{slogan}. Achat de véhicules et de machines en Chine, import-export de qualité.", "{slogan}. Vehicles and machinery bought in China, quality import-export.", "{slogan}。在中国采购车辆和机械设备，提供优质进出口服务。"],
    "footer.nav": ["Navigation", "Navigation", "导航"],
    "footer.vehicles": ["Véhicules", "Vehicles", "车辆"],
    "footer.products": ["Nos produits", "Our products", "我们的产品"],
    "footer.contact": ["Contact", "Contact", "联系方式"],
    "footer.rights": ["Tous droits réservés.", "All rights reserved.", "版权所有。"],
    address: ["Guangzhou, Chine", "Guangzhou, China", "中国广州"],
    hours: ["Tous les jours : 9h – 23h", "Every day: 9 am – 11 pm", "每天：9:00 – 23:00"],
    "wa.float": ["Écrire sur WhatsApp", "Chat on WhatsApp", "通过 WhatsApp 联系"],
    "price.ask": ["Prix sur demande", "Price on request", "价格面议"],

    // messages envoyés sur WhatsApp
    "wa.rdv": ["Bonjour, je souhaite prendre rendez-vous.", "Hello, I would like to book an appointment.", "您好，我想预约咨询。"],
    "wa.info": ["Bonjour, je souhaite des informations.", "Hello, I would like some information.", "您好，我想了解一些信息。"],
    "wa.hello": ["Bonjour", "Hello", "您好"],
    "wa.hello2": ["Bonjour,", "Hello,", "您好，"],
    "wa.cars": ["Bonjour, je souhaite des informations sur vos véhicules.", "Hello, I would like information about your vehicles.", "您好，我想了解你们的车辆信息。"],
    "wa.interest": ["Bonjour, je suis intéressé par : {n}{p}. Est-il toujours disponible ?", "Hello, I am interested in: {n}{p}. Is it still available?", "您好，我对这款车感兴趣：{n}{p}。请问还有现货吗？"],
    "wa.at": [" à {prix}", " at {prix}", "，价格 {prix}"],
    "wa.interest.short": ["Bonjour, je suis intéressé par : {n}.", "Hello, I am interested in: {n}.", "您好，我对这款车感兴趣：{n}。"],
    "wa.looking": ["Bonjour, je cherche : {x}.", "Hello, I am looking for: {x}.", "您好，我想咨询：{x}。"],
    "wa.anitem": ["un article", "an item", "一件商品"],
    "wa.iam": ["Bonjour, je suis {nom}.", "Hello, I am {nom}.", "您好，我是{nom}。"],
    "wa.tel": ["\nTéléphone : {x}", "\nPhone: {x}", "\n电话：{x}"],
    "wa.email": ["\nEmail : {x}", "\nEmail: {x}", "\n邮箱：{x}"],

    // cartes et fiche
    "card.see": ["Voir la fiche →", "View details →", "查看详情 →"],
    "card.fav": ["Ajouter aux favoris", "Add to favourites", "加入收藏"],
    "fiche.notfound": ["Véhicule introuvable", "Vehicle not found", "未找到该车辆"],
    "badge.sold": ["Vendu", "Sold", "已售"],
    "fiche.soldout": ["Ce véhicule a été vendu. Contactez-nous pour des modèles similaires.", "This vehicle has been sold. Contact us for similar models.", "该车已售出，欢迎联系我们了解类似车型。"],
    "fiche.sold": ["Il a peut-être été vendu.", "It may have been sold.", "可能已售出。"],
    "fiche.back": ["Retour au catalogue", "Back to the catalog", "返回目录"],
    "photo.prev": ["Photo précédente", "Previous photo", "上一张"],
    "photo.next": ["Photo suivante", "Next photo", "下一张"],
    "photo.n": ["Photo {n}", "Photo {n}", "照片 {n}"],
    zoom: ["Agrandir", "Enlarge", "放大"],
    "stock.1": ["✓ En stock (1 disponible)", "✓ In stock (1 available)", "✓ 现货（1 台可售）"],
    "stock.n": ["✓ En stock ({n} disponibles)", "✓ In stock ({n} available)", "✓ 现货（{n} 台可售）"],
    "btn.wa": ["Contacter sur WhatsApp", "Contact on WhatsApp", "WhatsApp 联系"],
    share: ["Partager", "Share", "分享"],
    favorite: ["Favori", "Favourite", "收藏"],
    specs: ["Caractéristiques", "Specifications", "规格参数"],
    "price.ref": ["Prix en FCFA : {x}", "Price in FCFA: {x}", "FCFA 价格：{x}"],
    "price.note": ["Montant converti à titre indicatif.", "Converted amount, for information only.", "换算金额仅供参考。"],
    "lab.marque": ["Marque", "Make", "品牌"],
    "lab.modele": ["Modèle", "Model", "型号"],
    "lab.annee": ["Année", "Year", "年份"],
    "lab.km": ["Kilométrage", "Mileage", "里程"],
    "lab.carburant": ["Carburant", "Fuel", "燃料"],
    "lab.transmission": ["Transmission", "Transmission", "变速箱"],
    "lab.couleur": ["Couleur", "Colour", "颜色"],
    "lab.puissance": ["Puissance", "Engine", "动力"],
    "lab.portes": ["Portes", "Doors", "车门数"],
    "lab.etat": ["État", "Condition", "车况"],
    similar: ["Vous aimerez aussi", "You may also like", "您可能还喜欢"],
    "lb.close": ["Fermer", "Close", "关闭"],
    "lb.prev": ["Précédente", "Previous", "上一张"],
    "lb.next": ["Suivante", "Next", "下一张"],
    "bar.wa": ["WhatsApp", "WhatsApp", "WhatsApp"],
    "title.fiche": ["Fiche véhicule – {nom}", "Vehicle details – {nom}", "车辆详情 – {nom}"],

    // accueil
    "hero.aria": ["Véhicules à la une", "Featured vehicles", "精选车辆"],
    "slide.view": ["Voir la fiche", "View details", "查看详情"],
    "slide.n": ["Diapositive {n}", "Slide {n}", "第 {n} 张"],
    "home.eyebrow1": ["Nos rubriques", "Our categories", "产品分类"],
    "home.h1": ["Que recherchez-vous ?", "What are you looking for?", "您在寻找什么？"],
    "home.p1": ["Choisissez une rubrique : voitures neuves ou d'occasion, moteurs, tracteurs, camions, machines.", "Pick a category: new or used cars, engines, tractors, trucks, machinery.", "请选择分类：新车、二手车、发动机、拖拉机、卡车、机械设备。"],
    "home.eyebrow2": ["Depuis Guangzhou", "From Guangzhou", "来自广州"],
    "home.h2": ["Le bon véhicule, directement de Chine.", "The right vehicle, straight from China.", "合适的车辆，直接来自中国。"],
    "svc1.t": ["Achat professionnel", "Professional purchasing", "专业采购"],
    "svc1.p": ["Nous achetons pour vous en Chine : véhicules, camions et machines, au meilleur prix.", "We buy for you in China: vehicles, trucks and machinery, at the best price.", "我们在中国为您采购：车辆、卡车和机械设备，价格优惠。"],
    "svc2.t": ["Confiance & partenariat", "Trust & partnership", "信任与合作"],
    "svc2.p": ["Un partenaire sur place à Guangzhou, qui vous accompagne de la sélection à la livraison.", "A partner on the ground in Guangzhou, with you from selection to delivery.", "我们在广州本地为您服务，从选车到交付全程陪伴。"],
    "svc3.t": ["Import – Export qualité", "Quality import – export", "优质进出口"],
    "svc3.p": ["Expédition de la Chine vers le Sénégal et l'Afrique de l'Ouest, avec un suivi clair.", "Shipping from China to Senegal and West Africa, with clear tracking.", "从中国发往塞内加尔和西非，全程清晰跟踪。"],
    "home.eyebrow3": ["Sélection", "Selection", "精选"],
    "home.h3": ["Véhicules à la une", "Featured vehicles", "精选车辆"],
    "home.all": ["Voir tout le catalogue →", "See the full catalog →", "查看全部产品 →"],
    "home.eyebrow4": ["Simple et clair", "Simple and clear", "简单明了"],
    "home.h4": ["Comment ça marche ?", "How does it work?", "如何运作？"],
    "st1.t": ["Vous choisissez", "You choose", "您选择"],
    "st1.p": ["Parcourez le catalogue, ou dites-nous sur WhatsApp ce que vous cherchez.", "Browse the catalog, or tell us on WhatsApp what you are looking for.", "浏览产品目录，或通过 WhatsApp 告诉我们您的需求。"],
    "st2.t": ["Nous vous répondons", "We reply", "我们回复您"],
    "st2.p": ["Photos, vidéos et détails de l'article, directement sur WhatsApp.", "Photos, videos and details of the item, straight on WhatsApp.", "通过 WhatsApp 直接发送照片、视频和详细信息。"],
    "st3.t": ["Nous achetons en Chine", "We buy in China", "我们在中国采购"],
    "st3.p": ["Nous achetons et préparons votre article depuis Guangzhou.", "We buy and prepare your item from Guangzhou.", "我们在广州为您采购并准备好商品。"],
    "st4.t": ["Livraison à Dakar", "Delivery to Dakar", "运抵达喀尔"],
    "st4.p": ["Expédition vers le Port autonome de Dakar, avec un suivi clair.", "Shipping to the Port Autonome de Dakar, with clear tracking.", "发往达喀尔自治港，全程清晰跟踪。"],
    "home.eyebrow5": ["Questions fréquentes", "Frequently asked questions", "常见问题"],
    "home.h5": ["Vos questions, nos réponses", "Your questions, our answers", "您的问题，我们的解答"],
    "faq1.q": ["Que veut dire « prix une fois arrivé au Port autonome de Dakar » ?", "What does “price once delivered at the Port Autonome de Dakar” mean?", "“到达达喀尔自治港后的价格”是什么意思？"],
    "faq1.a": ["C'est le prix annoncé pour un article arrivé au Port autonome de Dakar. Pour le détail des frais après l'arrivée au port (dédouanement, transport), demandez-nous sur WhatsApp.", "It is the price quoted for an item once it has arrived at the Port Autonome de Dakar. For the costs after arrival at the port (customs clearance, transport), ask us on WhatsApp.", "这是商品运抵达喀尔自治港后的报价。到港后的费用（清关、运输）详情，请通过 WhatsApp 咨询我们。"],
    "faq2.q": ["Comment commander ou réserver ?", "How do I order or reserve?", "如何下单或预订？"],
    "faq2.a": ["Ouvrez la fiche de l'article, puis cliquez sur « Contacter sur WhatsApp ». Nous échangeons ensuite sur les détails et les étapes.", "Open the item page, then click “Contact on WhatsApp”. We then discuss the details and the next steps.", "打开商品详情页，点击“WhatsApp 联系”，随后我们会与您沟通细节和后续步骤。"],
    "faq3.q": ["Puis-je voir plus de photos ou une vidéo ?", "Can I see more photos or a video?", "我可以看更多照片或视频吗？"],
    "faq3.a": ["Oui. Nous sommes sur place à Guangzhou : demandez-nous des photos ou une vidéo de l'article sur WhatsApp.", "Yes. We are on site in Guangzhou: ask us for photos or a video of the item on WhatsApp.", "可以。我们就在广州本地，您可以通过 WhatsApp 向我们索取商品的照片或视频。"],
    "faq4.q": ["Vendez-vous autre chose que des voitures ?", "Do you sell anything other than cars?", "除了汽车，你们还销售其他产品吗？"],
    "faq4.a": ["Oui : moteurs, tracteurs, camions, machines industrielles et décortiqueuses d'arachides. Si vous ne trouvez pas ce que vous cherchez, demandez-le nous.", "Yes: engines, tractors, trucks, industrial machinery and peanut shellers. If you cannot find what you are looking for, just ask us.", "有：发动机、拖拉机、卡车、工业机械和花生脱壳机。如果没找到您需要的，请直接告诉我们。"],
    "faq5.q": ["Comment vous joindre ?", "How can I reach you?", "如何联系你们？"],
    "faq5.a": ["Par WhatsApp au {wa} ({h}), ou depuis la page Contact.", "By WhatsApp at {wa} ({h}), or from the Contact page.", "请通过 WhatsApp {wa}（{h}）联系，或使用“联系我们”页面。"],
    "cta.h": ["Votre partenaire de confiance en Chine.", "Your trusted partner in China.", "您在中国值得信赖的合作伙伴。"],
    "cta.p": ["Écrivez-nous sur WhatsApp au {wa} : on vous répond rapidement.", "Write to us on WhatsApp at {wa}: we reply quickly.", "请通过 WhatsApp {wa} 联系我们，我们会尽快回复。"],
    "cta.btn": ["Discuter sur WhatsApp", "Chat on WhatsApp", "WhatsApp 咨询"],
    "tile.1": ["{n} article", "{n} item", "{n} 件"],
    "tile.n": ["{n} articles", "{n} items", "{n} 件"],
    "tile.soon": ["Bientôt", "Coming soon", "即将上线"],
    "title.index": ["{nom} (CBF) – Voitures, moteurs, camions et machines depuis la Chine", "{nom} (CBF) – Cars, engines, trucks and machinery from China", "{nom}（CBF）– 来自中国的汽车、发动机、卡车和机械设备"],

    // catalogue
    "cat.eyebrow": ["Sur le site", "On the site", "网站内容"],
    "cat.title": ["Tout le catalogue, en ligne.", "The whole catalog, online.", "完整产品目录，在线浏览。"],
    "cat.sub": ["Voitures, moteurs, tracteurs, camions et machines : choisissez une rubrique, puis contactez-nous sur WhatsApp.", "Cars, engines, tractors, trucks and machinery: pick a category, then contact us on WhatsApp.", "汽车、发动机、拖拉机、卡车和机械设备：选择分类，然后通过 WhatsApp 联系我们。"],
    "title.vehicules": ["Véhicules – {nom}", "Catalog – {nom}", "产品目录 – {nom}"],
    "search.ph": ["Rechercher une marque, un modèle…", "Search a make or model…", "搜索品牌或型号…"],
    "search.aria": ["Rechercher", "Search", "搜索"],
    "sort.aria": ["Trier", "Sort", "排序"],
    "sort.by": ["Trier par", "Sort by", "排序方式"],
    "sort.asc": ["Prix croissant", "Price: low to high", "价格从低到高"],
    "sort.desc": ["Prix décroissant", "Price: high to low", "价格从高到低"],
    "sort.recent": ["Plus récents", "Newest", "最新年份"],
    "budget.aria": ["Budget", "Budget", "预算"],
    "budget.all": ["Tous les prix", "All prices", "全部价格"],
    "budget.1": ["Moins de 6 000 000 FCFA", "Under 6,000,000 FCFA", "6,000,000 FCFA 以下"],
    "budget.2": ["6 000 000 à 8 000 000 FCFA", "6,000,000 to 8,000,000 FCFA", "6,000,000 – 8,000,000 FCFA"],
    "budget.3": ["8 000 000 à 10 000 000 FCFA", "8,000,000 to 10,000,000 FCFA", "8,000,000 – 10,000,000 FCFA"],
    "budget.4": ["Plus de 10 000 000 FCFA", "Over 10,000,000 FCFA", "10,000,000 FCFA 以上"],
    "carb.aria": ["Carburant", "Fuel", "燃料"],
    "carb.all": ["Tous les carburants", "All fuels", "全部燃料"],
    "fav.btn": ["♥ Mes favoris", "♥ My favourites", "♥ 我的收藏"],
    all: ["Tout", "All", "全部"],
    "cat.allcats": ["Toutes catégories", "All categories", "全部类别"],
    "count.1": ["{n} article disponible", "{n} item available", "共 {n} 件可选"],
    "count.n": ["{n} articles disponibles", "{n} items available", "共 {n} 件可选"],
    "empty.h": ["Bientôt disponible", "Coming soon", "即将上线"],
    "empty.p": ["Nous n'avons pas encore de {sujet} en ligne, mais nous pouvons en trouver pour vous en Chine.", "We don't have any {sujet} online yet, but we can find some for you in China.", "我们暂时还没有上架{sujet}，但可以在中国为您寻找。"],
    "empty.any": ["ce que vous cherchez", "what you are looking for", "您需要的商品"],
    "empty.btn": ["Demander sur WhatsApp", "Ask on WhatsApp", "通过 WhatsApp 询问"],
    "empty.fav": ["Vous n'avez pas encore de favoris : touchez le cœur sur un article pour le garder ici.", "You have no favourites yet: tap the heart on an item to keep it here.", "您还没有收藏：点击商品上的心形图标即可收藏。"],
    "empty.none": ["Aucun article ne correspond à votre recherche.", "No item matches your search.", "没有符合您搜索的商品。"],

    // contact
    "title.contact": ["Contact – {nom}", "Contact – {nom}", "联系我们 – {nom}"],
    "c.h1": ["Écrivez-nous sur WhatsApp.", "Write to us on WhatsApp.", "欢迎通过 WhatsApp 联系我们。"],
    "c.sub": ["Nos coordonnées et un formulaire qui ouvre directement WhatsApp.", "Our contact details and a form that opens WhatsApp directly.", "我们的联系方式，以及可直接打开 WhatsApp 的表单。"],
    "c.coords": ["Nos coordonnées", "Our contact details", "联系方式"],
    "c.addr": ["Adresse", "Address", "地址"],
    "c.hours": ["Horaires", "Opening hours", "营业时间"],
    "c.email": ["Email", "Email", "电子邮箱"],
    "c.wa": ["WhatsApp", "WhatsApp", "WhatsApp"],
    "c.others": ["Autres numéros", "Other numbers", "其他号码"],
    "c.open": ["Ouvrir WhatsApp", "Open WhatsApp", "打开 WhatsApp"],
    "c.formh": ["Envoyez un message", "Send a message", "发送留言"],
    "f.name": ["Nom *", "Name *", "姓名 *"],
    "f.email": ["Email", "Email", "电子邮箱"],
    "f.tel": ["Téléphone", "Phone", "电话"],
    "f.msg": ["Votre message *", "Your message *", "您的留言 *"],
    "f.send": ["Envoyer sur WhatsApp", "Send on WhatsApp", "通过 WhatsApp 发送"],
    "f.note": ["Le message s'ouvre dans WhatsApp, il vous reste à l'envoyer.", "The message opens in WhatsApp; you just need to send it.", "消息会在 WhatsApp 中打开，您只需点击发送。"],

    // à propos
    "title.a-propos": ["À propos – {nom}", "About us – {nom}", "关于我们 – {nom}"],
    "a.p1": ["<strong>Cheikh Baye Fall Cargo (CBF)</strong> est basé à Guangzhou, en Chine. Nous vous accompagnons pour acheter vos véhicules, camions et machines directement auprès des fournisseurs chinois.", "<strong>Cheikh Baye Fall Cargo (CBF)</strong> is based in Guangzhou, China. We help you buy your vehicles, trucks and machinery directly from Chinese suppliers.", "<strong>Cheikh Baye Fall Cargo (CBF)</strong> 总部位于中国广州。我们协助您直接向中国供应商采购车辆、卡车和机械设备。"],
    "a.p2": ["De la sélection à l'expédition, nous gérons l'achat et vous tenons informé à chaque étape, pour que vous receviez ce que vous avez commandé.", "From selection to shipping, we handle the purchase and keep you informed at every step, so that you receive what you ordered.", "从选品到发货，我们负责采购并在每一步及时通知您，确保您收到所订购的商品。"],
    "a.p3": ["Une question ? Écrivez-nous sur WhatsApp : nous vous répondons rapidement.", "Any question? Write to us on WhatsApp: we reply quickly.", "有问题吗？请通过 WhatsApp 联系我们，我们会尽快回复。"],
    "a.b1": ["Achat", "Purchasing", "采购"],
    "a.s1": ["professionnel", "professional", "专业"],
    "a.b2": ["Confiance", "Trust", "信任"],
    "a.s2": ["& partenariat", "& partnership", "与合作"],
    "a.b3": ["Import–Export", "Import–Export", "进出口"],
    "a.s3": ["qualité", "quality", "优质"],

    // ----- Cheikh Baye Fall Cargo -----
    "nav.cargo": ["Cargo", "Cargo", "货运"],
    "footer.cargo": ["Cargo Chine → Sénégal", "Cargo China → Senegal", "中国 → 塞内加尔货运"],
    "footer.track": ["Suivre un colis", "Track a parcel", "包裹查询"],
    "title.cargo": ["Cheikh Baye Fall Cargo – Fret Chine → Sénégal et suivi de colis", "Cheikh Baye Fall Cargo – China → Senegal freight and parcel tracking", "Cheikh Baye Fall Cargo – 中国至塞内加尔货运与包裹查询"],
    "cg.eyebrow": ["Nouveau service", "New service", "全新服务"],
    "cg.h1": ["Cheikh Baye Fall Cargo", "Cheikh Baye Fall Cargo", "Cheikh Baye Fall Cargo"],
    "cg.route": ["Guangzhou → Sénégal", "Guangzhou → Senegal", "广州 → 塞内加尔"],
    "cg.sub": ["Expédiez vos colis de la Chine vers le Sénégal en toute sécurité, rapidement et moins cher.", "Ship your parcels from China to Senegal safely, quickly and for less.", "安全、快速、实惠地将您的包裹从中国寄往塞内加尔。"],
    "cg.b1": ["Fiable et sécurisé", "Reliable and secure", "安全可靠"],
    "cg.b2": ["Livraison rapide", "Fast delivery", "快速送达"],
    "cg.b3": ["Suivi de vos colis", "Parcel tracking", "包裹跟踪"],
    "cg.b4": ["Service client disponible", "Customer service available", "客服随时在线"],
    "cg.cta.book": ["Réserver une expédition", "Book a shipment", "预订发货"],
    "cg.cta.track": ["Suivre mon colis", "Track my parcel", "查询我的包裹"],
    "cg.tarifs.eyebrow": ["Tarifs au kilo", "Price per kilo", "每公斤价格"],
    "cg.tarifs.h": ["Deux formules, un prix clair", "Two options, one clear price", "两种方式，价格透明"],
    "cg.mode.standard": ["Fret Standard", "Standard freight", "标准货运"],
    "cg.mode.express": ["Fret Express", "Express freight", "快速货运"],
    "cg.mode.standard.c": ["Standard", "Standard", "标准"],
    "cg.mode.express.c": ["Express", "Express", "快速"],
    "cg.jours": ["{n} jours", "{n} days", "{n} 天"],
    "cg.jour": ["1 jour", "1 day", "1 天"],
    "cg.parkg": ["/ kg", "/ kg", "/ 公斤"],
    "cg.delai.est": ["Délai estimé : {d}", "Estimated time: {d}", "预计时效：{d}"],
    "cg.sim.h": ["Simulateur de prix", "Price calculator", "运费计算器"],
    "cg.sim.poids": ["Poids de vos bagages (kg)", "Weight of your luggage (kg)", "货物重量（公斤）"],
    "cg.sim.total": ["Prix estimé", "Estimated price", "预计运费"],
    "cg.sim.note": ["Estimation selon le poids indiqué. Le prix final est calculé sur le poids pesé à la réception à Guangzhou.", "Estimate based on the weight entered. The final price is based on the weight measured on receipt in Guangzhou.", "根据填写重量估算。最终运费以广州收货时称重为准。"],
    "cg.conv": ["Montants en FCFA ; conversion indicative.", "Amounts in FCFA; converted value is indicative.", "金额以 FCFA 为准，换算仅供参考。"],
    "cg.dep.eyebrow": ["Calendrier", "Schedule", "发货时间表"],
    "cg.dep.h": ["Prochains départs", "Upcoming departures", "近期发货批次"],
    "cg.dep.aucun": ["Aucun départ publié pour le moment. Écrivez-nous sur WhatsApp : nous vous donnons la prochaine date.", "No departure published yet. Message us on WhatsApp and we will give you the next date.", "暂无发布的发货批次。请通过 WhatsApp 联系我们获取下一批日期。"],
    "cg.dep.depart": ["Départ", "Departure", "发货日期"],
    "cg.dep.limite": ["Dépôt avant le", "Drop-off before", "截止收货"],
    "cg.dep.arrivee": ["Arrivée estimée", "Estimated arrival", "预计到达"],
    "cg.dep.reste": ["Plus que {n} jours pour déposer", "{n} days left to drop off", "距截止收货还剩 {n} 天"],
    "cg.dep.reste1": ["Dernier jour demain", "Last day tomorrow", "明天截止"],
    "cg.dep.reste0": ["Dernier jour pour déposer : aujourd'hui", "Last day to drop off: today", "今天截止收货"],
    "cg.dep.reserver": ["Réserver sur ce départ", "Book this departure", "预订此批次"],
    "cg.dep.adate": ["Date à confirmer", "Date to be confirmed", "日期待定"],
    "cg.st.ouvert": ["Ouvert aux dépôts", "Open for drop-off", "接受收货"],
    "cg.st.cloture": ["Dépôts clôturés", "Drop-off closed", "已截止收货"],
    "cg.st.en_transit": ["En transit", "In transit", "运输中"],
    "cg.st.dedouanement": ["Dédouanement", "Customs clearance", "清关中"],
    "cg.st.arrive": ["Arrivé à Dakar", "Arrived in Dakar", "已到达达喀尔"],
    "cg.st.disponible": ["Disponible pour retrait", "Ready for pickup", "可提货"],
    "cg.res.eyebrow": ["Réservation", "Booking", "预订"],
    "cg.res.h": ["Demande d'expédition", "Shipping request", "发货申请"],
    "cg.res.p": ["Remplissez ce formulaire : vous recevez aussitôt une référence et les instructions pour déposer vos bagages chez CBF à Guangzhou.", "Fill in this form: you immediately get a reference and the instructions to drop off your luggage at CBF in Guangzhou.", "填写此表格后，您将立即获得预订编号以及在广州 CBF 交货的说明。"],
    "cg.f.depart": ["Départ souhaité", "Preferred departure", "选择批次"],
    "cg.f.prochain": ["Le prochain départ disponible", "The next available departure", "最近可用批次"],
    "cg.f.mode": ["Mode d'expédition", "Shipping mode", "运输方式"],
    "cg.f.nature": ["Nature des bagages / marchandises", "Type of luggage / goods", "货物种类"],
    "cg.f.nature.ph": ["Ex. vêtements, téléphones, pièces auto, traceurs GPS…", "E.g. clothes, phones, car parts, GPS trackers…", "例如：服装、手机、汽车配件、GPS 定位器…"],
    "cg.f.poids": ["Poids estimé (kg)", "Estimated weight (kg)", "预估重量（公斤）"],
    "cg.f.nb": ["Nombre de colis", "Number of parcels", "件数"],
    "cg.f.nom": ["Nom complet", "Full name", "姓名"],
    "cg.f.tel": ["Téléphone / WhatsApp", "Phone / WhatsApp", "电话 / WhatsApp"],
    "cg.f.ville": ["Ville de retrait au Sénégal (facultatif)", "Pickup city in Senegal (optional)", "塞内加尔提货城市（选填）"],
    "cg.f.msg": ["Précisions (facultatif)", "Details (optional)", "补充说明（选填）"],
    "cg.f.envoyer": ["Valider ma demande", "Send my request", "提交申请"],
    "cg.f.envoi": ["Envoi…", "Sending…", "发送中…"],
    "cg.f.cond": ["Aucun paiement maintenant. Le prix final est calculé sur le poids pesé à la réception de vos bagages à Guangzhou.", "No payment now. The final price is based on the weight measured when your luggage is received in Guangzhou.", "现在无需付款。最终运费以广州收货时称重为准。"],
    "cg.f.estim": ["Prix estimé : {x}", "Estimated price: {x}", "预计运费：{x}"],
    "cg.err.champs": ["Merci d'indiquer la nature des marchandises, un poids, votre nom et un numéro de téléphone valide.", "Please enter the type of goods, a weight, your name and a valid phone number.", "请填写货物种类、重量、姓名和有效电话号码。"],
    "cg.err.depart": ["Ce départ n'accepte plus de réservations. Choisissez-en un autre ou écrivez-nous sur WhatsApp.", "This departure no longer accepts bookings. Choose another one or message us on WhatsApp.", "该批次已停止预订，请选择其他批次或通过 WhatsApp 联系我们。"],
    "cg.err.gen": ["Impossible d'envoyer la demande pour le moment. Envoyez-la sur WhatsApp, nous vous répondons vite.", "We could not send the request right now. Send it on WhatsApp, we reply quickly.", "暂时无法提交申请，请通过 WhatsApp 发送，我们会尽快回复。"],
    "cg.err.wa": ["Envoyer ma demande sur WhatsApp", "Send my request on WhatsApp", "通过 WhatsApp 发送申请"],
    "cg.ok.h": ["Demande enregistrée ✓", "Request received ✓", "申请已提交 ✓"],
    "cg.ok.ref": ["Votre référence", "Your reference", "您的预订编号"],
    "cg.ok.recap": ["{m} · {k} kg estimés · environ {x}", "{m} · {k} kg estimated · about {x}", "{m} · 预估 {k} 公斤 · 约 {x}"],
    "cg.ok.etapes": ["Et maintenant ?", "What next?", "接下来怎么做？"],
    "cg.ok.e1": ["Confirmez votre demande sur WhatsApp avec votre référence.", "Confirm your request on WhatsApp with your reference.", "通过 WhatsApp 发送您的预订编号进行确认。"],
    "cg.ok.e2a": ["Déposez vos bagages chez CBF à Guangzhou : {a}", "Drop off your luggage at CBF in Guangzhou: {a}", "将货物送至广州 CBF：{a}"],
    "cg.ok.e2b": ["CBF vous envoie l'adresse de dépôt à Guangzhou sur WhatsApp.", "CBF sends you the drop-off address in Guangzhou on WhatsApp.", "CBF 将通过 WhatsApp 发送广州的收货地址。"],
    "cg.ok.limite": ["Date limite de dépôt : {d}.", "Drop-off deadline: {d}.", "截止收货日期：{d}。"],
    "cg.ok.e3": ["À la réception, vos bagages sont pesés et vous recevez votre code de suivi.", "On receipt, your luggage is weighed and you receive your tracking code.", "收货后将称重，并发给您包裹查询码。"],
    "cg.ok.wa": ["Confirmer sur WhatsApp", "Confirm on WhatsApp", "通过 WhatsApp 确认"],
    "cg.ok.autre": ["Faire une autre demande", "Make another request", "再提交一个申请"],
    "cg.wa.demande": ["Bonjour CBF Cargo, je confirme ma demande d'expédition {ref} : {m}, {k} kg estimés ({n}), départ : {d}. Nom : {nom}.", "Hello CBF Cargo, I confirm my shipping request {ref}: {m}, {k} kg estimated ({n}), departure: {d}. Name: {nom}.", "您好 CBF Cargo，我确认发货申请 {ref}：{m}，预估 {k} 公斤（{n}），批次：{d}。姓名：{nom}。"],
    "cg.wa.manuel": ["Bonjour CBF Cargo, je souhaite expédier : {n}, {k} kg estimés, mode {m}, départ : {d}. Nom : {nom}, tél : {tel}.", "Hello CBF Cargo, I would like to ship: {n}, {k} kg estimated, {m} mode, departure: {d}. Name: {nom}, phone: {tel}.", "您好 CBF Cargo，我想寄送：{n}，预估 {k} 公斤，{m}，批次：{d}。姓名：{nom}，电话：{tel}。"],
    "cg.wa.info": ["Bonjour CBF Cargo, je souhaite des informations sur l'expédition Chine → Sénégal.", "Hello CBF Cargo, I would like information about shipping China → Senegal.", "您好 CBF Cargo，我想了解中国到塞内加尔的货运信息。"],
    "cg.wa.colis": ["Bonjour CBF Cargo, j'ai une question sur mon colis {c}.", "Hello CBF Cargo, I have a question about my parcel {c}.", "您好 CBF Cargo，我想咨询我的包裹 {c}。"],
    "cg.wa.produit": ["Bonjour CBF Cargo, je souhaite commander : {n}.", "Hello CBF Cargo, I would like to order: {n}.", "您好 CBF Cargo，我想订购：{n}。"],
    "cg.suivi.eyebrow": ["Suivi de colis", "Parcel tracking", "包裹查询"],
    "cg.suivi.h": ["Où est mon colis ?", "Where is my parcel?", "我的包裹在哪里？"],
    "cg.suivi.p": ["Entrez votre code de suivi (ex. CBF-7K3M-Q9XA) ou le numéro de téléphone donné au dépôt.", "Enter your tracking code (e.g. CBF-7K3M-Q9XA) or the phone number given at drop-off.", "请输入包裹查询码（例如 CBF-7K3M-Q9XA）或交货时登记的电话号码。"],
    "cg.suivi.ph": ["Code de suivi ou téléphone", "Tracking code or phone", "查询码或电话号码"],
    "cg.suivi.btn": ["Suivre", "Track", "查询"],
    "cg.suivi.charge": ["Recherche…", "Searching…", "查询中…"],
    "cg.suivi.court": ["Entrez un code de suivi complet ou un numéro de téléphone (9 chiffres au moins).", "Enter a full tracking code or a phone number (at least 9 digits).", "请输入完整查询码或电话号码（至少 9 位数字）。"],
    "cg.suivi.rien": ["Aucun colis trouvé. Vérifiez le code, ou écrivez-nous sur WhatsApp.", "No parcel found. Check the code, or message us on WhatsApp.", "未找到包裹。请核对查询码，或通过 WhatsApp 联系我们。"],
    "cg.suivi.err": ["Le suivi est momentanément indisponible. Réessayez dans un instant ou écrivez-nous sur WhatsApp.", "Tracking is temporarily unavailable. Try again shortly or message us on WhatsApp.", "查询暂时不可用，请稍后再试或通过 WhatsApp 联系我们。"],
    "cg.suivi.plusieurs": ["{n} colis trouvés pour ce numéro", "{n} parcels found for this number", "该号码共找到 {n} 个包裹"],
    "cg.suivi.dans": ["Votre colis arrivera dans {n} jours", "Your parcel will arrive in {n} days", "您的包裹将在 {n} 天后到达"],
    "cg.suivi.dans1": ["Votre colis arrivera demain", "Your parcel will arrive tomorrow", "您的包裹将于明天到达"],
    "cg.suivi.dans0": ["Arrivée prévue aujourd'hui", "Arrival expected today", "预计今天到达"],
    "cg.suivi.imminent": ["Arrivée imminente : le suivi sera mis à jour très bientôt", "Arrival imminent: tracking will be updated very soon", "即将到达，查询信息将很快更新"],
    "cg.suivi.prevue": ["Arrivée prévue le {d}", "Expected arrival on {d}", "预计到达日期：{d}"],
    "cg.suivi.attente": ["Votre colis partira avec le prochain convoi", "Your parcel will leave with the next shipment", "您的包裹将随下一批次发出"],
    "cg.suivi.departle": ["Départ prévu le {d}", "Departure planned on {d}", "预计发货日期：{d}"],
    "cg.suivi.arrive": ["Votre colis est arrivé au Sénégal", "Your parcel has arrived in Senegal", "您的包裹已到达塞内加尔"],
    "cg.suivi.dispo": ["Votre colis vous attend : vous pouvez venir le retirer", "Your parcel is waiting for you: you can come and pick it up", "您的包裹已可提取，欢迎前来提货"],
    "cg.suivi.retire": ["Colis retiré. Merci de votre confiance !", "Parcel picked up. Thank you for your trust!", "包裹已提取，感谢您的信任！"],
    "cg.suivi.colis": ["{n} colis · {k} kg", "{n} parcel(s) · {k} kg", "{n} 件 · {k} 公斤"],
    "cg.suivi.question": ["Une question sur ce colis ?", "A question about this parcel?", "对该包裹有疑问？"],
    "cg.et.depot_valide": ["Dépôt validé", "Drop-off confirmed", "已收货"],
    "cg.et.en_transit": ["En transit", "In transit", "运输中"],
    "cg.et.dedouanement": ["Dédouanement", "Customs clearance", "清关中"],
    "cg.et.arrive": ["Arrivé au Sénégal", "Arrived in Senegal", "已到达塞内加尔"],
    "cg.et.disponible": ["Prêt pour retrait", "Ready for pickup", "可提货"],
    "cg.et.retire": ["Retiré", "Picked up", "已提货"],
    "cg.prod.eyebrow": ["Arrivages", "New arrivals", "新到货"],
    "cg.prod.h": ["Produits importés disponibles", "Imported products available", "现货进口商品"],
    "cg.prod.commander": ["Commander sur WhatsApp", "Order on WhatsApp", "WhatsApp 订购"],
    "cg.prod.epuise": ["Épuisé", "Sold out", "已售罄"],
    "cg.how.h": ["Comment ça marche ?", "How does it work?", "流程说明"],
    "cg.how1.t": ["Vous réservez", "You book", "在线预订"], "cg.how1.p": ["Choisissez un départ et un mode, envoyez votre demande.", "Choose a departure and a mode, send your request.", "选择批次和运输方式，提交申请。"],
    "cg.how2.t": ["Vous déposez à Guangzhou", "You drop off in Guangzhou", "广州交货"], "cg.how2.p": ["CBF pèse vos bagages et vous donne votre code de suivi.", "CBF weighs your luggage and gives you your tracking code.", "CBF 称重并发给您查询码。"],
    "cg.how3.t": ["Vous suivez en direct", "You track it live", "实时跟踪"], "cg.how3.p": ["Transit, dédouanement, arrivée : chaque étape apparaît dans le suivi.", "Transit, customs, arrival: every step shows in the tracking.", "运输、清关、到达，每一步都可查询。"],
    "cg.how4.t": ["Vous retirez au Sénégal", "You pick up in Senegal", "塞内加尔提货"], "cg.how4.p": ["Nous vous prévenons dès que votre colis est disponible.", "We let you know as soon as your parcel is ready.", "包裹可提取时我们会立即通知您。"],
    "cg.contact": ["Service Cargo sur WhatsApp : {w}", "Cargo service on WhatsApp: {w}", "货运客服 WhatsApp：{w}"],
    "home.track.h": ["Suivre mon colis", "Track my parcel", "查询我的包裹"],
    "home.track.p": ["Cheikh Baye Fall Cargo · Guangzhou → Sénégal", "Cheikh Baye Fall Cargo · Guangzhou → Senegal", "Cheikh Baye Fall Cargo · 广州 → 塞内加尔"],
    "home.cargo.eyebrow": ["Nouveau : Cheikh Baye Fall Cargo", "New: Cheikh Baye Fall Cargo", "全新：Cheikh Baye Fall Cargo"],
    "home.cargo.h": ["Envoyez vos colis de Chine au Sénégal", "Send your parcels from China to Senegal", "将您的包裹从中国寄往塞内加尔"],
    "home.cargo.p": ["Fret Standard ou Express au kilo, réservation en ligne et suivi de colis en temps réel.", "Standard or Express freight by the kilo, online booking and real-time parcel tracking.", "按公斤计费的标准或快速货运，在线预订，实时查询包裹。"],
    "home.cargo.btn": ["Découvrir le service Cargo", "Discover the Cargo service", "了解货运服务"]
  };

  // ---------- Valeurs des véhicules (carburant, couleur, état…) ----------
  const TERMES = {
    "Neuf": ["New", "全新"], "Occasion": ["Used", "二手"],
    "Tracteur agricole": ["Farm tractor", "农用拖拉机"], "Tracteur agricole 140–150 ch": ["Farm tractor 140–150 hp", "农用拖拉机 140–150 马力"],
    "Cylindres": ["Cylinders", "气缸数"], "4 ou 6 (selon la version)": ["4 or 6 (depending on version)", "4缸或6缸（视版本而定）"],
    "SUV / 4x4": ["SUV / 4x4", "SUV / 四驱"], "Berline": ["Sedan", "轿车"], "Pick-up": ["Pick-up", "皮卡"], "Monospace": ["MPV", "MPV"],
    "Essence": ["Petrol", "汽油"], "Diesel": ["Diesel", "柴油"], "Hybride": ["Hybrid", "混合动力"],
    "Hybride rechargeable": ["Plug-in hybrid", "插电式混合动力"], "Électrique": ["Electric", "纯电动"],
    "Automatique": ["Automatic", "自动"], "Manuelle": ["Manual", "手动"],
    "Noir": ["Black", "黑色"], "Blanc": ["White", "白色"], "Gris": ["Grey", "灰色"], "Gris foncé": ["Dark grey", "深灰色"],
    "Bleu": ["Blue", "蓝色"], "Bleu clair": ["Light blue", "浅蓝色"], "Rouge": ["Red", "红色"], "Vert": ["Green", "绿色"],
    "Vert foncé": ["Dark green", "深绿色"], "Orange": ["Orange", "橙色"], "Orange cuivré": ["Copper orange", "铜橙色"],
    "Jaune": ["Yellow", "黄色"], "Marron": ["Brown", "棕色"], "Argent": ["Silver", "银色"], "Beige": ["Beige", "米色"],
    "Places": ["Seats", "座位数"], "Transmission intégrale": ["All-wheel drive", "四轮驱动"],
    "Capacité": ["Capacity", "载重/容量"], "Poids": ["Weight", "重量"],
    "Chine": ["China", "中国"], "Sénégal": ["Senegal", "塞内加尔"],
    "Prix une fois arrivé au Port autonome de Dakar": ["Price once delivered at the Port Autonome de Dakar", "到达达喀尔自治港后的价格"]
  };
  // anciennes données : on garde les mots tels quels s'ils n'ont pas de traduction

  function t(cle, vars) {
    const e = D[cle];
    let s = e ? (e[IDX[lang]] || e[0]) : cle;
    const v = Object.assign({ wa: S.whatsappAffiche, nom: S.nom, slogan: D.slogan[IDX[lang]], h: D.hours[IDX[lang]] }, vars || {});
    return s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m));
  }
  const tv = x => {
    if (x === undefined || x === null || lang === "fr") return x;
    const e = TERMES[x];
    return e ? e[lang === "en" ? 0 : 1] : x;
  };
  // puissance : "1.5T hybride" -> "1.5T hybrid"
  const tp = p => (!p || lang === "fr") ? p : String(p).replace(/hybride/gi, lang === "en" ? "hybrid" : "混动").replace(/ ch\b/g, lang === "en" ? " hp" : " 马力");
  window.t = t; window.tv = tv; window.tp = tp;

  // ---------- Rubriques ----------
  const RUB = {
    "voitures-neuves": [["New cars", "New cars, straight from China."], ["新车", "新车，直接来自中国。"]],
    "voitures-occasion": [["Used cars", "Checked used cars, real photos and mileage."], ["二手车", "经过检查的二手车，真实照片与里程。"]],
    moteurs: [["Engines", "Engines and mechanical parts."], ["发动机", "发动机及机械配件。"]],
    tracteurs: [["Tractors", "Tractors and farm equipment."], ["拖拉机", "拖拉机及农业机械。"]],
    camions: [["Trucks", "Trucks and transport vehicles."], ["卡车", "卡车及运输车辆。"]],
    machines: [["Industrial machinery", "Equipment and machines for industry."], ["工业机械", "工业设备与机械。"]],
    arachides: [["Peanut shellers", "Shelling machines for peanuts."], ["花生脱壳机", "花生脱壳加工机械。"]]
  };
  window.rubNom = r => (lang === "fr" || !RUB[r.cle]) ? r.nom : RUB[r.cle][lang === "en" ? 0 : 1][0];
  window.rubTexte = r => (lang === "fr" || !RUB[r.cle]) ? r.texte : RUB[r.cle][lang === "en" ? 0 : 1][1];

  // ---------- Formats de nombres ----------
  const LOC = { fr: "fr-FR", en: "en-US", zh: "zh-CN" }[lang];
  window.fmtNombre = n => new Intl.NumberFormat(LOC).format(n).replace(/[  ]/g, " ");

  // ---------- Monnaie : FCFA (français), dollars US (anglais), yuan RMB (chinois) ----------
  const TAUX = Object.assign({ en: 584.5, zh: 87.8 }, S.taux || {});
  const SYMB = { en: "$", zh: "¥" };
  // montant converti, arrondi à la centaine : 13 000 000 FCFA -> 22 200 $
  const convertir = n => Math.round(n / TAUX[lang] / 100) * 100;
  const montant = n => lang === "fr" ? fmtNombre(n) + " " + S.devise : SYMB[lang] + fmtNombre(convertir(n));
  window.fmtPrixCFA = n => fmtNombre(n) + " " + S.devise;
  window.fmtPrixAffiche = n => lang === "fr" ? fmtPrixCFA(n) : (lang === "en" ? "≈ " : "约 ") + montant(n);
  // libellés du filtre de budget dans la monnaie de la langue
  if (lang !== "fr") {
    const m = montant, b = [6000000, 8000000, 10000000];
    if (lang === "en") {
      D["budget.1"][1] = "Under " + m(b[0]);
      D["budget.2"][1] = m(b[0]) + " to " + m(b[1]);
      D["budget.3"][1] = m(b[1]) + " to " + m(b[2]);
      D["budget.4"][1] = "Over " + m(b[2]);
    } else {
      D["budget.1"][2] = m(b[0]) + " 以下";
      D["budget.2"][2] = m(b[0]) + " – " + m(b[1]);
      D["budget.3"][2] = m(b[1]) + " – " + m(b[2]);
      D["budget.4"][2] = m(b[2]) + " 以上";
    }
  }

  // ---------- Description d'un véhicule dans la langue choisie ----------
  window.descDe = v => {
    const d = window.DESCRIPTIONS && window.DESCRIPTIONS[v.id];
    return (lang !== "fr" && d && d[lang]) ? d[lang] : v.description;
  };

  // ---------- Applique les textes du HTML ----------
  const pageNom = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
  document.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-ph]").forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-aria]").forEach(e => { e.setAttribute("aria-label", t(e.dataset.i18nAria)); });
  const cleTitre = "title." + (pageNom === "vehicule" ? "fiche" : pageNom);
  if (D[cleTitre]) document.title = t(cleTitre);

  // ---------- Sélecteur de langue (créé par main.js) ----------
  window.selecteurLangue = function () {
    const box = document.createElement("div");
    box.className = "langues";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", t("lang.label"));
    box.innerHTML = LANGUES.map(l => '<button type="button" data-l="' + l[0] + '"' + (l[0] === lang ? ' class="actif" aria-pressed="true"' : ' aria-pressed="false"') + ">" + l[1] + "</button>").join("");
    box.addEventListener("click", e => {
      const b = e.target.closest("button[data-l]");
      if (!b || b.dataset.l === lang) return;
      try { localStorage.setItem("cbf-lang", b.dataset.l); } catch (x) {}
      const u = new URL(location.href);
      u.searchParams.set("lang", b.dataset.l);
      location.href = u.toString();
    });
    return box;
  };
})();
