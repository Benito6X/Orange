// tools/calculator.js
// Calculadora segura: interpreta español básico y evalúa solo expresiones matemáticas permitidas.

'use strict';

function normalizeExpression(input = '') {
  return String(input || '')
    .replace(/[¿¡]/g, '')
    .replace(/cu[aá]nto es|cu[aá]nto da|calcula|calcular|resuelve|resultado de|cu[aá]nto son/gi, '')
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/\bx\b/gi, '*')
    .replace(/\bpor\b/gi, '*').replace(/\bentre\b/gi, '/')
    .replace(/\bm[aá]s\b/gi, '+').replace(/\bmenos\b/gi, '-')
    .replace(/al cuadrado/gi, '**2').replace(/al cubo/gi, '**3')
    .replace(/\^/g, '**')
    .replace(/ra[ií]z cuadrada de\s*(\d+(?:\.\d+)?)/gi, 'sqrt($1)')
    .replace(/ra[ií]z de\s*(\d+(?:\.\d+)?)/gi, 'sqrt($1)')
    .replace(/\bpi\b|π/gi, 'PI')
    .trim();
}

function safeEval(expression) {
  const expr = normalizeExpression(expression);
  if (!expr || expr.length > 180) throw new Error('Expresión vacía o demasiado larga');
  if (!/^[\d\s+\-*/().,%*sqrtPI]+$/i.test(expr) || !/\d|PI/i.test(expr)) {
    throw new Error('La expresión contiene caracteres no permitidos');
  }
  const jsExpr = expr
    .replace(/\bsqrt\s*\(/gi, 'Math.sqrt(')
    .replace(/\bPI\b/g, 'Math.PI')
    .replace(/,/g, '.');
  // eslint-disable-next-line no-new-func
  const value = Function('"use strict";return (' + jsExpr + ')')();
  if (!Number.isFinite(value)) throw new Error('Resultado no finito');
  return { expression: jsExpr, value };
}

function formatNumber(value) {
  if (Number.isInteger(value)) return value.toLocaleString('es');
  return Number(value.toFixed(10)).toString();
}

async function run(args = {}) {
  const { expression, value } = safeEval(args.expression || args.query || '');
  return { ok: true, expression, value, result: formatNumber(value) };
}

module.exports = { name: 'calculator', run, normalizeExpression, safeEval };
