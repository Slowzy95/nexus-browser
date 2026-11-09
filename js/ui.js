/* ui.js — Rendu des vues, listes et modales */
import { $, $$, escapeHtml, faviconFor, hostOf, timeAgo } from './utils.js';
import { state, DEFAULT_APPS, ENGINES, saveFavorites, saveHistory, saveShortcuts } from './store.js';
import { t, currentLangKey } from './i18n.js';
import { navigate, renderTabStrip, goBack, goForward, reloadTab } from './tabs.js';
import { renderGameGrid } from './games.js';
import { openSettings } from './settings.js';

const VIEW_TITLES = {
  home: 'home.eyebrow', browser: 'nav.browser', apps: 'nav.apps',
  games: 'nav.games', favorites: 'nav.favorites', history: 'nav.history',
};

export function showView(name) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  $$('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const crumb = $('#breadcrumb');
  if (crumb) crumb.innerHTML = escapeHtml(t('sidebar.space')) + ' <span aria-hidden="true">/</span> ' + escapeHtml(t(VIEW_TITLES[name] || name));
  closeSidebar();
  window.scrollTo(0, 0);
  if (name === 'browser') renderTabStrip();
  if (name === 'favorites') renderFavorites();
  if (name === 'history') renderHistory();
}

/* ─── Sidebar mobile ─── */
export function openSidebar() { $('#sidebar').classList.add('open'); $('#sidebarBackdrop').classList.add('show'); }
export function closeSidebar() { $('#sidebar').classList.remove('open'); $('#sidebarBackdrop').classList.remove('show'); }

/* ─── Historique ─── */
export function recordVisit(url, title) {
  if (!url) return;
  const item = { url, title: title || hostOf(url), at: Date.now() };
  state.history = [item, ...state.history.filter(x => x.url !== url)].slice(0, 200);
  saveHistory();
  renderRecent();
  renderHistory();
}

/* ─── Grilles d'applications ─── */
export function renderApps() {
  const lang = currentLangKey();
  const q = ($('#appFilter')?.value || '').toLowerCase();
  const filtered = DEFAULT_APPS.filter(a =>
    (a.name + ' ' + (a.desc[lang] || a.desc.fr) + ' ' + (a.category[lang] || a.category.fr)).toLowerCase().includes(q)
  );
  $('#homeApps').innerHTML = DEFAULT_APPS.slice(0, 4).map(a => appCard(a, lang)).join('');
  $('#allApps').innerHTML = filtered.map(a => appCard(a, lang)).join('');
  $('#appCount').textContent = t('apps.count', { n: filtered.length });
  bindCardActions();
}

function appCard(a, lang) {
  const fav = state.favorites.some(f => f.url === a.url);
  return `<article class="app-card">
    <img class="app-logo-img" src="${faviconFor(a.url)}" alt="" loading="lazy">
    <div class="app-logo" hidden>${escapeHtml(a.initial)}</div>
    <div class="app-copy"><strong>${escapeHtml(a.name)}</strong><small>${escapeHtml(a.desc[lang] || a.desc.fr)}</small></div>
    <button class="icon-mini" data-fav="${escapeHtml(a.url)}" title="${escapeHtml(t('favorites.add'))}" aria-label="${escapeHtml(t('favorites.add'))}">${fav ? '★' : '☆'}</button>
    <button class="icon-mini open" data-open="${escapeHtml(a.url)}" title="${escapeHtml(t('common.open'))}" aria-label="${escapeHtml(t('common.open'))}">↗</button>
  </article>`;
}

/** Repli visuel si le favicon ne charge pas (compatible CSP : aucun handler en ligne). */
function bindImgFallbacks(root) {
  root.querySelectorAll('img').forEach(img => {
    const fallback = img.nextElementSibling && img.nextElementSibling.classList.contains('app-logo')
      ? img.nextElementSibling
      : (img.classList.contains('recent-favicon') ? null : img.parentElement.querySelector('.shortcut-letter'));
    const fail = () => { img.style.display = 'none'; if (fallback) fallback.hidden = false; };
    img.addEventListener('error', fail, { once: true });
    if (img.complete && img.naturalWidth === 0) fail();
  });
}

function bindCardActions() {
  $$('[data-open]').forEach(b => {
    if (b._bound) return; b._bound = true;
    b.addEventListener('click', () => { showView('browser'); navigate(b.dataset.open); recordVisit(b.dataset.open, hostOf(b.dataset.open)); });
  });
  $$('[data-fav]').forEach(b => {
    if (b._bound) return; b._bound = true;
    b.addEventListener('click', () => toggleFavorite(b.dataset.fav));
  });
  bindImgFallbacks(document);
}

