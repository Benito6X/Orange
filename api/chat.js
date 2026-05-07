const OpenAI = require('openai');

const Planner = require('../core/planner');
const Reasoner = require('../core/reasoner');
const Evaluator = require('../core/evaluator');
const Personality = require('../core/personality');
const MemoryManager = require('../memory/memory_manager');
const Feedback = require('../learning/feedback');
const Reinforcement = require('../learning/reinforcement');
const Mind = require('../core/mind');

function safeText(value, max = 12000) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, max);
}

function compactMeta(plan, evaluation, execution) {
  return {
    plan_id: plan.id,
    strategy: plan.strategy,
    intents: plan.analysis.intents.map(i => i.name),
    tools: (execution.toolResults || []).map(r => ({ tool: r.tool, ok: !!r.ok, provider: r.provider || undefined })),
    evaluation: { ok: evaluation.ok, score: evaluation.score, issues: (evaluation.issues || []).map(i => i.code) },
    mind: plan.mind ? Mind.compact(plan.mind) : undefined
  };
}

async function askLLM({ client, model, system, input, maxOutputTokens = 2600 }) {
  const response = await client.responses.create({
    model,
    instructions: system,
    input,
    store: false,
    max_output_tokens: maxOutputTokens
  });
  const text = safeText(response.output_text, 20000);
  if (!text) throw new Error('El modelo no devolvió texto');
  return text;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'Método no permitido' }));
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = safeText(body.message, 12000);
    if (!message) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: 'Mensaje vacío' }));
    }

    const clientMemory = {
      user: body.user || {},
      facts: Array.isArray(body.facts) ? body.facts : [],
      history: Array.isArray(body.history) ? body.history : [],
      semantic: Array.isArray(body.semantic) ? body.semantic : []
    };

    const memoryManager = MemoryManager.fromClientPayload(clientMemory);
    const learnedFromMessage = memoryManager.learnFromUser(message);
    const feedback = Feedback.detectFeedback(message);
    for (const fact of Feedback.buildMemoryFactsFromFeedback(feedback)) {
      const added = memoryManager.longTerm.addFact(fact.text, fact.tag, fact.weight);
      if (added) memoryManager.semantic.add(added.text, { tag: added.tag, weight: added.weight, ts: added.ts });
    }

    const mindState = Mind.state(message, { memory: { user: memoryManager.longTerm.user, facts: memoryManager.longTerm.facts }, history: clientMemory.history });

    const plan = Planner.createPlan(message, {
      history: clientMemory.history,
      memory: { user: memoryManager.longTerm.user, facts: memoryManager.longTerm.facts }
    });
    plan.mind = mindState;
    plan.mind_steps = Mind.plan(mindState);

    const execution = await Reasoner.executePlan(plan, { memoryManager, clientMemory });

    // Respuestas directas cuando una herramienta o memoria da solución exacta.
    if (execution.directAnswer && !plan.use_llm) {
      const evaluation = Evaluator.evaluateAnswer({
        answer: execution.directAnswer,
        plan,
        toolResults: execution.toolResults,
        userMessage: message
      });
      Reinforcement.reinforceMemory(memoryManager, feedback, [
        ...(execution.memoryContext?.long_term || []),
        ...(execution.memoryContext?.semantic || [])
      ]);
      res.statusCode = 200;
      return res.end(JSON.stringify({
        ok: true,
        text: Mind.enforce(execution.directAnswer, mindState),
        model: 'ari-core-direct',
        memory_patch: memoryManager.buildClientPatch(),
        meta: compactMeta(plan, evaluation, execution)
      }));
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Si no hay LLM, responde con el mejor resultado estructurado del core.
      const fallback = Mind.enforce(execution.directAnswer || buildNoLLMFallback(plan, execution, learnedFromMessage), mindState);
      const evaluation = Evaluator.evaluateAnswer({ answer: fallback, plan, toolResults: execution.toolResults, userMessage: message });
      res.statusCode = 200;
      return res.end(JSON.stringify({
        ok: true,
        text: fallback,
        model: 'ari-core-no-llm',
        memory_patch: memoryManager.buildClientPatch(),
        meta: compactMeta(plan, evaluation, execution)
      }));
    }

    const model = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
    const client = new OpenAI({ apiKey });
    const preferences = require('../learning/user_preferences').extractFromMemory({
      user: memoryManager.longTerm.user,
      facts: memoryManager.longTerm.facts
    }, clientMemory.history);
    const system = Personality.buildSystemInstruction({}, preferences) + '\n\n' + Mind.llmContext(mindState);
    const input = Reasoner.buildLLMInput({ plan, execution, clientMemory, userMessage: message });

    let text = Mind.enforce(await askLLM({ client, model, system, input }), mindState);
    let evaluation = Evaluator.evaluateAnswer({ answer: text, plan, toolResults: execution.toolResults, userMessage: message });

    if (!evaluation.ok && evaluation.should_retry) {
      const repairInput = Evaluator.buildRepairPrompt({ answer: text, evaluation, plan, toolResults: execution.toolResults });
      text = Mind.enforce(await askLLM({ client, model, system, input: repairInput, maxOutputTokens: 2200 }), mindState);
      evaluation = Evaluator.evaluateAnswer({ answer: text, plan, toolResults: execution.toolResults, userMessage: message });
    }

    // Aprende del turno exitoso: feedback, preferencias y hechos explícitos del usuario.
    Reinforcement.reinforceMemory(memoryManager, feedback, [
      ...(execution.memoryContext?.long_term || []),
      ...(execution.memoryContext?.semantic || [])
    ]);

    res.statusCode = 200;
    return res.end(JSON.stringify({
      ok: true,
      text: Mind.enforce(text, mindState),
      model,
      memory_patch: memoryManager.buildClientPatch(),
      meta: compactMeta(plan, evaluation, execution)
    }));
  } catch (err) {
    console.error('Ari API error:', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ ok: false, error: err.message || 'Error interno' }));
  }
};

