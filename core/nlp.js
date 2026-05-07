// core/nlp.js
// NLP ligero para Ari: intención múltiple, entidades y contexto implícito.
// No reemplaza a un LLM; prepara señales para que Ari planifique mejor.

'use strict';

const STOP = new Set(`el la los las un una unos unas de del al y o en que es se por con a su para me mi mis te tu tus si no ya le lo nos les hay ser son era fue han he ha pero como mas más bien muy tambien también asi así esto eso esta este ese esa aqui aquí ahi ahí donde cuando porqué porque aunque tanto todo toda todos todas cada otro otra qué que cómo como cuál cual cuándo cuando quién quien cuánto cuanto dónde donde puedes podrias podrías ayuda ayudame ayúdame necesito quiero haz hacer crea crear dame generar genera divide decide aplica maneja verifica detecta sistema`.split(/\s+/));

function norm(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0000/g, '')
    .trim();
}

function clean(value = '', max = 12000) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, max);
}

function tokenize(value = '') {
  return norm(value)
    .replace(/[¿¡.,;:!?()\[\]{}«»"“”'`<>]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

function hasAny(low, terms) {
  const text = norm(low);
  return terms.some(term => {
    const t = norm(term);
    if (!t) return false;
    if (/^[a-z0-9]+$/.test(t) && t.length <= 3) {
      return new RegExp(`(^|[^a-z0-9])${t}([^a-z0-9]|$)`).test(text);
    }
    return text.includes(t);
  });
}

function sentenceSplit(text = '') {
  return clean(text)
    .split(/(?:\n+|(?<=[.!?])\s+|\s+(?:y tambien|y también|ademas|además|luego|despues|después)\s+)/i)
    .map(x => x.trim())
    .filter(Boolean);
}

function detectIntents(text = '') {
  const low = norm(text);
  const intents = [];
  const add = (name, confidence = 0.7, reason = '') => intents.push({ name, confidence, reason });

  if (/^(recuerda|aprende|guarda|nota|memoriza)\b/.test(low) || hasAny(low, ['mi nombre es', 'me llamo', 'me gusta', 'prefiero', 'de ahora en adelante'])) add('memory_write', 0.95, 'El usuario está enseñando o guardando información');
  if (hasAny(low, ['que recuerdas de mi', 'qué recuerdas de mí', 'que sabes de mi', 'mi memoria', 'mis datos', 'como me llamo'])) add('memory_query', 0.95, 'El usuario pregunta por memoria');
  if (/(^|\b)(calcula|calcular|resuelve|cuanto es|cuanto da|resultado de)(\b|$)/.test(low) || /^[\d\s+\-*/().,%×÷^]+$/.test(text.trim())) add('calculation', 0.95, 'Operación matemática detectable');
  if (hasAny(low, ['codigo', 'código', 'script', 'programa', 'funcion', 'función', 'javascript', 'js', 'python', 'react', 'node', 'bug', 'error', 'archivo', 'zip', 'ejecuta este js', 'corre este js'])) add('coding', 0.82, 'Solicitud técnica o de programación');
  if (hasAny(low, ['buscar en internet', 'busca en internet', 'web', 'actual', 'reciente', 'ultimas', 'últimas', 'hoy', 'precio', 'noticia', '2026', 'latest'])) add('web_search', 0.86, 'Puede requerir datos actuales');
  if (hasAny(low, ['api', 'endpoint', 'conectar', 'integracion', 'integración', 'fetch'])) add('api_use', 0.74, 'Posible uso de API externa');
  if (hasAny(low, ['lee el archivo', 'archivo', 'documento', 'txt', 'json', 'md'])) add('file_read', 0.65, 'Menciona lectura de archivos');
  if (hasAny(low, ['explica', 'razona', 'analiza', 'compara', 'por que', 'por qué', 'paso a paso', 'estrategia', 'plan'])) add('reasoning', 0.88, 'Pide análisis o inferencia');
  if (hasAny(low, ['imagen', 'logo', 'diseño', 'diseno', 'ui', 'ux', 'viral', 'profesional', '4k'])) add('creative_design', 0.78, 'Pide diseño/creatividad');
  if (/\?$/.test(text.trim()) || /^(que|qué|cual|cuál|cuando|cuándo|donde|dónde|quien|quién|como|cómo)\b/.test(low)) add('question', 0.70, 'Pregunta directa');
  if (hasAny(low, ['triste', 'ansiedad', 'solo', 'sola', 'deprim', 'matarme', 'suicid', 'no quiero vivir'])) add('emotional_support', 0.90, 'Señal emocional o de riesgo');

  if (!intents.length) add('general', 0.50, 'No hay intención especializada clara');
  return mergeIntents(intents);
}

function mergeIntents(intents = []) {
  const map = new Map();
  for (const intent of intents) {
    if (!map.has(intent.name) || map.get(intent.name).confidence < intent.confidence) map.set(intent.name, intent);
  }
  return [...map.values()].sort((a, b) => b.confidence - a.confidence);
}

function extractEntities(text = '') {
  const raw = clean(text, 12000);
  const entities = [];
  const add = (type, value, meta = {}) => {
    const v = clean(value, 200);
    if (!v) return;
    if (!entities.some(e => e.type === type && norm(e.value) === norm(v))) entities.push({ type, value: v, ...meta });
  };

  const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  for (const m of raw.matchAll(emailRe)) add('email', m[0]);

  const urlRe = /https?:\/\/[^\s)]+/gi;
  for (const m of raw.matchAll(urlRe)) add('url', m[0]);

  const dateRe = /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|hoy|mañana|ayer|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/gi;
  for (const m of raw.matchAll(dateRe)) add('date', m[0]);

  const numberRe = /\b\d+(?:[.,]\d+)?\b/g;
  for (const m of raw.matchAll(numberRe)) add('number', m[0]);

  const quotedRe = /["“”'`«»]([^"“”'`«»]{2,80})["“”'`«»]/g;
  for (const m of raw.matchAll(quotedRe)) add('quoted_text', m[1]);

  // Nombres propios simples: secuencias capitalizadas, evitando inicio genérico de frase.
  const nameRe = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})\b/g;
  for (const m of raw.matchAll(nameRe)) {
    if (!['Hola', 'Necesito', 'Quiero', 'Sistema', 'Debe'].includes(m[1])) add('proper_name', m[1]);
  }

  return entities.slice(0, 40);
}

function inferContext(text = '', history = []) {
  const low = norm(text);
  const lastUser = [...(history || [])].reverse().find(x => x && (x.role === 'user' || x.role === 'usuario'));
  const implicit = [];

  if (/^(eso|esto|lo anterior|esa idea|ese codigo|ese código|hazlo|mejoralo|mejóralo)\b/.test(low)) {
    implicit.push({ type: 'reference_previous_turn', value: clean(lastUser?.text || lastUser?.content || '', 500) });
  }
  if (hasAny(low, ['más profesional', 'mas profesional', 'más premium', 'mas premium', 'otra forma'])) {
    implicit.push({ type: 'style_continuation', value: 'El usuario quiere una versión mejorada del resultado anterior' });
  }
  if (hasAny(low, ['no entendi', 'no entendí', 'explicalo simple', 'explícalo simple'])) {
    implicit.push({ type: 'simplify', value: 'Reducir tecnicismos y explicar con pasos concretos' });
  }
  return implicit;
}

function analyze(text = '', context = {}) {
  const history = context.history || [];
  return {
    raw: clean(text, 12000),
    low: norm(text),
    tokens: tokenize(text),
    parts: sentenceSplit(text),
    intents: detectIntents(text),
    entities: extractEntities(text),
    implicit_context: inferContext(text, history),
    length: clean(text).length
  };
}

module.exports = { STOP, norm, clean, tokenize, hasAny, sentenceSplit, detectIntents, extractEntities, inferContext, analyze };