/* ─── Favoris ─── */
export function toggleFavorite(url) {
  const existing = state.favorites.find(f => f.url === url);
  if (existing) {
    state.favorites = state.favorites.filter(f => f.url !== url);
    saveFavorites(); refreshAll();
    toastMsg(t('favorites.removed'));
  } else {
    state.favorites.unshift({ name: hostOf(url), url, at: Date.now() });
    saveFavorites(); refreshAll();
    toastMsg(t('favorites.added'));
  }
  renderFavCount();
}

function renderFavCount() {
  const el = $('#favCount');
  if (!el) return;
  el.hidden = state.favorites.length === 0;
  el.textContent = state.favorites.length;
}

export function renderFavorites() {
  const el = $('#favoritesList');
  if (!el) return;
  el.innerHTML = state.favorites.length
    ? state.favorites.map(f => itemRow(f, { removable: true })).join('')
    : `<div class="empty">${escapeHtml(t('favorites.empty'))}</div>`;
  bindListRows(el);
  renderFavCount();
}

/* ─── Historique ─── */
export function renderHistory() {
  const el = $('#historyList');
  if (!el) return;
  const q = ($('#historyFilter')?.value || '').toLowerCase();
  const rows = state.history.filter(h => (h.title + h.url).toLowerCase().includes(q));
  el.innerHTML = rows.length
    ? rows.map(h => itemRow(h, { date: true, removable: true })).join('')
    : `<div class="empty">${escapeHtml(t('history.empty'))}</div>`;
  bindListRows(el);
}

export function renderRecent() {
  const el = $('#recentList');
  if (!el) return;
  const rows = state.history.slice(0, 5);
  el.innerHTML = rows.length
    ? rows.map(h => itemRow(h, { removable: false })).join('')
    : `<div class="empty">${escapeHtml(t('history.empty'))}</div>`;
  bindListRows(el);
}

function itemRow(item, opts = {}) {
  const title = escapeHtml(item.title || hostOf(item.url));
  const sub = opts.date
    ? escapeHtml(timeAgo(item.at, currentLangKey())) + ' · ' + escapeHtml(hostOf(item.url))
    : escapeHtml(hostOf(item.url));
  return `<div class="recent-item">
    <img class="recent-favicon" src="${faviconFor(item.url)}" alt="" loading="lazy">
    <div class="recent-copy"><strong>${title}</strong><small>${sub}</small></div>
    <button class="icon-mini" data-open="${escapeHtml(item.url)}" title="${escapeHtml(t('common.open'))}" aria-label="${escapeHtml(t('common.open'))}">↗</button>
    ${opts.removable ? `<button class="icon-mini danger" data-remove="${escapeHtml(item.url)}" title="${escapeHtml(t('common.delete'))}" aria-label="${escapeHtml(t('common.delete'))}">✕</button>` : ''}
  </div>`;
}

function bindListRows(root) {
  bindImgFallbacks(root);
  root.querySelectorAll('[data-open]').forEach(b => {
    if (b._bound) return; b._bound = true;
    b.addEventListener('click', () => { showView('browser'); navigate(b.dataset.open); recordVisit(b.dataset.open, hostOf(b.dataset.open)); });
  });
  root.querySelectorAll('[data-remove]').forEach(b => {
    if (b._bound) return; b._bound = true;
    b.addEventListener('click', () => {
      const url = b.dataset.remove;
      state.favorites = state.favorites.filter(f => f.url !== url);
      state.history = state.history.filter(h => h.url !== url);
      saveFavorites(); saveHistory();
      refreshAll();
    });
  });
}

