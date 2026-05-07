// ═══════════════════════════════════════════════════
//  ARI ENGINE v10 — Motor local más humano
//  Intención + emoción + memoria + contexto + KB + generadores.
//  Nota honesta: sin API/LLM no será ChatGPT, pero este motor
//  evita respuestas genéricas y responde directo a pedidos simples.
// ═══════════════════════════════════════════════════

(function(){
'use strict';

window.AriMem = {
  KEY: "ari_v10", d: null,
  init() {
    try { this.d = JSON.parse(localStorage.getItem(this.KEY)) || this.fr(); }
    catch { this.d = this.fr(); }
    this.d.facts = Array.isArray(this.d.facts) ? this.d.facts : [];
    this.d.user = this.d.user && typeof this.d.user === "object" ? this.d.user : {};
    this.d.msgs = Number.isFinite(this.d.msgs) ? this.d.msgs : 0;
    this.d.history = Array.isArray(this.d.history) ? this.d.history : [];
    this.save();
  },
  fr() { return { facts: [], user: {}, msgs: 0, history: [] }; },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch(e) {} },
  migrateFromOldKeys() {
    // Importa memoria previa una sola vez si existe ari_v7/ari_v4.
    if (this.d && (this.d.facts.length || Object.keys(this.d.user).length)) return;
    for (const key of ["ari_v7", "ari_v4"]) {
      try {
        const old = JSON.parse(localStorage.getItem(key));
        if (!old) continue;
        if (Array.isArray(old.facts)) this.d.facts = old.facts;
        if (old.user && typeof old.user === "object") this.d.user = old.user;
        if (Number.isFinite(old.msgs)) this.d.msgs = old.msgs;
        if (Array.isArray(old.history)) this.d.history = old.history;
        this.save(); break;
      } catch(e) {}
    }
  },
  add(t, tag) {
    if (!t) return false;
    const clean = String(t).trim();
    if (!clean) return false;
    if (this.d.facts.some(f => String(f.t).toLowerCase() === clean.toLowerCase())) return false;
    this.d.facts.push({ t: clean, tag: tag || "dato", ts: Date.now() });
    this.save(); return true;
  },
  del(i) { this.d.facts.splice(i, 1); this.save(); },
  su(k, v) { this.d.user[k] = String(v).trim(); this.save(); },
  gu(k) { return this.d.user[k]; },
  srch(q) {
    const w = AriNLP.tok(q);
    return this.d.facts.filter(f => w.some(x => AriNLP.norm(f.t).includes(x))).slice(0, 8);
  },
  tick() { this.d.msgs++; this.save(); },
  cnt() { return this.d.facts.length; },
  lv() { const m = this.d.msgs; return m < 10 ? 1 : m < 50 ? 2 : m < 150 ? 3 : m < 400 ? 4 : 5; },
  remember(role, text) {
    const clean = String(text || "").slice(0, 1600);
    this.d.history.push({ role, text: clean, ts: Date.now() });
    if (this.d.history.length > 40) this.d.history = this.d.history.slice(-40);
    this.save();
  },
  context(n = 10) { return this.d.history.slice(-n); },
  lastUser(n = 1) { return this.d.history.filter(x => x.role === "user").slice(-n); },
  clear() { this.d = this.fr(); this.save(); }
};

window.AriNLP = {
  STOP: new Set("el la los las un una unos unas de del al y o en que es se por con a su para me mi mis te tu tus si no ya le lo nos les hay ser son era fue han he ha pero como mas más bien muy tambien también asi así esto eso esta este ese esa aqui aquí ahi ahí donde cuando porqué porque aunque tanto todo toda todos todas cada otro otra qué que cómo como cuál cual cuándo cuando quién quien cuánto cuanto dónde donde puedes podrias podrías ayuda ayudame ayúdame".split(" ")),
  norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); },
  tok(s) {
    return this.norm(s).replace(/[¿¡.,;:!?()\[\]{}«»"“”'`]/g, " ").split(/\s+/).filter(w => w.length > 2 && !this.STOP.has(w));
  },
  any(low, arr) { return arr.some(x => low.includes(this.norm(x))); },
  starts(low, arr) { return arr.some(x => low.startsWith(this.norm(x))); },
  score(ws, txt) {
    if (!ws.length || !txt) return 0;
    const t = this.tok(txt);
    let hits = 0;
    for (const w of ws) if (t.some(x => x === w || x.includes(w) || w.includes(x))) hits++;
    return hits / Math.max(1, ws.length);
  },
  cap(s) { s = String(s || "").trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; },
  stripCommand(low) {
    return low.replace(/^(crea|crear|haz|hacer|genera|generar|dame|cuentame|cuéntame|escribe|redacta|inventa|quiero|necesito)\s+/i, "").trim();
  }
};

window.AriCalc = function(s) {
  const c = String(s || "").replace(/[¿¡]/g, "")
    .replace(/cuanto es|cuánto es|cuanto da|cuánto da|calcula|resuelve|el resultado de|cuanto son|cuánto son/gi, "").trim()
    .replace(/×/g, "*").replace(/÷/g, "/").replace(/\bx\b/g, "*")
    .replace(/\bpor\b/g, "*").replace(/\bentre\b/g, "/")
    .replace(/\bmas\b|\bmás\b/g, "+").replace(/\bmenos\b/g, "-")
    .replace(/al cuadrado/g, "**2").replace(/al cubo/g, "**3").replace(/\^/g, "**")
    .replace(/raiz cuadrada de (\d+)/gi, "Math.sqrt($1)").replace(/raíz cuadrada de (\d+)/gi, "Math.sqrt($1)")
    .replace(/raiz de (\d+)/gi, "Math.sqrt($1)").replace(/raíz de (\d+)/gi, "Math.sqrt($1)")
    .replace(/\bpi\b|π/g, "Math.PI")
    .replace(/\bsin\b/g, "Math.sin").replace(/\bcos\b/g, "Math.cos").replace(/\btan\b/g, "Math.tan");
  if (c.length > 0 && c.length < 140 && /^[\d\s+\-*/.()%MathsqrtPIcostan]+$/.test(c) && /\d/.test(c)) {
    try {
      const r = Function('"use strict";return(' + c + ')')();
      if (Number.isFinite(r) && !isNaN(r)) {
        const fmt = Number.isInteger(r) ? r.toLocaleString("es") : parseFloat(r.toFixed(8)).toString();
        return `El resultado es **${fmt}**.\n\nLo calculé interpretando la operación como: \`${c}\``;
      }
    } catch(e) {}
  }
  return null;
};

window.AriLearn = [
  { re: /^(recuerda|aprende|guarda|nota|sabe|memoriza)\s+(que\s+)?(.+)/i, fn: m => ({ learn: m[3] }) },
  { re: /^mi nombre es (.+)/i, fn: m => ({ uk: "nombre", uv: m[1], learn: `El nombre del usuario es ${m[1]}` }) },
  { re: /^me llamo (.+)/i, fn: m => ({ uk: "nombre", uv: m[1], learn: `El usuario se llama ${m[1]}` }) },
  { re: /^tengo (\d+) años/i, fn: m => ({ uk: "edad", uv: m[1], learn: `El usuario tiene ${m[1]} años` }) },
  { re: /^trabajo\s+(en|como|de)\s+(.+)/i, fn: m => ({ uk: "trabajo", uv: `${m[1]} ${m[2]}`, learn: `El usuario trabaja ${m[1]} ${m[2]}` }) },
  { re: /^vivo en (.+)/i, fn: m => ({ uk: "lugar", uv: m[1], learn: `El usuario vive en ${m[1]}` }) },
  { re: /^estudio (.+)/i, fn: m => ({ uk: "estudio", uv: m[1], learn: `El usuario estudia ${m[1]}` }) },
  { re: /^me gusta (.+)/i, fn: m => ({ learn: `Al usuario le gusta: ${m[1]}` }) },
  { re: /^soy (un|una)?\s*(.+)/i, fn: m => ({ learn: `El usuario dice que es: ${m[2]}` }) },
  { re: /^mi (.+?) (es|son) (.+)/i, fn: m => ({ uk: AriNLP.norm(m[1]).replace(/\s+/g, "_"), uv: m[3], learn: `${m[1]} del usuario: ${m[3]}` }) },
  { re: /^(odio|no me gusta|detesto) (.+)/i, fn: m => ({ learn: `Al usuario no le gusta: ${m[2]}` }) },
];

window.AriGenerators = {
  pick(a){ return a[Math.floor(Math.random()*a.length)]; },
  jokes: [
    "¿Por qué el programador confundió Halloween con Navidad? Porque OCT 31 es igual a DEC 25.",
    "Le dije a mi computadora que necesitaba espacio… y empezó a borrar mis archivos. Demasiado literal.",
    "¿Qué hace una abeja en el gimnasio? Zum-ba.",
    "¿Por qué el WiFi fue al psicólogo? Porque tenía problemas de conexión.",
    "Un bug entra a un bar. El bartender dice: ‘Aquí no servimos bugs’. El bug responde: ‘Tranquilo, solo vengo a reproducirme’."
  ],
  joke(topic){
    const low = AriNLP.norm(topic || "");
    if (low.includes("program")) return "Aquí va uno de programadores: ¿Por qué JavaScript fue a terapia? Porque no sabía manejar sus promesas.";
    if (low.includes("ia") || low.includes("robot")) return "Aquí va uno de IA: Le pregunté a una IA si tenía sentimientos y me respondió: ‘Claro… según mi archivo sentimientos_final_v3_ahora_si.js’.";
    if (low.includes("panama") || low.includes("panamá")) return "Aquí va uno suave: En Panamá el sol no sale… te entrevista para saber si estás listo para sudar.";
    return this.pick(this.jokes);
  },
  greeting(a){
    const low = a.low;
    if (AriNLP.any(low, ["buenos dias", "buen día", "buen dia", "mañana", "manana"])) {
      return `Claro. Aquí tienes un saludo de buenos días:\n\n**Buenos días.** Que hoy tengas claridad para tomar buenas decisiones, energía para avanzar y calma para manejar lo que venga. Que sea un día productivo, bonito y lleno de buenas oportunidades.`;
    }
    if (AriNLP.any(low, ["cumple", "cumpleaños", "birthday"])) {
      return `Claro. Aquí tienes un saludo de cumpleaños:\n\n**Feliz cumpleaños.** Que Dios te regale mucha vida, salud, paz y nuevas oportunidades. Te deseo un día hermoso, rodeado de cariño y momentos que valgan la pena recordar.`;
    }
    if (AriNLP.any(low, ["profesional", "formal", "cliente", "empresa"])) {
      return `Claro. Aquí tienes un saludo profesional:\n\n**Buenos días.** Espero que se encuentre muy bien. Le deseo una excelente jornada y quedo atento para apoyar en lo que sea necesario.`;
    }
    return `Claro. Aquí tienes un saludo natural:\n\n**Hola, espero que estés muy bien.** Te deseo un día tranquilo, productivo y lleno de cosas buenas.`;
  },
  shortText(a){
    if (AriNLP.any(a.low, ["buenos dias", "buen día", "buen dia"])) return this.greeting(a);
    if (AriNLP.any(a.low, ["gracias", "agradecimiento"])) return "Claro:\n\n**Muchas gracias por tu apoyo. Lo valoro mucho y aprecio el tiempo que me has dedicado.**";
    if (AriNLP.any(a.low, ["disculpa", "perdon", "perdón"])) return "Claro:\n\n**Te pido disculpas por lo ocurrido. No fue mi intención causar molestias. Gracias por tu comprensión; voy a corregirlo.**";
    return `Claro. Te dejo una versión limpia y profesional:\n\n**Hola. Espero que estés muy bien. Te escribo para compartirte esto de forma clara y directa. Quedo atento a tu respuesta.**`;
  },
  ideas(a){
    const thing = AriNLP.stripCommand(a.low) || "tu proyecto";
    return `Tengo varias ideas para **${thing}**:\n\n1. **Versión premium:** diseño oscuro, bordes suaves, microanimaciones y experiencia tipo app nativa.\n2. **Versión viral:** una frase fuerte, visual limpio y un detalle inesperado que haga que la gente lo comparta.\n3. **Versión funcional:** menos decoración y más velocidad, claridad y botones directos.\n4. **Versión inteligente:** memoria, contexto, sugerencias automáticas y respuestas adaptadas al usuario.\n\nMi recomendación: empieza por la versión funcional y luego la haces premium. Si primero intentas hacerla perfecta, te puedes quedar atascado.`;
  },
  imagePrompt(a){
    return `Te dejo una dirección visual premium:\n\n**Concepto:** imagen tecnológica y elegante, con profundidad, luz suave, sombras realistas y composición limpia.\n\n**Prompt sugerido:**\n\n\`Diseño visual premium para marca tecnológica, fondo oscuro con degradados violeta y cian, iluminación cinematográfica, partículas sutiles, profundidad 3D, interfaz flotante tipo inteligencia artificial, composición limpia, alto contraste, detalles nítidos, estilo moderno, profesional, 4K, sin texto excesivo\`\n\nLa clave: que se vea costoso sin saturarlo. Menos elementos, mejor iluminación.`;
  },
  calculatorCode(){
    return `Sí. Aquí tienes una **calculadora completa en un solo archivo HTML**, moderna y responsive. Cópiala en \`calculadora.html\` y ábrela en el navegador.\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Calculadora Premium</title>\n<style>\n*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at top,#2d1363,#080810 55%);font-family:system-ui;color:white}.calc{width:min(92vw,380px);padding:18px;border-radius:30px;background:rgba(18,18,28,.86);border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 90px rgba(0,0,0,.5);backdrop-filter:blur(20px)}.screen{min-height:96px;display:flex;align-items:end;justify-content:end;padding:18px;border-radius:22px;background:#090911;font-size:40px;font-weight:700;overflow:hidden;margin-bottom:14px}.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}button{height:64px;border:0;border-radius:20px;font-size:22px;font-weight:800;color:white;background:#242438;cursor:pointer;transition:.15s}button:active{transform:scale(.95)}.op{background:#7c3aed}.clear{background:#ef4444}.eq{background:#22c55e}.zero{grid-column:span 2}\n</style>\n</head>\n<body>\n<main class="calc"><div class="screen" id="screen">0</div><section class="keys">\n<button class="clear" onclick="clearAll()">C</button><button onclick="del()">⌫</button><button onclick="tap('%')">%</button><button class="op" onclick="tap('/')">÷</button>\n<button onclick="tap('7')">7</button><button onclick="tap('8')">8</button><button onclick="tap('9')">9</button><button class="op" onclick="tap('*')">×</button>\n<button onclick="tap('4')">4</button><button onclick="tap('5')">5</button><button onclick="tap('6')">6</button><button class="op" onclick="tap('-')">−</button>\n<button onclick="tap('1')">1</button><button onclick="tap('2')">2</button><button onclick="tap('3')">3</button><button class="op" onclick="tap('+')">+</button>\n<button class="zero" onclick="tap('0')">0</button><button onclick="tap('.')">.</button><button class="eq" onclick="calc()">=</button>\n</section></main>\n<script>\nconst screen=document.getElementById('screen');let exp='';function draw(){screen.textContent=exp||'0'}function tap(v){if(exp.length<20){exp+=v;draw()}}function clearAll(){exp='';draw()}function del(){exp=exp.slice(0,-1);draw()}function calc(){try{if(!/^[0-9+\\-*/%.() ]+$/.test(exp))throw new Error();const r=Function('"use strict";return('+exp+')')();exp=Number.isFinite(r)?String(Number(r.toFixed(8))):'';draw()}catch{screen.textContent='Error';exp=''}}\n<\/script>\n</body>\n</html>\n\`\`\`\n\nLa validación evita ejecutar texto extraño: solo acepta números y operadores básicos.`;
  }
};

window.AriEngine = {
  CTX: { topic: null, turns: 0, lastIntent: null },
  CORE_KEYS: new Set(["identidad","saludos","despedidas","emocional","ayuda","conocimiento","razonamiento","fallback_humano"]),
  stats() { return { f: AriMem.cnt(), m: AriMem.d.msgs, lv: AriMem.lv(), topics: this.countTopics() }; },
  reply(t, ok = false, meta = {}) { this.CTX.lastIntent = meta.intent || this.CTX.lastIntent; AriMem.remember("ari", t); return { t, ok, meta }; },
  countTopics() {
    let n = 0; const KB = window.KB_BRAIN || {};
    for (const node of Object.values(KB)) { if (node && typeof node === "object") { n++; if (node.subs) n += Object.keys(node.subs).length; } }
    return n;
  },
  analyze(input) {
    const raw = String(input || "").trim(); const low = AriNLP.norm(raw); const ws = AriNLP.tok(raw);
    const emotion = this.detectEmotion(low); const intent = this.detectIntent(low, raw);
    return { raw, low, ws, emotion, intent, memories: this.memoryLinks(ws), history: AriMem.context(10), name: AriMem.gu("nombre") || "", stats: this.stats(), short: raw.length < 45 };
  },
  detectIntent(low, raw) {
    if (/^(recuerda|aprende|guarda|nota|sabe|memoriza)\b/.test(low)) return "aprender";
    if (AriNLP.any(low, ["chiste", "broma", "hazme reir", "hazme reír", "cuentame algo gracioso", "cuéntame algo gracioso"])) return "humor";
    if (AriNLP.any(low, ["adivinanza", "acertijo"])) return "adivinanza";
    if (AriNLP.any(low, ["crea un saludo", "crear un saludo", "haz un saludo", "genera un saludo", "saludo de buenos dias", "saludo de buenas tardes", "saludo de buenas noches", "felicitacion", "felicitación"])) return "crear_saludo";
    if (AriNLP.any(low, ["como estas", "como te va", "que tal estas", "que tal", "como te sientes", "estas bien"])) return "charla_estado";
    if (/^(hola|hey|buenas|buenos dias|buenas tardes|buenas noches|saludos)\b/.test(low)) return "saludo";
    if (/^(gracias|muchas gracias|ok gracias)\b/.test(low)) return "agradecimiento";
    if (/^(adios|bye|chao|hasta luego|nos vemos|me voy)\b/.test(low)) return "despedida";
    if (AriNLP.any(low, ["como me llamo", "cual es mi nombre", "quien soy", "que recuerdas de mi", "que sabes de mi", "cuantos anos tengo", "donde vivo", "a que me dedico"])) return "memoria";
    if (AriNLP.any(low, ["codigo", "código", "script", "programa", "funcion", "función", "html", "css", "javascript", "python", "react", "bug", "error", "calculadora"])) return "codigo";
    if (/(^|\b)(calcula|calcular|resuelve|cuanto es|cuánto es|cuanto da|cuánto da)(\b|$)/.test(low) || /^[\d\s+\-*/().,%×÷]+$/.test(raw.trim())) return "calculo";
    if (AriNLP.any(low, ["imagen", "logo", "post", "interfaz", "ui", "ux", "diseño", "diseno"])) return "visual";
    if (AriNLP.any(low, ["mensaje", "texto", "frase", "redacta", "escribe", "copy", "caption", "correo", "email", "whatsapp"])) return "texto";
    if (AriNLP.any(low, ["crea", "haz", "diseña", "disena", "genera", "inventa", "idea", "ideas", "app", "propuesta"])) return "crear";
    if (AriNLP.any(low, ["por que", "porque", "explica", "analiza", "razona", "compara", "diferencia", "conviene", "recomienda", "que es", "definicion", "definición"])) return "explicar";
    if (/\?$/.test(raw) || /^(que|qué|cual|cuál|cuando|cuándo|donde|dónde|quien|quién)\b/i.test(raw)) return "pregunta";
    if (this.CTX.lastIntent === "humor" && AriNLP.any(low, ["otro", "otra", "uno mas", "uno más"])) return "humor";
    return "general";
  },
  detectEmotion(low) {
    if (AriNLP.any(low, ["suicid", "hacerme dano", "hacerme daño", "quitarme la vida", "no quiero vivir", "matarme"])) return { type: "riesgo", label: "riesgo", level: 5 };
    const map = [
      { type: "tristeza", level: 3, kws: ["triste", "solo", "sola", "llorar", "deprim", "vacio", "vacío", "duelo", "extraño", "extrano"] },
      { type: "ansiedad", level: 3, kws: ["ansioso", "ansiosa", "ansiedad", "panico", "pánico", "miedo", "preocup", "nervios"] },
      { type: "enojo", level: 2, kws: ["enojado", "molesto", "rabia", "frustrado", "frustrada", "odio", "harto", "harta"] },
      { type: "cansancio", level: 2, kws: ["cansado", "cansada", "agotado", "agotada", "burnout", "estresado", "estresada", "sin energia", "sin energía"] },
      { type: "alegria", level: 1, kws: ["feliz", "contento", "contenta", "emocionado", "emocionada", "genial", "excelente", "perfecto"] }
    ];
    return map.find(e => AriNLP.any(low, e.kws)) || { type: "neutral", label: "neutral", level: 0 };
  },
  memoryLinks(ws) { if (!ws.length) return []; return AriMem.d.facts.filter(f => { const ft = AriNLP.norm(f.t); return ws.some(w => ft.includes(w)); }).slice(0, 4); },
  learn(raw) {
    for (const p of (window.AriLearn || [])) {
      const m = raw.match(p.re); if (!m) continue;
      const d = p.fn(m); if (d.uk) AriMem.su(d.uk, d.uv); if (!d.learn) continue;
      const added = AriMem.add(d.learn, d.uk || "dato");
      if (typeof window.AriUI !== "undefined") window.AriUI.renderMem();
      if (d.uk === "nombre") return this.reply(`Mucho gusto, **${d.uv}**. Ya guardé tu nombre.\n\nAhora puedo hablarte de forma más personal y conectar mejor mis respuestas con lo que me enseñes.`, true, {intent:"aprender"});
      return this.reply(added ? `Guardado.\n\nLo integré así en mi memoria: **${d.learn}**\n\nCuando el tema esté relacionado, usaré ese dato para responderte con más contexto.` : `Eso ya estaba guardado. No lo dupliqué, pero lo tomaré en cuenta cuando tenga sentido.`, added, {intent:"aprender"});
    }
    return null;
  },
  reasonAboutUser(a) {
    const low = a.low, nm = AriMem.gu("nombre"), edad = AriMem.gu("edad"), lugar = AriMem.gu("lugar"), trabajo = AriMem.gu("trabajo"), estudio = AriMem.gu("estudio");
    if (AriNLP.any(low, ["como me llamo", "cual es mi nombre"])) return this.reply(nm ? `Te llamas **${nm}**. Lo tengo guardado en mi memoria.` : `Todavía no tengo tu nombre guardado. Puedes decirme: \`mi nombre es ...\``);
    if (AriNLP.any(low, ["cuantos anos tengo", "cuántos años tengo"])) return this.reply(edad ? `Tienes **${edad} años** según lo que me enseñaste.` : `Todavía no tengo tu edad guardada. Puedes decirme: \`tengo [número] años\``);
    if (AriNLP.any(low, ["donde vivo", "dónde vivo"])) return this.reply(lugar ? `Vives en **${lugar}**, según mi memoria.` : `Todavía no tengo guardado dónde vives.`);
    if (AriNLP.any(low, ["quien soy", "que sabes de mi", "que recuerdas de mi", "que tienes guardado", "mis datos"])) {
      const lines = [];
      if (nm) lines.push(`- Tu nombre es **${nm}**.`); if (edad) lines.push(`- Tienes **${edad} años**.`); if (lugar) lines.push(`- Vives en **${lugar}**.`); if (trabajo) lines.push(`- Trabajas **${trabajo}**.`); if (estudio) lines.push(`- Estudias **${estudio}**.`);
      AriMem.d.facts.slice(-10).reverse().forEach(f => { if (!lines.some(x => x.includes(f.t.slice(0, 18)))) lines.push(`- ${f.t}`); });
      return this.reply(lines.length ? `Esto es lo que recuerdo de ti:\n\n${lines.join("\n")}\n\nPuedo usarlo para adaptar mis respuestas. También puedes borrar recuerdos desde el panel.` : `Todavía no tengo recuerdos guardados sobre ti. Puedes enseñarme con frases como \`recuerda que me gusta crear apps modernas\`.`);
    }
    return null;
  },
  flattenBrain() {
    const out = [], KB = window.KB_BRAIN || {};
    for (const [cat, node] of Object.entries(KB)) {
      if (!node || typeof node !== "object") continue;
      if (node.kw || node.res) out.push({ cat, sub: null, node, depth: 1 });
      if (node.subs && typeof node.subs === "object") for (const [sub, sn] of Object.entries(node.subs)) out.push({ cat, sub, node: sn, depth: 2 });
    }
    return out;
  },
  bestKnowledge(a) {
    let best = null;
    for (const item of this.flattenBrain()) {
      if (this.CORE_KEYS.has(item.cat) && !["explicar", "pregunta"].includes(a.intent)) continue;
      if (["saludos","despedidas"].includes(item.cat)) continue;
      const searchText = `${item.cat} ${item.sub || ""} ${item.node.kw || ""}`;
      let score = AriNLP.score(a.ws, searchText) + (item.depth === 2 ? 0.07 : 0);
      if (["explicar", "pregunta"].includes(a.intent)) score += 0.04;
      if (!best || score > best.score) best = { ...item, score };
    }
    return best && best.score >= 0.18 ? best : null;
  },
  pickResponse(node, a) {
    if (!node || !Array.isArray(node.res) || !node.res.length) return "";
    let r = node.res[Math.floor(Math.random() * node.res.length)];
    if (typeof r === "function") { try { r = r({ nombre: a.name, name: a.name, stats: a.stats, emocion: a.emotion, memorias: a.memories }); } catch { try { r = r(a.name); } catch { r = ""; } } }
    return String(r || "").trim();
  },
  smallTalk(a) {
    const n = a.name ? `, **${a.name}**` : "";
    if (a.intent === "charla_estado") return this.reply(`Estoy bien${n}. Más importante: estoy lista para ayudarte de forma útil, no solo responder por responder.\n\nHoy puedo ayudarte a crear, corregir código, mejorar tu app, darte ideas o simplemente conversar.`, false, {intent:a.intent});
    if (a.intent === "saludo") return this.reply(`${AriGenerators.pick(["Hola", "Buenas", "Hey"])}${n}. Te leo. ¿Qué quieres crear, arreglar o pensar ahora?`, false, {intent:a.intent});
    if (a.intent === "agradecimiento") return this.reply(`Con gusto${n}. Seguimos puliéndolo hasta que quede como quieres.`, false, {intent:a.intent});
    return null;
  },
  emotionalAnswer(a) {
    if (a.emotion.type === "riesgo") return this.reply(`Lo que acabas de decir es importante.\n\nSi estás pensando en hacerte daño o sientes que puedes perder el control, busca ayuda inmediata ahora mismo: llama a emergencias de tu país o contacta a alguien de confianza que pueda estar contigo físicamente.\n\nAhora no tienes que resolver toda tu vida; solo necesitamos que estés seguro en este momento. Respóndeme solo esto: **¿estás en peligro inmediato ahora mismo?**`);
    const start = { tristeza:"Te leo. Eso suena como algo que duele y que quizá vienes cargando desde hace rato.", ansiedad:"Suena a que tu mente está intentando resolver demasiadas cosas al mismo tiempo.", enojo:"Entiendo la frustración. Cuando algo no avanza o se repite, la mente se cansa y se enciende.", cansancio:"Eso suena a cansancio acumulado, no solo a falta de ganas.", alegria:"Me alegra leerte así. Usemos esa energía para avanzar con intención." }[a.emotion.type] || "Te leo.";
    const mem = a.memories.length ? `\n\nTambién conecto esto con algo que recuerdo: ${a.memories.map(m => `**${m.t}**`).join(" · ")}.` : "";
    return this.reply(`${a.name ? start.replace(/\.$/, `, **${a.name}**.`) : start}\n\nMi lectura es esta: antes de buscar una solución grande, conviene separar el problema en partes pequeñas.\n\n**Vamos por orden:**\n1. Qué pasó.\n2. Qué parte puedes controlar.\n3. Qué paso mínimo puedes hacer hoy.${mem}\n\nDime cuál de esas tres partes quieres ordenar primero.`);
  },
  humor(a) {
    if (AriNLP.any(a.low, ["que es un chiste", "qué es un chiste", "definicion de chiste", "definición de chiste"])) {
      return this.reply(`Un **chiste** es una frase o historia corta creada para causar risa. Normalmente funciona porque rompe una expectativa: te lleva por un camino y al final cambia el sentido con un remate.\n\nEjemplo: “¿Qué hace una abeja en el gimnasio? Zum-ba.”`, false, {intent:"humor"});
    }
    const topic = a.low.replace(/cuentame|cuéntame|dime|hazme|un|una|chiste|broma|de|sobre/g, "").trim();
    return this.reply(`${AriGenerators.joke(topic)}\n\nSi quieres, te cuento otro más negro, más sano, más de programadores o más dominicano/panameño.`, false, {intent:"humor"});
  },
  riddle(a) { return this.reply(`Adivinanza:\n\n**No tiene boca y habla, no tiene oídos y responde. ¿Qué es?**\n\nRespuesta: **el eco**.`, false, {intent:"adivinanza"}); },
  codeAnswer(a) {
    if (a.low.includes("calculadora")) return this.reply(AriGenerators.calculatorCode(), false, {intent:"codigo"});
    if (AriNLP.any(a.low, ["error", "bug", "no funciona", "pantalla", "responsive", "movil", "móvil"])) return this.reply(`Vamos a arreglarlo con método.\n\nPor lo que dices, puede ser un problema de **ruta, caché, responsive, evento JS o CSS que no se está aplicando**.\n\nEnvíame el error de consola o el bloque de código relacionado y te digo exactamente qué línea cambiar. Si es visual, mándame captura + CSS de esa pantalla.`, false, {intent:"codigo"});
    return this.reply(`Sí. Puedo crear ese código.\n\nPara no darte algo genérico, voy a asumir que lo quieres **funcional, limpio y listo para pegar**. Dime solo el lenguaje si no lo mencionaste: HTML/JS, React, Python o Node.\n\nMientras tanto, puedo darte una estructura base con: interfaz, lógica, validaciones y comentarios.`, false, {intent:"codigo"});
  },
  createAnswer(a) {
    if (a.intent === "crear_saludo") return this.reply(AriGenerators.greeting(a), false, {intent:"crear"});
    if (a.intent === "texto") return this.reply(AriGenerators.shortText(a), false, {intent:"texto"});
    if (a.intent === "visual") return this.reply(AriGenerators.imagePrompt(a), false, {intent:"visual"});
    if (AriNLP.any(a.low, ["idea", "ideas"])) return this.reply(AriGenerators.ideas(a), false, {intent:"crear"});
    return this.reply(`Claro. Te propongo una versión directa:\n\n**Concepto:** algo moderno, claro y útil, sin sentirse recargado.\n\n**Estructura:**\n1. Mensaje principal fuerte.\n2. Detalle visual o funcional premium.\n3. Acción clara para el usuario.\n\n**Resultado:** debe sentirse profesional, rápido y fácil de entender.\n\nSi quieres, lo convierto ahora mismo en texto, código, diseño de interfaz o prompt de imagen.`, false, {intent:"crear"});
  },
  answerKnowledge(item, a) {
    const title = item.sub ? `${item.cat} / ${item.sub}` : item.cat;
    const raw = this.pickResponse(item.node, a);
    const mem = a.memories.length ? `\n\n**Conexión con tu memoria:** ${a.memories.map(m => m.t).join(" · ")}` : "";
    const intro = ["explicar","pregunta"].includes(a.intent) ? `Voy a explicarlo claro. Detecté que esto va sobre **${title}**.\n\n` : `Esto se relaciona con **${title}**.\n\n`;
    this.CTX = { topic: title, turns: 0, lastIntent: a.intent };
    return this.reply(`${intro}${raw}${mem}\n\nMi conclusión: lo importante es entender el principio y aplicarlo. Puedo bajarlo a ejemplo, código o pasos si quieres.`, false, {intent:a.intent, topic:title});
  },
  generalReason(a) {
    if (["explicar", "pregunta"].includes(a.intent)) return this.reply(`Puedo explicarlo.\n\nLo que entiendo que preguntas es: **${a.raw}**.\n\nMi forma de abordarlo sería:\n1. Definir el concepto.\n2. Separar lo importante de lo secundario.\n3. Dar un ejemplo real.\n4. Cerrar con una conclusión práctica.\n\nDime si lo quieres simple o técnico y lo desarrollo.`, false, {intent:a.intent});
    if (a.short) return this.reply(`Te sigo. Para responder mejor necesito solo una pista: ¿quieres que lo cree, lo explique o lo convierta en código?`, false, {intent:"general"});
    return this.reply(`Voy a ordenar lo que pides:\n\n1. **Objetivo:** qué quieres lograr.\n2. **Contexto:** dónde lo estás haciendo.\n3. **Resultado:** cómo debe quedar.\n\nCon esos tres datos puedo darte una respuesta concreta, no una frase genérica.`, false, {intent:"general"});
  },
  get(input) {
    const raw = String(input || "").trim(); if (!raw) return this.reply("Te leo. Escribe lo que necesitas y lo trabajamos.");
    AriMem.remember("user", raw); const a = this.analyze(raw);
    const learned = this.learn(raw); if (learned) return learned;
    const userReason = this.reasonAboutUser(a); if (userReason) return userReason;
    if (/^(olvida|elimina|borra)\s+(todo|memoria|recuerdos)/i.test(a.low)) return this.reply('Para borrar todo, usa el botón **Borrar memoria** del panel. Así evitamos borrar información importante por accidente.');
    const mc = AriCalc(a.low); if (mc) return this.reply(mc, false, {intent:"calculo"});
    if (["saludo","charla_estado","agradecimiento"].includes(a.intent)) return this.smallTalk(a);
    if (a.intent === "despedida") return this.reply("Listo. Cuando vuelvas seguimos desde donde lo dejamos.", false, {intent:a.intent});
    if (a.intent === "humor") return this.humor(a);
    if (a.intent === "adivinanza") return this.riddle(a);
    if (a.emotion.level >= 2) return this.emotionalAnswer(a);
    if (a.intent === "codigo") return this.codeAnswer(a);
    if (["crear_saludo", "texto", "visual", "crear"].includes(a.intent)) return this.createAnswer(a);
    if (AriNLP.any(a.low, ["ayuda", "como funciona", "instrucciones", "comandos"])) { const node = (window.KB_BRAIN || {}).ayuda; return this.reply(this.pickResponse(node, a)); }
    if (AriNLP.any(a.low, ["que sabes", "cuanto sabes", "capacidades", "habilidades", "cuantos temas", "conocimiento"])) { const node = (window.KB_BRAIN || {}).conocimiento; return this.reply(this.pickResponse(node, a)); }
    if (AriNLP.any(a.low, ["quien eres", "que eres", "presentate", "preséntate"])) { const node = (window.KB_BRAIN || {}).identidad; return this.reply(this.pickResponse(node, a)); }
    const best = this.bestKnowledge(a); if (best) return this.answerKnowledge(best, a);
    const hits = AriMem.srch(a.raw); if (hits.length) return this.reply(`Revisé mi memoria y encontré esto relacionado:\n\n${hits.map(f => `- ${f.t}`).join("\n")}\n\n¿Quieres que lo use para darte una recomendación o una respuesta más directa?`);
    return this.generalReason(a);
  }
};

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    AriMem.init(); AriMem.migrateFromOldKeys();
    if (typeof window.AriUI !== "undefined") window.AriUI.init();
  });
}
console.log("✅ Ari Engine v10 humano listo");
})();
