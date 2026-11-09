/* i18n.js — Internationalisation (FR / EN) */
import { state, saveSettings } from './store.js';

export const LANGS = [
  { code: 'auto', label: 'Automatique' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
];

const MESSAGES = {
  fr: {
    'sidebar.space': 'ESPACE', 'sidebar.personal': 'PERSONNEL',
    'sidebar.status': 'Mode local actif', 'sidebar.open': 'Ouvrir le menu', 'sidebar.close': 'Fermer le menu',
    'nav.home': 'Accueil', 'nav.browser': 'Navigateur', 'nav.apps': 'Applications', 'nav.games': 'Jeux',
    'nav.favorites': 'Favoris', 'nav.history': 'Historique', 'nav.settings': 'Paramètres',
    'theme.toggle': 'Changer le thème',
    'common.seeAll': 'Tout afficher', 'common.cancel': 'Annuler', 'common.save': 'Enregistrer',
    'common.delete': 'Supprimer', 'common.open': 'Ouvrir', 'common.close': 'Fermer', 'common.confirm': 'Confirmer',
    'common.name': 'Nom', 'common.url': 'Adresse (URL)', 'common.add': 'Ajouter', 'common.today': "Aujourd'hui",
    'common.yesterday': 'Hier', 'common.loading': 'Chargement…',
    'home.eyebrow': 'VOTRE ESPACE WEB', 'home.title': 'Tout votre web.<br>Au même endroit.',
    'home.subtitle': 'Un navigateur hybride pour retrouver vos sites, applications et jeux — rapide, privé et installable.',
    'home.search': 'Rechercher', 'home.searchPlaceholder': 'Rechercher sur le Web ou saisir une adresse…',
    'home.shortcutsEyebrow': 'ACCÈS RAPIDE', 'home.shortcuts': 'Vos raccourcis',
    'home.appsEyebrow': 'DÉCOUVRIR', 'home.apps': 'Applications suggérées',
    'home.recentEyebrow': 'REPRISE RAPIDE', 'home.recent': 'Récemment visités',
    'home.noticeTitle': 'À savoir sur NEXUS',
    'home.noticeBody': "NEXUS est une application web : les sites qui interdisent l'intégration (X-Frame-Options / CSP) ne peuvent pas s'afficher dans le cadre intégré — utilisez alors le bouton « Ouvrir en externe ». Cette application ne contourne aucune restriction de site, de réseau ou d'administration.",
    'home.searchNote': 'Recherche via {engine} · Stockage 100 % local',
    'shortcut.add': '+ Ajouter', 'shortcut.namePh': 'Nom du site', 'shortcut.urlPh': 'exemple : https://wikipedia.org',
    'shortcut.empty': 'Aucun raccourci. Ajoutez vos sites favoris !',
    'shortcut.added': 'Raccourci ajouté', 'shortcut.removed': 'Raccourci supprimé',
    'shortcut.removeTitle': 'Retirer le raccourci',
    'browser.back': 'Retour', 'browser.forward': 'Avancer', 'browser.reload': 'Actualiser',
    'browser.external': 'Ouvrir en externe', 'browser.go': 'Aller',
    'browser.addressPlaceholder': 'Adresse ou recherche…',
    'browser.newTab': 'Nouvel onglet', 'browser.closeTab': "Fermer l'onglet",
    'browser.welcomeTitle': 'Que souhaitez-vous consulter ?', 'browser.welcomeSub': 'Saisissez une adresse ou lancez une recherche.',
    'browser.frameHint': "Page vide ou bloquée ? Le site interdit peut-être l'intégration.",
    'browser.frameHintOpen': 'Ouvrir en externe ↗', 'browser.noAddress': "Aucune adresse à ouvrir",
    'browser.blockedTitle': 'Ce site refuse l\u2019intégration',
    'browser.blockedBody': '{host} interdit son affichage dans une application web (politique X-Frame-Options / CSP). Ouvrez-le dans un nouvel onglet de votre navigateur système.',
    'browser.blockedHint': 'NEXUS ne contourne jamais les protections des sites : c\u2019est une limite normale des applications web.',
    'browser.noBack': 'Pas de page précédente', 'browser.noForward': 'Pas de page suivante',
    'browser.incognitoNote': 'Navigation intégrée : le site s\u2019affiche dans un cadre sécurisé.',
    'favorites.eyebrow': 'PERSONNEL', 'favorites.subtitle': 'Enregistrés sur cet appareil uniquement.',
    'favorites.add': '+ Ajouter un favori', 'favorites.addTitle': 'Ajouter un favori',
    'favorites.empty': 'Aucun favori enregistré pour le moment.',
    'favorites.added': 'Ajouté aux favoris', 'favorites.removed': 'Retiré des favoris',
    'favorites.alreadyPresent': 'Ce site est déjà dans vos favoris',
    'favorites.namePh': 'Nom du site', 'favorites.urlPh': 'exemple : https://wikipedia.org',
    'history.eyebrow': 'PERSONNEL', 'history.subtitle': 'Pages ouvertes depuis cet appareil.',
    'history.clear': "Effacer l'historique", 'history.searchPlaceholder': "Rechercher dans l'historique…",
    'history.empty': 'Historique vide.', 'history.cleared': 'Historique effacé',
    'history.confirmClear': "Effacer tout l'historique ? Cette action est irréversible.",
    'apps.eyebrow': 'RÉPERTOIRE', 'apps.subtitle': 'Vos services web regroupés dans un seul espace.',
    'apps.filterPlaceholder': 'Filtrer les applications…', 'apps.count': '{n} application(s)',
    'games.eyebrow': 'DÉTENTE', 'games.subtitle': 'Mini-jeux autonomes, sans compte ni connexion.',
    'games.placeholder': 'Sélectionnez un jeu pour commencer.',
    'games.memory.desc': 'Retrouvez les paires de symboles.', 'games.memory.status': 'Paires : {matched}/{total} · Coups : {moves}',
    'games.memory.win': 'Bravo ! Terminé en {moves} coups.', 'games.memory.again': 'Recommencer',
    'games.reaction.desc': 'Testez votre temps de réaction.', 'games.reaction.start': 'Démarrer',
    'games.reaction.wait': 'Patientez…', 'games.reaction.now': 'MAINTENANT !', 'games.reaction.click': 'Cliquez !',
    'games.reaction.tooEarly': 'Trop tôt ! Réessayez.', 'games.reaction.result': 'Votre temps : {ms} ms',
    'games.calc.desc': 'Petite calculatrice de bureau.', 'games.calc.title': 'Calculatrice',
    'settings.title': 'Paramètres', 'settings.language': 'Langue', 'settings.theme': 'Thème',
    'settings.theme.dark': 'Sombre', 'settings.theme.light': 'Clair', 'settings.theme.system': 'Système',
    'settings.engine': 'Moteur de recherche', 'settings.proxy': 'URL de proxy (optionnel)',
    'settings.proxyPh': 'https://mon-proxy.exemple.workers.dev',
    'settings.proxyHint': 'Laissez vide pour la navigation directe. Voir proxy/README.md pour déployer le vôtre (Cloudflare Workers, gratuit).',
    'settings.proxyApplied': 'Proxy enregistré. Certaines pages peuvent ne pas fonctionner via un proxy.',
    'settings.homepage': "Raccourcis de la page d'accueil",
    'settings.backup': 'Sauvegarde et restauration', 'settings.export': 'Exporter (JSON)', 'settings.import': 'Importer (JSON)',
    'settings.imported': 'Sauvegarde restaurée', 'settings.importError': 'Fichier de sauvegarde invalide',
    'settings.data': 'Données locales', 'settings.clearAll': 'Tout effacer',
    'settings.clearAllConfirm': 'Effacer favoris, historique, raccourcis et paramètres ? Action irréversible.',
    'settings.cleared': 'Données locales effacées',
    'settings.shortcutsHint': 'Gérez vos raccourcis depuis la page d’accueil.',
    'settings.manageShortcuts': 'Gérer les raccourcis',
    'settings.about': 'À propos', 'settings.aboutText': 'NEXUS Browser v1.0 — application web statique, sans compte, sans collecte de données. Favoris, historique et paramètres sont stockés uniquement dans ce navigateur.',
    'toast.copied': 'Copié', 'toast.invalidUrl': 'Adresse invalide',
    'error.offline': 'Hors ligne : certaines ressources peuvent être indisponibles.',
    'footer.tagline': 'Une expérience web personnelle, locale et privée',
    'theme.dark': 'Thème sombre activé', 'theme.light': 'Thème clair activé',
    'kbd.title': 'Raccourcis clavier',
    'kbd.newTab': 'Nouvel onglet', 'kbd.closeTab': "Fermer l'onglet", 'kbd.focusAddress': 'Barre d’adresse',
    'kbd.search': 'Recherche rapide', 'kbd.back': 'Page précédente', 'kbd.fav': 'Ajouter aux favoris',
    'settings.kbd': 'Raccourcis clavier (ordinateur)',
    'settings.kbdList': 'Ctrl+T : nouvel onglet · Alt+W : fermer l’onglet · Ctrl+L : barre d’adresse · Ctrl+K : recherche · Alt+← : retour · Ctrl+D : favori',
  },
  en: {
    'sidebar.space': 'SPACE', 'sidebar.personal': 'PERSONAL',
    'sidebar.status': 'Local mode active', 'sidebar.open': 'Open menu', 'sidebar.close': 'Close menu',
    'nav.home': 'Home', 'nav.browser': 'Browser', 'nav.apps': 'Apps', 'nav.games': 'Games',
    'nav.favorites': 'Favorites', 'nav.history': 'History', 'nav.settings': 'Settings',
    'theme.toggle': 'Toggle theme',
    'common.seeAll': 'See all', 'common.cancel': 'Cancel', 'common.save': 'Save',
    'common.delete': 'Delete', 'common.open': 'Open', 'common.close': 'Close', 'common.confirm': 'Confirm',
    'common.name': 'Name', 'common.url': 'Address (URL)', 'common.add': 'Add', 'common.today': 'Today',
    'common.yesterday': 'Yesterday', 'common.loading': 'Loading…',
    'home.eyebrow': 'YOUR WEB SPACE', 'home.title': 'All your web.<br>In one place.',
    'home.subtitle': 'A hybrid browser for your sites, apps and games — fast, private and installable.',
    'home.search': 'Search', 'home.searchPlaceholder': 'Search the web or enter an address…',
    'home.shortcutsEyebrow': 'QUICK ACCESS', 'home.shortcuts': 'Your shortcuts',
    'home.appsEyebrow': 'DISCOVER', 'home.apps': 'Suggested apps',
    'home.recentEyebrow': 'PICK UP WHERE YOU LEFT', 'home.recent': 'Recently visited',
    'home.noticeTitle': 'Good to know about NEXUS',
    'home.noticeBody': 'NEXUS is a web app: sites that forbid embedding (X-Frame-Options / CSP) cannot be shown inside the frame — use the "Open externally" button then. This app does not bypass any site, network or admin restriction.',
    'home.searchNote': 'Search via {engine} · 100% local storage',
    'shortcut.add': '+ Add', 'shortcut.namePh': 'Site name', 'shortcut.urlPh': 'e.g. https://wikipedia.org',
    'shortcut.empty': 'No shortcuts yet. Add your favorite sites!',
    'shortcut.added': 'Shortcut added', 'shortcut.removed': 'Shortcut removed',
    'shortcut.removeTitle': 'Remove shortcut',
    'browser.back': 'Back', 'browser.forward': 'Forward', 'browser.reload': 'Reload',
    'browser.external': 'Open externally', 'browser.go': 'Go',
    'browser.addressPlaceholder': 'Address or search…',
    'browser.newTab': 'New tab', 'browser.closeTab': 'Close tab',
    'browser.welcomeTitle': 'What would you like to visit?', 'browser.welcomeSub': 'Enter an address or start a search.',
    'browser.frameHint': 'Empty or blocked page? The site may forbid embedding.',
    'browser.frameHintOpen': 'Open externally ↗', 'browser.noAddress': 'No address to open',
    'browser.blockedTitle': 'This site refuses embedding',
    'browser.blockedBody': '{host} disallows being shown inside a web app (X-Frame-Options / CSP policy). Open it in a new tab of your system browser.',
    'browser.blockedHint': 'NEXUS never bypasses site protections: this is a normal web app limit.',
    'browser.noBack': 'No previous page', 'browser.noForward': 'No next page',
    'browser.incognitoNote': 'Embedded navigation: the site loads inside a secured frame.',
    'favorites.eyebrow': 'PERSONAL', 'favorites.subtitle': 'Stored on this device only.',
    'favorites.add': '+ Add a favorite', 'favorites.addTitle': 'Add a favorite',
    'favorites.empty': 'No favorites yet.',
    'favorites.added': 'Added to favorites', 'favorites.removed': 'Removed from favorites',
    'favorites.alreadyPresent': 'This site is already in your favorites',
    'favorites.namePh': 'Site name', 'favorites.urlPh': 'e.g. https://wikipedia.org',
    'history.eyebrow': 'PERSONAL', 'history.subtitle': 'Pages opened on this device.',
    'history.clear': 'Clear history', 'history.searchPlaceholder': 'Search history…',
    'history.empty': 'History is empty.', 'history.cleared': 'History cleared',
    'history.confirmClear': 'Clear all history? This cannot be undone.',
    'apps.eyebrow': 'DIRECTORY', 'apps.subtitle': 'Your web services in one place.',
    'apps.filterPlaceholder': 'Filter apps…', 'apps.count': '{n} app(s)',
    'games.eyebrow': 'RELAX', 'games.subtitle': 'Standalone mini-games, no account needed.',
    'games.placeholder': 'Select a game to start.',
    'games.memory.desc': 'Find the matching pairs.', 'games.memory.status': 'Pairs: {matched}/{total} · Moves: {moves}',
    'games.memory.win': 'Well done! Finished in {moves} moves.', 'games.memory.again': 'Play again',
    'games.reaction.desc': 'Test your reaction time.', 'games.reaction.start': 'Start',
    'games.reaction.wait': 'Wait…', 'games.reaction.now': 'NOW!', 'games.reaction.click': 'Click!',
    'games.reaction.tooEarly': 'Too early! Try again.', 'games.reaction.result': 'Your time: {ms} ms',
    'games.calc.desc': 'A small desk calculator.', 'games.calc.title': 'Calculator',
    'settings.title': 'Settings', 'settings.language': 'Language', 'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark', 'settings.theme.light': 'Light', 'settings.theme.system': 'System',
    'settings.engine': 'Search engine', 'settings.proxy': 'Proxy URL (optional)',
    'settings.proxyPh': 'https://my-proxy.example.workers.dev',
    'settings.proxyHint': 'Leave empty for direct navigation. See proxy/README.md to deploy your own (Cloudflare Workers, free).',
    'settings.proxyApplied': 'Proxy saved. Some pages may not work through a proxy.',
    'settings.homepage': 'Home page shortcuts',
    'settings.backup': 'Backup & restore', 'settings.export': 'Export (JSON)', 'settings.import': 'Import (JSON)',
    'settings.imported': 'Backup restored', 'settings.importError': 'Invalid backup file',
    'settings.data': 'Local data', 'settings.clearAll': 'Erase everything',
    'settings.clearAllConfirm': 'Erase favorites, history, shortcuts and settings? This cannot be undone.',
    'settings.cleared': 'Local data erased',
    'settings.shortcutsHint': 'Manage your shortcuts from the home page.',
    'settings.manageShortcuts': 'Manage shortcuts',
    'settings.about': 'About', 'settings.aboutText': 'NEXUS Browser v1.0 — static web app, no account, no data collection. Favorites, history and settings are stored only in this browser.',
    'toast.copied': 'Copied', 'toast.invalidUrl': 'Invalid address',
    'error.offline': 'Offline: some resources may be unavailable.',
    'footer.tagline': 'A personal, local and private web experience',
    'theme.dark': 'Dark theme enabled', 'theme.light': 'Light theme enabled',
    'kbd.title': 'Keyboard shortcuts',
    'kbd.newTab': 'New tab', 'kbd.closeTab': 'Close tab', 'kbd.focusAddress': 'Address bar',
    'kbd.search': 'Quick search', 'kbd.back': 'Previous page', 'kbd.fav': 'Add to favorites',
    'settings.kbd': 'Keyboard shortcuts (desktop)',
    'settings.kbdList': 'Ctrl+T: new tab · Alt+W: close tab · Ctrl+L: address bar · Ctrl+K: search · Alt+←: back · Ctrl+D: favorite',
  },
};

let currentLang = 'fr';

/** Code de langue courant ('fr' | 'en') — pour les contenus localisés. */
export function currentLangKey() { return currentLang; }

export function detectLang() {
  const pref = (state.settings.lang || 'auto');
  if (pref !== 'auto') return pref;
  const nav = (navigator.language || 'fr').toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
}

export function initLang() {
  currentLang = detectLang();
  document.documentElement.lang = currentLang;
}

export function setLang(lang) {
  state.settings.lang = lang;
  saveSettings();
  initLang();
  applyI18n();
  document.dispatchEvent(new CustomEvent('i18n:change'));
}

export function t(key, vars) {
  const dict = MESSAGES[currentLang] || MESSAGES.fr;
  let s = dict[key] ?? MESSAGES.fr[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

/** Applies translations to all [data-i18n], [data-i18n-ph], [data-i18n-title], [data-i18n-aria], [data-i18n-html] nodes. */
export function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
}
