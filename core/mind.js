// core/mind.js
// ARI MIND v12 — capa cognitiva estable: intención, emoción simulada,
// restricciones, decisión, autoverificación y fallback inteligente.

'use strict';

const NLP = require('./nlp');

const CODE_WORDS = ['codigo', 'código', 'codigos', 'códigos', 'script', 'html', 'css', 'javascript', 'js', 'python', 'react', 'node', 'api', 'programa', 'programar', 'funcion', 'función', 'bug', 'error', 'consola'];
const CREATE_WORDS = ['crea', 'crear', 'haz', 'hacer', 'genera', 'generar', 'dame', 'escribe', 'redacta', 'construye', 'implementa', 'desarrolla'];
const EXPLAIN_WORDS = ['explica', 'explícame', 'explicame', 'analiza', 'razona', 'piensa', 'por que', 'por qué', 'porque', 'porqué', 'como', 'cómo', 'diferencia', 'compara'];

function constraints(text = '') {
  const low = NLP.norm(text);
  const noCode = [
    /(^|\b)no\s+(quiero|necesito|ocup[oa]|hagas|crear|crees|generes|me\s+des|des|pongas|uses|mandes|env[ií]es)\b.{0,90}\b(codigo|código|codigos|códigos|programa|script|html|css|javascript|js|python|react)\b/,
    /(^|\b)sin\s+(codigo|código|codigos|códigos|programa|script|html|css|javascript|js|python|react|programar)\b/,
    /(^|\b)no\s+mas\s+(codigo|código|codigos|códigos|programas|scripts)\b/,
    /(^|\b)evita(r)?\s+(el\s+|los\s+)?(codigo|código|codigos|códigos|programa|script|html|css)\b/,
    /(^|\b)(solo|solamente)\s+(explica|expl[ií]came|dime|analiza|habla)\b/,
    /(^|\b)en\s+palabras\b/
  ].some(re => re.test(low));

  const codeMention = NLP.hasAny(low, CODE_WORDS);
  const createVerb = NLP.hasAny(low, CREATE_WORDS);
  const explainRequest = NLP.hasAny(low, EXPLAIN_WORDS) || /\?$/.test(String(text).trim());

  const wantsCode = !noCode && codeMention && (
    /(^|\b)(crea|haz|genera|escribe|dame|necesito|quiero|implementa|construye|desarrolla)\b.{0,100}\b(codigo|código|programa|script|html|css|javascript|js|python|react|node|api|app|web)\b/.test(low) ||
    /(^|\b)(arregla|corrige|depura|debug|revisa)\b.{0,100}\b(codigo|código|error|bug|script|html|css|javascript|js|python|react)\b/.test(low)
  );

  return {
    noCode,
    codeMention,
    createVerb,
    explainRequest,
    wantsCode,
    wantsBrief: NLP.hasAny(low, ['breve', 'corto', 'resumen', 'directo', 'rápido', 'rapido']),
    wantsDeep: NLP.hasAny(low, ['profundo', 'a fondo', 'completo', 'detallado', 'paso a paso', 'razona bien', 'piensa bien']),
    wantsHuman: NLP.hasAny(low, ['humano', 'natural', 'sentimientos', 'emocion', 'emoción', 'empatia', 'empatía', 'inteligente', 'mente']),
    asksMindUpgrade: NLP.hasAny(low, ['razonamiento', 'sentimientos', 'inteligente', 'mente', 'piensa como', 'decisiones', 'no solo'])
  };
}

function emotion(text = '') {
  const low = NLP.norm(text);
  const packs = [
    { type: 'risk', label: 'riesgo', level: 5, valence: -1, arousal: 1, words: ['suicid', 'matarme', 'hacerme daño', 'hacerme dano', 'quitarme la vida', 'no quiero vivir'] },
    { type: 'frustration', label: 'frustración', level: 3, valence: -0.55, arousal: 0.78, words: ['no entiendes', 'no sirve', 'sigue igual', 'mal', 'fallo', 'fallos', 'te equivocas', 'molesto', 'harto', 'frustrado'] },
    { type: 'sadness', label: 'tristeza', level: 3, valence: -0.72, arousal: 0.35, words: ['triste', 'solo', 'sola', 'llorar', 'deprim', 'extraño', 'extrano', 'duelo', 'vacío', 'vacio'] },
    { type: 'anxiety', label: 'ansiedad', level: 3, valence: -0.55, arousal: 0.86, words: ['ansioso', 'ansiosa', 'ansiedad', 'pánico', 'panico', 'miedo', 'preocupado', 'preocupada', 'nervioso'] },
    { type: 'tired', label: 'cansancio', level: 2, valence: -0.42, arousal: 0.25, words: ['cansado', 'cansada', 'agotado', 'agotada', 'burnout', 'sin energia', 'sin energía', 'estresado'] },
    { type: 'excitement', label: 'entusiasmo', level: 1, valence: 0.65, arousal: 0.75, words: ['brutal', 'perfecto', 'excelente', 'genial', 'me encanta', 'vamos', 'increible', 'increíble'] }
  ];
  return packs.find(p => NLP.hasAny(low, p.words)) || { type: 'neutral', label: 'neutral', level: 0, valence: 0, arousal: 0.2 };
}

