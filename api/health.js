const { kvConfigStatus } = require('./_kv');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const kv = kvConfigStatus();
  res.end(JSON.stringify({
    ok: true,
    app: 'Aura Core',
    version: '3.0-smart-no-pin',
    engine: 'custom_reasoning_rules_memory_cloud',
    pinEnabled: false,
    loginConfigured: true,
    memoryConfigured: kv.configured,
    kv: {
      hasUrl: kv.hasUrl,
      hasToken: kv.hasToken,
      detectedUrlName: kv.detectedUrlName,
      detectedTokenName: kv.detectedTokenName,
      hasRedisUrlOnly: kv.hasRedisUrlOnly
    },
    requiredForMemory: ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    acceptedAliases: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'URL_DE_LA_API_REST_DE_KV'],
    note: 'Modo prueba: PIN desactivado. No usa OpenAI ni otra API de IA. No se devuelve ningún secreto al frontend.'
  }));
};
