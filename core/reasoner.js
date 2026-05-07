// core/reasoner.js
// Ejecuta el plan, coordina memoria/herramientas y prepara el input final para el LLM.

'use strict';

const Personality = require('./personality');
const NLP = require('./nlp');
const ToolRegistry = require('../tools');
const MemoryManager = require('../memory/memory_manager');
const Mind = require('./mind');

async function executePlan(plan, context = {}) {
  const memory = context.memoryManager || MemoryManager.fromClientPayload(context.clientMemory || {});
  const memoryContext = memory.retrieve(plan.original_input, {
    intents: plan.analysis.intents,
    entities: plan.analysis.entities,
    limit: 10
  });

  const toolResults = [];
  for (const toolCall of plan.tools || []) {
    const tool = ToolRegistry.get(toolCall.name);
    if (!tool) {
      toolResults.push({ tool: toolCall.name, ok: false, error: 'Herramienta no registrada' });
      continue;
    }
    try {
      const result = await tool.run(toolCall.args || {}, { plan, memory, context });
      toolResults.push({ tool: toolCall.name, reason: toolCall.reason, ...result });
    } catch (err) {
      toolResults.push({ tool: toolCall.name, ok: false, error: err.message || 'Error ejecutando herramienta' });
    }
  }

  const mindState = plan.mind || Mind.state(plan.original_input || '', { memory: memoryContext });
  const directAnswer = directToolAnswer(plan, toolResults, memoryContext) || directMindAnswer(plan, mindState, memoryContext);
  return {
    plan_id: plan.id,
    memoryContext,
    toolResults,
    mind: mindState,
    directAnswer,
    observations: buildObservations(plan, memoryContext, toolResults)
  };
}

function directToolAnswer(plan, toolResults, memoryContext) {
  const intents = plan.analysis.intents.map(i => i.name);

  if (intents.includes('calculation')) {
    const calc = toolResults.find(r => r.tool === 'calculator');
    if (calc?.ok) return `El resultado es **${calc.result}**.\n\nOperación interpretada: \`${calc.expression}\``;
  }

  if (intents.includes('memory_query')) {
    const lines = [];
    if (memoryContext.user_profile && Object.keys(memoryContext.user_profile).length) {
      for (const [k, v] of Object.entries(memoryContext.user_profile).slice(0, 10)) lines.push(`- ${k}: ${v}`);
    }
    for (const item of memoryContext.long_term || []) lines.push(`- ${item.text || item.t}`);
    if (lines.length) return `Esto es lo más relevante que recuerdo:\n\n${lines.slice(0, 12).join('\n')}`;
    return 'Todavía no tengo recuerdos relevantes guardados para eso.';
  }

  return null;
}


function directMindAnswer(plan, mindState, memoryContext) {
  if (!mindState) return null;
  if (mindState.intent === 'explain_without_code') {
    return Mind.enforce('Entendido. No crearé código. Te lo explico con palabras claras: primero identifico la intención real, luego reviso restricciones como “sin código”, después evalúo contexto y finalmente doy una respuesta práctica sin bloques técnicos.', mindState);
  }
  if (mindState.intent === 'engine_diagnosis') {
    return 'Ari fallaba porque estaba priorizando coincidencias de palabras sobre intención completa. La solución es una mente operativa: restricciones primero, intención real, emoción detectada, memoria relevante, plan, respuesta y autoverificación.';
  }
  if (mindState.intent === 'mind_upgrade' && !process.env.OPENAI_API_KEY) {
    return Mind.fallback({ plan });
  }
  if (mindState.intent === 'decision' && !process.env.OPENAI_API_KEY) {
    return 'Para decidir bien, Ari debe evaluar: objetivo, opciones, impacto, costo, riesgo y reversibilidad. La recomendación debe salir de esos criterios, no de una palabra clave.';
  }
  return null;
}