/* ─── Raccourcis page d'accueil ─── */
export function renderShortcuts() {
  const grid = $('#shortcutGrid');
  if (!grid) return;
  if (!state.shortcuts.length) {
    grid.innerHTML = `<div class="empty">${escapeHtml(t('shortcut.empty'))}</div>`;
    return;
  }
  grid.innerHTML = state.shortcuts.map(s => `
    <div class="shortcut-card" data-shortcut="${escapeHtml(s.url)}">
      <img src="${faviconFor(s.url)}" alt="" loading="lazy">
      <div class="shortcut-letter" hidden>${escapeHtml((s.name || '?')[0].toUpperCase())}</div>
      <span class="shortcut-name">${escapeHtml(s.name || hostOf(s.url))}</span>
      <button class="shortcut-remove" data-remove-shortcut="${escapeHtml(s.url)}" title="${escapeHtml(t('shortcut.removeTitle'))}" aria-label="${escapeHtml(t('shortcut.removeTitle'))}">✕</button>
    </div>`).join('');
  bindImgFallbacks(grid);

  grid.querySelectorAll('[data-shortcut]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.shortcut-remove')) return;
      const url = card.dataset.shortcut;
      showView('browser'); navigate(url); recordVisit(url, hostOf(url));
    });
  });
  grid.querySelectorAll('[data-remove-shortcut]').forEach(b => {
    b.addEventListener('click', () => {
      state.shortcuts = state.shortcuts.filter(s => s.url !== b.dataset.removeShortcut);
      saveShortcuts(); renderShortcuts();
      toastMsg(t('shortcut.removed'));
    });
  });
}

/* ─── Modales ─── */
export function openModal(html, onMount) {
  const backdrop = $('#modalBackdrop');
  const modal = $('#modal');
  modal.innerHTML = html;
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('show'));
  const close = () => { backdrop.classList.remove('show'); setTimeout(() => { backdrop.hidden = true; }, 200); };
  backdrop.onclick = e => { if (e.target === backdrop) close(); };
  modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
  if (onMount) onMount(modal, close);
  return close;
}

export function promptAddItem(kind) {
  const isFav = kind === 'favorite';
  const title = isFav ? t('favorites.addTitle') : t('shortcut.add');
  const close = openModal(`
    <h3>${escapeHtml(title)}</h3>
    <label class="field"><span>${escapeHtml(t('common.name'))}</span><input id="mName" placeholder="${escapeHtml(isFav ? t('favorites.namePh') : t('shortcut.namePh'))}"></label>
    <label class="field"><span>${escapeHtml(t('common.url'))}</span><input id="mUrl" type="url" inputmode="url" placeholder="${escapeHtml(isFav ? t('favorites.urlPh') : t('shortcut.urlPh'))}"></label>
    <div class="modal-actions">
      <button class="secondary" data-close>${escapeHtml(t('common.cancel'))}</button>
      <button class="primary" id="mSave">${escapeHtml(t('common.add'))}</button>
    </div>`, (modal, close) => {
      modal.querySelector('#mName').focus();
      modal.querySelector('#mSave').addEventListener('click', () => {
        const name = modal.querySelector('#mName').value.trim();
        let url = modal.querySelector('#mUrl').value.trim();
        if (!url) { toastMsg(t('toast.invalidUrl')); return; }
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        try { new URL(url); } catch { toastMsg(t('toast.invalidUrl')); return; }
        if (isFav) {
          if (state.favorites.some(f => f.url === url)) { toastMsg(t('favorites.alreadyPresent')); close(); return; }
          state.favorites.unshift({ name: name || hostOf(url), url, at: Date.now() });
          saveFavorites(); refreshAll(); renderFavCount();
        } else {
          if (state.shortcuts.some(s => s.url === url)) { close(); return; }
          state.shortcuts.push({ name: name || hostOf(url), url });
          saveShortcuts(); renderShortcuts();
        }
        toastMsg(isFav ? t('favorites.added') : t('shortcut.added'));
        close();
      });
    });
}

export function confirmModal(message, onConfirm) {
  openModal(`
    <h3>${escapeHtml(t('common.confirm'))}</h3>
    <p>${escapeHtml(message)}</p>
    <div class="modal-actions">
      <button class="secondary" data-close>${escapeHtml(t('common.cancel'))}</button>
      <button class="primary danger" id="mConfirm">${escapeHtml(t('common.confirm'))}</button>
    </div>`, (modal, close) => {
      modal.querySelector('#mConfirm').addEventListener('click', () => { close(); onConfirm(); });
    });
}

function toastMsg(m) {
  const el = $('#toast');
  el.textContent = m; el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ─── Rafraîchissement global ─── */
export function refreshAll() {
  renderApps();
  renderShortcuts();
  renderFavorites();
  renderHistory();
  renderRecent();
  renderFavCount();
  renderSearchNote();
}

export function renderSearchNote() {
  const el = $('#searchNote');
  if (el) el.textContent = t('home.searchNote', { engine: ENGINES[state.settings.engine].label });
}
