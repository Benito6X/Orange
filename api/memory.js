const { requireAuth, readBody } = require('./_auth');
const { getJson, setJson } = require('./_kv');
const { inferTags } = require('./_engine');

const KEY = 'aura:owner:memories';

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === 'GET') {
      const memories = await getJson(KEY, []);
      return json(res, 200, { ok: true, memories });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const text = String(body.text || '').trim();
      if (!text) return json(res, 400, { ok: false, error: 'La memoria no puede estar vacía.' });
      const memories = await getJson(KEY, []);
      const item = {
        id: `mem_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        text,
        tags: Array.isArray(body.tags) && body.tags.length ? body.tags : inferTags(text),
        createdAt: new Date().toISOString()
      };
      memories.unshift(item);
      await setJson(KEY, memories.slice(0, 500));
      return json(res, 200, { ok: true, memory: item, memories });
    }

    if (req.method === 'DELETE') {
      const body = await readBody(req);
      const id = String(body.id || '').trim();
      const memories = await getJson(KEY, []);
      const next = id ? memories.filter(m => m.id !== id) : [];
      await setJson(KEY, next);
      return json(res, 200, { ok: true, memories: next });
    }

    return json(res, 405, { ok: false, error: 'Método no permitido.' });
  } catch (err) {
    return json(res, 500, { ok: false, error: err.message || 'Error de memoria.' });
  }
};