function buildObservations(plan, memoryContext, toolResults) {
  const out = [];
  out.push(`Estrategia: ${plan.strategy}`);
  out.push(`Intenciones: ${plan.analysis.intents.map(i => `${i.name}(${i.confidence})`).join(', ')}`);
  if (plan.analysis.entities.length) out.push(`Entidades: ${plan.analysis.entities.map(e => `${e.type}:${e.value}`).join(', ')}`);
  if (plan.mind) out.push(`Mente: intent=${plan.mind.intent}, goal=${plan.mind.goal}, emotion=${plan.mind.emotion?.label}, confidence=${plan.mind.confidence}`);
  if (memoryContext.relevant_count) out.push(`Memoria relevante encontrada: ${memoryContext.relevant_count}`);
  if (toolResults.length) {
    out.push(`Herramientas ejecutadas: ${toolResults.map(r => `${r.tool}:${r.ok ? 'ok' : 'error'}`).join(', ')}`);
  }
  return out;
}

function buildLLMInput({ plan, execution, clientMemory = {}, userMessage }) {
  const mem = execution.memoryContext || {};
  const toolBlock = (execution.toolResults || []).map(r => formatToolResult(r)).join('\n\n');
  const steps = (plan.steps || []).map((s, i) => `${i + 1}. ${s.label}`).join('\n');

  return [
    'MENSAJE DEL USUARIO:',
    userMessage,
    '',
    'PLAN INTERNO RESUMIDO:',
    `Estrategia: ${plan.strategy}`,
    `Pasos:\n${steps}`,
    `Intenciones detectadas: ${plan.analysis.intents.map(i => i.name).join(', ')}`,
    plan.mind ? Mind.llmContext(plan.mind) : '',
    plan.analysis.entities.length ? `Entidades: ${JSON.stringify(plan.analysis.entities).slice(0, 2000)}` : '',
    plan.analysis.implicit_context.length ? `Contexto implícito: ${JSON.stringify(plan.analysis.implicit_context).slice(0, 2000)}` : '',
    '',
    'MEMORIA RELEVANTE:',
    formatMemory(mem),
    '',
    toolBlock ? `RESULTADOS DE HERRAMIENTAS:\n${toolBlock}` : 'RESULTADOS DE HERRAMIENTAS:\nNo se ejecutaron herramientas o no eran necesarias.',
    '',
    'ESTILO DE RESPUESTA:',
    Personality.responseStyleHints(plan.response_contract),
    '',
    'INSTRUCCIÓN FINAL:',
    'Responde al usuario con una solución útil y concreta. No muestres JSON interno ni digas que hiciste un plan interno. Puedes mostrar pasos si ayudan. Respeta las restricciones del estado mental simulado.'
  ].filter(x => x !== '').join('\n');
}

function formatMemory(mem = {}) {
  const lines = [];
  if (mem.user_profile && Object.keys(mem.user_profile).length) {
    lines.push('Perfil del usuario:');
    for (const [k, v] of Object.entries(mem.user_profile).slice(0, 12)) lines.push(`- ${NLP.clean(k, 80)}: ${NLP.clean(v, 240)}`);
  }
  if (Array.isArray(mem.long_term) && mem.long_term.length) {
    lines.push('Recuerdos persistentes relevantes:');
    for (const item of mem.long_term.slice(0, 12)) lines.push(`- ${NLP.clean(item.text || item.t || item, 300)}`);
  }
  if (Array.isArray(mem.semantic) && mem.semantic.length) {
    lines.push('Coincidencias semánticas:');
    for (const item of mem.semantic.slice(0, 8)) lines.push(`- ${NLP.clean(item.text || item.t || item, 300)}${item.score ? ` (score ${item.score})` : ''}`);
  }
  if (Array.isArray(mem.short_term) && mem.short_term.length) {
    lines.push('Contexto reciente:');
    for (const h of mem.short_term.slice(-8)) lines.push(`- ${h.role || 'msg'}: ${NLP.clean(h.text || h.content || '', 280)}`);
  }
  return lines.length ? lines.join('\n') : 'Sin memoria relevante.';
}

function formatToolResult(result = {}) {
  const safe = { ...result };
  if (safe.content && typeof safe.content === 'string') safe.content = NLP.clean(safe.content, 4000);
  if (safe.results && Array.isArray(safe.results)) safe.results = safe.results.slice(0, 6);
  return `Herramienta: ${result.tool}\nEstado: ${result.ok ? 'ok' : 'error'}\nResultado:\n${JSON.stringify(safe, null, 2).slice(0, 6000)}`;
}

module.exports = { executePlan, buildLLMInput, formatMemory, formatToolResult, directMindAnswer };
