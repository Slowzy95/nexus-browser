# NEXUS Browser

Navigateur web hybride moderne : recherche, onglets, favoris, historique, raccourcis
personnalisables, mini-jeux et calculatrice — application web statique, installable
en PWA, entièrement gratuite et sans compte.

**Déploiement :** <https://slowzy95.github.io/nexus-browser/>

## Ce que c'est (et ce que ce n'est pas)

NEXUS est une **application web** (HTML/CSS/JavaScript), pas un navigateur Chromium :

- Les sites qui autorisent l'intégration s'affichent dans le cadre intégré.
- Les sites qui l'interdisent (en-têtes `X-Frame-Options` / `CSP frame-ancestors`)
  doivent être ouverts via le bouton « Ouvrir en externe » (nouvel onglet système).
- Aucune restriction de site, de réseau ou d'administration n'est contournée.
- Favoris, historique, raccourcis et paramètres sont stockés **uniquement dans le
  stockage local de votre navigateur** — aucune donnée n'est envoyée quelque part.

## Fonctionnalités

- Recherche web avec moteur configurable (DuckDuckGo par défaut ; Qwant, Google,
  Bing, Ecosia, Startpage).
- Barre d'adresse intelligente : URL ou recherche, selon ce qui est saisi.
- Onglets multiples avec historique de navigation par onglet (retour/avant).
- Favoris : ajout, suppression, page dédiée.
- Historique : recherche, suppression d'entrée, effacement complet.
- Raccourcis de page d'accueil personnalisables (ajout/retrait).
- Thème sombre par défaut, clair, ou suivant le système.
- Interface bilingue : français et anglais (détection automatique).
- Raccourcis clavier (ordinateur) : `Ctrl+T` nouvel onglet, `Alt+W` fermer l'onglet,
  `Ctrl+L` barre d'adresse, `Ctrl+K` recherche, `Alt+←` retour, `Ctrl+D` favori.
- Mini-jeux : Memory, test de réflexe, calculatrice.
- Sauvegarde/restauration de toutes vos données (export/import JSON).
- PWA installable (Android : « Ajouter à l'écran d'accueil ») avec service worker
  et mode hors ligne pour l'interface.
- Proxy web optionnel (voir `proxy/README.md`).

## Lancer le projet

Aucun build, aucune dépendance : ouvrez `index.html` dans un navigateur, ou servez
le dossier via n'importe quel serveur statique (le service worker exige HTTPS ou localhost).

```bash
# exemple avec Python
python3 -m http.server 8080
```

## Déploiement gratuit

Le site est publié sur **GitHub Pages** (branche `main`, dossier racine).
Chaque push sur `main` met automatiquement le site à jour.

## Proxy web optionnel

Un proxy filtré pour Cloudflare Workers est fourni dans `proxy/` (avec protections
SSRF, limite de taille, timeout, clé d'accès obligatoire). Il est **désactivé par
défaut** — voir `proxy/README.md` pour le déployer et ses limites honnêtes
(les SPA complexes, WebSockets, vidéo et connexions authentifiées n'y fonctionnent pas).

## Structure

```
index.html            Structure de l'application
404.html              Repli GitHub Pages
css/styles.css        Thèmes sombre/clair, responsive
js/main.js            Point d'entrée (événements, thème, clavier, SW)
js/i18n.js            Traductions FR/EN
js/store.js           État global + persistance localStorage
js/utils.js           Helpers (échappement, normalisation d'URL…)
js/tabs.js            Moteur d'onglets
js/ui.js              Rendu des vues, listes, modales
js/games.js           Memory, réflexe, calculatrice
js/settings.js        Panneau de paramètres
manifest.webmanifest  Configuration PWA
sw.js                 Service worker (cache + hors ligne)
assets/               Icônes SVG + PNG (PWA)
proxy/                Proxy Cloudflare Worker optionnel
```

## Sécurité

- Échappement systématique des contenus insérés dans le DOM.
- `iframe` en `sandbox` + `referrerpolicy` restrictif.
- Aucune clé API, aucun secret, aucun service payant dans le frontend.
- Proxy (si activé) : SSRF bloqué, redirections revalidées, taille et timeout limités,
  clé d'accès obligatoire, aucune collecte de cookies ou mots de passe.

## Licence

Projet personnel — © 2026 Slowzy95
