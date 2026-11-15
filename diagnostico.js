'use strict';

const { esProfesional, perfilDe, etiquetaPerfil, notaPerfil } = require('./public/profesional');

// Enganche corto: 3 líneas a partir de las respuestas, para llevar a pedir la propuesta.
// Determinista, sin precios ni cifras inventadas. Habla Empresa Inteligente, de usted.
// Nunca usar la palabra "bot".

function de(perfil, negocio, profesional, emprendedor, idea) {
  if (perfil === 'profesional' && profesional != null) return profesional;
  if (perfil === 'emprendedor' && emprendedor != null) return emprendedor;
  if (perfil === 'idea' && idea != null) return idea;
  return negocio;
}

const TIPOS = {
  estetica: 'Estética / salud',
  celulares: 'Celulares / tecnología',
  restaurante: 'Restaurante / comida',
  otro: 'Otro tipo de negocio',
};
const PROBLEMAS = {
  pocos: 'Llegan pocos clientes nuevos',
  responder: 'No alcanzo a responder a todos al mismo tiempo',
  recompra: 'Los clientes compran una vez y no vuelven',
  nosabe: 'No sé qué está funcionando y qué no',
  margen: 'Vendo, pero me queda poco margen',
  desorden: 'Todo depende de mí y está desordenado',
  procesos: 'Me toca hacerlo todo y no alcanzo con todos los procesos',
};
// Ya no se preguntan en la página; se conservan para leer envíos anteriores en /admin.
const CANALES = {
  referidos: 'Recomendaciones y boca a boca',
  redes: 'Redes sociales (publicaciones sin pauta)',
  pauta: 'Anuncios pagados',
  google: 'Google / Google Maps',
  local: 'Gente que pasa por el local',
  irregular: 'Casi no llegan clientes nuevos',
};
const MENSAJES = {
  '0-5': { label: 'Menos de 5 al día', min: 0 },
  '6-20': { label: 'Entre 6 y 20 al día', min: 6 },
  '21-50': { label: 'Entre 21 y 50 al día', min: 21 },
  '50+': { label: 'Más de 50 al día', min: 50 },
};
const PAUTA = {
  no: 'No hace pauta',
  'sin-medir': 'Hace pauta pero no mide lo que le deja',
  midiendo: 'Hace pauta y mide los resultados',
};
const METAS = {
  poco: 'Vender un poco más (hasta un 20 %)',
  bastante: 'Vender bastante más (30 a 50 %)',
  duplicar: 'Duplicar las ventas',
  sinmeta: 'Todavía no tengo una meta clara',
};

// Línea 2: por qué pasa en su tipo de negocio y qué se está yendo.
const POR_QUE = {
  estetica: 'En estética y salud la gente agenda por confianza: si no ve resultados reales ni reseñas, esa cita se la lleva otro negocio.',
  celulares: 'En celulares y tecnología el cliente pregunta en varios locales a la vez: el que responde primero y claro se queda con la venta.',
  restaurante: 'En comida la gente decide en segundos mirando fotos y videos: si su negocio no aparece, el antojo se lo lleva otro.',
  otro: 'Cuando un cliente nuevo no entiende rápido qué ofrece y cómo comprarle, se va con quien se lo explica mejor, y esa venta no vuelve.',
  profesional: 'En una profesión independiente, si no lo encuentran claro en internet o no pueden agendar fácil, esa consulta se va con otro profesional.',
  emprendedor: 'En un emprendimiento, si la gente no entiende rápido quién es usted y cómo pedirle el servicio, se va con otra persona y su agenda no se llena.',
  idea: 'Mientras una idea no se vea en internet ni tenga una forma clara de conseguir clientes, se queda en el papel y se atrasa el arranque.',
};

const APERTURA_PROBLEMA = {
  pocos: 'Hoy le llegan pocos clientes nuevos, y eso se siente en las ventas.',
  responder: 'Hoy se le escapan conversaciones porque no alcanza a responder a tiempo, y quien no contesta se queda sin la venta.',
  recompra: 'Hoy los clientes compran una vez y no vuelven, y eso es plata que ya había costado conseguir.',
  margen: 'Hoy vende, pero le queda poco margen, y eso significa trabajar mucho para ganar menos de lo que merece.',
  nosabe: 'Hoy no tiene claro qué está funcionando y qué no, y así es difícil decidir en qué poner el tiempo y el dinero.',
  desorden: 'Hoy casi todo depende de usted y está desordenado, y el negocio no puede crecer más allá de las horas que usted le pone.',
  procesos: 'Hoy le toca hacerlo todo y no alcanza con todos los procesos, y el negocio no puede crecer más allá de las horas que usted le pone.',
};

