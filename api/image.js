const { requireAuth, readBody } = require('./_auth');

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function palette(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('rojo')) return ['#ff3b3b', '#6d1111', '#ffb4b4'];
  if (p.includes('azul')) return ['#2f6bff', '#071a4a', '#9cc3ff'];
  if (p.includes('verde')) return ['#20c997', '#073b33', '#b6fff0'];
  if (p.includes('morado') || p.includes('violeta')) return ['#7c5cff', '#1b114d', '#d5c8ff'];
  const h = hash(prompt) % 360;
  return [`hsl(${h},85%,58%)`, `hsl(${(h + 40) % 360},70%,18%)`, `hsl(${(h + 180) % 360},90%,82%)`];
}

function svgPoster(prompt) {
  const [a, b, c] = palette(prompt);
  const safe = prompt.replace(/[<>&]/g, '').slice(0, 80) || 'Aura Visual';
  const seed = hash(prompt);
  const circles = Array.from({ length: 18 }, (_, i) => {
    const x = (seed * (i + 3) * 37) % 1200;
    const y = (seed * (i + 7) * 53) % 1200;
    const r = 18 + ((seed + i * 29) % 110);
    const op = 0.07 + ((i % 5) * 0.025);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? a : c}" opacity="${op}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${b}"/><stop offset=".55" stop-color="#080812"/><stop offset="1" stop-color="${a}"/></linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="26"/></filter>
  </defs>
  <rect width="1200" height="1200" fill="url(#g)"/>
  <g filter="url(#blur)">${circles}</g>
  <rect x="80" y="80" width="1040" height="1040" rx="64" fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.16)"/>
  <path d="M170 780 C360 610 470 870 650 660 C810 475 930 520 1030 400" fill="none" stroke="${c}" stroke-width="10" opacity=".75" stroke-linecap="round"/>
  <circle cx="930" cy="330" r="90" fill="${a}" opacity=".22"/>
  <text x="110" y="180" fill="#ffffff" font-family="Inter,Arial,sans-serif" font-size="42" font-weight="800" letter-spacing="-1">Aura Visual Engine</text>
  <text x="110" y="1000" fill="#ffffff" font-family="Inter,Arial,sans-serif" font-size="62" font-weight="900" letter-spacing="-2">${safe}</text>
  <text x="112" y="1056" fill="rgba(255,255,255,.62)" font-family="Inter,Arial,sans-serif" font-size="24">Generado sin API de imagen externa</text>
</svg>`;
}

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Método no permitido.' });

  const body = await readBody(req);
  const prompt = String(body.prompt || '').trim();
  if (!prompt) return json(res, 400, { ok: false, error: 'Describe la imagen que quieres crear.' });

  const svg = svgPoster(prompt);
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return json(res, 200, { ok: true, type: 'svg', imageDataUrl: dataUrl, svg, note: 'Motor gráfico propio. No usa OpenAI, Pollinations ni Replicate.' });
};
