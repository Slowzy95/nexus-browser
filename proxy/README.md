# Proxy web optionnel — Cloudflare Worker

Le proxy est **optionnel** : NEXUS Browser fonctionne entièrement sans lui (iframe directe
+ ouverture externe). Ce dossier contient un proxy personnel filtré pour les rares
usages où l'intégration directe échoue et où vous acceptez les limites décrites ici.

## Ce que ce proxy est

Un Cloudflare Worker qui agit comme un **relais HTTP(S) strictement filtré** pour
votre usage personnel uniquement :

- Schémas autorisés : `http:` et `https:` uniquement.
- **Protection SSRF complète** : blocage de `localhost`, `127.x`, `10.x`, `192.168.x`,
  `172.16–31.x`, `169.254.x` (métadonnées cloud), IPv6 locales (`::1`, `fc00::/7`,
  `fe80::/10`), `.local`, `.internal`, `.lan`, `.corp`, `.home`, `.localhost`.
- **Redirections suivies manuellement** : chaque cible de redirection est revalidée
  (3 sauts maximum) — une redirection vers une adresse privée est bloquée.
- **Taille de réponse limitée à 2 Mo**, types de contenu limités à HTML/texte.
- **Timeout de 10 s** sur chaque requête amont.
- **Clé d'accès personnelle obligatoire** (`NEXUS_ACCESS_KEY`) : le worker refuse de
  démarrer sans elle, donc **aucun relais ouvert anonyme**.
- **Aucune collecte** : pas de journalisation des requêtes, aucun cookie transmis,
  aucun mot de passe intercepté (les cookies reçus sont jetés, `no-store` côté client).
- Identifiants dans l'URL bloqués (`user:pass@host`).

## Ce que ce proxy n'est PAS

- Un moyen de contourner des paywalls, des blocages d'administration scolaire ou
  d'entreprise, des restrictions réseau ou des authentifications.
- Un navigateur complet : les applications très dynamiques (SPA), les WebSockets,
  le streaming vidéo, les connexions avec session ne fonctionneront pas ou mal.
- Un service public : c'est votre worker, avec votre clé, pour votre usage.

## Déploiement gratuit (5 minutes)

1. Créez un compte gratuit sur [Cloudflare](https://dash.cloudflare.com/sign-up) (aucune carte bancaire requise).
2. Installez [Node.js](https://nodejs.org) puis, dans ce dossier :
   ```bash
   npx wrangler login
   npx wrangler secret put NEXUS_ACCESS_KEY   # choisissez une longue phrase secrète
   npx wrangler deploy
   ```
3. Le worker répondra sur une URL du type `https://nexus-proxy-xxxx.yourname.workers.dev`.
4. Dans NEXUS Browser → Paramètres → « URL de proxy », entrez :
   `https://nexus-proxy-xxxx.yourname.workers.dev` (la clé est demandée séparément
   dans l'interface si vous l'avez définie — voir ci-dessous).

> Note : l'interface des paramètres NEXUS accepte aussi l'URL complète avec `?key=...`,
> mais il est plus sûr de garder la clé dans le secret du worker et de ne pas la
> stocker en clair dans le navigateur.

## Limites de l'offre gratuite Cloudflare Workers (à vérifier avant usage intensif)

- ~100 000 requêtes/jour sur l'offre gratuite (largement suffisant pour un usage
  personnel ; vérifiez les chiffres actuels sur la page Pricing de Cloudflare).
- Temps CPU limité par requête (~10 ms CPU gratuit) : inadapté à des réponses
  volumineuses ou à du traitement lourd.
- Les conditions d'utilisation de Cloudflare interdisent l'usage comme relais
  anonyme public : c'est cohérent avec la clé d'accès obligatoire.

## Configuration locale (facultatif)

Le fichier `wrangler.toml` fourni est minimal ; `npx wrangler deploy` vous guidera.
