// memory/memory_manager.js
// Orquestador de memoria: short-term + long-term + semantic.

'use strict';

const { ShortTermMemory } = require('./short_term');
const { LongTermMemory } = require('./long_term');
const { SemanticMemory } = require('./semantic');
const NLP = require('../core/nlp');

class MemoryManager {
  constructor({ shortTerm, longTerm, semantic } = {}) {
    this.shortTerm = shortTerm || new ShortTermMemory();
    this.longTerm = longTerm || new LongTermMemory();
    this.semantic = semantic || new SemanticMemory();
  }

  static fromClientPayload(payload = {}) {
    const user = payload.user || {};
    const facts = payload.facts || [];
    const history = payload.history || payload.messages || [];
    const semanticItems = payload.semantic || [];

    const longTerm = new LongTermMemory({ user, facts });
    const shortTerm = new ShortTermMemory(history);
    const semantic = new SemanticMemory(semanticItems.length ? semanticItems : facts.map(f => ({ text: f.text || f.t || f, tag: f.tag || 'dato', ts: f.ts })));
    return new MemoryManager({ shortTerm, longTerm, semantic });
  }

  learnFromUser(text) {
    const learned = this.longTerm.learnFromText(text);
    for (const fact of learned) this.semantic.add(fact.text, { tag: fact.tag, weight: fact.weight, ts: fact.ts });
    this.semantic.forgetSmart();
    this.longTerm.forgetSmart();
    return learned;
  }

  retrieve(query, opts = {}) {
    const semantic = this.semantic.search(query, { limit: opts.limit || 8 });
    const longTerm = this.longTerm.search(query, { limit: opts.limit || 8 });
    const shortTerm = this.shortTerm.relevant(query, opts.limit || 10);

    const relevant = new Map();
    for (const item of [...semantic, ...longTerm]) {
      const text = NLP.clean(item.text || item.t || '', 1000);
      if (!text) continue;
      if (!relevant.has(NLP.norm(text))) relevant.set(NLP.norm(text), item);
    }

    return {
      user_profile: this.longTerm.user,
      short_term: shortTerm,
      long_term: longTerm,
      semantic,
      relevant_count: relevant.size + shortTerm.length
    };
  }

  buildClientPatch() {
    this.longTerm.forgetSmart();
    this.semantic.forgetSmart();
    return {
      ...this.longTerm.toClientPatch(),
      semantic: this.semantic.toJSON().slice(-80)
    };
  }
}

module.exports = MemoryManager;
