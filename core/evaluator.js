// core/evaluator.js
// Verifica si la respuesta tiene sentido antes de enviarla.

'use strict';

const NLP = require('./nlp');
const Mind = require('./mind');

function evaluateAnswer({ answer = '', plan = {}, toolResults = [], userMessage = '' }) {
  const text = NLP.clean(answer, 20000);
  const issues = [];
  let score = 1;

  if (!text) { issues.push({ level: 'critical', code: 'empty', message: 'Respuesta vacía' }); score -= 0.7; }
  if (text.length < 12) { issues.push({ level: 'major', code: 'too_short', message: 'Respuesta demasiado corta' }); score -= 0.25; }
  if (/(as an ai language model|i cannot|i’m sorry)/i.test(text)) { issues.push({ level: 'minor', code: 'wrong_language_or_style', message: 'Estilo no natural para Ari' }); score -= 0.15; }
  if (/[{}][\s\S]*"choices"[\s\S]*"usage"/.test(text)) { issues.push({ level: 'critical', code: 'raw_api_json', message: 'Parece JSON crudo de API' }); score -= 0.5; }

  const lowUser = NLP.norm(userMessage);
  const lowAnswer = NLP.norm(text);
  const mind = plan.mind || Mind.state(userMessage || '');

  if (!mind.constraints?.noCode && NLP.hasAny(lowUser, ['codigo', 'código', 'script', 'html', 'javascript', 'python']) && !/```|function|const|let|class|<html|npm|archivo/i.test(text)) {
    issues.push({ level: 'major', code: 'missing_code', message: 'El usuario pidió código pero no hay código o pasos técnicos suficientes' });
    score -= 0.25;
  }


  if (mind.constraints?.noCode && /```|<html|function\s+|const\s+|let\s+|class\s+|npm\s+/i.test(text)) {
    issues.push({ level: 'critical', code: 'violates_no_code_constraint', message: 'El usuario pidió no crear código, pero la respuesta contiene código' });
    score -= 0.55;
  }

  if (mind.intent === 'mind_upgrade' && !NLP.hasAny(lowAnswer, ['razonamiento', 'decisiones', 'emocion', 'emoción', 'memoria', 'autoverificacion', 'autoverificación'])) {
    issues.push({ level: 'major', code: 'missing_mind_architecture', message: 'La respuesta no aborda razonamiento, decisiones, emoción simulada y memoria' });
    score -= 0.25;
  }

  if (NLP.hasAny(lowAnswer, ['siento de verdad', 'tengo conciencia real', 'estoy viva', 'estoy vivo'])) {
    issues.push({ level: 'critical', code: 'claims_real_consciousness', message: 'La respuesta finge sentimientos reales o conciencia' });
    score -= 0.7;
  }

  const usedWeb = (toolResults || []).some(r => r.tool === 'web_search' && r.ok && Array.isArray(r.results) && r.results.length);
  if (usedWeb && !/(fuente|según|encontré|resultado|referencia|http)/i.test(text)) {
    issues.push({ level: 'minor', code: 'missing_source_context', message: 'Usó búsqueda web pero no contextualiza fuentes' });
    score -= 0.10;
  }

  const failedTools = (toolResults || []).filter(r => r.ok === false);
  if (failedTools.length && NLP.hasAny(lowAnswer, ['ya lo hice', 'confirmado', 'ejecutado correctamente'])) {
    issues.push({ level: 'critical', code: 'claims_failed_tool_success', message: 'Afirma éxito aunque una herramienta falló' });
    score -= 0.45;
  }

  if (plan.strategy === 'safety_first' && !NLP.hasAny(lowAnswer, ['emergencia', 'ayuda', 'peligro', 'seguro', 'confianza'])) {
    issues.push({ level: 'critical', code: 'unsafe_emotional_response', message: 'Respuesta emocional sin contención de seguridad' });
    score -= 0.6;
  }

  const ok = score >= 0.72 && !issues.some(i => i.level === 'critical');
  return {
    ok,
    score: Math.max(0, Number(score.toFixed(2))),
    issues,
    should_retry: !ok && (plan.max_loops || 1) > 1,
    summary: ok ? 'Respuesta aprobada' : 'Respuesta necesita corrección'
  };
}

function buildRepairPrompt({ answer = '', evaluation = {}, plan = {}, toolResults = [] }) {
  const issues = (evaluation.issues || []).map(i => `- ${i.code}: ${i.message}`).join('\n') || '- Mejorar claridad y precisión';
  return [
    'Corrige la respuesta antes de enviarla al usuario.',
    'Mantén español claro, tono profesional y cercano.',
    'No inventes datos de herramientas. Si una herramienta falló, dilo de forma honesta y ofrece alternativa.',
    'Respeta restricciones explícitas como “sin código”. No incluyas código si el usuario lo rechazó.',
    'No afirmes sentimientos reales ni conciencia. Habla de emoción simulada o lectura emocional si aplica.',
    `Estrategia esperada: ${plan.strategy || 'direct_helpful'}`,
    `Problemas detectados:\n${issues}`,
    toolResults.length ? `Resultados de herramientas disponibles:\n${JSON.stringify(toolResults).slice(0, 5000)}` : '',
    `Respuesta anterior a mejorar:\n${answer}`
  ].filter(Boolean).join('\n\n');
}

module.exports = { evaluateAnswer, buildRepairPrompt };
