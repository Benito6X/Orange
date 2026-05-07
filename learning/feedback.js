// learning/feedback.js
// Detecta feedback del usuario y genera aprendizajes accionables.

'use strict';

const NLP = require('../core/nlp');
const Preferences = require('./user_preferences');

function detectFeedback(text = '') {
  const low = NLP.norm(text);
  const positive = NLP.hasAny(low, ['me gusto', 'me gustó', 'perfecto', 'excelente', 'asi si', 'así sí', 'eso era', 'brutal']);
  const negative = NLP.hasAny(low, ['no me gusto', 'no me gustó', 'mal', 'feo', 'no sirve', 'muy simple', 'demasiado', 'no entendi', 'no entendí']);
  const style = NLP.hasAny(low, ['mas profesional', 'más profesional', 'mas corto', 'más corto', 'mas detalle', 'más detalle', 'premium', 'moderno', 'simple']);

  if (!positive && !negative && !style) return { isFeedback: false };
  return {
    isFeedback: true,
    sentiment: positive && !negative ? 'positive' : negative ? 'negative' : 'neutral',
    preferences: Preferences.updateFromFeedback(text, {}),
    raw: NLP.clean(text, 1000)
  };
}

function buildMemoryFactsFromFeedback(feedback = {}) {
  if (!feedback.isFeedback) return [];
  const facts = [];
  if (feedback.preferences?.tone) facts.push({ text: `Preferencia de tono del usuario: ${feedback.preferences.tone}`, tag: 'preferencia', weight: 2 });
  if (feedback.preferences?.detail_level) facts.push({ text: `Preferencia de detalle del usuario: ${feedback.preferences.detail_level}`, tag: 'preferencia', weight: 2 });
  if (feedback.raw && feedback.sentiment !== 'neutral') facts.push({ text: `Feedback del usuario (${feedback.sentiment}): ${feedback.raw}`, tag: 'feedback', weight: feedback.sentiment === 'positive' ? 1.5 : 2 });
  return facts;
}

module.exports = { detectFeedback, buildMemoryFactsFromFeedback };
