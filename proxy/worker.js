/**
 * NEXUS Browser — proxy web optionnel (Cloudflare Worker)
 * ═══════════════════════════════════════════════════════════
 * Proxy HTTP(S) strictement filtré, conçu pour un usage personnel,
 * avec protection SSRF, limite de taille, timeout et blocage des
 * redirections vers des cibles interdites.
 *
 * Routes :
 *   GET /?url=<https://...>   → renvoie le contenu filtré
 *   GET /health               → état du service
 *
 * Limites assumées et documentées (voir proxy/README.md) :
 *   - Texte/HTML simple uniquement (les SPA très dynamiques, les
 *     WebSockets, la vidéo en streaming et les connexions
 *     authentifiées ne fonctionnent pas via un proxy de ce type).
 *   - Ne contourne aucun paywall, blocage d'administration ou
 *     restriction réseau : ce n'est pas son rôle.
 *   - Aucune donnée (mot de passe, cookie) n'est collectée ni
 *     journalisée : les cookies reçus sont supprimés.
 */

const MAX_BODY_BYTES = 2 * 1024 * 1024;      // 2 Mo max par réponse
const FETCH_TIMEOUT_MS = 10_000;             // timeout global
const MAX_REDIRECTS = 3;
const ALLOWED_SCHEMES = new Set(['http:', 'https:']);
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i, /^127\./, /^0\./, /^10\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./, /^::1$/, /^fc00:/i, /^fe80:/i, /^fd/i, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /\.local$/i, /\.internal$/i, /\.localhost$/i, /\.home$/i, /\.corp$/i, /\.lan$/i,
];
const PRIVATE_IP_V4 = /^(0|10|127|169\.254|192\.168)\.|^172\.(1[6-9]|2\d|3[01])\.|^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./;

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'x-nexus-proxy': '1' },
  });
}

function isBlockedHost(hostname) {
  if (!hostname) return true;
  // littéral IPv6
  if (hostname.includes(':')) {
    const h = hostname.replace(/^\[|\]$/g, '').toLowerCase();
    if (h === '::' || h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true;
  }
  for (const re of BLOCKED_HOST_PATTERNS) if (re.test(hostname)) return true;
  // IP littérale IPv4 non-privée déjà couverte ci-dessus ; IPv4 privée :
  if (PRIVATE_IP_V4.test(hostname)) return true;
  return false;
}

function validateUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { return null; }
  if (!ALLOWED_SCHEMES.has(u.protocol)) return null;
  if (u.protocol === 'https:' && u.port === '443') u.port = '';
  if (u.port && ['80', '443'].includes(u.port)) u.port = '';
  if (isBlockedHost(u.hostname)) return null;
  if (u.username || u.password) return null; // pas d'identifiants dans l'URL
  if (raw.length > 2048) return null;
  return u;
}

/** Suivi manuel des redirections pour revérifier chaque cible. */
async function fetchWithGuards(url, env) {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const u = validateUrl(current.href);
    if (!u) throw new Error('blocked_redirect');
    const res = await fetch(u.href, {
      redirect: 'manual',
      headers: {
        'user-agent': 'NexusBrowserProxy/1.0 (+personal use)',
        'accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.3',
        'accept-language': 'fr,en;q=0.8',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if ([301, 302, 303, 307, 308].includes(res.status) && res.headers.get('location')) {
      const next = new URL(res.headers.get('location'), current);
      current = next;
      continue;
    }
    return res;
  }
  throw new Error('too_many_redirects');
}

export default {
  async fetch(request, env) {
    const reqUrl = new URL(request.url);

    if (reqUrl.pathname === '/health') {
      return jsonResponse({ ok: true, service: 'nexus-proxy', version: '1.0.0' });
    }

    if (reqUrl.pathname !== '/') {
      return jsonResponse({ error: 'not_found' }, 404);
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'method_not_allowed' }, 405);
    }

    // ─── Clé d'accès personnelle (obligatoire) : évite un relais ouvert ───
    const ACCESS_KEY = (env && env.NEXUS_ACCESS_KEY) || '';
    if (ACCESS_KEY) {
      const provided = reqUrl.searchParams.get('key') || (request.headers.get('x-nexus-key') || '');
      if (provided !== ACCESS_KEY) return jsonResponse({ error: 'unauthorized' }, 401);
    } else {
      return jsonResponse({ error: 'not_configured', detail: 'Define NEXUS_ACCESS_KEY secret (wrangler secret put NEXUS_ACCESS_KEY).' }, 503);
    }

    const target = reqUrl.searchParams.get('url');
    if (!target) return jsonResponse({ error: 'missing_url' }, 400);

    const u = validateUrl(target);
    if (!u) return jsonResponse({ error: 'blocked_url', detail: 'Scheme, host or port not allowed.' }, 403);

    try {
      const upstream = await fetchWithGuards(u, env);

      const ct = (upstream.headers.get('content-type') || '').toLowerCase();
      if (!/text\/html|application\/xhtml|text\/plain/.test(ct)) {
        return jsonResponse({ error: 'unsupported_content_type', detail: ct || 'unknown' }, 415);
      }

      // Limite de taille : on tronque au-delà du quota octets autorisés
      const len = Number(upstream.headers.get('content-length') || '0');
      if (len > MAX_BODY_BYTES) {
        return jsonResponse({ error: 'too_large', detail: `>${MAX_BODY_BYTES} bytes` }, 413);
      }

      const buf = await upstream.arrayBuffer();
      if (buf.byteLength > MAX_BODY_BYTES) {
        return jsonResponse({ error: 'too_large' }, 413);
      }

      return new Response(buf, {
        status: upstream.status,
        headers: {
          'content-type': ct.includes('text/plain') ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'x-nexus-proxy': '1',
          // Aucun en-tête de confidentialité du client n'est transmis ; les cookies sont jetés.
        },
      });
    } catch (err) {
      const msg = String(err && err.message || err);
      if (msg.includes('blocked_redirect')) return jsonResponse({ error: 'blocked_redirect' }, 403);
      if (msg.includes('too_many_redirects')) return jsonResponse({ error: 'too_many_redirects' }, 508);
      if (msg.includes('Timeout') || msg.includes('abort')) return jsonResponse({ error: 'timeout' }, 504);
      return jsonResponse({ error: 'upstream_failed', detail: msg.slice(0, 200) }, 502);
    }
  },
};