function goal(text = '') {
  const low = NLP.norm(text);
  if (NLP.hasAny(low, ['arregla', 'corrige', 'soluciona', 'no funciona', 'fallo', 'error', 'bug'])) return 'arreglar';
  if (NLP.hasAny(low, ['crea', 'haz', 'genera', 'diseña', 'disena', 'escribe', 'construye'])) return 'crear';
  if (NLP.hasAny(low, ['decide', 'conviene', 'cual elijo', 'cuál elijo', 'recomienda'])) return 'decidir';
  if (NLP.hasAny(low, ['razonamiento', 'sentimientos', 'inteligente', 'mente', 'decisiones'])) return 'mejorar_mente';
  if (/\?$/.test(text) || NLP.hasAny(low, EXPLAIN_WORDS)) return 'entender';
  return 'responder_util';
}

function intent(text = '', c = constraints(text)) {
  const low = NLP.norm(text);
  if (c.noCode && c.codeMention) return 'explain_without_code';
  if (c.asksMindUpgrade) return 'mind_upgrade';
  if (NLP.hasAny(low, ['por que no razona', 'por qué no razona', 'sigue sin razonar', 'no razona', 'no piensa', 'no entiende'])) return 'engine_diagnosis';
  if (c.wantsCode) return 'code_task';
  if (NLP.hasAny(low, ['triste', 'ansioso', 'cansado', 'frustrado', 'miedo', 'solo', 'sola'])) return 'emotional_support';
  if (NLP.hasAny(low, ['decide', 'recomienda', 'conviene', 'mejor', 'peor', 'pros', 'contras'])) return 'decision';
  if (NLP.hasAny(low, CREATE_WORDS)) return 'creation';
  if (c.explainRequest) return 'explanation';
  return 'general';
}

function state(text = '', context = {}) {
  const c = constraints(text);
  const e = emotion(text);
  const g = goal(text);
  const i = intent(text, c);
  const tokens = NLP.tokenize(text);
  const memory = context.memory || {};
  const confidence = estimateConfidence({ text, constraints: c, emotion: e, goal: g, intent: i, memory });
  return {
    version: 'ari-mind-v12',
    raw: NLP.clean(text, 12000),
    low: NLP.norm(text),
    tokens,
    constraints: c,
    emotion: e,
    goal: g,
    intent: i,
    confidence,
    mood: simulatedMood(e, i),
    decision_policy: decisionPolicy(i, c, e),
    timestamp: new Date().toISOString()
  };
}

function simulatedMood(e, i) {
  return {
    valence: e.valence,
    arousal: e.arousal,
    empathy: Math.min(1, 0.62 + Math.max(0, -e.valence) * 0.28 + (e.level >= 2 ? 0.1 : 0)),
    curiosity: i === 'mind_upgrade' || i === 'explanation' ? 0.86 : 0.62,
    confidence: i === 'general' ? 0.55 : 0.76,
    focus: i
  };
}

function decisionPolicy(i, c, e) {
  const policy = [];
  policy.push('respetar intención completa antes que palabra clave aislada');
  if (c.noCode) policy.push('no generar código ni bloques técnicos');
  if (e.level >= 2) policy.push('ajustar tono por emoción detectada');
  if (i === 'decision') policy.push('comparar opciones, riesgos, costo e impacto');
  if (i === 'mind_upgrade') policy.push('explicar módulos de razonamiento, emoción simulada y autoevaluación');
  policy.push('dar conclusión accionable');
  return policy;
}

function estimateConfidence({ text, constraints, emotion, goal, intent, memory }) {
  let n = 0.54;
  if (intent !== 'general') n += 0.15;
  if (goal !== 'responder_util') n += 0.08;
  if (constraints.noCode || constraints.wantsCode) n += 0.08;
  if (emotion.level >= 2) n += 0.04;
  if (memory && (memory.relevant_count || 0) > 0) n += 0.05;
  if (String(text).trim().length < 6) n -= 0.18;
  return Math.max(0.12, Math.min(0.96, Number(n.toFixed(2))));
}

function plan(mindState = {}) {
  const steps = [
    { id: 'understand', label: 'Entender intención real', why: `Objetivo: ${mindState.goal}; intención: ${mindState.intent}` },
    { id: 'context', label: 'Revisar contexto y memoria', why: 'Usar recuerdos solo si ayudan' }
  ];
  if (mindState.constraints?.noCode) steps.push({ id: 'constraint:no_code', label: 'Respetar “sin código”', why: 'La restricción explícita gana sobre palabras como crear/código' });
  if (mindState.emotion?.level >= 2) steps.push({ id: 'emotion', label: 'Ajustar tono emocional', why: `Señal detectada: ${mindState.emotion.label}` });
  if (mindState.intent === 'decision') steps.push({ id: 'decision', label: 'Evaluar opciones', why: 'Comparar impacto, riesgo, costo y reversibilidad' });
  if (mindState.intent === 'mind_upgrade') steps.push({ id: 'mind', label: 'Diseñar mente simulada', why: 'Razonamiento + emoción simulada + autoverificación' });
  steps.push({ id: 'answer', label: 'Responder útil', why: 'Dar salida clara, práctica y honesta' });
  steps.push({ id: 'verify', label: 'Autoevaluar', why: 'Evitar contradicciones, código no pedido o tono incorrecto' });
  return steps;
}

