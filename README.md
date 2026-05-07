# Ari v5 — IA Personal Local

## Estructura del proyecto

```
ari/
├── index.html          ← Interfaz (no editar)
├── engine.js           ← Motor NLP + razonamiento (no editar)
├── brain/
│   ├── core.js         ← Identidad, saludos, emocional, motivación
│   ├── tech.js         ← Programación, IA/ML, Ciberseguridad
│   ├── ciencias.js     ← Física, química, biología, astronomía
│   ├── matematicas.js  ← Álgebra, cálculo, estadística
│   ├── humanidades.js  ← Historia, geografía, filosofía, literatura
│   ├── vida.js         ← Salud, nutrición, finanzas, negocios
│   └── extras.js       ← Música, cocina, deportes, viajes, idiomas
└── README.md           ← Este archivo
```

## Cómo abrir Ari

Abre `index.html` en cualquier navegador moderno.
No necesita servidor ni internet.

## Cómo agregar conocimiento

### Agregar una respuesta a un tema existente

```javascript
// En brain/tech.js, busca el tema y agrega al array res:
javascript: {
  kw: '...',
  res: [
    "Respuesta existente...",
    "Tu nueva respuesta aquí ✨"   // ← agrega aquí
  ]
}
```

### Agregar un tema nuevo

```javascript
window.KB_BRAIN.mi_tema = {
  kw: 'palabras clave que activan este tema separadas por espacio',
  res: [
    "**Título** 🎯\n\nContenido en markdown...",
    "Segunda variante de respuesta."
  ]
};
```

### Agregar subtemas (más específicos)

```javascript
window.KB_BRAIN.ciencia = {
  kw: 'ciencia...',
  res: ["Respuesta general..."],
  subs: {
    mi_subtema: {
      kw: 'palabras muy específicas',
      res: ["Respuesta específica y detallada..."]
    }
  }
};
```

## Formato Markdown disponible

```
**negrita**    → texto en negrita
*cursiva*      → texto en cursiva
`código`       → código inline
## Subtítulo   → encabezado
- item         → lista
1. item        → lista numerada
```bloque```   → bloque de código
```

## Preguntas directas sobre el usuario

Ari responde automáticamente:
- "cómo me llamo" → busca en memoria
- "quién soy" → resumen de todo lo guardado
- "cuántos años tengo" → busca en memoria
- "dónde vivo" → busca en memoria
- "qué recuerdas de mí" → muestra todo

## Subir a la web

Arrastra la carpeta `ari/` a **netlify.com/drop** — gratis, en 30 segundos.

---
Sin API · Sin internet · 100% tuyo · 💜

---

## Actualización aplicada por ChatGPT — Ari v6 humano

Se reemplazaron:

- `engine.js`: ahora analiza intención, emoción, memoria, contexto e historial antes de responder.
- `brain/core.js`: ahora define personalidad humana, tono y respuestas base menos robóticas.

También se dejaron copias de seguridad:

- `engine.original.js`
- `brain/core.original.js`

Pruebas recomendadas:

```txt
hola
```

```txt
me siento frustrado con mi app
```

```txt
crea código para una calculadora
```

```txt
explica física cuántica como principiante
```

```txt
mi nombre es Yael
```

```txt
qué recuerdas de mí
```
