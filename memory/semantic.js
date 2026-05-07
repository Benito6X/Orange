// memory/semantic.js
// Búsqueda semántica sin dependencias externas: embeddings hash + coseno.
// Es más débil que embeddings reales, pero permite similitud por significado aproximado
// y se puede reemplazar luego por OpenAI embeddings, pgvector, Pinecone, etc.

'use strict';

const NLP = require('../core/nlp');

const DIM = 384;

function hashToken(token) {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function vectorize(text = '') {
  const tokens = NLP.tokenize(text);
  const vector = new Array(DIM).fill(0);
  if (!tokens.length) return vector;

  for (const token of tokens) {
    const h = hashToken(token);
    const idx = h % DIM;
    const sign = (h & 1) ? 1 : -1;
    vector[idx] += sign * (1 + Math.min(token.length, 12) / 12);

    // Bigrams simples para capturar algo de contexto.
    for (let i = 0; i < token.length - 2; i++) {
      const sub = token.slice(i, i + 3);
      const sh = hashToken(sub);
      vector[sh % DIM] += ((sh & 1) ? 1 : -1) * 0.15;
    }
  }

  const mag = Math.sqrt(vector.reduce((s, x) => s + x * x, 0)) || 1;
  return vector.map(x => Number((x / mag).toFixed(6)));
}

function cosine(a = [], b = []) {
  const n = Math.min(a.length, b.length);
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  if (!ma || !mb) return 0;
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

class SemanticMemory {
  constructor(items = []) {
    this.items = Array.isArray(items) ? items.map(normalizeItem).filter(Boolean) : [];
  }

  add(text, meta = {}) {
    const clean = NLP.clean(text, 1600);
    if (!clean) return null;
    const existing = this.items.find(i => NLP.norm(i.text) === NLP.norm(clean));
    if (existing) {
      existing.weight = Math.min(10, (existing.weight || 1) + 0.2);
      existing.last_access = Date.now();
      return existing;
    }
    const item = {
      id: meta.id || `sem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: clean,
      tag: meta.tag || 'semantic',
      weight: Number(meta.weight || 1),
      ts: meta.ts || Date.now(),
      last_access: Date.now(),
      vector: vectorize(clean)
    };
    this.items.push(item);
    return item;
  }

  search(query, opts = {}) {
    const limit = opts.limit || 8;
    const threshold = Number.isFinite(opts.threshold) ? opts.threshold : 0.08;
    const qv = vectorize(query);
    return this.items
      .map(item => {
        const score = cosine(qv, item.vector || vectorize(item.text)) * (1 + Math.min(item.weight || 1, 6) / 20);
        return { ...item, score: Number(score.toFixed(3)) };
      })
      .filter(item => item.score >= threshold)
      .sort((a, b) => b.score - a.score || (b.last_access || 0) - (a.last_access || 0))
      .slice(0, limit)
      .map(item => {
        const original = this.items.find(x => x.id === item.id);
        if (original) original.last_access = Date.now();
        return item;
      });
  }

  forgetSmart(opts = {}) {
    const maxItems = opts.maxItems || 250;
    if (this.items.length <= maxItems) return [];
    const now = Date.now();
    const scored = this.items.map(item => {
      const ageDays = (now - (item.ts || now)) / 86400000;
      const idleDays = (now - (item.last_access || item.ts || now)) / 86400000;
      const importance = (item.weight || 1) - ageDays * 0.003 - idleDays * 0.01 + (item.tag === 'preferencia' ? 1 : 0);
      return { item, importance };
    }).sort((a, b) => b.importance - a.importance);

    const keep = scored.slice(0, maxItems).map(x => x.item);
    const forgotten = scored.slice(maxItems).map(x => x.item);
    this.items = keep;
    return forgotten;
  }

  toJSON() {
    return this.items.map(i => ({ ...i, vector: i.vector }));
  }
}

function normalizeItem(item) {
  if (!item) return null;
  const text = NLP.clean(item.text || item.t || item.content || item, 1600);
  if (!text) return null;
  return {
    id: item.id || `sem_${hashToken(text)}_${String(item.ts || Date.now()).slice(-6)}`,
    text,
    tag: item.tag || 'semantic',
    weight: Number(item.weight || 1),
    ts: item.ts || Date.now(),
    last_access: item.last_access || item.ts || Date.now(),
    vector: Array.isArray(item.vector) && item.vector.length === DIM ? item.vector : vectorize(text)
  };
}

module.exports = { SemanticMemory, vectorize, cosine, DIM };
