/* games.js — Mini-jeux : Memory, Réflexe + Calculatrice */
import { $ } from './utils.js';
import { t as tr } from './i18n.js';

export const GAMES = [
  { id: 'memory', name: 'Memory', descKey: 'games.memory.desc' },
  { id: 'reaction', name: 'Réflexe', descKey: 'games.reaction.desc' },
  { id: 'calc', name: 'Calculatrice', descKey: 'games.calc.desc' },
];

export function renderGameGrid() {
  const grid = $('#gameGrid');
  if (!grid) return;
  grid.innerHTML = '';
  GAMES.forEach((g, i) => {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.innerHTML = `
      <div class="game-art ${['memory-art', 'reaction-art', 'calc-art'][i]}"><span>${String(i + 1).padStart(2, '0')}</span></div>
      <div class="game-info">
        <div><h3>${g.name}</h3><p>${tr(g.descKey)}</p></div>
        <button class="primary small">${tr('games.reaction.start') === 'Démarrer' || tr('games.reaction.start') === 'Start' ? tr('common.open') : tr('common.open')}</button>
      </div>`;
    card.querySelector('button').addEventListener('click', () => startGame(g.id));
    grid.appendChild(card);
  });
}

export function startGame(id) {
  const panel = $('#gamePanel');
  panel.innerHTML = '';
  if (id === 'memory') gameMemory(panel);
  else if (id === 'reaction') gameReaction(panel);
  else if (id === 'calc') gameCalc(panel);
}

/* ─── Memory ─── */
function gameMemory(panel) {
  const symbols = ['◆', '●', '▲', '■', '✦', '○', '◇', '★'];
  const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  let open = [], matched = 0, locked = false, moves = 0;

  panel.innerHTML = `
    <div class="game-center">
      <h3>Memory</h3>
      <p id="memoryStatus">${tr('games.memory.status', { matched: 0, total: 8, moves: 0 })}</p>
      <div class="memory-board" id="memoryBoard"></div>
      <button class="secondary" id="memoryAgain">${tr('games.memory.again')}</button>
    </div>`;
  $('#memoryAgain').addEventListener('click', () => gameMemory(panel));

  const board = $('#memoryBoard');
  deck.forEach(s => {
    const b = document.createElement('button');
    b.className = 'memory-card';
    b.setAttribute('aria-label', '?');
    b.textContent = '?';
    b.addEventListener('click', () => {
      if (locked || b.classList.contains('revealed')) return;
      b.textContent = s;
      b.classList.add('revealed');
      open.push({ b, s });
      if (open.length === 2) {
        moves++; locked = true;
        setTimeout(() => {
          if (open[0].s === open[1].s) {
            matched++;
            open.forEach(x => { x.b.disabled = true; x.b.classList.add('matched'); });
          } else {
            open.forEach(x => { x.b.textContent = '?'; x.b.classList.remove('revealed'); });
          }
          open = []; locked = false;
          $('#memoryStatus').textContent = matched === 8
            ? tr('games.memory.win', { moves })
            : tr('games.memory.status', { matched, total: 8, moves });
        }, 650);
      }
    });
    board.appendChild(b);
  });
}

/* ─── Réflexe ─── */
function gameReaction(panel) {
  panel.innerHTML = `
    <div class="game-center">
      <h3>${tr('games.reaction.desc')}</h3>
      <p id="reactionText">${tr('games.reaction.start')}</p>
      <button class="primary" id="reactionStart">${tr('games.reaction.start')}</button>
      <div class="reaction-area" id="reactionArea">${tr('games.reaction.wait')}</div>
    </div>`;
  let timer = null, start = 0, ready = false;
  const area = $('#reactionArea');
  $('#reactionStart').addEventListener('click', () => {
    clearTimeout(timer); ready = false;
    area.className = 'reaction-area waiting';
    area.textContent = tr('games.reaction.wait');
    timer = setTimeout(() => {
      ready = true; start = performance.now();
      area.className = 'reaction-area go';
      area.textContent = tr('games.reaction.now');
    }, 1200 + Math.random() * 2800);
  });
  area.addEventListener('click', () => {
    if (!ready) {
      if (timer) { clearTimeout(timer); timer = null; }
      $('#reactionText').textContent = tr('games.reaction.tooEarly');
      area.className = 'reaction-area waiting';
      area.textContent = tr('games.reaction.wait');
      return;
    }
    ready = false;
    $('#reactionText').textContent = tr('games.reaction.result', { ms: Math.round(performance.now() - start) });
    area.className = 'reaction-area done';
    area.textContent = tr('games.reaction.result', { ms: Math.round(performance.now() - start) });
  });
}

/* ─── Calculatrice ─── */
function gameCalc(panel) {
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];
  panel.innerHTML = `
    <div class="game-center">
      <h3>${tr('games.calc.title')}</h3>
      <div class="calc-screen" id="calcScreen">0</div>
      <div class="calc-board" id="calcBoard"></div>
      <button class="secondary" id="calcClear">C</button>
    </div>`;
  let expr = '';
  const screen = $('#calcScreen');
  const safeEval = (e) => {
    const clean = e.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
    if (!/^[0-9+\-*/.() ]+$/.test(clean) || clean.length > 40) return null;
    try { return Function('"use strict";return (' + clean + ')')(); } catch { return null; }
  };
  keys.forEach(k => {
    const b = document.createElement('button');
    b.className = 'calc-key' + (k === '=' ? ' equals' : '');
    b.textContent = k;
    b.addEventListener('click', () => {
      if (k === '=') {
        const r = safeEval(expr);
        screen.textContent = r === null || !isFinite(r) ? 'Erreur' : String(Math.round(r * 1e8) / 1e8);
        expr = r !== null && isFinite(r) ? String(r) : '';
      } else {
        expr += k;
        screen.textContent = expr || '0';
      }
    });
    $('#calcBoard').appendChild(b);
  });
  $('#calcClear').addEventListener('click', () => { expr = ''; screen.textContent = '0'; });
}
