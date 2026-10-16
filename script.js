const PRODUCTS = window.PRODUCTS || [];

/* ---------- traductions ---------- */
const I18N = {
  fr: {
    title: "Galerie de Luxe Tétouan",
    desc: "Galerie de Luxe à Tétouan : découvrez notre sélection de chaussures et de sacs de luxe pour femme.",
    city: "Tétouan",
    nav_collection: "Collection", nav_about: "La Boutique", nav_contact: "Contact",
    hero_eyebrow: "Nouvelle collection",
    hero_title: "Galerie<br><em>de Luxe</em>",
    hero_lead: "Une sélection choisie avec soin pour femme, disponible en boutique à Tétouan.",
    hero_cta: "Découvrir la collection",
    strip1: "Collection femme", strip2: "Tétouan · Maroc", strip3: "Disponible en boutique",
    coll_eyebrow: "Notre sélection", coll_title: "La Collection",
    all: "Tout", empty: "Les articles arrivent bientôt.",
    about_eyebrow: "La Boutique", about_title: "Le luxe, près de chez vous",
    about_text: "Galerie de Luxe est une boutique située à Tétouan, dédiée aux femmes qui aiment les belles pièces : ballerines, baskets, espadrilles et sacs. Venez découvrir toute la sélection en boutique et essayer les modèles qui vous plaisent.",
    v1_t: "Sélection", v1_d: "Des modèles choisis pour leur style et leur confort.",
    v2_t: "Choix", v2_d: "Ballerines, baskets, espadrilles et sacs réunis au même endroit.",
    v3_t: "Accueil", v3_d: "Un conseil personnalisé, directement en boutique.",
    contact_eyebrow: "Nous trouver", contact_title: "Contact",
    addr_t: "Adresse", addr_text: "Galerie de Luxe<br>Av. Sidi Mohamed Al Kharaz<br>Tétouan, Maroc",
    phone_t: "Téléphone", btn_call: "Appeler", btn_route: "Itinéraire",
    wa_msg: "Bonjour, je voudrais des informations sur vos articles.",
    footer: "© {y} Galerie de Luxe Tétouan · Tous droits réservés", admin: "Administration",
    cats: { Espadrilles: "Espadrilles", Sacs: "Sacs", Ballerines: "Ballerines", Baskets: "Baskets" },
  },
  ar: {
    title: "غاليري دو لوكس تطوان",
    desc: "غاليري دو لوكس في تطوان: اكتشفي تشكيلتنا من الأحذية والحقائب الفاخرة للنساء.",
    city: "تطوان",
    nav_collection: "التشكيلة", nav_about: "عن المتجر", nav_contact: "اتصل بنا",
    hero_eyebrow: "تشكيلة جديدة",
    hero_title: "غاليري<br><em>دو لوكس</em>",
    hero_lead: "تشكيلة مختارة بعناية للنساء، متوفرة في متجرنا بتطوان.",
    hero_cta: "اكتشفي التشكيلة",
    strip1: "تشكيلة نسائية", strip2: "تطوان · المغرب", strip3: "متوفر في المتجر",
    coll_eyebrow: "اختيارنا لكِ", coll_title: "التشكيلة",
    all: "الكل", empty: "المنتجات قادمة قريباً.",
    about_eyebrow: "عن المتجر", about_title: "الفخامة قريبة منكِ",
    about_text: "غاليري دو لوكس متجر في تطوان مخصص للنساء اللواتي يعشقن القطع الجميلة: أحذية باليرينا، أحذية رياضية، إسبادريل وحقائب. تعالي لاكتشاف التشكيلة كاملة في المتجر وجرّبي الموديلات التي تعجبكِ.",
    v1_t: "اختيار دقيق", v1_d: "موديلات مختارة لأناقتها وراحتها.",
    v2_t: "تنوّع", v2_d: "أحذية باليرينا وأحذية رياضية وإسبادريل وحقائب في مكان واحد.",
    v3_t: "استقبال", v3_d: "نصائح شخصية مباشرة في المتجر.",
    contact_eyebrow: "كيف تجدوننا", contact_title: "اتصل بنا",
    addr_t: "العنوان", addr_text: "غاليري دو لوكس<br>شارع سيدي محمد الخراز<br>تطوان، المغرب",
    phone_t: "الهاتف", btn_call: "اتصال", btn_route: "الاتجاهات",
    wa_msg: "مرحباً، أودّ الحصول على معلومات حول منتجاتكم.",
    footer: "© {y} غاليري دو لوكس تطوان · جميع الحقوق محفوظة", admin: "الإدارة",
    cats: { Espadrilles: "إسبادريل", Sacs: "حقائب", Ballerines: "أحذية باليرينا", Baskets: "أحذية رياضية" },
  },
  en: {
    title: "Galerie de Luxe Tetouan",
    desc: "Galerie de Luxe in Tetouan: discover our selection of luxury shoes and bags for women.",
    city: "Tetouan",
    nav_collection: "Collection", nav_about: "The Boutique", nav_contact: "Contact",
    hero_eyebrow: "New collection",
    hero_title: "Galerie<br><em>de Luxe</em>",
    hero_lead: "A carefully chosen selection for women, available in our boutique in Tetouan.",
    hero_cta: "Discover the collection",
    strip1: "Women's collection", strip2: "Tetouan · Morocco", strip3: "Available in store",
    coll_eyebrow: "Our selection", coll_title: "The Collection",
    all: "All", empty: "New items are coming soon.",
    about_eyebrow: "The Boutique", about_title: "Luxury, close to home",
    about_text: "Galerie de Luxe is a boutique in Tetouan for women who love beautiful pieces: ballet flats, sneakers, espadrilles and bags. Come and see the whole selection in store and try on the styles you like.",
    v1_t: "Selection", v1_d: "Styles chosen for their look and comfort.",
    v2_t: "Choice", v2_d: "Ballet flats, sneakers, espadrilles and bags all in one place.",
    v3_t: "Welcome", v3_d: "Personal advice, right in the boutique.",
    contact_eyebrow: "Find us", contact_title: "Contact",
    addr_t: "Address", addr_text: "Galerie de Luxe<br>Av. Sidi Mohamed Al Kharaz<br>Tetouan, Morocco",
    phone_t: "Phone", btn_call: "Call", btn_route: "Directions",
    wa_msg: "Hello, I would like some information about your items.",
    footer: "© {y} Galerie de Luxe Tetouan · All rights reserved", admin: "Admin",
    cats: { Espadrilles: "Espadrilles", Sacs: "Bags", Ballerines: "Ballet flats", Baskets: "Sneakers" },
  },
};

