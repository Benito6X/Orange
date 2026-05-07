// ARI BRAIN — matematicas.js
// Temas: Álgebra · Cálculo · Estadística · Probabilidad
window.KB_BRAIN = window.KB_BRAIN || {};
Object.assign(window.KB_BRAIN, {

matematicas: {
  kw: "matemáticas algebra geometría cálculo estadística probabilidad número ecuación función logaritmo trigonometría porcentaje integral derivada",
  res: ["Matemáticas 🔢 Álgebra, cálculo, estadística, trigonometría, probabilidad... ¿Qué necesitas?"],
  subs: {
    algebra: {
      kw: "ecuación cuadrática sistema lineal factorizar logaritmo exponencial progresión serie binomio",
      res: ["**Álgebra** 📐\n\n**Cuadrática:** ax²+bx+c=0 → x=(-b±√(b²-4ac))/2a\nΔ>0: 2 raíces · Δ=0: 1 raíz doble · Δ<0: complejas\n\n**Identidades:**\n(a±b)²=a²±2ab+b² · a²-b²=(a+b)(a-b) · (a+b)³=a³+3a²b+3ab²+b³ · a³±b³=(a±b)(a²∓ab+b²)\n\n**Logaritmos:**\nlog(ab)=loga+logb · log(a/b)=loga-logb · log(aⁿ)=n·loga\nCambio de base: logₐb=ln(b)/ln(a)\n\n**Progresiones:**\n- Aritmética: aₙ=a₁+(n-1)d · Sₙ=n(a₁+aₙ)/2\n- Geométrica: aₙ=a₁rⁿ⁻¹ · Sₙ=a₁(1-rⁿ)/(1-r) · Serie infinita: S=a₁/(1-r) (|r|<1)\n\n¿Tienes una ecuación específica?"]
    },
    calculo: {
      kw: "derivada integral límite regla cadena producto cociente taylor integración sustitución partes",
      res: ["**Cálculo** 🔢\n\n**Derivadas:** [xⁿ]'=nxⁿ⁻¹ · [eˣ]'=eˣ · [ln x]'=1/x · [sin x]'=cos x · [cos x]'=-sin x · [tan x]'=sec²x\nCadena: [f(g)]'=f'(g)·g' · Producto: (fg)'=f'g+fg' · Cociente: (f/g)'=(f'g-fg')/g²\nL'Hôpital: si f/g→0/0 ó ∞/∞ entonces lim(f/g)=lim(f'/g')\n\n**Integrales:**\n∫xⁿdx=xⁿ⁺¹/(n+1)+C · ∫eˣdx=eˣ+C · ∫(1/x)dx=ln|x|+C\n∫sin x dx=-cos x+C · ∫cos x dx=sin x+C\n\nPor partes: ∫u dv=uv-∫v du (ILATE: Inversa>Log>Álgebra>Trig>Exp)\n\nTFC: ∫ₐᵇf(x)dx=F(b)-F(a) donde F'=f\n\n**Series de Taylor:** f(x)=Σf⁽ⁿ⁾(a)/n!·(x-a)ⁿ\neˣ=Σxⁿ/n! · sin x=Σ(-1)ⁿx²ⁿ⁺¹/(2n+1)!"]
    },
    estadistica: {
      kw: "estadística media mediana moda desviación varianza normal regresión correlación bayes hipótesis prueba",
      res: ["**Estadística** 📊\n\n**Medidas:** Media: x̄=Σxᵢ/n · Varianza: s²=Σ(xᵢ-x̄)²/(n-1) · s=√s² · CV=s/x̄×100%\nCuartiles: Q1(25%), Q2(50%), Q3(75%) · IQR=Q3-Q1 · Outliers: <Q1-1.5·IQR ó >Q3+1.5·IQR\n\n**Normal:** 68-95-99.7% a ±1σ, ±2σ, ±3σ · Z=(x-μ)/σ\n\n**Regresión:** ŷ=β₀+β₁x · β₁=r(Sy/Sx) · β₀=ȳ-β₁x̄ · R²=varianza explicada\n\n**Probabilidad:**\nP(A∪B)=P(A)+P(B)-P(A∩B) · P(A|B)=P(A∩B)/P(B)\nBayes: P(A|B)=P(B|A)·P(A)/P(B)\nC(n,r)=n!/(r!(n-r)!) · P(n,r)=n!/(n-r)!\n\n**Tests:** p<0.05 → rechaza H₀ · t-test: medias · chi²: independencia · ANOVA: múltiples grupos"]
    }
  }
}

});
console.log("✅ Brain matematicas.js listo");