function buildNoLLMFallback(plan, execution, learned = []) {
  const toolLines = (execution.toolResults || []).map(r => {
    if (r.ok && r.tool === 'web_search') {
      const items = (r.results || []).slice(0, 4).map(x => `- ${x.title || 'Resultado'}: ${x.snippet || ''}${x.url ? ` (${x.url})` : ''}`);
      return items.length ? `Encontré estos resultados web:\n${items.join('\n')}` : 'Intenté buscar en web, pero no encontré resultados útiles.';
    }
    if (r.ok && r.tool === 'calculator') return `Resultado calculado: **${r.result}**.`;
    if (r.ok && r.tool === 'file_reader') return `Leí el archivo ${r.path}:\n\n${r.content.slice(0, 2000)}`;
    if (!r.ok) return `La herramienta ${r.tool} falló: ${r.error}`;
    return `Herramienta ${r.tool} ejecutada.`;
  });

  if (plan.mind && ['mind_upgrade','engine_diagnosis','explain_without_code','decision'].includes(plan.mind.intent)) {
    return Mind.fallback({ plan, execution, learned });
  }

  if (learned.length) {
    return `Guardé esta información en memoria:\n\n${learned.map(f => `- ${f.text}`).join('\n')}\n\nLa usaré cuando sea relevante.`;
  }

  if (toolLines.length) return toolLines.join('\n\n');

  return [
    'Puedo procesar tu solicitud con el core local, pero para una respuesta avanzada falta configurar `OPENAI_API_KEY`.',
    '',
    `Estrategia detectada: **${plan.strategy}**.`,
    `Intenciones: ${plan.analysis.intents.map(i => i.name).join(', ')}.`,
    '',
    'Siguiente paso recomendado: configura la API o usa el motor local como fallback básico.'
  ].join('\n');
}
