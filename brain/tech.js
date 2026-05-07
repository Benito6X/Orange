// ARI BRAIN — tech.js
// Temas: Programación (JS/TS/Python/React/CSS/Git/SQL/Docker/Algoritmos)
//        Tecnología · IA/ML · Ciberseguridad
// Agrega respuestas a los arrays res:[] o nuevos subtemas a subs:{}
window.KB_BRAIN = window.KB_BRAIN || {};
Object.assign(window.KB_BRAIN, {

programacion: {
  kw: "programar código javascript python html css react typescript node sql git docker algoritmo función variable array objeto clase api backend frontend framework librería bug debug developer",
  res: ["¡Me encanta hablar de código! 💻 Manejo JS, TS, Python, React, CSS, SQL, Git, Docker, Algoritmos y más. ¿Por dónde empezamos?"],
  subs: {
    javascript: {
      kw: "javascript js closure scope async await promise fetch dom evento module import export proxy",
      res: ["**JavaScript moderno** 💻\n\n```javascript\n// Optional chaining + nullish\nconst precio = producto?.precio ?? 0;\n\n// Async con retry\nasync function fetchRetry(url, n = 3) {\n  for (let i = 0; i < n; i++) {\n    try {\n      const r = await fetch(url);\n      if (!r.ok) throw new Error(`HTTP ${r.status}`);\n      return await r.json();\n    } catch (e) {\n      if (i === n - 1) throw e;\n      await new Promise(r => setTimeout(r, 1000 * 2 ** i));\n    }\n  }\n}\n\n// Promise.allSettled\nconst [users, posts] = await Promise.allSettled([\n  fetch('/api/users').then(r => r.json()),\n  fetch('/api/posts').then(r => r.json())\n]).then(res => res.map(r => r.status === 'fulfilled' ? r.value : null));\n\n// AbortController para timeout\nconst ctrl = new AbortController();\nsetTimeout(() => ctrl.abort(), 5000);\nconst data = await fetch(url, { signal: ctrl.signal });\n```\n\n**Event loop:** call stack → microtasks (Promises) → tasks (setTimeout). Siempre vacía microtasks primero. ¿Qué profundizamos?"]
    },
    typescript: {
      kw: "typescript ts tipo type interface generic enum utility conditional mapped template",
      res: ["**TypeScript avanzado** 🔷\n\n```typescript\n// Discriminated unions — el patrón más seguro\ntype API<T> = { ok: true; data: T } | { ok: false; error: string; code: number };\n\nasync function call<T>(url: string): Promise<API<T>> {\n  try {\n    const r = await fetch(url);\n    if (!r.ok) return { ok: false, error: r.statusText, code: r.status };\n    return { ok: true, data: await r.json() };\n  } catch(e) { return { ok: false, error: String(e), code: 0 }; }\n}\n\n// Template literal types\ntype Evento = 'click' | 'focus';\ntype Handler = `on${Capitalize<Evento>}`; // 'onClick' | 'onFocus'\n\n// satisfies — valida sin perder tipos literales\nconst config = { port: 3000, host: 'localhost' } satisfies Record<string, string | number>;\nconfig.port.toFixed(0); // TypeScript sabe que es number\n```"]
    },
    python: {
      kw: "python pip django flask fastapi pandas numpy dataclass asyncio generador decorador",
      res: ["**Python avanzado** 🐍\n\n```python\nfrom dataclasses import dataclass, field\nfrom typing import Optional\n\n@dataclass\nclass Producto:\n    nombre: str\n    precio: float\n    tags: list[str] = field(default_factory=list)\n    \n    def __post_init__(self):\n        if self.precio < 0: raise ValueError('precio inválido')\n    \n    @property\n    def precio_iva(self) -> float:\n        return round(self.precio * 1.07, 2)\n\n# Context manager\nfrom contextlib import contextmanager\nimport time\n\n@contextmanager\ndef timer(label=''):\n    t = time.perf_counter()\n    try: yield\n    finally: print(f'{label}: {time.perf_counter()-t:.4f}s')\n\n# Pattern matching (3.10+)\nmatch evento:\n    case {'tipo': 'crear', 'nombre': str(n)}:\n        crear(n)\n    case {'tipo': 'error', 'code': 404}:\n        raise NotFoundError()\n    case _: log.warning('desconocido')\n```"]
    },
    react: {
      kw: "react hook useState useEffect useCallback useMemo useRef context reducer suspense",
      res: ["**React — patrones modernos** ⚛️\n\n```jsx\n// Custom hook con AbortController\nfunction useFetch(url) {\n  const [s, d] = useReducer(\n    (prev, a) => ({ ...prev, ...a }),\n    { data: null, loading: true, error: null }\n  );\n  useEffect(() => {\n    const ctrl = new AbortController();\n    d({ loading: true, error: null });\n    fetch(url, { signal: ctrl.signal })\n      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })\n      .then(data => d({ data, loading: false }))\n      .catch(e => { if (e.name !== 'AbortError') d({ error: e.message, loading: false }); });\n    return () => ctrl.abort();\n  }, [url]);\n  return s;\n}\n\n// Optimistic updates\nasync function deleteItem(id) {\n  setItems(prev => prev.filter(i => i.id !== id)); // actualiza UI primero\n  try { await api.delete(id); }\n  catch { setItems(original); toast.error('Error'); } // rollback si falla\n}\n```"]
    },
    css: {
      kw: "css flexbox grid animación transition responsive media query container query variable",
      res: ["**CSS moderno** 🎨\n\n```css\n:root {\n  --accent: hsl(262 80% 62%);\n  --space: clamp(1rem, 2vw, 2rem);\n}\n\n/* Grid sin media queries */\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));\n  gap: var(--space);\n}\n\n/* Container queries (2023) */\n.card-wrap { container-type: inline-size; }\n@container (min-width: 400px) { .card { grid-template-columns: auto 1fr; } }\n\n/* :has() selector */\n.form:has(:invalid) .submit { opacity: .5; pointer-events: none; }\n\n/* Glassmorphism */\n.glass {\n  background: rgba(255,255,255,.08);\n  backdrop-filter: blur(20px) saturate(180%);\n  border: .5px solid rgba(255,255,255,.12);\n}\n```"]
    },
    git: {
      kw: "git commit push pull merge branch rebase stash cherry pick reflog bisect worktree",
      res: ["**Git — dominio profesional** 🔧\n\n```bash\n# Conventional commits\ngit commit -m 'feat(auth): add OAuth2 with PKCE'\ngit commit -m 'fix(api): handle 429 with exponential backoff'\n\n# Rebase interactivo — historial limpio\ngit rebase -i HEAD~5\n# pick|squash(s)|fixup(f)|reword(r)|drop(d)\n\n# Bisect — encuentra el commit culpable\ngit bisect start\ngit bisect bad              # actual está roto\ngit bisect good v2.1.0      # versión que funcionaba\n# Git hace checkout en el medio, dile good/bad\ngit bisect reset\n\n# Recuperar trabajo perdido\ngit reflog                  # historial de TODOS los movimientos\ngit checkout HEAD@{3}       # volver a cualquier punto\n\n# Worktree — múltiples ramas en paralelo\ngit worktree add ../hotfix hotfix/critical\n```"]
    },
    sql: {
      kw: "sql mysql postgresql select join where group having order index window function cte recursiva",
      res: ["**SQL avanzado** 🗄️\n\n```sql\n-- Window functions\nSELECT\n  nombre, depto, salario,\n  RANK() OVER (PARTITION BY depto ORDER BY salario DESC) AS rk,\n  AVG(salario) OVER (PARTITION BY depto) AS avg_depto,\n  LAG(salario) OVER (ORDER BY fecha_ingreso) AS anterior\nFROM empleados;\n\n-- CTE recursiva (jerarquías)\nWITH RECURSIVE h AS (\n  SELECT id, nombre, jefe_id, 0 AS lvl\n  FROM empleados WHERE jefe_id IS NULL\n  UNION ALL\n  SELECT e.id, e.nombre, e.jefe_id, h.lvl+1\n  FROM empleados e JOIN h ON e.jefe_id = h.id\n)\nSELECT REPEAT('  ',lvl)||nombre AS org FROM h ORDER BY lvl;\n\n-- UPSERT atómico\nINSERT INTO usuarios(email, nombre) VALUES ($1, $2)\nON CONFLICT (email) DO UPDATE\n  SET nombre=EXCLUDED.nombre, updated_at=NOW()\nRETURNING id;\n\n-- Índice parcial\nCREATE INDEX CONCURRENTLY idx_activos\nON pedidos (cliente_id, fecha DESC)\nWHERE estado = 'pendiente';\n```"]
    },
    algoritmos: {
      kw: "algoritmo big o complejidad recursión árbol grafo hash dp bfs dfs dijkstra greedy sliding window",
      res: ["**Algoritmos** 🧮\n\n```\nO(1): hash/array   O(log n): búsqueda binaria\nO(n): recorrido    O(n log n): mergesort\nO(n²): nested loops  O(2^n): subsets sin memo\n```\n\n```javascript\n// Dijkstra\nfunction dijkstra(graph, src) {\n  const dist = {}, pq = [[0, src]];\n  for (const n in graph) dist[n] = Infinity;\n  dist[src] = 0;\n  while (pq.length) {\n    pq.sort((a,b) => a[0]-b[0]);\n    const [d, u] = pq.shift();\n    if (d > dist[u]) continue;\n    for (const [v, w] of graph[u]||[]) {\n      if (dist[u]+w < dist[v]) {\n        dist[v] = dist[u]+w; pq.push([dist[v], v]);\n      }\n    }\n  }\n  return dist;\n}\n\n// Sliding window — mayor substring sin repetición\nfunction longestUnique(s) {\n  const seen = new Map(); let [l, max] = [0, 0];\n  for (let r = 0; r < s.length; r++) {\n    if (seen.has(s[r]) && seen.get(s[r]) >= l) l = seen.get(s[r])+1;\n    seen.set(s[r], r);\n    max = Math.max(max, r-l+1);\n  }\n  return max;\n}\n```"]
    },
    docker: {
      kw: "docker contenedor imagen dockerfile compose kubernetes deploy volumen k8s",
      res: ["**Docker en producción** 🐳\n\n```dockerfile\nFROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --frozen-lockfile\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nRUN addgroup -S app && adduser -S app -G app\nCOPY --from=deps --chown=app:app /app/node_modules ./node_modules\nCOPY --chown=app:app . .\nUSER app\nEXPOSE 3000\nHEALTHCHECK CMD wget -qO- http://localhost:3000/health\nCMD [\"node\",\"server.js\"]\n```\n\n```bash\ndocker compose up -d --build    # levantar\ndocker stats                    # recursos en tiempo real\ndocker system prune -af         # limpiar todo\ndocker compose watch            # live reload (2023+)\n```"]
    }
  }
},

ia_ml: {
  kw: "inteligencia artificial ia machine learning deep learning red neuronal gpt llm transformer atención rlhf fine-tuning embeddings",
  res: ["**IA y Machine Learning** 🤖\n\n**Jerarquía:** IA ⊃ ML ⊃ Deep Learning ⊃ Transformers/LLMs\n\n**Tipos de ML:**\n- Supervisado: labeled data → función (spam, precios, diagnóstico)\n- No supervisado: patrones sin etiquetas (clustering, anomalías)\n- Por refuerzo: agente+entorno+recompensa → política óptima (AlphaGo, ChatGPT-RLHF)\n- Auto-supervisado: genera su propio label (masked LM = base de BERT/GPT)\n\n**Cómo funcionan los LLMs:**\n1. Pre-entrenamiento: next-token prediction en billones de tokens\n2. Fine-tuning supervisado en ejemplos de calidad\n3. RLHF: preferencias humanas alinean el modelo\n4. Temperatura controla aleatoriedad; Top-p controla diversidad\n\n**Transformer (2017):** Self-attention permite a cada token 'atender' a todos los demás con diferentes pesos. Superó a RNNs en dependencias de largo alcance.\n\n**Limitaciones:** Alucinación · Razonamiento causal débil · Sin memoria persistente · Costoso en compute · No sabe lo que no sabe\n\n¿Qué aspecto de IA te interesa más?"]
},

ciberseguridad: {
  kw: "seguridad ciberseguridad hacking contraseña cifrado VPN phishing ransomware 2fa autenticación vulnerabilidad OWASP zero trust",
  res: ["**Ciberseguridad** 🔐\n\n**Lo que debes hacer YA:**\n1. **Gestor de contraseñas** (Bitwarden gratis): contraseñas únicas, 20+ chars, aleatorias\n2. **2FA con app** (Authy, Aegis). Nunca SMS si puedes evitarlo (SIM swapping)\n3. **Actualiza siempre**: 60% de brechas explotan vulnerabilidades con parche disponible\n4. **Phishing**: el 91% de ciberataques empieza aquí\n\n**OWASP Top 10 (2023):**\n1. Broken Access Control · 2. Cryptographic Failures · 3. Injection (SQL/XSS)\n4. Insecure Design · 5. Security Misconfiguration · 6. Vulnerable Components\n7. Auth Failures · 8. Integrity Failures · 9. Logging Failures · 10. SSRF\n\n**Conceptos clave:**\n- Zero Trust: nunca confíes, siempre verifica\n- Mínimo privilegio: solo los permisos estrictamente necesarios\n- Defensa en profundidad: múltiples capas\n- SQL Injection: siempre usa queries parametrizadas\n- XSS: sanitiza siempre el input del usuario"]
}

});
console.log("✅ Brain tech.js listo");

