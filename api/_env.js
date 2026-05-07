export function clean(v) {
  return String(v || '').trim();
}

export function looksLikeOpenAIKey(v) {
  return /^sk-[A-Za-z0-9_\-]{20,}$/.test(clean(v));
}

export function getOpenAIKey() {
  const candidates = [
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_KEY,
    process.env.AURA_OPENAI_API_KEY,
    process.env.AI_API_KEY,
    process.env.OPENAI_SECRET_KEY,
    process.env.OPENAI_SECRET,
    process.env.AI_PROVIDER // fallback de emergencia si alguien pegó la key aquí por error
  ];
  return clean(candidates.find((v) => looksLikeOpenAIKey(v)) || process.env.OPENAI_API_KEY || '');
}

export function getProvider() {
  const raw = clean(process.env.AI_PROVIDER).toLowerCase();
  if (['openai', 'anthropic', 'openrouter'].includes(raw)) return raw;
  if (looksLikeOpenAIKey(process.env.AI_PROVIDER)) return 'openai';
  if (getOpenAIKey()) return 'openai';
  if (clean(process.env.ANTHROPIC_API_KEY)) return 'anthropic';
  if (clean(process.env.OPENROUTER_API_KEY)) return 'openrouter';
  return '';
}

export function mask(value) {
  const v = clean(value);
  if (!v) return null;
  if (v.length <= 10) return 'set';
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}
