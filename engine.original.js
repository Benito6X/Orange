// ═══════════════════════════════════════════════════
//  ARI ENGINE v5 — Motor con razonamiento real
//  Edita brain/*.js para agregar conocimiento.
//  No edites este archivo.
// ═══════════════════════════════════════════════════

window.AriMem = {
  KEY: "ari_v5", d: null,
  init() { try { this.d = JSON.parse(localStorage.getItem(this.KEY)) || this.fr(); } catch { this.d = this.fr(); } },
  fr() { return { facts: [], user: {}, msgs: 0 }; },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch(e) {} },
  add(t, tag) {
    if (!t || this.d.facts.some(f => f.t.toLowerCase() === t.toLowerCase())) return false;
    this.d.facts.push({ t, tag: tag||"dato", ts: Date.now() });
    this.save(); return true;
  },
  del(i) { this.d.facts.splice(i, 1); this.save(); },
  su(k, v) { this.d.user[k] = v; this.save(); },
  gu(k) { return this.d.user[k]; },
  srch(q) {
    const w = AriNLP.tok(q);
    return this.d.facts.filter(f => w.some(x => f.t.toLowerCase().includes(x)));
  },
  tick() { this.d.msgs++; this.save(); },
  cnt() { return this.d.facts.length; },
  lv() { const m = this.d.msgs; return m<10?1:m<50?2:m<150?3:m<400?4:5; },
  clear() { this.d = this.fr(); this.save(); }
};

window.AriNLP = {
  STOP: new Set("el la los las un una de del al y o en que es se por con a su para me mi te tu si no ya le lo nos les hay ser son era fue han he ha pero como mas bien muy también así esto eso esta ese esa aqui ahi donde cuando porque aunque tanto todo toda todos todas cada otro otra este qué cómo cuál cuándo quién cuánto dónde".split(" ")),
  tok(s) {
    return s.toLowerCase().replace(/[¿¡.,;:!?()\[\]«»""]/g,"").split(/\s+/).filter(w => w.length > 2 && !this.STOP.has(w));
  },
  score(ws, txt) {
    if (!ws.length) return 0;
    const t = this.tok(txt);
    return ws.filter(w => t.some(x => x.includes(w) || w.includes(x))).length / ws.length;
  }
};

window.AriCalc = function(s) {
  const c = s.replace(/[¿¡]/g,"")
    .replace(/cuánto es|cuánto da|calcula|resuelve|el resultado de|cuánto son/gi,"").trim()
    .replace(/\bx\b/g,"*").replace(/÷/g,"/").replace(/\bpor\b/g,"*").replace(/\bentre\b/g,"/")
    .replace(/\bmás\b/g,"+").replace(/\bmenos\b/g,"-")
    .replace(/al cuadrado/g,"**2").replace(/al cubo/g,"**3").replace(/\^/g,"**")
    .replace(/raíz cuadrada de (\d+)/g,"Math.sqrt($1)").replace(/raíz de (\d+)/g,"Math.sqrt($1)")
    .replace(/\bpi\b|π/g,"Math.PI")
    .replace(/\bsin\b/g,"Math.sin").replace(/\bcos\b/g,"Math.cos").replace(/\btan\b/g,"Math.tan");
  if (c.length > 0 && c.length < 140 && /^[\d\s\+\-\*\/\.\(\)%MathsqrtPIcostanlog1029]+$/.test(c)) {
    try {
      const r = Function('"use strict";return('+c+')')();
      if (Number.isFinite(r) && !isNaN(r)) {
        const fmt = Number.isInteger(r) ? r.toLocaleString("es") : parseFloat(r.toFixed(8)).toString();
        return `El resultado es **${fmt}** 🔢`;
      }
    } catch(e) {}
  }
  return null;
};

