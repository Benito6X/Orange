// ═══════════════════════════════════════════════════
//  ARI BRAIN — core.js
//  Temas: Identidad · Saludos · Despedidas ·
//         Emocional · Motivación · Ayuda · Conocimiento
//  ─────────────────────────────────────────────────
//  CÓMO AGREGAR RESPUESTAS:
//  1. Abre este archivo en cualquier editor de texto
//  2. Busca el tema que quieres expandir
//  3. Agrega un string al array "res": [...]
//  4. Guarda y recarga el navegador
// ═══════════════════════════════════════════════════

window.KB_BRAIN = window.KB_BRAIN || {};

Object.assign(window.KB_BRAIN, {

  identidad: {
    kw: "ari quien eres nombre presentate bot robot ia qué eres cómo funciones cómo te hicieron creaste",
    res: [
      "Soy **Ari** 💜 Una IA personal que vive completamente en tu dispositivo — sin servidores externos, sin API, sin suscripción, sin rastreo. Todo mi conocimiento está en los archivos `brain/*.js` que puedes abrir y editar. Tengo 38 temas integrados y puedes enseñarme lo que quieras con *\"recuerda que...\"*. ¿Qué exploramos?",
      "Me llamo **Ari** ✨ Soy un motor de conocimiento local — funciono sin internet, sin costos. Mis archivos `brain/` contienen todo lo que sé y puedes editarlos para enseñarme más. ¿En qué te ayudo hoy?",
      "Soy **Ari** 🌟 Una IA construida para ser 100% tuya. Sin dependencias externas. Sin rastreo. Mi conocimiento está en archivos `.js` editables que vienen con el proyecto. Escribe *\"recuerda que...\"* para enseñarme algo ahora mismo.",
    ]
  },

  saludos: {
    kw: "hola hey buenas buenos días tardes noches qué tal cómo estás cómo vas saludos hi hello sup qué más",
    isFn: true,
    res: [
      n => `¡Hola${n ? ", **"+n+"**" : ""}! 💜 ¿En qué puedo ayudarte hoy?`,
      n => `¡Hey${n ? " **"+n+"**" : ""}! Aquí estoy, lista para lo que necesites 🌟`,
      n => `¡${n ? "**"+n+"**, q" : "Q"}ué bueno verte! ¿Qué exploramos hoy? ✨`,
      n => `Hola${n ? " **"+n+"**" : ""}! 😊 Cuéntame qué tienes en mente.`,
    ]
  },

  despedidas: {
    kw: "adiós bye chao hasta luego nos vemos me voy buenas noches hasta pronto cuídate",
    res: [
      "¡Hasta pronto! 💜 Todo lo que me enseñaste quedó guardado para la próxima.",
      "¡Chao! Cuídate mucho 🌟 Aquí estaré cuando me necesites.",
      "¡Nos vemos! 💜 Fue un placer conversar contigo.",
      "¡Hasta luego! ✨ Tu memoria sigue guardada y lista.",
    ]
  },

  emocional: {
    kw: "triste solo deprimido ansioso estresado cansado agotado frustrado enojado miedo preocupado mal llorar no puedo burnout duelo angustia pánico inseguro perdido",
    isFn: true,
    res: [
      n => `Entiendo que estás pasando por algo difícil${n ? ", **"+n+"**" : ""}. Lo que sientes es válido — no tienes que estar bien todo el tiempo 💜 ¿Quieres contarme qué está pasando?`,
      () => "Lo que describes suena pesado 💜 A veces la vida simplemente pesa más de lo que debería. ¿Qué está pasando? Aquí escucho sin juzgar.",
      () => "Ese agotamiento es real — el cuerpo y la mente mandan señales cuando algo necesita atención 💜 ¿Cuánto tiempo llevas sintiéndote así?",
      () => "No tienes que tener todo resuelto para hablar de ello 💜 A veces solo necesitamos que alguien escuche sin juzgar. ¿Qué está pasando?",
    ]
  },

  motivacion: {
    kw: "motivación fuerza voluntad disciplina hábito procrastinar empezar meta objetivo lograr éxito fracaso rendirse consistencia productividad atomic habits",
    res: [
      "**Motivación y hábitos** 💪\n\n**La verdad:** La motivación es una emoción que fluctúa. La disciplina es un sistema que funciona aunque no tengas ganas.\n\n**Atomic Habits (James Clear):**\n- `(1.01)^365 = 37.78` — 1% mejor cada día lo cambia todo\n- Loop del hábito: Señal → Antojo → Respuesta → Recompensa\n- Para crear hábitos: hazlos obvios, atractivos, fáciles, satisfactorios\n- Para romper hábitos: invisibles, poco atractivos, difíciles\n\n**Principios clave:**\n- El entorno > la fuerza de voluntad: ropa de gym lista la noche anterior\n- Identidad > metas: \"Soy alguien que cuida su salud\" > \"quiero perder peso\"\n- La cadena de Seinfeld: una X en el calendario cada día. No rompas la cadena.\n- Nunca faltes dos días seguidos. Uno = accidente. Dos = nuevo hábito negativo.\n\n**Deep work (Cal Newport):** 4-6h de trabajo enfocado valen más que 10h fragmentadas.\n\n¿Qué estás intentando cambiar o lograr?",
    ]
  },

  conocimiento: {
    kw: "qué sabes cuánto sabes cuáles temas conoces capacidades habilidades qué puedes cuántos temas",
    isFn: true,
    res: [
      s => `**Base de conocimiento de Ari** 🧠\n\n**38 temas** distribuidos en 7 archivos editables en la carpeta \`brain/\`.\n\n💾 Recuerdos guardados sobre ti: **${s.f}**\n💬 Mensajes intercambiados: **${s.m}**\n🎯 Nivel: **${s.lv}/5**\n\nEdita los archivos \`brain/*.js\` para agregar conocimiento permanente 🌱`
    ]
  },

  ayuda: {
    kw: "ayuda help comando cómo funciona instrucciones qué puedo enseñar tutorial cómo uso",
    res: [
      "**Cómo usar Ari al máximo** 🤖\n\n**Para enseñarme sobre ti:**\n```\nrecuerda que [cualquier dato]\nmi nombre es [X]\ntengo [N] años\nvivo en [ciudad]\ntrabajo en/como [X]\nestudio [X]\nme gusta [X]\n```\n\n**Para preguntarme sobre ti:**\n- \"cómo me llamo\"\n- \"quién soy\"\n- \"cuántos años tengo\"\n- \"qué recuerdas de mí\"\n\n**Para agregar conocimiento permanente:**\nEdita los archivos en la carpeta `brain/` directamente.\n\n**38 temas disponibles:**\nProgramación · IA/ML · Ciberseguridad · Matemáticas · Física · Química · Biología · Astronomía · Historia · Geografía · Filosofía · Literatura · Psicología · Economía · Finanzas · Negocios · Salud · Nutrición · Música · Arte/Diseño · Cocina · Deportes · Viajes · Idiomas · Motivación · Liderazgo · Comunicación · Inteligencia emocional · Derecho · Meditación"
    ]
  }

});
console.log("✅ Brain core.js listo");
