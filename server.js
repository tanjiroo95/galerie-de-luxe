// Serveur de la vitrine Galerie de Luxe : sert le site et gère l'administration (aucune dépendance à installer).
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
// STORAGE_DIR : dossier persistant (disque de l'hébergeur) pour les photos et les données. Par défaut : ce dossier.
const STORAGE = process.env.STORAGE_DIR ? path.resolve(process.env.STORAGE_DIR) : ROOT;
const DATA = path.join(STORAGE, "data");
const IMAGES = path.join(STORAGE, "images");
const PORT = process.env.PORT || 3000;
const MAX_BODY = 25 * 1024 * 1024;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};
const PRIVATE = new Set(["server.js", "start.bat", "package.json", "render.yaml", "DEPLOY.md", ".gitignore"]);

/* ---------- premier démarrage : copie des articles de départ vers le stockage ---------- */
if (STORAGE !== ROOT) {
  for (const dir of ["data", "images"]) {
    const target = path.join(STORAGE, dir);
    if (fs.existsSync(target)) continue;
    fs.mkdirSync(target, { recursive: true });
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (f !== "admin.json") fs.copyFileSync(path.join(ROOT, dir, f), path.join(target, f));
    }
  }
}
fs.mkdirSync(IMAGES, { recursive: true });
fs.mkdirSync(DATA, { recursive: true });

/* ---------- données ---------- */
const productsFile = path.join(DATA, "products.json");
const adminFile = path.join(DATA, "admin.json");

const readProducts = () => JSON.parse(fs.readFileSync(productsFile, "utf8"));
function writeProducts(list) {
  fs.writeFileSync(productsFile, JSON.stringify(list, null, 2));
  fs.writeFileSync(path.join(DATA, "products.js"), "window.PRODUCTS = " + JSON.stringify(list) + ";\n");
}
const readAdmin = () => (fs.existsSync(adminFile) ? JSON.parse(fs.readFileSync(adminFile, "utf8")) : null);

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString("hex") };
}
function checkPassword(password) {
  const admin = readAdmin();
  if (!admin) return false;
  const a = Buffer.from(hashPassword(password, admin.salt).hash, "hex");
  return crypto.timingSafeEqual(a, Buffer.from(admin.hash, "hex"));
}

function saveImage(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) throw new Error("Image non valide (formats acceptés : JPG, PNG, WebP).");
  const name = crypto.randomBytes(8).toString("hex") + "." + (m[1] === "jpeg" ? "jpg" : m[1]);
  fs.writeFileSync(path.join(IMAGES, name), Buffer.from(m[2], "base64"));
  return name;
}
function deleteImage(name) {
  // seulement des noms simples, jamais de chemin
  if (path.basename(name) === name) fs.rm(path.join(IMAGES, name), { force: true }, () => {});
}

