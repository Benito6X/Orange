// tools/web_search.js
// Búsqueda web real cuando hay proveedor configurado.
// Soporta TAVILY_API_KEY, BRAVE_SEARCH_API_KEY o SERPAPI_API_KEY.
// Fallback: DuckDuckGo Instant Answer, útil pero limitado.

'use strict';

function cleanQuery(query = '') {
  return String(query || '').replace(/\u0000/g, '').trim().slice(0, 500);
}

async function run(args = {}) {
  const query = cleanQuery(args.query || args.q || '');
  if (!query) throw new Error('Consulta web vacía');
  const max = Math.min(Number(args.max_results || 5), 8);

  if (process.env.TAVILY_API_KEY) return tavily(query, max);
  if (process.env.BRAVE_SEARCH_API_KEY) return brave(query, max);
  if (process.env.SERPAPI_API_KEY) return serpapi(query, max);
  return duckduckgoInstant(query, max);
}

async function tavily(query, max) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: max, search_depth: 'basic' }),
    signal: AbortSignal.timeout(9000)
  });
  const data = await res.json();
  return {
    ok: res.ok,
    provider: 'tavily',
    query,
    results: (data.results || []).slice(0, max).map(x => ({ title: x.title, url: x.url, snippet: x.content }))
  };
}

async function brave(query, max) {
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(max));
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY },
    signal: AbortSignal.timeout(9000)
  });
  const data = await res.json();
  return {
    ok: res.ok,
    provider: 'brave',
    query,
    results: (data.web?.results || []).slice(0, max).map(x => ({ title: x.title, url: x.url, snippet: x.description }))
  };
}

async function serpapi(query, max) {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', process.env.SERPAPI_API_KEY);
  url.searchParams.set('num', String(max));
  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  const data = await res.json();
  return {
    ok: res.ok,
    provider: 'serpapi',
    query,
    results: (data.organic_results || []).slice(0, max).map(x => ({ title: x.title, url: x.link, snippet: x.snippet }))
  };
}

async function duckduckgoInstant(query, max) {
  const url = new URL('https://api.duckduckgo.com/');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('no_html', '1');
  url.searchParams.set('skip_disambig', '1');
  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  const data = await res.json();
  const related = Array.isArray(data.RelatedTopics) ? data.RelatedTopics.flatMap(x => x.Topics || [x]) : [];
  const results = [];
  if (data.AbstractText) results.push({ title: data.Heading || query, url: data.AbstractURL || '', snippet: data.AbstractText });
  for (const item of related) {
    if (results.length >= max) break;
    if (item.Text) results.push({ title: item.FirstURL ? new URL(item.FirstURL).hostname : query, url: item.FirstURL || '', snippet: item.Text });
  }
  return { ok: res.ok, provider: 'duckduckgo_instant', query, results: results.slice(0, max), note: 'Fallback limitado; configura TAVILY_API_KEY/BRAVE_SEARCH_API_KEY/SERPAPI_API_KEY para mejores resultados.' };
}

module.exports = { name: 'web_search', run };
