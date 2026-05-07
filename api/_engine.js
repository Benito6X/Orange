const STOP = new Set('el la los las un una unos unas de del para por con sin sobre desde hasta entre y o u a en que como cual cuales cuando donde porque por que mi mis tu tus su sus es soy eres son somos estoy estas esta esto este esa ese esos esas lo al se me te nos ya mas más muy pero si no hola gracias necesito quiero quieres puedes poder hacer crear genera generar dame explica proyecto app ia aura por favor bro mi amor'.split(/\s+/));

function clean(s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s+\-*/().,¿?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s = '') {
  return clean(s).split(' ').filter(w => w.length > 2 && !STOP.has(w));
}

function titleCase(s='') {
  return String(s).trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function todayInfo() {
  const now = new Date();
  const tz = 'America/Panama';
  const full = new Intl.DateTimeFormat('es-PA', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now);
  const time = new Intl.DateTimeFormat('es-PA', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true }).format(now);
  return { full, time, tz };
}

function scoreMemory(prompt, memory) {
  const pt = new Set(tokens(prompt));
  const mt = new Set(tokens(`${memory.text || ''} ${(memory.tags || []).join(' ')}`));
  let score = 0;
  for (const t of pt) if (mt.has(t)) score += 2;
  const p = clean(prompt);
  const m = clean(memory.text || '');
  if (m && p.includes(m.slice(0, Math.min(18, m.length)))) score += 4;
  return score;
}

function pickRelevantMemories(prompt, memories, limit = 8) {
  return [...(memories || [])]
    .map(m => ({ ...m, _score: scoreMemory(prompt, m) }))
    .filter(m => m._score > 0)
    .sort((a, b) => b._score - a._score || new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, limit);
}

function inferTags(text) {
  const t = clean(text);
  const tags = [];
  if (/(codigo|program|html|css|javascript|react|node|api|frontend|backend|web|app|software|bug|error)/.test(t)) tags.push('desarrollo');
  if (/(diseno|diseño|logo|marca|branding|visual|ui|ux|interfaz|imagen|movil|responsive)/.test(t)) tags.push('diseño');
  if (/(negocio|ventas|marketing|estrategia|cliente|empresa|precio|producto)/.test(t)) tags.push('negocio');
  if (/(aura|ia|asistente|chatbot|motor|memoria)/.test(t)) tags.push('aura');
  if (/(personalidad|estilo|tono|respuesta|prefer|siempre|nunca)/.test(t)) tags.push('preferencias');
  if (/(pin|clave|seguridad|privado|sesion|login|token)/.test(t)) tags.push('seguridad');
  return [...new Set(tags.length ? tags : ['general'])];
}

function autoMemoryCandidates(prompt) {
  const p = String(prompt || '').trim();
  const normalized = clean(p);
  const patterns = [
    /(?:recuerda que|guarda que|aprende que|memoriza que|ten presente que)\s+(.+)/i,
    /(?:mi proyecto|mi app|mi marca|mi negocio)\s+(?:se llama|es|trata de)\s+(.+)/i,
    /(?:soy|yo soy|trabajo como|me dedico a)\s+(.+)/i,
    /(?:me gusta|prefiero|quiero que siempre|de ahora en adelante|no quiero que)\s+(.+)/i
  ];
  for (const re of patterns) {
    const m = p.match(re);
    if (m && m[1] && m[1].trim().length > 3) return [{ text: m[1].trim(), tags: inferTags(m[1]) }];
  }
  if (normalized.includes('recuerda') || normalized.includes('guarda') || normalized.includes('aprende')) return [{ text: p, tags: inferTags(p) }];
  return [];
}

function memoryBlock(memories) {
  if (!memories || !memories.length) return '';
  return `\n\n**Memoria usada:**\n${memories.map(m => `- ${m.text}`).join('\n')}`;
}

