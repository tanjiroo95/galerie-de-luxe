// "Studio photo" : détoure le produit avec une IA qui tourne dans le navigateur (aucune photo n'est envoyée en ligne),
// puis le replace sur un fond de studio propre, centré, avec une ombre douce et de légères corrections de lumière.
const LIB = "https://esm.sh/@imgly/background-removal@1.4.5";
const W = 1200, H = 1500; // format 4:5, comme la vitrine

let libPromise;
const loadLib = () => (libPromise ||= import(LIB).catch((e) => { libPromise = null; throw e; }));

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(img.src); resolve(img); };
    img.onerror = () => reject(new Error("Impossible de lire l'image."));
    img.src = URL.createObjectURL(blob);
  });
}

// Rectangle qui contient le produit (pixels non transparents)
function boundingBox(img) {
  const k = Math.min(1, 600 / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * k)), h = Math.max(1, Math.round(img.height * k));
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) return null;
  return { x: x0 / k, y: y0 / k, w: (x1 - x0 + 1) / k, h: (y1 - y0 + 1) / k };
}

// Filtre max (dilatation) ou min (érosion) séparable, de rayon r, sur un masque 0-255
function filterMask(a, w, h, r, max) {
  const pick = max ? Math.max : Math.min;
  const tmp = new Uint8Array(a.length), out = new Uint8Array(a.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = a[y * w + x];
    for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) v = pick(v, a[y * w + k]);
    tmp[y * w + x] = v;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = tmp[y * w + x];
    for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) v = pick(v, tmp[k * w + x]);
    out[y * w + x] = v;
  }
  return out;
}

// L'IA ne garde que le contour du produit : on reprend les pixels de la photo d'origine et on protège
// tout ce qui est coloré (intérieur des chaussures, semelle, matière) pour ne rien effacer à l'intérieur.
async function buildSubject(origBlob, cutBlob) {
  const [orig, cut] = await Promise.all([loadImage(origBlob), loadImage(cutBlob)]);
  const k = Math.min(1, 1600 / Math.max(orig.width, orig.height));
  const w = Math.round(orig.width * k), h = Math.round(orig.height * k);
  const read = (img) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    return { c, ctx, px: ctx.getImageData(0, 0, w, h) };
  };
  const o = read(orig), ai = read(cut);
  const colored = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = o.px.data[i * 4], g = o.px.data[i * 4 + 1], b = o.px.data[i * 4 + 2];
    const chroma = Math.max(r, g, b) - Math.min(r, g, b); // le fond de studio est gris : peu de couleur
    colored[i] = Math.max(0, Math.min(1, (chroma - 18) / 10)) * 255;
  }
  const closed = filterMask(filterMask(colored, w, h, 2, true), w, h, 2, false);
  for (let i = 0; i < w * h; i++) o.px.data[i * 4 + 3] = Math.max(ai.px.data[i * 4 + 3], closed[i]);
  o.ctx.putImageData(o.px, 0, 0);
  return o.c;
}

async function compose(img) {
  const box = boundingBox(img);
  if (!box) throw new Error("Aucun produit détecté sur cette photo.");

  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // fond de studio : blanc pur
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // produit centré, marges confortables
  const scale = Math.min((W * 0.78) / box.w, (H * 0.66) / box.h);
  const dw = box.w * scale, dh = box.h * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2 - H * 0.02;

  // ombre douce sous le produit
  ctx.save();
  ctx.filter = "blur(22px)";
  ctx.fillStyle = "rgba(40,30,20,0.16)";
  ctx.beginPath();
  ctx.ellipse(W / 2, dy + dh + 6, dw * 0.42, Math.max(10, dh * 0.035), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // produit, avec un léger coup d'éclat
  ctx.filter = "contrast(1.06) saturate(1.08) brightness(1.03)";
  ctx.drawImage(img, box.x, box.y, box.w, box.h, dx, dy, dw, dh);
  ctx.filter = "none";

  return c.toDataURL("image/jpeg", 0.9);
}

// file : fichier image ; onStatus(texte) : message de progression. Retourne une image (data URL JPEG).
window.makeProfessional = async function (file, onStatus = () => {}) {
  onStatus("Chargement de l'IA… (la première fois, cela peut prendre une à deux minutes)");
  const lib = await loadLib();
  const cut = await lib.removeBackground(file, {
    output: { format: "image/png" },
    progress: (key, current, total) => {
      if (String(key).startsWith("fetch") && total) onStatus(`Téléchargement de l'IA… ${Math.round((current / total) * 100)} %`);
      else onStatus("L'IA détoure le produit…");
    },
  });
  onStatus("Mise en page du studio…");
  return compose(await buildSubject(file, cut));
};