const APERTURA_PROBLEMA_PROF = {
  pocos: 'Hoy le llegan pocos pacientes o clientes nuevos, y eso se siente en su agenda.',
  responder: 'Hoy se le escapan conversaciones porque no alcanza a responder a tiempo, y quien no recibe respuesta se va con otro profesional.',
  recompra: 'Hoy las personas van una vez y no vuelven a agendar, y eso es un vínculo que ya había costado construir.',
  margen: 'Hoy trabaja, pero le queda poco margen, y eso significa atender mucho para ganar menos de lo que merece.',
  nosabe: 'Hoy no tiene claro qué está funcionando y qué no, y así es difícil decidir en qué poner el tiempo y el dinero.',
  desorden: 'Hoy casi todo depende de usted y está desordenado, y su práctica no puede crecer más allá de las horas que usted le pone.',
  procesos: 'Hoy le toca hacerlo todo y no alcanza con todos los procesos, y su práctica no puede crecer más allá de las horas que usted le pone.',
};

const APERTURA_PROBLEMA_EMP = {
  pocos: 'Hoy le llegan pocos clientes nuevos, y eso se siente en su agenda y en lo que cobra.',
  responder: 'Hoy se le escapan conversaciones porque no alcanza a responder a tiempo, y quien no recibe respuesta se va con otra persona.',
  recompra: 'Hoy los clientes compran o agendan una vez y no vuelven, y eso es trabajo que ya había costado conseguir.',
  margen: 'Hoy trabaja, pero le queda poco margen, y cuesta cobrar lo que su trabajo vale o se le va el tiempo en desorden.',
  nosabe: 'Hoy no tiene claro qué está funcionando y qué no, y así es difícil decidir en qué poner el tiempo y el dinero.',
  desorden: 'Hoy casi todo depende de usted y está desordenado: atender, cobrar y darse a conocer pasan por la misma persona.',
  procesos: 'Hoy le toca hacerlo todo —atender, cobrar, agendar y conseguir clientes— y el día no alcanza.',
};

const APERTURA_PROBLEMA_IDEA = {
  pocos: 'Hoy todavía no tiene una forma constante de conseguir sus primeros clientes, y la idea se queda sin una prueba real.',
  responder: 'Si ya le escriben, esas conversaciones se pueden enfriar si no hay una forma clara de responder y dar el siguiente paso.',
  recompra: 'Todavía está en el momento de conseguir las primeras personas; el plan empieza por validar y atraer, y luego por hacer que vuelvan.',
  margen: 'Antes de preocuparse por el margen, hace falta validar la idea, fijar cómo cobrar y conseguir las primeras ventas.',
  nosabe: 'Como la idea aún está arrancando, es normal no saber qué va a funcionar; por eso el primer paso es probar con claridad y medir.',
  desorden: 'Al arrancar es fácil que todo quede en la cabeza y en chats sueltos; un orden simple ayuda a pasar de la idea a los primeros clientes.',
  procesos: 'Todavía no hay procesos armados, y eso es normal al iniciar; el plan empieza por lo esencial para arrancar sin complicarse.',
};

function etiquetaTipo(d) {
  const tipo = TIPOS[d.tipo] ? d.tipo : 'otro';
  const otro = String(d.tipoOtro || '').trim();
  if (tipo === 'otro' && otro) return etiquetaPerfil(otro) + otro;
  return TIPOS[tipo];
}

function diagnosticar(d) {
  const tipo = TIPOS[d.tipo] ? d.tipo : 'otro';
  const perfil = tipo === 'otro' ? (perfilDe(d.tipoOtro) || '') : '';
  const problema = PROBLEMAS[d.problema] ? d.problema : 'pocos';
  const negocio = String(d.negocio || '').trim() || 'su negocio';

  const espejo = de(perfil, APERTURA_PROBLEMA, APERTURA_PROBLEMA_PROF, APERTURA_PROBLEMA_EMP, APERTURA_PROBLEMA_IDEA)[problema];
  const porQue = POR_QUE[perfil || tipo];
  const propuesta = de(perfil,
    'Por eso le armamos una propuesta concreta para ' + negocio + ': qué haríamos, en qué orden y cuánto es la inversión, en una sola página. Mientras todo siga igual, esas ventas se las sigue llevando otro.',
    'Por eso le armamos una propuesta concreta para su práctica: qué haríamos para que más personas lo encuentren y agenden, en qué orden y cuánto es la inversión, en una sola página.',
    'Por eso le armamos una propuesta concreta para su emprendimiento: cómo conseguir más clientes, darse a conocer y cuánto es la inversión, en una sola página.',
    'Por eso le armamos una propuesta concreta para arrancar: qué validar primero, cómo conseguir sus primeros clientes y cuánto es la inversión, en una sola página.'
  );
  const titulo = de(perfil,
    'Lo que vemos en ' + negocio,
    'Lo que vemos en su práctica',
    'Lo que vemos en su emprendimiento',
    'Lo que vemos en su idea'
  );

  return {
    version: 3,
    negocio: d.negocio,
    tipo: etiquetaTipo(d),
    ciudad: d.ciudad,
    profesional: perfil === 'profesional',
    perfilCliente: perfil || 'negocio',
    titulo,
    lineas: [espejo, porQue, propuesta],
    problemas: [PROBLEMAS[problema]],
  };
}

module.exports = { diagnosticar, etiquetaTipo, esProfesional, perfilDe, notaPerfil, TIPOS, CANALES, MENSAJES, PAUTA, PROBLEMAS, METAS };
