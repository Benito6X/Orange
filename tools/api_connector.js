// tools/api_connector.js
// Conector API con allowlist de hosts para evitar SSRF/abuso.
// Configura ARI_ALLOWED_API_HOSTS="api.ejemplo.com,otro.com".

'use strict';

function allowedHosts() {
  return String(process.env.ARI_ALLOWED_API_HOSTS || '')
    .split(',')
    .map(x => x.trim().toLowerCase())
    .filter(Boolean);
}

function assertAllowed(urlString) {
  const url = new URL(urlString);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Protocolo no permitido');
  const hosts = allowedHosts();
  if (!hosts.length) throw new Error('No hay hosts permitidos. Configura ARI_ALLOWED_API_HOSTS.');
  if (!hosts.includes(url.hostname.toLowerCase())) throw new Error(`Host no permitido: ${url.hostname}`);
  return url;
}

async function run(args = {}) {
  const url = assertAllowed(args.url || args.endpoint || '');
  const method = String(args.method || 'GET').toUpperCase();
  if (!['GET', 'POST'].includes(method)) throw new Error('Solo se permite GET o POST');

  const headers = { 'Accept': 'application/json,text/plain;q=0.8,*/*;q=0.5' };
  if (args.headers && typeof args.headers === 'object') {
    for (const [k, v] of Object.entries(args.headers)) {
      if (/^(authorization|cookie|set-cookie)$/i.test(k)) continue;
      headers[k] = String(v).slice(0, 200);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: method === 'POST' && args.body ? JSON.stringify(args.body) : undefined,
    signal: AbortSignal.timeout(7000)
  });
  const text = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    url: url.toString(),
    content_type: res.headers.get('content-type') || '',
    content: text.slice(0, 6000)
  };
}

module.exports = { name: 'api_connector', run, allowedHosts };
