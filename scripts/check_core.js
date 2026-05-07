const Planner = require('../core/planner');
const Reasoner = require('../core/reasoner');
const MemoryManager = require('../memory/memory_manager');

async function main() {
  const memory = MemoryManager.fromClientPayload({
    user: { nombre: 'Usuario' },
    facts: [{ t: 'Al usuario le gusta el diseño premium moderno', tag: 'preferencia', weight: 2 }],
    history: [{ role: 'user', text: 'Estamos creando Ari IA' }]
  });

  const samples = [
    'calcula 2 + 2 * 3',
    '¿qué recuerdas de mí?',
    'Necesito una estrategia paso a paso para mejorar mi app Ari',
    'ejecuta este js: ```js\nconst x = 2 + 3; console.log(x); x * 2\n```'
  ];

  for (const message of samples) {
    const plan = Planner.createPlan(message, {
      history: memory.shortTerm.history,
      memory: { user: memory.longTerm.user, facts: memory.longTerm.facts }
    });
    const execution = await Reasoner.executePlan(plan, { memoryManager: memory });
    console.log('\nMensaje:', message);
    console.log('Estrategia:', plan.strategy);
    console.log('Intenciones:', plan.analysis.intents.map(i => i.name).join(', '));
    console.log('Herramientas:', plan.tools.map(t => t.name).join(', ') || 'ninguna');
    console.log('Directa:', execution.directAnswer ? 'sí' : 'no');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
