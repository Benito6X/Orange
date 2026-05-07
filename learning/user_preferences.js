// learning/user_preferences.js
// Aprende preferencias de estilo/formato desde memoria y feedback.

'use strict';

const NLP = require('../core/nlp');

function extractFromMemory(memory = {}, history = []) {
  const facts = Array.isArray(memory.facts) ? memory.facts : [];
  const user = memory.user || {};
  const text = [
    ...Object.entries(user).map(([k, v]) => `${k}: ${v}`),
    ...facts.map(f => f.text || f.t || f),
    ...(history || []).slice(-8).map(h => h.text || h.content || '')
  ].join('\n');
  const low = NLP.norm(text);

  const prefs = {
    tone: 'profesional_cercano',
    detail_level: 'medio',
    format: 'claro_con_pasos',
    design_style: null
  };

  if (NLP.hasAny(low, ['formal', 'profesional'])) prefs.tone = 'profesional';
  if (NLP.hasAny(low, ['casual', 'natural', 'relajado'])) prefs.tone = 'casual_cercano';
  if (NLP.hasAny(low, ['tecnico', 'técnico', 'programador', 'codigo', 'código'])) prefs.tone = 'tecnico_claro';
  if (NLP.hasAny(low, ['explica simple', 'no entendi', 'no entendí', 'paso a paso simple'])) prefs.detail_level = 'simple';
  if (NLP.hasAny(low, ['detallado', 'profundo', 'completo', 'avanzado'])) prefs.detail_level = 'alto';
  if (NLP.hasAny(low, ['premium', 'moderno', '4k', 'nitidez', 'sombras', 'iluminacion', 'iluminación'])) prefs.design_style = 'premium_moderno_4k';

  return prefs;
}

function updateFromFeedback(feedbackText = '', current = {}) {
  const low = NLP.norm(feedbackText);
  const next = { ...current };
  if (NLP.hasAny(low, ['mas corto', 'más corto', 'resumido'])) next.detail_level = 'bajo';
  if (NLP.hasAny(low, ['mas detalle', 'más detalle', 'explica mejor'])) next.detail_level = 'alto';
  if (NLP.hasAny(low, ['muy robotico', 'robótico', 'mas humano', 'más humano'])) next.tone = 'humano_cercano';
  if (NLP.hasAny(low, ['mas profesional', 'más profesional'])) next.tone = 'profesional';
  return next;
}

module.exports = { extractFromMemory, updateFromFeedback };