const DEFINITIONS = {
  comunicacion: {
    title: 'Comunicación',
    simple: 'La comunicación es el proceso de enviar, recibir e interpretar información entre personas, sistemas o grupos.',
    practical: 'Sirve para coordinar acciones, expresar ideas, resolver problemas y confirmar que todos entendieron lo mismo.',
    parts: ['Emisor: quien envía el mensaje.', 'Mensaje: lo que se quiere transmitir.', 'Canal: voz, texto, imagen, video, gesto o sistema.', 'Receptor: quien interpreta el mensaje.', 'Retroalimentación: respuesta que confirma comprensión.'],
    example: 'Cuando dices “arregla Aura para móvil y PC”, estás enviando un mensaje con un objetivo claro; la respuesta correcta debe entender el problema, proponer una solución y confirmar el resultado.'
  },
  inteligencia: {
    title: 'Inteligencia',
    simple: 'La inteligencia es la capacidad de entender información, relacionarla, razonar, aprender y tomar decisiones útiles.',
    practical: 'En software, esa capacidad puede venir de reglas, memoria, búsqueda, modelos entrenados o combinación de varios sistemas.',
    parts: ['Comprender el contexto.', 'Separar lo importante de lo secundario.', 'Elegir una acción.', 'Aprender del resultado.'],
    example: 'Un bot de frases responde siempre igual; una IA real interpreta intención, contexto y cambia su respuesta según el caso.'
  },
  api: {
    title: 'API',
    simple: 'Una API es una conexión controlada para que una app hable con otro servicio.',
    practical: 'Permite que el frontend mande datos a un backend, y el backend responda sin exponer secretos.',
    parts: ['Endpoint: ruta como /api/chat.', 'Request: lo que envías.', 'Response: lo que recibes.', 'Credenciales: claves privadas del servidor.'],
    example: 'Aura puede usar /api/chat para hablar con un motor de IA sin mostrar la API key en el navegador.'
  },
  frontend: {
    title: 'Frontend',
    simple: 'El frontend es la parte visual e interactiva de una app.',
    practical: 'Incluye pantalla, botones, formularios, animaciones, responsive y experiencia de usuario.',
    parts: ['HTML: estructura.', 'CSS: diseño.', 'JavaScript: interacción.', 'Responsive: adaptación a móvil y PC.'],
    example: 'La pantalla de chat de Aura, el input y el sidebar son frontend.'
  },
  backend: {
    title: 'Backend',
    simple: 'El backend es la parte privada de una app donde vive la lógica segura.',
    practical: 'Maneja memoria, sesiones, base de datos, validaciones y conexión con servicios.',
    parts: ['Rutas API.', 'Autenticación.', 'Base de datos.', 'Seguridad.'],
    example: 'La memoria KV y el PIN de Aura son backend.'
  },
  memoria: {
    title: 'Memoria en una IA',
    simple: 'La memoria permite guardar datos importantes del usuario o proyecto para reutilizarlos después.',
    practical: 'Hace que la app no empiece de cero en cada conversación.',
    parts: ['Datos guardados.', 'Etiquetas.', 'Búsqueda por relevancia.', 'Uso en nuevas respuestas.'],
    example: 'Si guardas “Aura debe verse premium”, el motor puede usarlo cuando pidas diseño o UI.'
  },
  branding: {
    title: 'Branding',
    simple: 'El branding es la construcción estratégica de una marca: imagen, voz, promesa y percepción.',
    practical: 'Sirve para que una marca se vea profesional, sea recordable y comunique valor.',
    parts: ['Identidad visual.', 'Tono de comunicación.', 'Promesa de valor.', 'Consistencia.'],
    example: 'Aura necesita branding de producto premium: limpio, serio, moderno y confiable.'
  }
};

