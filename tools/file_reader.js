// tools/file_reader.js
// Lector de archivos seguro dentro del proyecto desplegado.

'use strict';

const fs = require('fs/promises');
const path = require('path');

const ALLOWED_EXT = new Set(['.txt', '.md', '.json', '.js', '.css', '.html']);

function resolveSafe(inputPath = '') {
  const base = path.resolve(process.cwd());
  const requested = path.resolve(base, String(inputPath || '').replace(/^[/\\]+/, ''));
  if (!requested.startsWith(base)) throw new Error('Ruta fuera del proyecto no permitida');
  const ext = path.extname(requested).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) throw new Error(`Extensión no permitida: ${ext || 'sin extensión'}`);
  return requested;
}

async function run(args = {}) {
  const file = resolveSafe(args.path || args.file || '');
  const stat = await fs.stat(file);
  if (stat.size > 250000) throw new Error('Archivo demasiado grande para lectura directa');
  const content = await fs.readFile(file, 'utf8');
  return {
    ok: true,
    path: path.relative(process.cwd(), file),
    size: stat.size,
    content: content.slice(0, 12000)
  };
}

module.exports = { name: 'file_reader', run, resolveSafe };
