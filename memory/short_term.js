// memory/short_term.js
// Contexto inmediato de conversación: prioriza turnos recientes y reduce ruido.

'use strict';

const NLP = require('../core/nlp');

class ShortTermMemory {
  constructor(history = []) {
    this.history = Array.isArray(history) ? history.map(normalizeTurn).filter(Boolean) : [];
  }

  add(role, text) {
    const turn = normalizeTurn({ role, text, ts: Date.now() });
    if (!turn) return null;
    this.history.push(turn);
    this.trim();
    return turn;
  }

  trim(maxTurns = 40) {
    if (this.history.length > maxTurns) this.history = this.history.slice(-maxTurns);
  }

  relevant(query, limit = 10) {
    const qTokens = NLP.tokenize(query);
    return this.history
      .map((turn, idx) => {
        const text = turn.text || turn.content || '';
        const tTokens = NLP.tokenize(text);
        const overlap = qTokens.filter(q => tTokens.some(t => t === q || t.includes(q) || q.includes(t))).length;
        const recency = idx / Math.max(1, this.history.length);
        const score = overlap / Math.max(1, qTokens.length) + recency * 0.35;
        return { ...turn, score: Number(score.toFixed(3)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .sort((a, b) => (a.ts || 0) - (b.ts || 0));
  }

  summarize(limit = 12) {
    return this.history.slice(-limit).map(turn => ({
      role: turn.role,
      text: NLP.clean(turn.text, 500),
      ts: turn.ts
    }));
  }
}

function normalizeTurn(turn) {
  if (!turn) return null;
  const text = NLP.clean(turn.text || turn.content || turn.message || '', 1600);
  if (!text) return null;
  const role = turn.role === 'ari' || turn.role === 'assistant' || turn.role === 'ai' ? 'ari' : 'user';
  return { role, text, ts: turn.ts || Date.now() };
}

module.exports = { ShortTermMemory, normalizeTurn };