function inferIntent(prompt) {
  const p = clean(prompt);
  if (/(que dia es hoy|fecha de hoy|fecha actual|que fecha es|dia actual)/.test(p)) return 'date';
  if (/(que hora es|hora actual|dime la hora)/.test(p)) return 'time';
  if (/(que sabes de mi|mi memoria|recuerdas de mi|que tienes guardado|memoria guardada)/.test(p)) return 'memory';
  if (/(codigo|programa|html|css|javascript|react|node|script|calculadora|landing|web|app)/.test(p)) return 'code';
  if (/(diseno|diseña|branding|logo|marca|visual|ui|ux|interfaz|pantalla|responsive|movil|pc)/.test(p)) return 'design';
  if (/(estrategia|marketing|negocio|ventas|cliente|plan|contenido|campaña)/.test(p)) return 'strategy';
  if (/(analiza|analisis|evalua|diagnostica|problema|error|falla|corrige|mejora|optimiza)/.test(p)) return 'analysis';
  if (/(que es|define|definicion|explica|concepto)/.test(p)) return 'definition';
  if (/(calcula|cuanto es|resultado)/.test(p) || /^[\d\s+\-*/().,%]+$/.test(p)) return 'math';
  if (/(lista|pasos|guia|tutorial|como hago|como puedo)/.test(p)) return 'guide';
  return 'general';
}

function extractTopic(prompt) {
  const p = clean(prompt).replace(/[?¿]/g, '').trim();
  let topic = p
    .replace(/^(que es|define|definicion de|explica|crea|crear|genera|generar|haz|hacer|analiza|mejora|corrige|diseña|disena|como hago|como puedo)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!topic) topic = tokens(prompt).slice(0, 5).join(' ');
  return topic || 'este tema';
}

function tryMath(prompt) {
  const raw = String(prompt).replace(/,/g, '.').replace(/%/g, '/100');
  const candidate = raw.match(/[-+*/().\d\s]{3,}/)?.[0]?.trim();
  if (!candidate) return null;
  if (!/^[\d\s+\-*/().]+$/.test(candidate)) return null;
  try {
    const value = Function(`"use strict"; return (${candidate})`)();
    if (Number.isFinite(value)) return `El resultado es **${value}**.`;
  } catch (_) {}
  return null;
}

function answerDateTime(intent) {
  const { full, time, tz } = todayInfo();
  if (intent === 'date') return `Hoy es **${full}**.\n\nHora aproximada en Panamá: **${time}** (${tz}).`;
  if (intent === 'time') return `La hora aproximada en Panamá es **${time}** (${tz}).`;
  return null;
}

function answerDefinition(prompt, memories) {
  const p = clean(prompt);
  const found = Object.keys(DEFINITIONS).find(k => p.includes(k));
  if (found) {
    const d = DEFINITIONS[found];
    return `## ${d.title}\n\n${d.simple}\n\n**En la práctica:** ${d.practical}\n\n**Elementos clave:**\n${d.parts.map(x => `- ${x}`).join('\n')}\n\n**Ejemplo:** ${d.example}${memoryBlock(memories)}`;
  }
  const topic = extractTopic(prompt);
  return `## ${titleCase(topic)}\n\nNo tengo una enciclopedia completa porque esta versión no usa un modelo externo, pero puedo razonar el tema de forma práctica.\n\n**Idea central:** ${topic} debe entenderse por su función: qué problema resuelve, para quién sirve y qué resultado produce.\n\n**Cómo analizarlo:**\n- Define el contexto: dónde se usa y por qué importa.\n- Identifica sus partes principales.\n- Mira un ejemplo real.\n- Evalúa ventajas, límites y riesgos.\n\n**Para darte una explicación más exacta**, dime si lo quieres para escuela, negocio, diseño, programación o uso personal.${memoryBlock(memories)}`;
}

