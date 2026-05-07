// memory/long_term.js
// Memoria persistente: perfil, hechos, prioridad y olvido inteligente.

'use strict';

const NLP = require('../core/nlp');

class LongTermMemory {
  constructor({ user = {}, facts = [] } = {}) {
    this.user = user && typeof user === 'object' ? { ...user } : {};
    this.facts = Array.isArray(facts) ? facts.map(normalizeFact).filter(Boolean) : [];
  }

  addFact(text, tag = 'dato', weight = 1) {
    const clean = NLP.clean(text, 1000);
    if (!clean) return null;
    const existing = this.facts.find(f => NLP.norm(f.text) === NLP.norm(clean));
    if (existing) {
      existing.weight = Math.min(10, (existing.weight || 1) + 0.25);
      existing.last_access = Date.now();
      return existing;
    }
    const fact = { id: `fact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, text: clean, tag, weight, ts: Date.now(), last_access: Date.now() };
    this.facts.push(fact);
    return fact;
  }

  setUser(key, value) {
    const k = NLP.clean(key, 80);
    const v = NLP.clean(value, 300);
    if (!k || !v) return false;
    this.user[k] = v;
    return true;
  }

  learnFromText(text = '') {
    const raw = NLP.clean(text, 2000);
    const learned = [];
    const patterns = [
      { re: /(?:mi nombre es|me llamo)\s+([^.,;\n]+)/i, key: 'nombre', make: v => `El nombre del usuario es ${v}` },
      { re: /tengo\s+(\d{1,3})\s+años/i, key: 'edad', make: v => `El usuario tiene ${v} años` },
      { re: /(?:vivo en|soy de|estoy en)\s+([^.,;\n]+)/i, key: 'lugar', make: v => `El usuario vive o está en ${v}` },
      { re: /(?:trabajo como|soy programador|soy diseñador|me dedico a)\s*([^.,;\n]*)/i, key: 'trabajo', make: v => v ? `El usuario se dedica a ${v}` : 'El usuario trabaja en programación/diseño' },
      { re: /(?:me gusta|prefiero|me encanta)\s+([^.,;\n]+)/i, key: null, tag: 'preferencia', make: v => `Al usuario le gusta/prefiere ${v}` },
      { re: /(?:de ahora en adelante|en el futuro|siempre)\s+([^.,;\n]+)/i, key: null, tag: 'preferencia', make: v => `Preferencia futura del usuario: ${v}` },
      { re: /(?:recuerda|aprende|guarda|nota|memoriza)\s+(?:que\s+)?([^\n]+)/i, key: null, tag: 'dato', make: v => v }
    ];

    for (const p of patterns) {
      const m = raw.match(p.re);
      if (!m) continue;
      const value = NLP.clean(m[1], 300);
      if (!value && p.key !== 'trabajo') continue;
      if (p.key && value) this.setUser(p.key, value);
      const factText = p.make(value);
      const fact = this.addFact(factText, p.tag || p.key || 'dato', p.tag === 'preferencia' ? 2 : 1.2);
      if (fact) learned.push(fact);
    }

    return learned;
  }

  search(query, opts = {}) {
    const limit = opts.limit || 8;
    const qTokens = NLP.tokenize(query);
    return this.facts
      .map(fact => {
        const fTokens = NLP.tokenize(fact.text);
        const overlap = qTokens.filter(q => fTokens.some(t => t === q || t.includes(q) || q.includes(t))).length;
        const score = overlap / Math.max(1, qTokens.length) + Math.min(fact.weight || 1, 8) / 20;
        return { ...fact, score: Number(score.toFixed(3)) };
      })
      .filter(f => f.score > 0.08)
      .sort((a, b) => b.score - a.score || (b.weight || 0) - (a.weight || 0))
      .slice(0, limit)
      .map(f => {
        const original = this.facts.find(x => x.id === f.id);
        if (original) original.last_access = Date.now();
        return f;
      });
  }

  forgetSmart(opts = {}) {
    const maxFacts = opts.maxFacts || 180;
    if (this.facts.length <= maxFacts) return [];
    const now = Date.now();
    const ranked = this.facts.map(f => {
      const ageDays = (now - (f.ts || now)) / 86400000;
      const idleDays = (now - (f.last_access || f.ts || now)) / 86400000;
      const pinBonus = ['nombre', 'edad', 'lugar', 'trabajo', 'preferencia'].includes(f.tag) ? 1 : 0;
      const importance = (f.weight || 1) + pinBonus - ageDays * 0.002 - idleDays * 0.008;
      return { f, importance };
    }).sort((a, b) => b.importance - a.importance);
    this.facts = ranked.slice(0, maxFacts).map(x => x.f);
    return ranked.slice(maxFacts).map(x => x.f);
  }

  toClientPatch() {
    return {
      user: this.user,
      facts: this.facts.map(f => ({ t: f.text, tag: f.tag, ts: f.ts, weight: f.weight }))
    };
  }
}

function normalizeFact(fact) {
  const text = NLP.clean(fact.text || fact.t || fact.content || fact, 1000);
  if (!text) return null;
  return {
    id: fact.id || `fact_${Math.abs(hash(text))}_${String(fact.ts || Date.now()).slice(-6)}`,
    text,
    tag: fact.tag || 'dato',
    weight: Number(fact.weight || 1),
    ts: fact.ts || Date.now(),
    last_access: fact.last_access || fact.ts || Date.now()
  };
}

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  return h;
}

module.exports = { LongTermMemory, normalizeFact };