// ═══════════════════════════════════════════════════
//  ARI BRAIN v9 — EXPANSIÓN PROFUNDA: tecnología
//  Agregado automáticamente para ampliar conocimiento.
// ═══════════════════════════════════════════════════
window.KB_BRAIN = window.KB_BRAIN || {};
Object.assign(window.KB_BRAIN, {
  "tech_avanzado_v9": {
    "kw": "tecnología avanzada software arquitectura sistemas ia ciberseguridad cloud devops frontend backend mobile bases datos redes computación",
    "res": [
      "**Tecnología avanzada — mapa general**\n\nUna app moderna combina:\n\n- **Frontend:** interfaz, experiencia, accesibilidad y rendimiento.\n- **Backend:** APIs, autenticación, reglas de negocio.\n- **Base de datos:** persistencia, relaciones, índices, consultas.\n- **Seguridad:** permisos, validación, cifrado y control de acceso.\n- **DevOps:** despliegue, monitoreo, logs, CI/CD.\n- **Producto:** lo que el usuario realmente necesita.\n- **IA:** automatización, análisis, generación y personalización.\n\nEl software profesional no es solo que funcione; debe ser mantenible, seguro, rápido y escalable."
    ],
    "subs": {
      "arquitectura_software": {
        "kw": "arquitectura software monolito microservicios modular capas clean architecture hexagonal mvc mvvm dominio",
        "res": [
          "**Arquitectura de software**\n\nPatrones comunes:\n\n- **Monolito:** todo en una aplicación. Simple para empezar.\n- **Modular monolith:** monolito dividido por módulos internos.\n- **Microservicios:** servicios separados; útil a escala, complejo al inicio.\n- **MVC:** Modelo, Vista, Controlador.\n- **MVVM:** Modelo, Vista, ViewModel.\n- **Clean Architecture:** dominio independiente de frameworks.\n- **Hexagonal:** la lógica central no depende de bases de datos ni UI.\n\nRegla práctica: empieza simple, separa responsabilidades y escala cuando el problema lo exija, no antes."
        ]
      },
      "javascript_profundo": {
        "kw": "javascript event loop closure prototype promesas async await módulos memoria this bind call apply",
        "res": [
          "**JavaScript profundo**\n\nConceptos que hacen diferencia:\n\n- **Event loop:** coordina call stack, microtasks y macrotasks.\n- **Closure:** una función recuerda variables de su entorno.\n- **Prototype:** herencia basada en objetos.\n- **`this`:** depende de cómo se llama la función.\n- **Promise:** representa un valor futuro.\n- **Async/await:** sintaxis más limpia sobre promesas.\n- **Módulos:** separan código en archivos reutilizables.\n- **Garbage collection:** libera memoria no referenciada.\n\nError común: confundir asincronía con paralelismo. JS puede ser no bloqueante aunque un solo hilo ejecute la lógica principal."
        ]
      },
      "typescript_profundo": {
        "kw": "typescript tipos genéricos generics union intersection infer mapped conditional satisfies never unknown",
        "res": [
          "**TypeScript profundo**\n\nTypeScript permite diseñar contratos antes de ejecutar.\n\nConceptos:\n- `unknown`: tipo seguro para valores desconocidos.\n- `never`: algo imposible o función que no retorna.\n- Union types: `A | B`.\n- Intersection types: `A & B`.\n- Generics: funciones reutilizables con tipos.\n- Conditional types: tipos que dependen de condiciones.\n- Mapped types: transformar propiedades.\n- `infer`: extraer tipos dentro de una condición.\n- `satisfies`: valida estructura sin perder tipos literales.\n\nObjetivo: reducir errores antes de correr el código."
        ]
      },
      "react_avanzado": {
        "kw": "react avanzado hooks reducer context memo suspense server components estado render re-render performance zustand nextjs",
        "res": [
          "**React avanzado**\n\nBuenas prácticas:\n\n- Mantén estado lo más local posible.\n- No uses Context para datos que cambian cada segundo si causa re-render global.\n- Usa `useMemo` y `useCallback` solo cuando haya costo real.\n- Divide componentes por responsabilidad.\n- Controla efectos: `useEffect` no debe reemplazar lógica de datos innecesariamente.\n- Usa keys estables en listas.\n- Evita duplicar estado derivado.\n- Mide rendimiento antes de optimizar.\n\nEn apps grandes, combina componentes limpios + estado predecible + buen manejo de carga/error."
        ]
      },
      "node_backend": {
        "kw": "node backend express fastify api rest middleware auth jwt session cors rate limit validación",
        "res": [
          "**Node.js Backend**\n\nComponentes típicos:\n\n- Rutas: definen endpoints.\n- Middlewares: validación, auth, logs, CORS.\n- Controladores: reciben request y devuelven response.\n- Servicios: lógica de negocio.\n- Repositorios: acceso a datos.\n- Esquemas: validación con Zod/Joi/Yup.\n- Auth: sesión o JWT bien configurado.\n- Rate limiting: protege endpoints.\n\nRegla: el frontend nunca debe ser la única capa de seguridad."
        ]
      },
      "bases_datos_avanzadas": {
        "kw": "base datos avanzada índices transacciones acid normalización query plan explain postgres mysql mongodb redis cache",
        "res": [
          "**Bases de datos avanzadas**\n\nConceptos clave:\n\n- **ACID:** atomicidad, consistencia, aislamiento, durabilidad.\n- **Índices:** aceleran lectura, pero cuestan escritura y espacio.\n- **Query plan:** cómo la base decide ejecutar una consulta.\n- **Transacciones:** aseguran operaciones completas.\n- **Bloqueos:** evitan inconsistencias, pero pueden causar espera.\n- **Normalización:** reduce duplicación.\n- **Desnormalización:** mejora lectura a costo de duplicación.\n- **Cache:** Redis/memoria para datos repetidos.\n- **Replicación:** copias para lectura o disponibilidad.\n- **Backup:** no existe sistema serio sin recuperación."
        ]
      },
      "cloud_devops": {
        "kw": "cloud devops docker kubernetes ci cd pipeline deployment serverless aws azure gcp vercel netlify logs monitoring",
        "res": [
          "**Cloud y DevOps**\n\nDevOps une desarrollo, despliegue y operación.\n\nElementos:\n- CI: pruebas automáticas al subir código.\n- CD: despliegue automatizado.\n- Docker: empaqueta app y dependencias.\n- Kubernetes: orquesta contenedores a escala.\n- Serverless: ejecuta funciones sin administrar servidores.\n- Logs: registro de eventos.\n- Métricas: CPU, memoria, latencia, errores.\n- Alertas: avisan antes de que el usuario se queje.\n- Rollback: volver a una versión estable.\n\nBuen despliegue = reproducible, monitoreado y reversible."
        ]
      },
      "ciberseguridad_profunda": {
        "kw": "ciberseguridad owasp xss csrf sqli ssrf rce auth autorización jwt cookies cifrado hashing pentesting",
        "res": [
          "**Ciberseguridad web**\n\nRiesgos comunes:\n\n- **XSS:** inyección de script en la página.\n- **SQL Injection:** manipular consultas.\n- **CSRF:** abusar de sesión activa del usuario.\n- **SSRF:** servidor hace requests no deseados.\n- **RCE:** ejecución remota de código.\n- **Broken Access Control:** usuario accede a lo que no debe.\n- **Credential stuffing:** probar contraseñas filtradas.\n- **Exposición de secretos:** claves en frontend o repositorio.\n\nBuenas prácticas:\n- Validar y sanitizar.\n- Usar consultas parametrizadas.\n- Cookies `HttpOnly`, `Secure`, `SameSite`.\n- Hash de contraseñas con bcrypt/argon2.\n- Autorización en servidor.\n- Logs de seguridad.\n- Mínimos privilegios."
        ]
      },
      "ia_machine_learning": {
        "kw": "machine learning deep learning red neuronal embeddings transformer llm prompt training inference fine tuning rag vector database",
        "res": [
          "**IA y Machine Learning**\n\nConceptos:\n\n- **Dataset:** ejemplos usados para aprender.\n- **Features:** variables de entrada.\n- **Modelo:** función que aprende patrones.\n- **Entrenamiento:** ajustar parámetros.\n- **Inferencia:** usar el modelo para responder.\n- **Overfitting:** memoriza entrenamiento y falla en datos nuevos.\n- **Embedding:** vector que representa significado.\n- **Transformer:** arquitectura base de muchos LLM.\n- **RAG:** recuperar información externa y usarla para responder.\n- **Fine-tuning:** adaptar modelo con nuevos ejemplos.\n\nPara una IA como Ari: una base `brain/*.js` es conocimiento simbólico; un LLM real aprende patrones en parámetros."
        ]
      },
      "movil_pwa": {
        "kw": "móvil movil pwa android ios responsive touch install offline service worker manifest viewport",
        "res": [
          "**Apps móviles y PWA**\n\nUna PWA puede sentirse como app si cuida:\n\n- `manifest.json` con nombre, iconos y color.\n- Service Worker para offline/cache.\n- Diseño responsive con `100dvh`.\n- Botones táctiles mínimo 44px.\n- Safe areas para iPhone.\n- Performance: carga rápida.\n- Estados offline y loading.\n- Evitar hover como única interacción.\n- Teclado móvil: cuidar inputs y viewport.\n\nUna app móvil no es una web achicada; es una experiencia táctil."
        ]
      }
    }
  }
});
console.log("✅ Expansión v9 cargada: tech.js");
