ARI v11 — IA REAL READY

Qué se corrigió:
1. index.html ahora carga los scripts en orden correcto:
   core → humanidades → ciencias → matematicas → tech → vida → extras → mente → engine.

2. Se agregó cache busting con ?v=11.0 para evitar que el navegador use engine.js viejo.

3. El mensaje del usuario se limpia y se envía intacto.
   El flujo correcto ahora es:
   input limpio → AriAI.get(userMessage) → backend /api/chat → LLM/API.
   Si el backend no está disponible, Ari usa AriEngine.get(userMessage) como fallback local.

4. Los botones rápidos ya no pisan el texto escrito por el usuario.
   Si el usuario escribió algo, se envía ese texto.
   Si el input está vacío, se envía el prompt del botón.

5. Se eliminaron eventos inline del botón enviar y de Enter.
   Ahora hay eventos únicos con bloqueo isSending para evitar doble respuesta.

6. engine.js fue ajustado para que el bug de “¿Quién es Cristóbal Colón?” no caiga en modo visual.
   La causa era que el detector visual buscaba “ui” con includes(), y “quien” contiene “ui”.

7. Se agregó backend real en /api/chat.js usando OpenAI Responses API.
   La clave API queda segura en variable de entorno, no en el frontend.

Pruebas en consola:
AriEngine.get("¿Quién es Cristóbal Colón?").t
AriEngine.get("crea código para una calculadora").t
Object.keys(KB_BRAIN).length

Resultado esperado:
- Colón responde con explicación directa, no prompt visual.
- Calculadora devuelve código HTML/CSS/JS.
- KB_BRAIN debe devolver más de 0 temas; en este paquete devuelve 65.

Cómo activar la IA real:
1. Sube este proyecto a Vercel.
2. En Vercel, abre Settings → Environment Variables.
3. Agrega:
   OPENAI_API_KEY = tu clave real
   OPENAI_MODEL = gpt-5.4-mini
4. Instala dependencias/deploy normal.
5. Abre la web. Si /api/chat responde, Ari usará IA real.
   Si no responde, Ari usará el motor local como respaldo.

Importante:
El motor local NO es una IA completa. Sirve para memoria, personalidad, acciones rápidas, cálculo simple, conocimiento offline y fallback.
El razonamiento real y preguntas generales deben ir al backend + LLM/API.


NUEVO EN ESTA VERSIÓN CORE:
- Se agregó core/planner.js, core/reasoner.js y core/evaluator.js.
- Se agregó memoria modular: short_term, long_term y semantic.
- Se agregó sistema de herramientas: web_search, calculator, code_executor, file_reader y api_connector.
- Se agregó aprendizaje: feedback, reinforcement y user_preferences.
- El backend /api/chat.js ahora usa un loop: analizar → planificar → ejecutar → evaluar → responder.
- Lee README_ARQUITECTURA_CORE.md para ver la arquitectura completa.