window.AriEngine = {
  CTX: { cat: null, t: 0 },
  rnd(a) { return a[Math.floor(Math.random() * a.length)]; },

  // ── RAZONAMIENTO DIRECTO sobre la persona ────────
  reasonAboutUser(low, raw) {
    const nm = AriMem.gu("nombre");
    const edad = AriMem.gu("edad");
    const lugar = AriMem.gu("lugar");
    const trabajo = AriMem.gu("trabajo");
    const estudio = AriMem.gu("estudio");

    // Nombre
    if (/cómo me llamo|como me llamo|cuál es mi nombre|cual es mi nombre|mi nombre|sabes mi nombre/.test(low)) {
      if (nm) return { t: `Te llamas **${nm}** 😊 Lo tengo guardado en mi memoria.` };
      return { t: `Aún no sé tu nombre 🤔 Escríbeme *"mi nombre es [X]"* y lo guardo para siempre.` };
    }

    // Quién soy
    if (/quién soy|quien soy|qué sabes de mí|que sabes de mi|qué sé de ti|qué sabes sobre mí/.test(low)) {
      const facts = AriMem.d.facts;
      if (!facts.length && !nm) return { t: `Todavía no sé mucho de ti 🤔 Cuéntame algo: *"mi nombre es..."*, *"vivo en..."*, *"trabajo como..."* y lo recuerdo para siempre.` };
      let info = [];
      if (nm) info.push(`📛 Tu nombre es **${nm}**`);
      if (edad) info.push(`🎂 Tienes **${edad} años**`);
      if (lugar) info.push(`📍 Vives en **${lugar}**`);
      if (trabajo) info.push(`💼 Trabajas **${trabajo}**`);
      if (estudio) info.push(`📚 Estudias **${estudio}**`);
      facts.slice(0, 5).forEach(f => {
        if (!info.some(i => i.includes(f.t.slice(0,15)))) info.push(`• ${f.t}`);
      });
      return { t: `Lo que sé sobre ti 🧠

${info.join("\n")}\n\n¿Hay algo más que quieras que recuerde?` };
    }

    // Edad
    if (/cuántos años tengo|cuantos años tengo|qué edad tengo|cual es mi edad/.test(low)) {
      if (edad) return { t: `Tienes **${edad} años** 🎂` };
      return { t: `No sé tu edad aún 🤔 Dime *"tengo [N] años"* y lo guardo.` };
    }

    // Dónde vivo
    if (/dónde vivo|donde vivo|en qué ciudad vivo|en que ciudad/.test(low)) {
      if (lugar) return { t: `Vives en **${lugar}** 📍` };
      return { t: `No sé dónde vives 🤔 Dime *"vivo en [ciudad]"* y lo recuerdo.` };
    }

    // Trabajo
    if (/en qué trabajo|en que trabajo|a qué me dedico|a que me dedico|cuál es mi trabajo/.test(low)) {
      if (trabajo) return { t: `Trabajas **${trabajo}** 💼` };
      return { t: `No sé en qué trabajas 🤔 Dime *"trabajo como [X]"* y lo guardo.` };
    }

    // Recuérdame algo
    if (/qué recuerdas|que recuerdas|qué sabes|qué guardaste|qué tienes guardado/.test(low)) {
      const facts = AriMem.d.facts;
      if (!facts.length && !nm) return { t: `No tengo nada guardado sobre ti todavía 🧠 Cuéntame algo con *"recuerda que..."* y lo guardo para siempre.` };
      let info = [];
      if (nm) info.push(`Tu nombre: **${nm}**`);
      if (edad) info.push(`Edad: **${edad}**`);
      if (lugar) info.push(`Lugar: **${lugar}**`);
      facts.slice(0, 6).forEach(f => info.push(`• ${f.t}`));
      return { t: `Lo que tengo guardado sobre ti 🧠\n\n${info.join("\n")}` };
    }

    return null;
  },

  get(input) {
    const raw = input.trim(), low = raw.toLowerCase();
    const ws = AriNLP.tok(low), nm = AriMem.gu("nombre");
    const KB = window.KB_BRAIN || {};

    // 1. Patrones de aprendizaje
    for (const p of (window.AriLearn || [])) {
      const m = raw.match(p.re);
      if (m) {
        const d = p.fn(m);
        if (d.uk) AriMem.su(d.uk, d.uv);
        if (d.learn) {
          const added = AriMem.add(d.learn, d.uk || "dato");
          if (typeof window.AriUI !== "undefined") window.AriUI.renderMem();
          if (d.uk === "nombre") return { t: `¡Mucho gusto, **${d.uv}**! 💜 Ya guardé tu nombre en mi memoria.`, ok: true };
          return { t: added ? `✅ Aprendido: *"${d.learn}"*` : `Ya lo sabía 😄`, ok: added };
        }
      }
    }

    // 2. Razonamiento directo sobre el usuario
    const userReason = this.reasonAboutUser(low, raw);
    if (userReason) return userReason;

    // 3. Olvido
    if (/^(olvida|elimina|borra)\s+(ese\s+)?(recuerdo|que)/i.test(low))
      return { t: "Usa el botón ✕ en el panel de recuerdos para borrar uno, o \"Borrar todo\" para limpiar todo." };

    // 4. ¿Qué sabes sobre X?
    const sm = low.match(/(?:qué sabes|tienes info|cuéntame|dime algo|qué recuerdas)\s+(?:sobre|de|acerca de)\s+(.+)/i);
    if (sm) {
      const hits = AriMem.srch(sm[1]);
      if (hits.length) return { t: `Lo que recuerdo sobre **${sm[1]}** 🧠\n\n${hits.slice(0,5).map(f=>`- ${f.t}`).join("\n")}\n\n¿Quieres contarme más?` };
    }

    // 5. Cálculo
    const mc = AriCalc(low);
    if (mc) return { t: mc };

    // 6. Scoring del KB
    const scores = {};
    for (const [cat, data] of Object.entries(KB)) {
      if (!data.kw) continue;
      const s = AriNLP.score(ws, data.kw);
      if (s > 0) scores[cat] = s;
      if (data.subs) for (const [sub, sd] of Object.entries(data.subs)) {
        const ss = AriNLP.score(ws, sd.kw);
        if (ss > 0) scores[`${cat}.${sub}`] = ss * 1.45;
      }
    }

    const ranked = Object.entries(scores).sort((a,b) => b[1]-a[1]);

    if (ranked.length && ranked[0][1] >= 0.11) {
      const [key] = ranked[0];
      const [cat, sub] = key.split(".");
      let responses;
      if (sub && KB[cat]?.subs?.[sub]) responses = KB[cat].subs[sub].res;
      else responses = KB[cat]?.res || [];
      let res = this.rnd(responses);
      if (typeof res === "function") {
        const isEmo = KB[cat]?.isFn;
        const stats = { f: AriMem.cnt(), m: AriMem.d.msgs, lv: AriMem.lv() };
        res = res(isEmo ? nm : stats);
      }
      this.CTX = { cat, t: 0 };
      return { t: res };
    }

    // 7. Buscar en memoria personal
    const mh = AriMem.srch(low);
    if (mh.length) return { t: `Revisando mi memoria... 🧠\n\n${mh.slice(0,3).map(f=>`- ${f.t}`).join("\n")}\n\n¿Es eso lo que buscabas?` };

    // 8. Contexto previo
    if (this.CTX.cat && this.CTX.t < 2) {
      this.CTX.t++;
      return { t: this.rnd(["Necesito más contexto 🤔 ¿Puedes darme más detalles?", "Cuéntame más para ayudarte mejor 💡", "Amplíame ese punto — así doy una respuesta más útil 🎯"]) };
    }

    // 9. Fallback
    this.CTX = { cat: null, t: 0 };
    return { t: this.rnd([
      "Ese tema está fuera de mi base actual 🌱 Puedes enseñarme: *\"recuerda que [dato]\"* y lo guardo para siempre. ¿Qué quieres que aprenda?",
      "No tengo suficiente info sobre eso todavía 💭 ¿Me lo enseñas con *\"recuerda que...\"*? Mi conocimiento crece contigo.",
      "Escapa de lo que sé por ahora 🤔 ¿Lo reformulas o me enseñas con *\"recuerda que...\"*?"
    ]) };
  }
};