function fallback({ plan: planObj = {}, execution = {}, learned = [] } = {}) {
  const s = planObj.mind || state(planObj.original_input || '');
  if (learned.length) {
    return `Guardé esta información en memoria:\n\n${learned.map(f => `- ${f.text}`).join('\n')}\n\nLa usaré cuando sea relevante.`;
  }
  if (s.intent === 'mind_upgrade') {
    return [
      'Ahora entiendo mejor lo que necesitas: no quieres solo más respuestas ni más texto en el brain; quieres que Ari tenga una **mente operativa**.',
      '',
      'La versión correcta debe funcionar con estos módulos:',
      '',
      '1. **Razonamiento:** separa objetivo, datos, supuestos, riesgos y conclusión.',
      '2. **Decisiones:** compara opciones por impacto, costo, riesgo y reversibilidad.',
      '3. **Emoción simulada:** no siente de verdad, pero detecta frustración, ansiedad, cansancio, entusiasmo o tristeza y adapta el tono.',
      '4. **Memoria:** usa datos del usuario cuando aportan contexto, sin forzarlos.',
      '5. **Autoverificación:** revisa si respetó restricciones como “sin código”, si respondió lo pedido y si no inventó.',
      '6. **Aprendizaje:** guarda preferencias estables y feedback para mejorar futuras respuestas.',
      '',
      'Conclusión: Ari no debe buscar palabras; debe crear un estado mental del mensaje y responder desde ese estado.'
    ].join('\n');
  }
  if (s.intent === 'explain_without_code') {
    return 'Entendido. No crearé código. Te responderé con explicación, diagnóstico y pasos claros, respetando que quieres hablarlo sin bloques técnicos.';
  }
  if (s.intent === 'engine_diagnosis') {
    return 'Ari fallaba porque reaccionaba por palabras clave. La corrección es una capa mental previa: restricciones, intención real, emoción, memoria, plan y autoverificación antes de responder.';
  }
  if (s.intent === 'decision') {
    return 'Para decidir bien, necesito comparar opciones por impacto, costo, riesgo y reversibilidad. La mejor decisión suele ser la que más te acerca al objetivo con menor daño si sale mal.';
  }
  if (s.emotion.level >= 2) {
    return `Detecto ${s.emotion.label}. No voy a responder frío: primero bajo el problema a algo manejable, luego identificamos qué puedes controlar y después elegimos el siguiente paso.`;
  }
  return 'Puedo ayudarte, pero para una respuesta avanzada falta configurar la API. Mientras tanto, el core local puede analizar intención, emoción simulada, memoria y darte una guía práctica.';
}

function enforce(answer = '', mindState = {}) {
  let text = NLP.clean(answer, 30000);
  if (mindState.constraints?.noCode) {
    text = text.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
    text = text.replace(/aqui tienes el codigo/gi, 'aquí tienes la explicación');
    text = text.replace(/puedo crear el codigo/gi, 'puedo explicarlo sin código');
    if (!/sin código|sin codigo|no crear[eé]? código|no voy a crear código/i.test(text)) {
      text += '\n\nRespetaré tu instrucción: **sin crear código**.';
    }
  }
  return text;
}

function compact(s = {}) {
  return {
    intent: s.intent,
    goal: s.goal,
    emotion: s.emotion?.label,
    confidence: s.confidence,
    constraints: s.constraints,
    policy: s.decision_policy
  };
}

function llmContext(mindState = {}) {
  return [
    'ESTADO MENTAL SIMULADO DE ARI:',
    `- Intención: ${mindState.intent}`,
    `- Objetivo: ${mindState.goal}`,
    `- Emoción detectada: ${mindState.emotion?.label || 'neutral'} nivel ${mindState.emotion?.level || 0}`,
    `- Confianza: ${mindState.confidence}`,
    `- Restricciones: ${JSON.stringify(mindState.constraints || {})}`,
    `- Política de decisión: ${(mindState.decision_policy || []).join('; ')}`,
    '',
    'REGLAS DE RESPUESTA:',
    '- No digas que tienes sentimientos reales. Puedes hablar de emoción simulada o lectura emocional.',
    '- Si el usuario pide “sin código”, no incluyas bloques de código.',
    '- Si el usuario está frustrado, reconoce el punto y cambia estrategia.',
    '- Si hay decisión, da recomendación con criterios.',
    '- Si falta información crítica, pregunta una sola cosa; si no, avanza con una suposición clara.'
  ].join('\n');
}

module.exports = {
  constraints,
  emotion,
  goal,
  intent,
  state,
  plan,
  fallback,
  enforce,
  compact,
  llmContext,
  CODE_WORDS,
  CREATE_WORDS,
  EXPLAIN_WORDS
};
