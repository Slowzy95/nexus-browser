/* tabs.js — Gestion des onglets et de la navigation intégrée */
import { $, $$, escapeHtml, hostOf, normalizeInput, toast } from './utils.js';
import { state, ENGINES } from './store.js';
import { t } from './i18n.js';

let tabs = [];
let tabSeq = 0;

export function initTabs() {
  tabs = [];
  newTab();
}

export function activeTab() {
  return tabs.find(x => x.id === state._activeTab) || tabs[0];
}

export function newTab(url = '') {
  const tab = { id: ++tabSeq, url: '', title: t('browser.newTab'), stack: [], pointer: -1 };
  tabs.push(tab);
  state._activeTab = tab.id;
  if (url) navigate(url);
  else renderTabStrip();
  return tab;
}

export function closeTab(id) {
  const idx = tabs.findIndex(x => x.id === id);
  if (idx === -1) return;
  tabs.splice(idx, 1);
  if (tabs.length === 0) { newTab(); return; }
  if (state._activeTab === id) state._activeTab = tabs[Math.max(0, idx - 1)].id;
  renderTabStrip();
}

export function activateTab(id) {
  state._activeTab = id;
  renderTabStrip();
}

/** Navigation : pousse l'URL dans la pile de l'onglet actif. */
export function navigate(rawUrl) {
  const url = normalizeInput(rawUrl, ENGINES[state.settings.engine].url);
  if (!url) return;
  const tab = activeTab();
  tab.url = url;
  tab.title = hostOf(url);
  // tronque la pile "forward" puis empile
  tab.stack = tab.stack.slice(0, tab.pointer + 1);
  tab.stack.push(url);
  tab.pointer = tab.stack.length - 1;
  renderTabStrip();
  // Signale la navigation (enregistrée comme historique par main.js)
  document.dispatchEvent(new CustomEvent('nexus:navigate', { detail: { url } }));
}

export function goBack() {
  const tab = activeTab();
  if (tab.pointer > 0) {
    tab.pointer--;
    tab.url = tab.stack[tab.pointer];
    tab.title = hostOf(tab.url);
    renderTabStrip();
  } else toast(t('browser.noBack'));
}

export function goForward() {
  const tab = activeTab();
  if (tab.pointer < tab.stack.length - 1) {
    tab.pointer++;
    tab.url = tab.stack[tab.pointer];
    tab.title = hostOf(tab.url);
    renderTabStrip();
  } else toast(t('browser.noForward'));
}

export function reloadTab() {
  const tab = activeTab();
  if (!tab.url) return;
  renderTabStrip(); // réinjecte l'iframe → recharge
}

export function renderTabStrip() {
  const strip = $('#tabStrip');
  strip.innerHTML = '';
  tabs.forEach(tab => {
    const b = document.createElement('button');
    b.className = 'tab' + (tab.id === state._activeTab ? ' active' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', tab.id === state._activeTab ? 'true' : 'false');
    b.title = tab.title;
    const label = document.createElement('span');
    label.className = 'tab-label';
    label.textContent = tab.title || t('browser.newTab');
    const close = document.createElement('span');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = t('browser.closeTab');
    b.append(label, close);
    b.addEventListener('click', e => {
      if (e.target.closest('.tab-close')) closeTab(tab.id);
      else activateTab(tab.id);
    });
    strip.appendChild(b);
  });
  const newTabBtn = document.createElement('button');
  newTabBtn.className = 'new-tab';
  newTabBtn.id = 'newTabBtn';
  newTabBtn.title = t('browser.newTab');
  newTabBtn.setAttribute('aria-label', t('browser.newTab'));
  newTabBtn.textContent = '+';
  newTabBtn.addEventListener('click', () => newTab());
  strip.appendChild(newTabBtn);
  renderTabContent();
}

function renderTabContent() {
  const content = $('#browserContent');
  const tab = activeTab();
  const addressInput = $('#addressInput');
  if (addressInput) addressInput.value = tab.url || '';

  if (!tab.url) {
    content.innerHTML = `
      <div class="browser-welcome">
        <div class="welcome-mark" aria-hidden="true">N</div>
        <h2>${escapeHtml(t('browser.welcomeTitle'))}</h2>
        <p>${escapeHtml(t('browser.welcomeSub'))}</p>
        <div class="quick-links">
          <button data-url="https://www.wikipedia.org">Wikipedia</button>
          <button data-url="https://duckduckgo.com">DuckDuckGo</button>
          <button data-url="https://www.qwant.com">Qwant</button>
          <button data-url="https://github.com">GitHub</button>
        </div>
        <p class="frame-warning">${escapeHtml(t('browser.frameHint'))}</p>
      </div>`;
    $$('#browserContent [data-url]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.url)));
    return;
  }

  // Navigation via proxy optionnel (expérimental) sinon iframe direct
  const proxy = (state.settings.proxy || '').trim();
  const src = proxy ? proxy + '?url=' + encodeURIComponent(tab.url) : tab.url;

  content.innerHTML = `
    <iframe class="site-frame" src="${escapeHtml(src)}"
      referrerpolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
      title="${escapeHtml(tab.title)}"></iframe>`;
}
