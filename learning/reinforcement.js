// learning/reinforcement.js
// Reforzamiento ligero: ajusta prioridad de memoria según feedback y uso.

'use strict';

function reinforceMemory(memoryManager, feedback = {}, usedItems = []) {
  if (!memoryManager || !feedback?.isFeedback) return { updated: 0 };
  let updated = 0;
  const delta = feedback.sentiment === 'positive' ? 0.3 : feedback.sentiment === 'negative' ? -0.15 : 0.05;

  for (const item of usedItems || []) {
    const text = item.text || item.t;
    if (!text) continue;
    for (const fact of memoryManager.longTerm.facts) {
      if ((fact.text || '').toLowerCase() === String(text).toLowerCase()) {
        fact.weight = Math.max(0.1, Math.min(10, (fact.weight || 1) + delta));
        fact.last_access = Date.now();
        updated++;
      }
    }
  }

  memoryManager.longTerm.forgetSmart();
  memoryManager.semantic.forgetSmart();
  return { updated };
}

module.exports = { reinforceMemory };