let lang = "fr";
try { lang = localStorage.getItem("lang"); } catch (e) {}
if (!I18N[lang]) {
  const nav = (navigator.language || "fr").slice(0, 2);
  lang = I18N[nav] ? nav : "fr";
}
let currentCat = "Tout"; // clé interne (français) de la catégorie affichée
let shown = [];          // articles actuellement affichés (pour la visionneuse)

const t = (k) => I18N[lang][k];
const productName = (p) => p["name_" + lang] || p.name;
function catLabel(cat) {
  const own = PRODUCTS.find((p) => p.cat === cat && p["cat_" + lang]);
  return (own && own["cat_" + lang]) || I18N[lang].cats[cat] || cat;
}

/* ---------- apparition au défilement ---------- */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 })
  : null;
const reveal = (el) => (io ? io.observe(el) : el.classList.add("in"));

/* ---------- affichage ---------- */
const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox.querySelector("img");
const lbCaption = document.getElementById("lb-caption");
let lbIndex = 0;

function openLightbox(i) {
  lbIndex = (i + shown.length) % shown.length;
  const p = shown[lbIndex];
  lbImg.src = "images/" + p.images[0];
  lbImg.alt = productName(p);
  lbCaption.textContent = productName(p);
  lightbox.hidden = false;
}

function render() {
  grid.innerHTML = "";
  if (!PRODUCTS.length) { grid.innerHTML = `<p class="empty">${t("empty")}</p>`; return; }
  shown = PRODUCTS.filter((p) => currentCat === "Tout" || p.cat === currentCat);
  shown.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "card";

    const photo = document.createElement("div");
    photo.className = "photo";
    const img = document.createElement("img");
    img.src = "images/" + p.images[0];
    img.alt = productName(p);
    img.loading = "lazy";
    photo.appendChild(img);
    photo.addEventListener("click", () => openLightbox(i));

    const category = document.createElement("span");
    category.className = "cat";
    category.textContent = catLabel(p.cat);
    const title = document.createElement("h3");
    title.textContent = productName(p);

    card.append(photo, category, title);
    grid.appendChild(card);
    reveal(card);
  });
}

function renderFilters() {
  filters.innerHTML = "";
  ["Tout", ...new Set(PRODUCTS.map((p) => p.cat))].forEach((c) => {
    const b = document.createElement("button");
    b.textContent = c === "Tout" ? t("all") : catLabel(c);
    if (c === currentCat) b.classList.add("active");
    b.addEventListener("click", () => { currentCat = c; renderFilters(); render(); });
    filters.appendChild(b);
  });
}

function applyLang() {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = t("title");
  document.querySelector('meta[name="description"]').content = t("desc");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = t(el.dataset.i18n);
    el.innerHTML = el.dataset.i18n === "footer" ? v.replace("{y}", new Date().getFullYear()) : v;
  });
  const wa = "https://wa.me/212639744695?text=" + encodeURIComponent(t("wa_msg"));
  document.getElementById("wa").href = wa;
  document.getElementById("fab").href = wa;
  document.querySelectorAll(".lang button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  renderFilters();
  render();
}

document.querySelectorAll(".lang button").forEach((b) =>
  b.addEventListener("click", () => {
    lang = b.dataset.lang;
    try { localStorage.setItem("lang", lang); } catch (e) {}
    applyLang();
  })
);

/* ---------- visionneuse ---------- */
const closeLightbox = () => (lightbox.hidden = true);
lightbox.addEventListener("click", closeLightbox);
lightbox.querySelector(".lb-prev").addEventListener("click", (e) => { e.stopPropagation(); openLightbox(lbIndex - 1); });
lightbox.querySelector(".lb-next").addEventListener("click", (e) => { e.stopPropagation(); openLightbox(lbIndex + 1); });
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  const step = document.documentElement.dir === "rtl" ? -1 : 1;
  if (e.key === "ArrowRight") openLightbox(lbIndex + step);
  if (e.key === "ArrowLeft") openLightbox(lbIndex - step);
});

/* ---------- en-tête et apparitions ---------- */
const navBar = document.querySelector(".nav");
const onScroll = () => navBar.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
document.querySelectorAll(".reveal").forEach(reveal);

applyLang();
