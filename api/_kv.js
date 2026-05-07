function envAny(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && String(value).trim()) return String(value).trim();
  }
  return '';
}

function getKvUrl() {
  return envAny([
    'KV_REST_API_URL',
    'UPSTASH_REDIS_REST_URL',
    'URL_DE_LA_API_REST_DE_KV',
    'URL de la API REST de KV',
    'KV_REST_URL'
  ]);
}

function getKvToken() {
  return envAny([
    'KV_REST_API_TOKEN',
    'UPSTASH_REDIS_REST_TOKEN',
    'TOKEN_DE_LA_API_REST_DE_KV',
    'KV_REST_TOKEN'
  ]);
}

function kvReady() {
  return Boolean(getKvUrl() && getKvToken());
}

function kvConfigStatus() {
  const url = getKvUrl();
  const token = getKvToken();
  return {
    configured: Boolean(url && token),
    hasUrl: Boolean(url),
    hasToken: Boolean(token),
    detectedUrlName: process.env.KV_REST_API_URL ? 'KV_REST_API_URL' : process.env.UPSTASH_REDIS_REST_URL ? 'UPSTASH_REDIS_REST_URL' : process.env.URL_DE_LA_API_REST_DE_KV ? 'URL_DE_LA_API_REST_DE_KV' : process.env['URL de la API REST de KV'] ? 'URL de la API REST de KV' : null,
    detectedTokenName: process.env.KV_REST_API_TOKEN ? 'KV_REST_API_TOKEN' : process.env.UPSTASH_REDIS_REST_TOKEN ? 'UPSTASH_REDIS_REST_TOKEN' : process.env.TOKEN_DE_LA_API_REST_DE_KV ? 'TOKEN_DE_LA_API_REST_DE_KV' : null,
    hasRedisUrlOnly: Boolean(process.env.REDIS_URL || process.env.KV_URL)
  };
}

async function kvCommand(command, ...args) {
  const url = getKvUrl();
  const token = getKvToken();
  if (!url || !token) {
    const err = new Error('Falta memoria cloud: configura KV_REST_API_URL y KV_REST_API_TOKEN. También acepto UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.');
    err.code = 'KV_NOT_CONFIGURED';
    throw err;
  }
  if (!/^https?:\/\//i.test(url)) {
    const err = new Error('La URL de memoria debe ser REST y empezar con https://. REDIS_URL o KV_URL no sirven para este motor sin librerías externas.');
    err.code = 'KV_URL_INVALID';
    throw err;
  }
  const response = await fetch(url.replace(/\/$/, ''), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([command, ...args])
  });
  const text = await response.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch (_) { json = { raw: text }; }
  if (!response.ok) {
    const err = new Error(json?.error || json?.message || `KV error ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return json.result;
}

async function getJson(key, fallback) {
  const value = await kvCommand('GET', key);
  if (!value) return fallback;
  try { return typeof value === 'string' ? JSON.parse(value) : value; }
  catch (_) { return fallback; }
}

async function setJson(key, value) {
  return await kvCommand('SET', key, JSON.stringify(value));
}

module.exports = { kvReady, kvConfigStatus, kvCommand, getJson, setJson, getKvUrl, getKvToken };