// ═══════════════════════════════════════════════════
//  ARI BRAIN v9 — EXPANSIÓN PROFUNDA: matemáticas
//  Agregado automáticamente para ampliar conocimiento.
// ═══════════════════════════════════════════════════
window.KB_BRAIN = window.KB_BRAIN || {};
Object.assign(window.KB_BRAIN, {
  "matematicas_avanzadas_v9": {
    "kw": "matemáticas avanzadas lógica discreta álgebra lineal matrices vectores cálculo multivariable ecuaciones diferenciales optimización teoría números combinatoria grafos",
    "res": [
      "**Matemáticas avanzadas — mapa general**\n\nLas matemáticas se dividen en áreas que resuelven distintos tipos de problemas:\n\n- **Álgebra:** símbolos, ecuaciones, estructuras.\n- **Geometría:** formas, espacio, medidas.\n- **Cálculo:** cambio, acumulación, límites.\n- **Álgebra lineal:** vectores, matrices, transformaciones, IA y gráficos.\n- **Probabilidad:** incertidumbre y azar.\n- **Estadística:** inferir patrones desde datos.\n- **Matemática discreta:** lógica, conjuntos, grafos, algoritmos.\n- **Optimización:** encontrar la mejor solución posible.\n- **Ecuaciones diferenciales:** sistemas que cambian con el tiempo.\n\nLa clave no es memorizar fórmulas, sino saber qué modelo describe el problema."
    ],
    "subs": {
      "logica_conjuntos": {
        "kw": "lógica proposicional conjuntos verdad falso implicación equivalencia unión intersección complemento cuantificadores",
        "res": [
          "**Lógica y conjuntos**\n\nLa lógica permite razonar sin contradicciones.\n\n**Operadores:**\n- `¬P`: no P.\n- `P ∧ Q`: P y Q.\n- `P ∨ Q`: P o Q.\n- `P → Q`: si P entonces Q.\n- `P ↔ Q`: P si y solo si Q.\n\n**Conjuntos:**\n- Unión: `A ∪ B`\n- Intersección: `A ∩ B`\n- Diferencia: `A - B`\n- Complemento: elementos que no están en A.\n- Subconjunto: `A ⊆ B`\n\n**Cuantificadores:**\n- `∀`: para todo.\n- `∃`: existe al menos uno.\n\nSirve para programación, bases de datos, pruebas matemáticas e inteligencia artificial."
        ]
      },
      "algebra_lineal_profunda": {
        "kw": "álgebra lineal matriz vector determinante inversa rango eigenvalor eigenvector espacio vectorial transformación lineal embeddings ia",
        "res": [
          "**Álgebra lineal**\n\nConceptos esenciales:\n\n- **Vector:** lista ordenada de números; representa dirección, magnitud o características.\n- **Matriz:** tabla de números; puede transformar vectores.\n- **Producto punto:** mide alineación o similitud.\n- **Norma:** tamaño de un vector.\n- **Determinante:** factor de escala de una transformación y orientación.\n- **Rango:** número de dimensiones independientes.\n- **Inversa:** deshace una transformación si existe.\n- **Eigenvectores:** direcciones que una matriz no gira, solo escala.\n- **Eigenvalores:** cuánto escala cada eigenvector.\n\nAplicaciones:\n- IA: embeddings y redes neuronales.\n- Gráficos: rotaciones, escalas, cámaras.\n- Estadística: PCA.\n- Sistemas físicos: vibraciones, estabilidad y dinámica."
        ]
      },
      "calculo_multivariable": {
        "kw": "cálculo multivariable derivada parcial gradiente divergencia rotacional integral doble triple campo vectorial optimización",
        "res": [
          "**Cálculo multivariable**\n\nExtiende el cálculo a funciones de varias variables.\n\n- Derivada parcial: cambio respecto a una variable manteniendo las demás constantes.\n- Gradiente `∇f`: dirección de mayor crecimiento.\n- Integral doble/triple: acumulación en áreas y volúmenes.\n- Divergencia: mide si un campo “sale” o “entra” de una región.\n- Rotacional: mide tendencia a girar.\n- Multiplicadores de Lagrange: optimización con restricciones.\n\nAplicaciones: física, economía, machine learning, gráficos 3D, fluidos y electromagnetismo."
        ]
      },
      "ecuaciones_diferenciales": {
        "kw": "ecuaciones diferenciales ode pde derivada crecimiento decaimiento logística oscilador armónico sistema dinámico",
        "res": [
          "**Ecuaciones diferenciales**\n\nModelan sistemas donde el cambio depende del estado.\n\nEjemplos:\n- Crecimiento exponencial: `dy/dt = ky`\n- Decaimiento radioactivo: `dy/dt = -ky`\n- Crecimiento logístico: `dy/dt = ky(1-y/K)`\n- Oscilador armónico: `d²x/dt² + ω²x = 0`\n\nAplicaciones:\n- Poblaciones.\n- Circuitos eléctricos.\n- Epidemiología.\n- Mecánica.\n- Economía.\n- Control de sistemas.\n- Clima y fluidos.\n\nLa idea central: no describes solo el valor, describes cómo cambia."
        ]
      },
      "grafos_algoritmos": {
        "kw": "grafos nodos aristas camino ciclo árbol bfs dfs dijkstra algoritmo red ruta dependencia",
        "res": [
          "**Grafos**\n\nUn grafo tiene nodos y conexiones.\n\nTipos:\n- Dirigido/no dirigido.\n- Ponderado/no ponderado.\n- Cíclico/acíclico.\n- Árbol: grafo conectado sin ciclos.\n- DAG: grafo dirigido acíclico.\n\nAlgoritmos:\n- BFS: explora por niveles.\n- DFS: explora profundo.\n- Dijkstra: camino más corto con pesos positivos.\n- Topological sort: ordenar dependencias.\n- Minimum spanning tree: conectar todo con costo mínimo.\n\nAplicaciones: mapas, redes sociales, dependencias de software, rutas, IA, logística y bases de conocimiento."
        ]
      },
      "optimizacion": {
        "kw": "optimización máximo mínimo función objetivo restricciones gradiente descenso convexidad programación lineal costo beneficio",
        "res": [
          "**Optimización**\n\nBusca la mejor solución según una función objetivo.\n\nElementos:\n- Función objetivo: lo que quieres maximizar o minimizar.\n- Variables: lo que puedes cambiar.\n- Restricciones: límites del problema.\n- Solución factible: cumple restricciones.\n- Óptimo local/global: mejor cercano o mejor absoluto.\n\nMétodos:\n- Derivadas para máximos y mínimos.\n- Descenso de gradiente.\n- Programación lineal.\n- Métodos numéricos.\n- Heurísticas cuando el problema es enorme.\n\nEn IA, entrenar un modelo es optimizar una función de pérdida."
        ]
      },
      "matematica_financiera": {
        "kw": "matemática financiera interés compuesto valor presente futuro tasa anual mensual préstamo amortización inversión",
        "res": [
          "**Matemática financiera**\n\nFórmulas clave:\n\n- Interés simple: `VF = P(1 + rt)`\n- Interés compuesto: `VF = P(1 + r)^t`\n- Valor presente: `VP = VF / (1 + r)^t`\n- Pago de préstamo amortizado:\n`PMT = P · r(1+r)^n / ((1+r)^n - 1)`\n\nIdeas:\n- Una tasa pequeña repetida muchos años se vuelve enorme.\n- Deuda de alto interés destruye patrimonio.\n- Invertir temprano importa más que intentar adivinar el mercado.\n- Inflación reduce poder adquisitivo si el dinero no crece."
        ]
      }
    }
  }
});
console.log("✅ Expansión v9 cargada: matematicas.js");
