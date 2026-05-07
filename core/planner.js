// core/planner.js
// Divide problemas en pasos, detecta intención múltiple y decide estrategia antes de responder.

'use strict';

const NLP = require('./nlp');
const Preferences = require('../learning/user_preferences');
const Mind = require('./mind');

function buildSteps(analysis) {
  const intents = analysis.intents.map(i => i.name);
  const steps = [];
  steps.push({ id: 'understand', label: 'Analizar intención real, entidades, restricciones y contexto implícito' });
  if (analysis.mind?.constraints?.noCode) {
    steps.push({ id: 'constraint:no_code', label: 'Respetar restricción explícita: responder sin código' });
  }
  if (analysis.mind?.emotion?.level >= 2) {
    steps.push({ id: 'emotion', label: `Ajustar tono por emoción detectada: ${analysis.mind.emotion.label}` });
  }
  if (analysis.mind?.intent === 'mind_upgrade') {
    steps.push({ id: 'mind_model', label: 'Diseñar respuesta con razonamiento, decisiones, emoción simulada y autoevaluación' });
  }

  if (intents.includes('memory_query') || intents.includes('memory_write')) {
    steps.push({ id: 'memory', label: 'Consultar o actualizar memoria relevante' });
  } else {
    steps.push({ id: 'memory', label: 'Buscar recuerdos útiles sin forzar personalización' });
  }

  if (intents.includes('calculation')) steps.push({ id: 'tool:calculator', label: 'Ejecutar cálculo exacto' });
  if (intents.includes('web_search')) steps.push({ id: 'tool:web_search', label: 'Buscar información actualizada' });
  if (intents.includes('file_read')) steps.push({ id: 'tool:file_reader', label: 'Leer archivo seguro si aplica' });
  if (intents.includes('api_use')) steps.push({ id: 'tool:api_connector', label: 'Consultar API permitida si aplica' });
  if (intents.includes('coding') && shouldExecuteCode(analysis.raw)) steps.push({ id: 'tool:code_executor', label: 'Probar código JavaScript aislado si es seguro' });

  steps.push({ id: 'reason', label: 'Aplicar lógica, inferencias y ordenar solución' });
  steps.push({ id: 'evaluate', label: 'Verificar utilidad, coherencia, seguridad y estilo' });
  steps.push({ id: 'answer', label: 'Responder en español con el tono adecuado' });
  return steps;
}

function shouldExecuteCode(text) {
  const low = NLP.norm(text);
  return NLP.hasAny(low, ['ejecuta este js', 'prueba este javascript', 'corre este codigo', 'corre este código', 'evalua este codigo', 'evalúa este código']);
}

function planTools(analysis) {
  const low = analysis.low;
  const intents = analysis.intents.map(i => i.name);
  const tools = [];

  if (intents.includes('calculation')) {
    tools.push({ name: 'calculator', args: { expression: analysis.raw }, reason: 'El mensaje contiene una operación matemática' });
  }

  if (intents.includes('web_search')) {
    const urls = analysis.entities.filter(e => e.type === 'url').map(e => e.value);
    const query = urls[0] || analysis.raw;
    tools.push({ name: 'web_search', args: { query, max_results: 5 }, reason: 'La respuesta puede depender de información actualizada o web' });
  }

  if (intents.includes('file_read')) {
    const quoted = analysis.entities.find(e => e.type === 'quoted_text')?.value;
    const fileMatch = analysis.raw.match(/(?:archivo|file|documento)\s+([\w./\\()\- áéíóúñ]+\.(?:txt|md|json|js|css|html))/i);
    const path = quoted || fileMatch?.[1];
    if (path) tools.push({ name: 'file_reader', args: { path }, reason: 'El usuario pidió leer un archivo' });
  }

  if (intents.includes('api_use') && analysis.entities.some(e => e.type === 'url')) {
    tools.push({ name: 'api_connector', args: { url: analysis.entities.find(e => e.type === 'url').value, method: 'GET' }, reason: 'El usuario mencionó una API/endpoint' });
  }

  if (!analysis.mind?.constraints?.noCode && intents.includes('coding') && shouldExecuteCode(analysis.raw)) {
    const code = extractCodeBlock(analysis.raw);
    if (code) tools.push({ name: 'code_executor', args: { language: 'javascript', code }, reason: 'El usuario pidió ejecutar/probar código JavaScript' });
  }

  // Evita herramientas duplicadas.
  const seen = new Set();
  return tools.filter(t => {
    const key = `${t.name}:${JSON.stringify(t.args)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractCodeBlock(text = '') {
  const fenced = text.match(/```(?:js|javascript)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const inline = text.match(/(?:ejecuta|corre|prueba|evalua|evalúa)[\s\S]*?:\s*([\s\S]+)/i);
  return inline ? inline[1].trim() : '';
}

function chooseStrategy(analysis) {
  const intents = analysis.intents.map(i => i.name);
  if (analysis.mind?.intent === 'mind_upgrade') return 'mind_architecture';
  if (analysis.mind?.intent === 'engine_diagnosis') return 'diagnose_reasoning';
  if (analysis.mind?.constraints?.noCode && intents.includes('coding')) return 'explain_without_code';
  if (analysis.mind?.intent === 'decision') return 'decision_matrix';
  if (intents.includes('emotional_support')) return 'safety_first';
  if (intents.includes('calculation')) return 'tool_first';
  if (intents.includes('web_search') || intents.includes('file_read') || intents.includes('api_use')) return 'research_then_answer';
  if (intents.includes('coding')) return 'technical_solution';
  if (intents.includes('creative_design')) return 'creative_strategy';
  if (intents.includes('reasoning')) return 'stepwise_reasoning';
  return 'direct_helpful';
}

function shouldUseLLM(analysis, tools) {
  const intents = analysis.intents.map(i => i.name);
  if (analysis.mind?.intent === 'mind_upgrade') return true;
  if (analysis.mind?.intent === 'decision') return true;
  if (analysis.mind?.constraints?.noCode && intents.includes('coding')) return true;
  if (intents.includes('calculation') && tools.length === 1 && analysis.length < 100) return false;
  if (intents.includes('memory_query') && analysis.length < 140) return false;
  return true;
}

function createPlan(input, context = {}) {
  const analysis = NLP.analyze(input, context);
  analysis.mind = Mind.state(input, context);
  const preferences = Preferences.extractFromMemory(context.memory || {}, context.history || []);
  const tools = planTools(analysis);

  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    original_input: NLP.clean(input, 12000),
    analysis,
    strategy: chooseStrategy(analysis),
    steps: buildSteps(analysis),
    tools,
    mind: analysis.mind,
    mind_steps: Mind.plan(analysis.mind),
    use_llm: shouldUseLLM(analysis, tools),
    response_contract: {
      language: 'es',
      tone: preferences.tone || 'profesional_cercano',
      detail_level: preferences.detail_level || 'medio',
      format: preferences.format || 'claro_con_pasos',
      avoid: ['respuestas vacías', 'pedir datos innecesarios', 'inventar resultados de herramientas', 'ignorar restricciones explícitas del usuario', 'fingir sentimientos reales']
    },
    max_loops: 2
  };
}

module.exports = { createPlan, shouldExecuteCode, extractCodeBlock };
