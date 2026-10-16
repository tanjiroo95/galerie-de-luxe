# Mettre Galerie de Luxe en ligne (Render)

Le site a besoin d'un hébergeur qui fait tourner **Node.js** et qui garde un **disque persistant**
(pour conserver les photos ajoutées et le mot de passe). L'offre gratuite de Render n'a pas de disque :
les photos ajoutées disparaîtraient à chaque redémarrage. Il faut donc l'offre payante « Starter »
(environ 7 $/mois, à vérifier sur render.com) — le fichier `render.yaml` est déjà réglé pour ça.

## Étapes

1. **Compte GitHub** (gratuit) : https://github.com → créer un dépôt **privé**, par exemple `galeria-luxe`.
2. **Envoyer le site** : sur la page du dépôt, « uploading an existing file », puis glisser tout le contenu
   du dossier `site` (y compris les dossiers `images` et `data`). Ne pas envoyer `data/admin.json` s'il existe.
3. **Compte Render** : https://render.com → se connecter avec GitHub.
4. **New → Blueprint** → choisir le dépôt `galeria-luxe` → *Apply*. Render lit `render.yaml`,
   crée le service et le disque, et démarre le site (2 à 3 minutes).
5. Render donne une adresse du type `https://galeria-luxe.onrender.com`.
6. **Tout de suite** : ouvrir `https://…onrender.com/admin.html` et choisir le mot de passe
   (la première personne qui ouvre cette page le définit — ne pas attendre).
7. Optionnel : brancher votre propre nom de domaine dans Render → Settings → Custom Domains.

## Bon à savoir

- Photos et articles ajoutés depuis l'administration sont stockés sur le disque Render (`/var/data`),
  pas dans GitHub. Les mises à jour du code ne les effacent pas.
- Mot de passe oublié : dans Render, onglet *Shell*, exécuter `rm /var/data/data/admin.json`,
  puis rouvrir `/admin.html` pour en choisir un nouveau.
- Sur ordinateur (sans hébergeur) : double-cliquer sur `start.bat`.
