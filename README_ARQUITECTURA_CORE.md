# Ari IA REAL — Arquitectura Core v12

Esta versión agrega una arquitectura más parecida a una IA moderna: planificador, razonador, evaluador, memoria avanzada, herramientas y aprendizaje básico.

## Flujo principal

```txt
input usuario
  ↓
core/nlp.js
  ↓
core/planner.js      → detecta intención múltiple, entidades y herramientas
  ↓
core/reasoner.js     → consulta memoria + ejecuta herramientas + prepara contexto
  ↓
api/chat.js          → llama al LLM si hace falta
  ↓
core/evaluator.js    → verifica coherencia antes de responder
  ↓
respuesta + memory_patch
  ↓
index.html / AriMem  → guarda memoria local actualizada
```

## Nuevos módulos

### core/

- `core/planner.js`  
  Divide el problema en pasos, detecta intenciones múltiples y decide si usar herramientas.

- `core/reasoner.js`  
  Ejecuta el plan, consulta memoria, coordina herramientas y prepara el prompt final del LLM.

- `core/evaluator.js`  
  Revisa si la respuesta está vacía, es incoherente, afirma herramientas fallidas o no cumple el pedido.

- `core/personality.js`  
  Mantiene personalidad consistente: español, tono profesional/cercano, estilo moderno y útil.

- `core/nlp.js`  
  Normaliza texto, tokeniza, extrae entidades simples y detecta intención/contexto implícito.

### memory/

- `memory/short_term.js`  
  Maneja contexto inmediato e historial reciente.

- `memory/long_term.js`  
  Guarda perfil del usuario, hechos persistentes, preferencias y pesos de importancia.

- `memory/semantic.js`  
  Implementa búsqueda semántica ligera con vectores hash + similitud coseno. No necesita librerías externas.

- `memory/memory_manager.js`  
  Une short-term, long-term y semantic. Devuelve `memory_patch` para que el frontend lo guarde.

### tools/

- `tools/web_search.js`  
  Búsqueda web con Tavily, Brave o SerpAPI. Si no hay keys, usa DuckDuckGo Instant Answer como fallback limitado.

- `tools/calculator.js`  
  Calculadora segura para expresiones matemáticas.

- `tools/code_executor.js`  
  Ejecuta JavaScript aislado con `vm`, sin `fs`, `process`, `require` ni red.

- `tools/file_reader.js`  
  Lee archivos seguros dentro del proyecto (`txt`, `md`, `json`, `js`, `css`, `html`).

- `tools/api_connector.js`  
  Conecta APIs externas solo si su host está permitido en `ARI_ALLOWED_API_HOSTS`.

- `tools/index.js`  
  Registro central de herramientas.

### learning/

- `learning/feedback.js`  
  Detecta frases como “me gustó”, “muy simple”, “más profesional”, “no entendí”.

- `learning/reinforcement.js`  
  Ajusta prioridad de recuerdos según feedback positivo/negativo.

- `learning/user_preferences.js`  
  Extrae preferencias de tono, detalle y estilo visual desde memoria/historial.

## Variables nuevas

En `.env.example` se agregaron:

```env
TAVILY_API_KEY=
BRAVE_SEARCH_API_KEY=
SERPAPI_API_KEY=
ARI_ALLOWED_API_HOSTS=
```

Solo necesitas una API de búsqueda si quieres que `web_search` sea fuerte. Si no configuras ninguna, Ari intentará usar DuckDuckGo Instant Answer, que es más limitado.

## Importante

Esta arquitectura mejora la toma de decisiones y memoria del proyecto, pero el razonamiento avanzado sigue dependiendo del LLM configurado con `OPENAI_API_KEY`. Si no hay API key, Ari responde usando el core local como fallback.
