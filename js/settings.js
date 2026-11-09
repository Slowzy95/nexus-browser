/* settings.js — Panneau de paramètres complet */
import { $, escapeHtml } from './utils.js';
import { state, ENGINES, saveSettings, exportData, importData, clearAllData } from './store.js';
import { t, setLang, applyI18n } from './i18n.js';
import { openModal, refreshAll, confirmModal } from './ui.js';
import { renderTabStrip } from './tabs.js';

export function openSettings() {
  openModal(`
    <h3>${escapeHtml(t('settings.title'))}</h3>

    <label class="field"><span>${escapeHtml(t('settings.language'))}</span>
      <select id="setLang">
        <option value="auto">Automatique</option>
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </label>

    <label class="field"><span>${escapeHtml(t('settings.theme'))}</span>
      <div class="seg" id="setTheme">
        <button data-val="dark" class="${state.settings.theme === 'dark' ? 'on' : ''}">${escapeHtml(t('settings.theme.dark'))}</button>
        <button data-val="light" class="${state.settings.theme === 'light' ? 'on' : ''}">${escapeHtml(t('settings.theme.light'))}</button>
        <button data-val="system" class="${state.settings.theme === 'system' ? 'on' : ''}">${escapeHtml(t('settings.theme.system'))}</button>
      </div>
    </label>

    <label class="field"><span>${escapeHtml(t('settings.engine'))}</span>
      <select id="setEngine">
        ${Object.entries(ENGINES).map(([k, v]) => `<option value="${k}" ${state.settings.engine === k ? 'selected' : ''}>${escapeHtml(v.label)}</option>`).join('')}
      </select>
    </label>

    <label class="field"><span>${escapeHtml(t('settings.proxy'))}</span>
      <input id="setProxy" type="url" inputmode="url" placeholder="${escapeHtml(t('settings.proxyPh'))}" value="${escapeHtml(state.settings.proxy || '')}">
      <small class="hint">${escapeHtml(t('settings.proxyHint'))}</small>
    </label>

    <div class="settings-group">
      <div class="settings-group-title">${escapeHtml(t('settings.kbd'))}</div>
      <p class="hint">${escapeHtml(t('settings.kbdList'))}</p>
    </div>

    <div class="settings-group">
      <div class="settings-group-title">${escapeHtml(t('settings.backup'))}</div>
      <div class="modal-actions">
        <button class="secondary" id="setExport">${escapeHtml(t('settings.export'))}</button>
        <button class="secondary" id="setImport">${escapeHtml(t('settings.import'))}</button>
        <input type="file" id="setImportFile" accept="application/json" hidden>
      </div>
    </div>

    <div class="settings-group">
      <div class="settings-group-title">${escapeHtml(t('settings.data'))}</div>
      <div class="modal-actions">
        <button class="secondary danger" id="setClear">${escapeHtml(t('settings.clearAll'))}</button>
      </div>
    </div>

    <div class="settings-group">
      <div class="settings-group-title">${escapeHtml(t('settings.about'))}</div>
      <p class="hint">${escapeHtml(t('settings.aboutText'))}</p>
    </div>

    <div class="modal-actions">
      <button class="primary" data-close>${escapeHtml(t('common.close'))}</button>
    </div>`, (modal, close) => {

    const s = state.settings;
    modal.querySelector('#setLang').value = s.lang;
    modal.querySelector('#setLang').addEventListener('change', e => { setLang(e.target.value); });

    modal.querySelectorAll('#setTheme button').forEach(b => b.addEventListener('click', () => {
      s.theme = b.dataset.val; saveSettings();
      modal.querySelectorAll('#setTheme button').forEach(x => x.classList.toggle('on', x === b));
      document.dispatchEvent(new CustomEvent('theme:change'));
    }));

    modal.querySelector('#setEngine').addEventListener('change', e => {
      s.engine = e.target.value; saveSettings(); refreshAll();
    });

    modal.querySelector('#setProxy').addEventListener('change', e => {
      s.proxy = e.target.value.trim(); saveSettings();
      if (s.proxy) alert(t('settings.proxyApplied'));
      renderTabStrip();
    });

    modal.querySelector('#setExport').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'nexus-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    const fileInput = modal.querySelector('#setImportFile');
    modal.querySelector('#setImport').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const f = fileInput.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          importData(JSON.parse(reader.result));
          applyI18n(); refreshAll();
          alert(t('settings.imported'));
          close();
        } catch { alert(t('settings.importError')); }
      };
      reader.readAsText(f);
    });

    modal.querySelector('#setClear').addEventListener('click', () => {
      confirmModal(t('settings.clearAllConfirm'), () => {
        clearAllData();
        applyI18n(); refreshAll();
        alert(t('settings.cleared'));
      });
    });
  });
}
