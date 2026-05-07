# Aura — Solución rápida

Este paquete acepta la API key de OpenAI en cualquiera de estos nombres:

- OPENAI_API_KEY
- OPENAI_KEY
- AURA_OPENAI_API_KEY
- AI_API_KEY

Variables recomendadas en Vercel:

AI_PROVIDER=openai
OPENAI_API_KEY=tu_api_key_nueva
OPENAI_MODEL=gpt-4o-mini
IMAGE_PROVIDER=openai
OPENAI_IMAGE_MODEL=gpt-image-1

Después de cambiar variables, haz Redeploy.

Prueba:
https://tu-proyecto.vercel.app/api/health

Debe decir:
openaiKeyConfigured: true
chatConfigured: true
imageConfigured: true

No subas solo index.html. Debe existir la carpeta api/.
