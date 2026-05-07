// tools/code_executor.js
// Ejecuta JavaScript aislado con timeout. No expone fs, process, require ni red.

'use strict';

const vm = require('vm');

function assertSafe(code = '') {
  const clean = String(code || '').trim();
  if (!clean) throw new Error('Código vacío');
  if (clean.length > 5000) throw new Error('Código demasiado largo para ejecución segura');
  const blocked = /\b(require|process|global|globalThis|Buffer|child_process|fs|net|http|https|eval|Function|import\s*\(|WebSocket|fetch|XMLHttpRequest)\b/i;
  if (blocked.test(clean)) throw new Error('El código contiene APIs bloqueadas por seguridad');
  return clean;
}

async function run(args = {}) {
  const language = String(args.language || 'javascript').toLowerCase();
  if (!['js', 'javascript'].includes(language)) {
    return { ok: false, error: 'Por seguridad este ejecutor solo corre JavaScript aislado' };
  }

  const code = assertSafe(args.code || '');
  const logs = [];
  const sandbox = {
    console: {
      log: (...a) => logs.push(a.map(String).join(' ')),
      error: (...a) => logs.push('[error] ' + a.map(String).join(' ')),
      warn: (...a) => logs.push('[warn] ' + a.map(String).join(' '))
    },
    Math,
    Date,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    RegExp,
    Set,
    Map
  };

  const context = vm.createContext(sandbox, { name: 'ari-code-sandbox' });
  const script = new vm.Script(`"use strict";\n${code}`, { timeout: 800 });
  let result;
  try {
    result = script.runInContext(context, { timeout: 800, displayErrors: true });
  } catch (err) {
    return { ok: false, error: err.message, logs };
  }
  return { ok: true, result: result === undefined ? null : String(result), logs: logs.slice(0, 30) };
}

module.exports = { name: 'code_executor', run };
