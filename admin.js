const $ = (id) => document.getElementById(id);

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Une erreur est survenue."), { status: res.status });
  return data;
}

let products = [];

/* ---------- connexion ---------- */
async function init() {
  let status;
  try { status = await (await fetch("/api/status")).json(); }
  catch {
    document.body.innerHTML = '<p style="padding:40px;text-align:center">Le serveur n\'est pas démarré.<br>Double-cliquez sur <strong>start.bat</strong> puis réessayez.</p>';
    return;
  }
  if (status.loggedIn) return showPanel();
  $("auth").hidden = false;
  const setup = !status.configured;
  $("auth-text").textContent = setup
    ? "Première visite : choisissez le mot de passe de l'administration."
    : "Entrez votre mot de passe pour gérer les articles.";
  $("password2").hidden = !setup;
  $("password2").required = setup;
  $("password").autocomplete = setup ? "new-password" : "current-password";
  $("auth-btn").textContent = setup ? "Créer le mot de passe" : "Se connecter";
  $("auth-form").onsubmit = async (e) => {
    e.preventDefault();
    $("auth-error").textContent = "";
    if (setup && $("password").value !== $("password2").value) {
      $("auth-error").textContent = "Les deux mots de passe sont différents.";
      return;
    }
    try {
      await api("POST", setup ? "/api/setup" : "/api/login", { password: $("password").value });
      $("auth").hidden = true;
      showPanel();
    } catch (err) { $("auth-error").textContent = err.message; }
  };
}

async function showPanel() {
  $("panel").hidden = false;
  await load();
}

$("logout").onclick = async () => { await api("POST", "/api/logout", {}); location.reload(); };

/* ---------- liste ---------- */
async function load() {
  products = await (await fetch("data/products.json", { cache: "no-store" })).json();
  $("count").textContent = `(${products.length})`;
  const list = $("list");
  list.innerHTML = "";
  if (!products.length) list.innerHTML = '<p class="hint">Aucun article pour le moment. Cliquez sur « Ajouter un article ».</p>';
  products.forEach((p) => {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = '<img alt=""><div class="info"><strong></strong><span></span></div><div class="btns"><button class="edit">Modifier</button><button class="del">Supprimer</button></div>';
    row.querySelector("img").src = "images/" + p.images[0];
    row.querySelector("strong").textContent = p.name;
    row.querySelector("span").textContent = `${p.cat} · ${p.images.length} photo${p.images.length > 1 ? "s" : ""}`;
    row.querySelector(".edit").onclick = () => openForm(p);
    row.querySelector(".del").onclick = async () => {
      if (!confirm(`Supprimer « ${p.name} » et ses photos ? Cette action est définitive.`)) return;
      try { await api("DELETE", "/api/products/" + p.id); await load(); }
      catch (err) { alert(err.message); }
    };
    list.appendChild(row);
  });
}

/* ---------- formulaire ---------- */
let editing = null;
let removed = [];
let added = []; // data URLs

function resize(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 1400;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Impossible de lire cette image."));
    img.src = URL.createObjectURL(file);
  });
}

function drawThumbs() {
  const box = $("thumbs");
  box.innerHTML = "";
  const add = (src, onRemove) => {
    const t = document.createElement("div");
    t.className = "thumb";
    t.innerHTML = '<img alt=""><button type="button" title="Retirer cette photo">×</button>';
    t.querySelector("img").src = src;
    t.querySelector("button").onclick = onRemove;
    box.appendChild(t);
  };
  if (editing) editing.images.filter((n) => !removed.includes(n)).forEach((n) => add("images/" + n, () => { removed.push(n); drawThumbs(); }));
  added.forEach((d, i) => add(d, () => { added.splice(i, 1); drawThumbs(); }));
}

function openForm(p) {
  editing = p || null;
  removed = [];
  added = [];
  $("form-title").textContent = p ? "Modifier l'article" : "Ajouter un article";
  $("f-name").value = p ? p.name : "";
  $("f-cat").value = p ? p.cat : "";
  $("form-error").textContent = "";
  for (const k of ["name-ar", "name-en", "cat-ar", "cat-en"]) $("f-" + k).value = p ? p[k.replace("-", "_")] || "" : "";
  $("tr").open = Boolean(p && (p.name_ar || p.name_en || p.cat_ar || p.cat_en));
  $("cats").innerHTML = [...new Set(products.map((x) => x.cat))].map((c) => `<option value="${c.replace(/"/g, "&quot;")}">`).join("");
  drawThumbs();
  $("overlay").hidden = false;
  $("f-name").focus();
}
const closeForm = () => { $("overlay").hidden = true; };

$("add").onclick = () => openForm(null);
$("cancel").onclick = closeForm;
$("overlay").addEventListener("mousedown", (e) => { if (e.target === $("overlay")) closeForm(); });

let busy = false;
$("f-files").onchange = async (e) => {
  const files = [...e.target.files];
  e.target.value = "";
  $("form-error").textContent = "";
  busy = true;
  $("save").disabled = true;
  let fallback = 0;
  try {
    for (let i = 0; i < files.length; i++) {
      const prefix = files.length > 1 ? `Photo ${i + 1}/${files.length} : ` : "";
      if ($("f-pro").checked && window.makeProfessional) {
        try {
          added.push(await window.makeProfessional(files[i], (t) => ($("f-status").textContent = prefix + t)));
          drawThumbs();
          continue;
        } catch (err) { fallback++; console.warn(err); }
      }
      $("f-status").textContent = prefix + "Préparation de la photo…";
      added.push(await resize(files[i]));
      drawThumbs();
    }
    if (fallback) $("form-error").textContent = `${fallback} photo(s) ajoutée(s) sans retouche IA (connexion internet nécessaire la première fois).`;
  } catch (err) { $("form-error").textContent = err.message; }
  $("f-status").textContent = "";
  busy = false;
  $("save").disabled = false;
  drawThumbs();
};

$("form").onsubmit = async (e) => {
  e.preventDefault();
  if (busy) return;
  const remaining = (editing ? editing.images.filter((n) => !removed.includes(n)).length : 0) + added.length;
  if (!remaining) { $("form-error").textContent = "Ajoutez au moins une photo."; return; }
  $("save").disabled = true;
  try {
    const body = {
      name: $("f-name").value, cat: $("f-cat").value, addImages: added,
      name_ar: $("f-name-ar").value, name_en: $("f-name-en").value,
      cat_ar: $("f-cat-ar").value, cat_en: $("f-cat-en").value,
    };
    if (editing) await api("PUT", "/api/products/" + editing.id, { ...body, removeImages: removed });
    else await api("POST", "/api/products", body);
    closeForm();
    await load();
  } catch (err) {
    if (err.status === 401) location.reload();
    $("form-error").textContent = err.message;
  } finally { $("save").disabled = false; }
};

init();
