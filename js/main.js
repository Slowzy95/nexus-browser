/* main.js — Point d'entrée : événements, thème, raccourcis clavier, service worker */
import { $, $$, toast } from './utils.js';
import { state, saveSettings } from './store.js';
import { initLang, applyI18n, t } from './i18n.js';
import { showView, openSidebar, closeSidebar, refreshAll, renderSearchNote, promptAddItem, confirmModal, recordVisit } from './ui.js';
import { initTabs, navigate, renderTabStrip, goBack, goForward, reloadTab, activeTab } from './tabs.js';
import { renderGameGrid } from './games.js';
import { openSettings } from './settings.js';
import { ENGINES } from './store.js';

/* ─── Thème ─── */
function applyTheme() {
  const pref = state.settings.theme;
  const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const light = pref === 'light' || (pref === 'system' && !systemDark);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  const meta = $('#metaThemeColor');
  if (meta) meta.content = light ? '#f2f5fa' : '#0d111b';
}

/* ─── Initialisation ─── */
function boot() {
  initLang();
  applyTheme();
  applyI18n();

  // Navigation par vues
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-view]');
    if (nav) { e.preventDefault(); showView(nav.dataset.view); }
    const settingsBtn = e.target.closest('[data-open-settings]');
    if (settingsBtn) { e.preventDefault(); openSettings(); }
  });

  // Sidebar mobile
  $('#menuBtn').addEventListener('click', openSidebar);
  $('#sidebarBackdrop').addEventListener('click', closeSidebar);

  // Historique : chaque navigation (onglet, adresse, recherche, raccourci) est enregistrée
  document.addEventListener('nexus:navigate', e => recordVisit(e.detail.url));

  // Recherche principale + barre d'adresse
  $('#mainSearch').addEventListener('submit', e => {
    e.preventDefault();
    showView('browser');
    navigate($('#mainQuery').value);
    $('#mainQuery').value = '';
  });
  $('#addressForm').addEventListener('submit', e => {
    e.preventDefault();
    navigate($('#addressInput').value);
  });

  // Outils navigateur
  $('#backBtn').addEventListener('click', goBack);
  $('#fwdBtn').addEventListener('click', goForward);
  $('#reloadBtn').addEventListener('click', reloadTab);
  $('#externalBtn').addEventListener('click', () => {
    const tab = activeTab();
    if (tab?.url) window.open(tab.url, '_blank', 'noopener,noreferrer');
    else toast(t('browser.noAddress'));
  });
  $('#frameHintOpen').addEventListener('click', () => {
    const tab = activeTab();
    if (tab?.url) window.open(tab.url, '_blank', 'noopener,noreferrer');
    else toast(t('browser.noAddress'));
  });
  $('#favBtn').addEventListener('click', () => {
    const tab = activeTab();
    if (tab?.url) {
      import('./ui.js').then(m => m.toggleFavorite(tab.url));
    }
  });

  // Ajouts
  $('#addShortcutBtn').addEventListener('click', () => promptAddItem('shortcut'));
  $('#addFavoriteBtn').addEventListener('click', () => promptAddItem('favorite'));

  // Historique
  $('#clearHistory').addEventListener('click', () => {
    confirmModal(t('history.confirmClear'), () => {
      state.history = [];
      import('./store.js').then(m => { m.saveHistory(); });
      refreshAll();
      toast(t('history.cleared'));
    });
  });
  $('#historyFilter').addEventListener('input', () => refreshAll());

  // Thème (bouton rapide : cycle sombre ↔ clair)
  $('#themeBtn').addEventListener('click', () => {
    const isLight = document.documentElement.dataset.theme === 'light';
    state.settings.theme = isLight ? 'dark' : 'light';
    saveSettings();
    applyTheme();
    toast(isLight ? t('theme.dark') : t('theme.light'));
  });

  // Filtre applications
  $('#appFilter').addEventListener('input', () => refreshAll());

  // Raccourcis clavier (desktop)
  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 't') { e.preventDefault(); import('./tabs.js').then(m => { m.newTab(); showView('browser'); }); }
    else if (e.altKey && e.key.toLowerCase() === 'w') { e.preventDefault(); import('./tabs.js').then(m => m.closeTab(activeTab().id)); }
    else if (mod && e.key.toLowerCase() === 'l') { e.preventDefault(); showView('browser'); $('#addressInput').focus(); }
    else if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); showView('home'); $('#mainQuery').focus(); }
    else if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
    else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); const tab = activeTab(); if (tab?.url) import('./ui.js').then(m => m.toggleFavorite(tab.url)); }
  });

  // Service worker (PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // État hors ligne
  addEventListener('offline', () => toast(t('error.offline')));

  // Rendu initial
  initTabs();
  renderGameGrid();
  refreshAll();
  renderSearchNote();
  showView('home');
}

boot();
