# Aura Core v3 — Smart Layout sin PIN

Versión de prueba sin PIN para revisar interfaz, motor y memoria.

## Qué mejora

- Pantalla completa en PC y móvil con `100dvh`.
- Sidebar responsive: fijo en PC y lateral en móvil.
- Chat con ancho profesional, input fijo y scroll correcto.
- Motor interno más dinámico: detecta intención, tema, fecha/hora, definiciones, código, diseño, estrategia y análisis.
- Memoria cloud por Vercel KV/Upstash.

## Variables necesarias para memoria

```env
KV_REST_API_URL=tu_url_de_kv
KV_REST_API_TOKEN=tu_token_de_kv
```

También acepta:

```env
UPSTASH_REDIS_REST_URL=tu_url
UPSTASH_REDIS_REST_TOKEN=tu_token
```

Todas en `Production and Preview`. Después haz Redeploy.

## Importante

Esta versión no usa OpenAI ni otra API de IA. No puede igualar el razonamiento de un modelo real, pero evita respuestas repetidas y usa memoria/contexto de forma más útil.
