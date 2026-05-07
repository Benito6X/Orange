# Aura - solución del error de API expuesta

El error que viste pasó porque `AI_PROVIDER` estaba configurado con la API key.

Debe quedar así en Vercel > Project > Settings > Environment Variables:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=tu_api_key_nueva
OPENAI_MODEL=gpt-4o-mini
IMAGE_PROVIDER=pollinations
```

Nunca pongas una clave `sk-...` en `AI_PROVIDER`.

Después de corregir las variables, entra a Deployments > Redeploy y desactiva `Use existing build cache` si aparece.

Prueba:

```txt
https://tu-proyecto.vercel.app/api/health
```

La respuesta segura debe verse así:

```json
{
  "ok": true,
  "app": "Aura",
  "providerConfigured": true,
  "providerName": "openai",
  "chatConfigured": true,
  "imageProvider": "pollinations",
  "note": "Health seguro: nunca devuelve API keys ni valores secretos."
}
```

La pantalla principal solo debe mostrar `Online`, no la API key.