window.AriLearn = [
  { re: /^(recuerda|aprende|guarda|nota|sabe|memoriza)\s+(que\s+)?(.+)/i, fn: m => ({ learn: m[3] }) },
  { re: /^mi nombre es (.+)/i, fn: m => ({ uk: "nombre", uv: m[1], learn: `El nombre del usuario es ${m[1]}` }) },
  { re: /^me llamo (.+)/i, fn: m => ({ uk: "nombre", uv: m[1], learn: `El usuario se llama ${m[1]}` }) },
  { re: /^tengo (\d+) años/i, fn: m => ({ uk: "edad", uv: m[1], learn: `El usuario tiene ${m[1]} años` }) },
  { re: /^trabajo\s+(en|como|de)\s+(.+)/i, fn: m => ({ uk: "trabajo", uv: m[2], learn: `El usuario trabaja ${m[1]} ${m[2]}` }) },
  { re: /^vivo en (.+)/i, fn: m => ({ uk: "lugar", uv: m[1], learn: `El usuario vive en ${m[1]}` }) },
  { re: /^estudio (.+)/i, fn: m => ({ uk: "estudio", uv: m[1], learn: `El usuario estudia ${m[1]}` }) },
  { re: /^me gusta (.+)/i, fn: m => ({ learn: `Al usuario le gusta: ${m[1]}` }) },
  { re: /^soy (un|una)?\s*(.+)/i, fn: m => ({ learn: `El usuario es: ${m[2]}` }) },
  { re: /^mi (.+?) (es|son) (.+)/i, fn: m => ({ uk: m[1], uv: m[3], learn: `${m[1]} del usuario: ${m[3]}` }) },
  { re: /^(odio|no me gusta|detesto) (.+)/i, fn: m => ({ learn: `Al usuario no le gusta: ${m[2]}` }) },
];

document.addEventListener("DOMContentLoaded", () => {
  AriMem.init();
  if (typeof window.AriUI !== "undefined") window.AriUI.init();
});
console.log("✅ Ari Engine v5 listo");