/* ---------- sessions ---------- */
const sessions = new Map();
const failures = new Map();
const cookieOf = (req) => (/(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || "") || [])[1];
const loggedIn = (req) => {
  const exp = sessions.get(cookieOf(req));
  return Boolean(exp && exp > Date.now());
};
function startSession(req, res) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + 8 * 3600 * 1000);
  const secure = req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure}`);
}

/* ---------- utilitaires HTTP ---------- */
function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-cache" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error("Fichier trop volumineux.")); req.destroy(); }
      else chunks.push(c);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || "{}")); }
      catch { reject(new Error("Requête invalide.")); }
    });
  });
}
const clean = (s, max) => String(s || "").replace(/\s+/g, " ").trim().slice(0, max);
// traductions facultatives (arabe / anglais) du nom et de la catégorie ; une valeur vide les retire
const translations = (b) => {
  const out = {};
  for (const k of ["name_ar", "name_en", "cat_ar", "cat_en"]) {
    const v = clean(b[k], k.startsWith("name") ? 80 : 40);
    if (v) out[k] = v;
  }
  return out;
};

/* ---------- API ---------- */
async function api(req, res, url) {
  const route = url.pathname;

  if (req.method === "GET" && route === "/api/status")
    return send(res, 200, { configured: Boolean(readAdmin()), loggedIn: loggedIn(req) });

  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "DELETE")
    return send(res, 405, { error: "Méthode non autorisée." });
  if (!/^application\/json/.test(req.headers["content-type"] || "") && req.method !== "DELETE")
    return send(res, 415, { error: "Requête invalide." });

  if (route === "/api/setup") {
    if (readAdmin()) return send(res, 403, { error: "Le mot de passe est déjà défini." });
    const { password } = await readBody(req);
    if (!password || password.length < 6) return send(res, 400, { error: "Choisissez un mot de passe d'au moins 6 caractères." });
    fs.writeFileSync(adminFile, JSON.stringify(hashPassword(password)));
    startSession(req, res);
    return send(res, 200, { ok: true });
  }

  if (route === "/api/login") {
    const ip = req.socket.remoteAddress;
    const f = failures.get(ip) || { n: 0, until: 0 };
    if (f.until > Date.now()) return send(res, 429, { error: "Trop d'essais. Réessayez dans quelques minutes." });
    const { password } = await readBody(req);
    if (!checkPassword(String(password || ""))) {
      f.n += 1;
      if (f.n >= 5) { f.n = 0; f.until = Date.now() + 10 * 60 * 1000; }
      failures.set(ip, f);
      return send(res, 401, { error: "Mot de passe incorrect." });
    }
    failures.delete(ip);
    startSession(req, res);
    return send(res, 200, { ok: true });
  }

  if (route === "/api/logout") {
    sessions.delete(cookieOf(req));
    res.setHeader("Set-Cookie", "sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
    return send(res, 200, { ok: true });
  }

  if (!loggedIn(req)) return send(res, 401, { error: "Veuillez vous connecter." });

  if (route === "/api/products" && req.method === "POST") {
    const b = await readBody(req);
    const name = clean(b.name, 80), cat = clean(b.cat, 40);
    if (!name || !cat) return send(res, 400, { error: "Le nom et la catégorie sont obligatoires." });
    if (!Array.isArray(b.addImages) || !b.addImages.length) return send(res, 400, { error: "Ajoutez au moins une photo." });
    const images = [];
    try { b.addImages.slice(0, 8).forEach((d) => images.push(saveImage(d))); }
    catch (e) { images.forEach(deleteImage); return send(res, 400, { error: e.message }); }
    const list = readProducts();
    list.unshift({ id: "p" + Date.now().toString(36), name, cat, ...translations(b), images });
    writeProducts(list);
    return send(res, 200, { ok: true });
  }

  const m = /^\/api\/products\/([\w-]+)$/.exec(route);
  if (m) {
    const list = readProducts();
    const idx = list.findIndex((p) => p.id === m[1]);
    if (idx < 0) return send(res, 404, { error: "Article introuvable." });
    const p = list[idx];

    if (req.method === "DELETE") {
      p.images.forEach(deleteImage);
      list.splice(idx, 1);
      writeProducts(list);
      return send(res, 200, { ok: true });
    }
    if (req.method === "PUT") {
      const b = await readBody(req);
      const name = clean(b.name, 80), cat = clean(b.cat, 40);
      if (!name || !cat) return send(res, 400, { error: "Le nom et la catégorie sont obligatoires." });
      const remove = (Array.isArray(b.removeImages) ? b.removeImages : []).filter((n) => p.images.includes(n));
      const added = [];
      try { (Array.isArray(b.addImages) ? b.addImages : []).slice(0, 8).forEach((d) => added.push(saveImage(d))); }
      catch (e) { added.forEach(deleteImage); return send(res, 400, { error: e.message }); }
      const images = p.images.filter((n) => !remove.includes(n)).concat(added);
      if (!images.length) { added.forEach(deleteImage); return send(res, 400, { error: "Un article doit garder au moins une photo." }); }
      remove.forEach(deleteImage);
      const base = { ...p };
      for (const k of ["name_ar", "name_en", "cat_ar", "cat_en"]) delete base[k];
      list[idx] = { ...base, name, cat, ...translations(b), images };
      writeProducts(list);
      return send(res, 200, { ok: true });
    }
  }
  return send(res, 404, { error: "Introuvable." });
}

/* ---------- fichiers statiques ---------- */
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  // photos et données : dans le dossier de stockage ; le reste : dans le dossier du site
  const base = rel.startsWith("/images/") ? IMAGES : rel.startsWith("/data/") ? DATA : ROOT;
  const sub = base === ROOT ? rel : rel.slice(rel.indexOf("/", 1));
  const file = path.normalize(path.join(base, sub));
  const relative = path.relative(base, file).split(path.sep).join("/");
  const hidden = base === ROOT ? PRIVATE.has(relative) : base === DATA && relative === "admin.json";
  if (relative.startsWith("..") || hidden || relative.split("/").some((p) => p.startsWith(".")))
    return send(res, 404, "Introuvable", "text/plain; charset=utf-8");
  fs.readFile(file, (err, buf) => {
    const type = TYPES[path.extname(file).toLowerCase()];
    if (err || !type) return send(res, 404, "Introuvable", "text/plain; charset=utf-8");
    send(res, 200, buf, type);
  });
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Méthode non autorisée", "text/plain; charset=utf-8");
    serveStatic(req, res, url);
  } catch (e) {
    if (!res.headersSent) send(res, 400, { error: e.message || "Erreur." });
  }
}).listen(PORT, () => {
  console.log(`Site :           http://localhost:${PORT}`);
  console.log(`Administration : http://localhost:${PORT}/admin.html`);
  console.log("Laissez cette fenêtre ouverte tant que vous utilisez le site.");
});