function codeTemplate(prompt, memories) {
  const p = clean(prompt);
  if (p.includes('calculadora')) {
    return `## Calculadora completa\n\nAquí tienes una calculadora en un solo archivo, responsive y funcional.\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Calculadora Aura</title>\n<style>\n*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090f;color:#fff;font-family:system-ui}.calc{width:min(390px,92vw);background:#141420;border:1px solid #2a2a3a;border-radius:28px;padding:20px;box-shadow:0 30px 80px #0008}.screen{height:96px;background:#0d0d15;border-radius:20px;padding:18px;text-align:right;font-size:34px;overflow:hidden}.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}button{height:62px;border:0;border-radius:18px;background:#222235;color:#fff;font-size:20px;font-weight:800;cursor:pointer}button:hover{filter:brightness(1.15)}.op{background:#6d5dfc}.eq{background:#20c997}.wide{grid-column:span 2}\n</style>\n</head>\n<body>\n<div class="calc">\n  <div class="screen" id="screen">0</div>\n  <div class="keys">\n    <button onclick="clearAll()">C</button><button onclick="del()">⌫</button><button onclick="press('%')">%</button><button class="op" onclick="press('/')">÷</button>\n    <button onclick="press('7')">7</button><button onclick="press('8')">8</button><button onclick="press('9')">9</button><button class="op" onclick="press('*')">×</button>\n    <button onclick="press('4')">4</button><button onclick="press('5')">5</button><button onclick="press('6')">6</button><button class="op" onclick="press('-')">−</button>\n    <button onclick="press('1')">1</button><button onclick="press('2')">2</button><button onclick="press('3')">3</button><button class="op" onclick="press('+')">+</button>\n    <button class="wide" onclick="press('0')">0</button><button onclick="press('.')">.</button><button class="eq" onclick="calc()">=</button>\n  </div>\n</div>\n<script>\nlet expr='';const s=document.getElementById('screen');function render(){s.textContent=expr||'0'}function press(v){if(expr==='Error')expr='';expr+=v;render()}function clearAll(){expr='';render()}function del(){expr=expr.slice(0,-1);render()}function calc(){try{expr=String(Function('return '+expr.replace(/%/g,'/100'))());render()}catch{expr='Error';render();expr=''}}\n<\/script>\n</body>\n</html>\n\`\`\`${memoryBlock(memories)}`;
  }
  const topic = extractTopic(prompt);
  return `## Base de código para ${topic}\n\n**Estructura recomendada:**\n- Interfaz clara y responsive.\n- Código separado por responsabilidad.\n- Validación de errores.\n- Estados de carga y mensajes visibles.\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>${titleCase(topic)}</title>\n<style>\nbody{margin:0;font-family:system-ui;background:#0b0b12;color:white}.app{min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(760px,100%);background:#151522;border:1px solid #2a2a3a;border-radius:24px;padding:28px;box-shadow:0 20px 60px #0006}button{background:#6d5dfc;color:white;border:0;border-radius:14px;padding:12px 18px;font-weight:800}\n</style>\n</head>\n<body><main class="app"><section class="card"><h1>${titleCase(topic)}</h1><p>Base lista para personalizar.</p><button>Comenzar</button></section></main></body>\n</html>\n\`\`\`${memoryBlock(memories)}`;
}

function designTemplate(prompt, memories) {
  const topic = extractTopic(prompt);
  return `## Diseño recomendado para ${topic}\n\n**Diagnóstico:** si una pantalla se ve cortada, normalmente falla por altura fija, overflow mal usado o contenedores sin \`min-height: 0\` dentro de layouts flex/grid.\n\n**Corrección visual:**\n- Usar \`height: 100dvh\` en la app principal.\n- Hacer que el chat sea \`flex: 1\` y tenga \`overflow-y: auto\`.\n- Mantener el input fijo abajo sin tapar los mensajes.\n- En móvil, convertir el sidebar en panel lateral y no ocupar ancho permanente.\n- En PC, centrar el contenido con \`max-width\` amplio, no dejarlo pegado a un lado.\n\n**Estilo premium:**\n- Fondo oscuro con degradados suaves.\n- Burbujas limpias, no bloques gigantes.\n- Tipografía clara y tamaños consistentes.\n- Iconos SVG, sin emojis.\n- Espaciado generoso en desktop y compacto en móvil.${memoryBlock(memories)}`;
}

function strategyTemplate(prompt, memories) {
  const topic = extractTopic(prompt);
  return `## Estrategia para ${topic}\n\n**Objetivo:** convertir la idea en una acción medible.\n\n**Plan:**\n1. Define el resultado principal.\n2. Resume la propuesta en una frase.\n3. Crea una primera versión simple.\n4. Prueba con usuarios reales.\n5. Mide qué funciona y corrige.\n\n**Prioridad:** no intentes hacerlo enorme al principio. Primero debe funcionar, verse bien y resolver un problema claro.${memoryBlock(memories)}`;
}

function analysisTemplate(prompt, memories) {
  const topic = extractTopic(prompt);
  return `## Análisis de ${topic}\n\n**Lectura del problema:** hay que separar tres capas: diseño, lógica y datos.\n\n**Posibles causas:**\n- Diseño: pantalla con altura/overflow incorrecto.\n- Lógica: motor limitado o respuestas demasiado genéricas.\n- Datos: falta de memoria útil o poco contexto guardado.\n\n**Solución práctica:**\n1. Corregir layout primero para que móvil y PC ocupen toda la pantalla.\n2. Mejorar el motor para que detecte intención, tema y contexto.\n3. Usar memoria relevante en cada respuesta.\n4. Aceptar una verdad técnica: sin modelo de IA real, el razonamiento siempre será limitado.\n\n**Resultado esperado:** una app más fluida, menos robótica y visualmente estable.${memoryBlock(memories)}`;
}

function guideTemplate(prompt, memories) {
  const topic = extractTopic(prompt);
  return `## Guía para ${topic}\n\n1. Define exactamente qué quieres lograr.\n2. Separa el problema en partes pequeñas.\n3. Resuelve primero lo que bloquea el funcionamiento.\n4. Luego pule diseño, velocidad y experiencia.\n5. Prueba en móvil y PC antes de darlo por terminado.\n\n**Recomendación:** si me pasas una captura o el error exacto, puedo darte el ajuste directo.${memoryBlock(memories)}`;
}

function generalResponse(prompt, memories) {
  const topic = extractTopic(prompt);
  const relevantWords = tokens(prompt).slice(0, 8);
  return `Entiendo que quieres trabajar sobre **${topic}**.\n\nMi lectura rápida es esta:\n- Tema detectado: **${relevantWords.join(', ') || topic}**.\n- Tipo de ayuda probable: explicación, análisis o plan de acción.\n- Mejor siguiente paso: dime si quieres que lo convierta en código, diseño, estrategia o corrección.\n\nPuedo darte una respuesta más útil si incluyes una de estas instrucciones:\n- “Hazlo en pasos”.\n- “Dame el código completo”.\n- “Explícalo para principiante”.\n- “Analízalo como diseñador/programador”.${memoryBlock(memories)}`;
}

function answer({ prompt, memories = [] }) {
  const intent = inferIntent(prompt);
  const relevant = pickRelevantMemories(prompt, memories);

  if (intent === 'memory') {
    if (!memories.length) return 'Todavía no tengo memoria guardada. Puedes decir: **recuerda que mi proyecto se llama Aura**.';
    return `Esto tengo guardado:\n\n${memories.map((m, i) => `${i + 1}. ${m.text}`).join('\n')}`;
  }

  const dt = answerDateTime(intent);
  if (dt) return dt;

  if (intent === 'math') {
    const math = tryMath(prompt);
    if (math) return math;
  }

  if (intent === 'definition') return answerDefinition(prompt, relevant);
  if (intent === 'code') return codeTemplate(prompt, relevant);
  if (intent === 'design') return designTemplate(prompt, relevant);
  if (intent === 'strategy') return strategyTemplate(prompt, relevant);
  if (intent === 'analysis') return analysisTemplate(prompt, relevant);
  if (intent === 'guide') return guideTemplate(prompt, relevant);

  return generalResponse(prompt, relevant);
}

module.exports = { answer, autoMemoryCandidates, inferTags, pickRelevantMemories };
