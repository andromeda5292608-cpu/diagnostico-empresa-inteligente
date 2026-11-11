'use strict';

const { esProfesional, esSaludEtica, perfilDe, etiquetaPerfil, notaPerfil } = require('./public/profesional');

function de(perfil, negocio, profesional, emprendedor, idea) {
  if (perfil === 'profesional' && profesional != null) return profesional;
  if (perfil === 'emprendedor' && emprendedor != null) return emprendedor;
  if (perfil === 'idea' && idea != null) return idea;
  return negocio;
}

// Diagnóstico preliminar por reglas. Determinista: mismas respuestas => mismo resultado.
// Sin precios, sin cifras inventadas: solo se usan datos que el negocio escribió.
// La marca que habla es Empresa Inteligente. Nunca usar la palabra "bot".

const TIPOS = {
  estetica: 'Estética / salud',
  celulares: 'Celulares / tecnología',
  restaurante: 'Restaurante / comida',
  otro: 'Otro / emprendimiento / idea',
};
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
const PROBLEMAS = {
  pocos: 'Llegan pocos clientes nuevos',
  responder: 'No alcanzo a responder a todos al mismo tiempo',
  recompra: 'Los clientes compran una vez y no vuelven',
  nosabe: 'No sé qué está funcionando y qué no',
  margen: 'Vendo, pero me queda poco margen',
  desorden: 'Todo depende de mí y está desordenado',
  procesos: 'Me toca hacerlo todo y no alcanzo con todos los procesos',
};
const METAS = {
  poco: 'Vender un poco más (hasta un 20 %)',
  bastante: 'Vender bastante más (30 a 50 %)',
  duplicar: 'Duplicar las ventas',
  sinmeta: 'Todavía no tengo una meta clara',
};

function tieneRedes(texto) {
  const t = String(texto || '').toLowerCase().trim();
  if (!t || (/^(no|ninguna?|nada|n\/a|no tengo|no tiene)\b/.test(t) && t.length < 25))
    return { instagram: false, facebook: false, web: false, maps: false, ninguna: true };
  const instagram = /instagram|(^|\s)@[a-z0-9._]{2,}|\big[: ]/.test(t);
  const facebook = /facebook|fb\.com|\bfb[: ]/.test(t);
  const maps = /google\.com\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps|\bg\.page\//.test(t);
  const sinSociales = t.replace(/(instagram|facebook|fb)\.com\/?\S*/g, ' ');
  const sinMaps = sinSociales.replace(/https?:\/\/\S*(maps\.google|google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|g\.page)\S*/g, ' ');
  const web = /(https?:\/\/|www\.)/.test(sinMaps) || /\b[a-z0-9-]{2,}\.(com|co|net|org|shop|store|site|app)\b/.test(sinMaps);
  return { instagram, facebook, web, maps, ninguna: !(instagram || facebook || web || maps) };
}

// Piezas específicas por tipo de negocio
const POR_TIPO = {
  estetica: {
    ideas: [
      'Agendar citas por WhatsApp con confirmación y recordatorio el día anterior, para bajar las citas que se pierden y liberarle tiempo.',
      'Mostrar en redes casos reales con permiso del cliente (antes y después, procesos, equipo), que es lo que más confianza da en salud y estética.',
      'Pedir reseñas en Google después de cada servicio: es lo primero que mira alguien nuevo antes de reservar.',
    ],
    problema: 'En estética y salud la decisión se toma por confianza: quien no ve resultados reales ni reseñas, no agenda, y esa cita se la lleva otro negocio.',
  },
  celulares: {
    ideas: [
      'Responder cotizaciones de reparación y accesorios por WhatsApp en minutos, con precios claros y tiempo de entrega, para no cederle la venta al de al lado.',
      'Avisar al cliente por mensaje cuando su equipo está listo y ofrecerle una revisión o garantía, para que vuelva y deje más plata en su local.',
      'Publicar reparaciones y accesorios reales del local; el cliente de tecnología compara rápido y compra donde ve movimiento.',
    ],
    problema: 'En celulares y tecnología el cliente pregunta a varios locales a la vez; el que responde primero y con claridad se queda con la venta. El que tarda, la pierde.',
  },
  restaurante: {
    ideas: [
      'Menú, horarios y ubicación siempre actualizados y fáciles de pedir por WhatsApp, con respuesta inmediata a las preguntas repetidas.',
      'Videos cortos de los platos y del lugar, publicados con constancia: en comida, el antojo se genera con la imagen, y sin ella el cliente pide en otro lado.',
      'Una promoción semanal o por fechas especiales, medida, para saber qué trae gente al local y repetir lo que sí vende.',
    ],
    problema: 'En restaurantes la gente decide en segundos mirando fotos y videos; sin contenido constante, el negocio no entra en la lista de opciones y el antojo se lo lleva otro.',
  },
  otro: {
    ideas: [
      'Dejar claro en redes y en Google qué vende, dónde está y cómo pedir, para que un cliente nuevo entienda en diez segundos y no se vaya con quien se lo explica mejor.',
      'Responder rápido por WhatsApp, con respuestas preparadas para las preguntas que más llegan, y no dejar enfriar a quien ya quiere comprar.',
      'Llevar un registro simple de cada cliente y de dónde llegó, para repetir lo que funciona y dejar de gastar tiempo en lo que no.',
    ],
    problema: 'Cuando un cliente nuevo no entiende rápido qué ofrece el negocio y cómo comprar, se va con quien se lo explica mejor, y esa venta ya no vuelve.',
  },
  profesional: {
    ideas: [
      'Mostrar su trabajo y su marca personal con contenido profesional en video, para que quien busca su servicio lo elija a usted con claridad.',
      'Pauta en Meta dirigida a su ciudad, para que más personas que buscan su profesión lo conozcan y le escriban a pedir una cita o una consulta.',
      'Agenda y recordatorios automáticos, para bajar las citas que se pierden y no estar pendiente del teléfono todo el día.',
    ],
    problema: 'En una profesión independiente, quien no lo encuentra claro en internet o no logra agendar fácil se va con otro profesional, y esa consulta ya no vuelve.',
  },
  emprendedor: {
    ideas: [
      'Crear su marca personal con contenido en video, para que la gente sepa quién es usted y qué hace, aunque todavía no tenga un local o un logo grande.',
      'Pauta en Meta en su ciudad, para conseguir más clientes y llenar su agenda, en lugar de esperar a que lo encuentren solos.',
      'Un orden simple para cobrar, agendar y dar seguimiento, para que el trabajo que ya hizo sí se convierta en plata y en clientes que vuelven.',
    ],
    problema: 'En un emprendimiento independiente, si la gente no entiende rápido quién es usted, qué hace y cómo pedirle el servicio, se va con otra persona, y esa agenda no se llena.',
  },
  idea: {
    ideas: [
      'Validar su idea con un mensaje claro y una presencia digital sencilla, para que deje de quedarse solo en la cabeza y se pueda probar con personas reales.',
      'Contenido y una pauta pequeña en su zona, para conseguir sus primeros clientes y ver si la idea despierta interés de verdad.',
      'Una página o un camino simple para que le escriban, y un orden básico para responderles, de modo que el arranque no se enrede.',
    ],
    problema: 'Cuando una idea aún no se ve en internet ni tiene una forma clara de conseguir los primeros clientes, se queda en el papel, y se atrasa el momento de arrancar.',
  },
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

const META_GANANCIA = {
  poco: 'Usted quiere vender un poco más. Un plan a la medida se arma para acercarlo a esa meta, con lo que su negocio necesita exactamente, no con un paquete genérico.',
  bastante: 'Usted quiere vender bastante más. Un plan a la medida se concentra en traer más clientes que sí compren y en no dejar ir a los que ya escriben.',
  duplicar: 'Usted quiere duplicar las ventas. Eso pide un sistema que traiga clientes de forma constante y una propuesta armada a la medida de su negocio, no un esfuerzo suelto de una semana.',
  sinmeta: 'Todavía no tiene una meta de ventas clara. En la propuesta la definimos juntos, con los números de su propio negocio, para que sepa hacia dónde vamos.',
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

const META_GANANCIA_PROF = {
  poco: 'Usted quiere atender un poco más. Un plan a la medida se arma para acercarlo a esa meta, con lo que su práctica necesita exactamente, no con un paquete genérico.',
  bastante: 'Usted quiere ampliar bastante su agenda. Un plan a la medida se concentra en atraer más pacientes o clientes que sí agenden y en no dejar ir a quienes ya escriben.',
  duplicar: 'Usted quiere extender sus servicios y ampliar su agenda. Eso pide un sistema que atraiga consultas de forma constante y una propuesta armada a la medida de su profesión, no un esfuerzo suelto de una semana.',
  sinmeta: 'Todavía no tiene una meta clara. En la propuesta la definimos juntos, a partir de su propia práctica, para que sepa hacia dónde vamos.',
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

const META_GANANCIA_EMP = {
  poco: 'Usted quiere conseguir un poco más de clientes. Un plan a la medida se arma para acercarlo a esa meta, con lo que su emprendimiento necesita exactamente, no con un paquete genérico.',
  bastante: 'Usted quiere llenar bastante más su agenda. Un plan a la medida se concentra en atraer más clientes y en que cada uno le vuelva a escribir.',
  duplicar: 'Usted quiere hacer crecer mucho su emprendimiento. Eso pide darse a conocer con una marca personal clara y un sistema para conseguir clientes de forma constante.',
  sinmeta: 'Todavía no tiene una meta clara. En la propuesta la definimos juntos, a partir de su propio emprendimiento, para que sepa hacia dónde vamos.',
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

const META_GANANCIA_IDEA = {
  poco: 'Usted quiere dar los primeros pasos. Un plan a la medida se arma para validar su idea y conseguir sus primeros clientes, sin armar nada innecesario.',
  bastante: 'Usted quiere ver su idea crecer con fuerza. Eso empieza por validarla, aparecer en internet y atraer a las primeras personas que sí le escriban o le compren.',
  duplicar: 'Usted quiere un salto grande. Para una idea que está arrancando, el plan empieza por validar, tener presencia digital y conseguir los primeros clientes de forma constante.',
  sinmeta: 'Todavía no tiene una meta clara, y en una idea que arranca es normal. En la propuesta la definimos juntos: qué validar primero y cómo conseguir las primeras personas.',
};

function etiquetaTipo(d) {
  const tipo = TIPOS[d.tipo] ? d.tipo : 'otro';
  const otro = String(d.tipoOtro || '').trim();
  if (tipo === 'otro' && otro) return etiquetaPerfil(otro) + otro;
  return TIPOS[tipo];
}

function diagnosticar(d) {
  const tipo = TIPOS[d.tipo] ? d.tipo : 'otro';
  const tipoOtro = String(d.tipoOtro || '').trim();
  const perfil = tipo === 'otro' ? (perfilDe(tipoOtro) || '') : '';
  const prof = perfil === 'profesional';
  const emp = perfil === 'emprendedor';
  const idea = perfil === 'idea';
  const salud = prof && esSaludEtica(tipoOtro);
  const redes = tieneRedes(d.redes);
  const msg = MENSAJES[d.mensajes] || MENSAJES['0-5'];
  const problemas = [];
  const oportunidades = [];
  let puntos = 0; // 0..N, solo para clasificar el nivel; no se muestra como cifra

  // 1. Presencia digital
  const nRedes = [redes.instagram, redes.facebook, redes.web, redes.maps].filter(Boolean).length;
  if (redes.ninguna || nRedes === 0) {
    problemas.push({
      titulo: 'Presencia digital casi invisible',
      detalle: de(perfil,
        'No indicó Instagram, Facebook, Google Maps ni página web. Hoy un cliente nuevo que lo busca en internet no encuentra dónde confiar, y esa venta se la lleva quien sí aparece.',
        'No indicó Instagram, Facebook, Google Maps ni página web. Hoy quien busca su servicio en internet no encuentra dónde confiar, y esa consulta se la lleva quien sí aparece.',
        'No indicó Instagram, Facebook, Google Maps ni página web. Hoy un cliente nuevo que lo busca no encuentra su marca personal, y esa oportunidad se la lleva quien sí aparece.',
        'No indicó Instagram, Facebook, Google Maps ni página web. Sin una presencia digital, su idea no se puede encontrar ni validar, y la primera conversación se la lleva quien sí aparece.'
      ),
    });
  } else if (nRedes === 1) {
    problemas.push({
      titulo: 'Presencia digital en un solo lugar',
      detalle: 'Solo indicó un canal (' + [redes.instagram && 'Instagram', redes.facebook && 'Facebook', redes.maps && 'Google Maps', redes.web && 'página web'].filter(Boolean).join('') + '). ' + (prof
        ? 'Quien lo busca en otro sitio no lo encuentra, y no hay a dónde llevar a la persona que llega por recomendación.'
        : 'Quien lo busca en otro sitio no lo encuentra, y no hay a dónde llevar al cliente que llega por recomendación.'),
    });
    puntos += 1;
  } else {
    puntos += 2;
    oportunidades.push(prof
      ? 'Ya tiene presencia en más de un canal: lo que falta es que todos digan lo mismo y lleven a quien lo busca a escribirle o agendar, para que esa presencia sí se convierta en consultas.'
      : 'Ya tiene presencia en más de un canal: lo que falta es que todos digan lo mismo y lleven al cliente a escribirle, para que esa presencia sí se convierta en ventas.');
  }

  // 2. Cómo consiguen clientes
  const canal = d.canal;
  if (canal === 'referidos' || canal === 'local') {
    problemas.push({
      titulo: prof ? 'Depende de pacientes o clientes que llegan solos' : 'Depende de clientes que llegan solos',
      detalle: prof
        ? ('Hoy sus pacientes o clientes llegan por ' + (canal === 'referidos' ? 'recomendaciones' : 'quienes ya pasan cerca o lo tienen de referencia') + '. Es un buen punto de partida, pero no puede crecer a voluntad: si baja el flujo, no tiene una palanca para subirlo, y su agenda queda a merced de la semana.')
        : ('Hoy sus clientes llegan por ' + (canal === 'referidos' ? 'recomendaciones' : 'quienes pasan por el local') + '. Es un buen punto de partida, pero no puede crecer a voluntad: si baja el flujo, no tiene una palanca para subirlo, y las ventas quedan a merced de la semana.'),
    });
    puntos += 1;
  } else if (canal === 'irregular') {
    problemas.push({
      titulo: prof ? 'Sin una fuente constante de consultas nuevas' : 'Sin una fuente constante de clientes nuevos',
      detalle: prof
        ? 'Indicó que casi no llegan pacientes o clientes nuevos. Sin un canal que funcione todos los días, su agenda depende de la suerte de cada semana, y el crecimiento se estanca.'
        : 'Indicó que casi no llegan clientes nuevos. Sin un canal que funcione todos los días, las ventas dependen de la suerte de cada semana, y el crecimiento se estanca.',
    });
  } else if (canal === 'redes') {
    problemas.push({
      titulo: prof ? 'Redes sin una ruta clara hacia la consulta' : 'Redes sin una ruta clara hacia la venta',
      detalle: prof
        ? 'Publica en redes, pero sin pauta el alcance depende del algoritmo y de que alguien vea la publicación justo ese día. Así se pierde la chance de llegar, a propósito, a quien busca su servicio.'
        : 'Publica en redes, pero sin pauta el alcance depende del algoritmo y de que alguien vea la publicación justo ese día. Así se pierde la chance de llegar, a propósito, a quien sí puede comprarle.',
    });
    puntos += 2;
  } else if (canal === 'pauta') {
    puntos += 3;
  } else if (canal === 'google') {
    puntos += 2;
    oportunidades.push(prof
      ? 'Google es un canal donde la persona ya quiere agendar. Cuidar la ficha, las fotos y las reseñas rinde mucho, y es una de las formas más directas de llenar su agenda.'
      : 'Google es un canal donde el cliente ya quiere comprar. Cuidar la ficha, las fotos y las reseñas rinde mucho, y es una de las formas más directas de vender más.');
  }

  // 3. Pauta
  if (d.pauta === 'no') {
    problemas.push({
      titulo: 'Sin publicidad pagada',
      detalle: prof
        ? 'No hace pauta, así que solo le escribe quien ya lo conoce. Mientras tanto, otros profesionales de su zona sí aparecen frente a quienes todavía no saben que usted existe.'
        : 'No hace pauta, así que solo le compra quien ya lo conoce. Mientras tanto, otros negocios de su zona sí aparecen frente a quienes todavía no saben que usted existe.',
    });
    oportunidades.push(prof
      ? 'Una pauta pequeña, dirigida solo a su ciudad o municipio, para probar qué mensaje trae consultas reales y dejar de esperar a que lo encuentren solos.'
      : 'Una pauta pequeña, dirigida solo a su ciudad o municipio, para probar qué mensaje trae clientes reales y dejar de esperar a que lo encuentren solos.');
  } else if (d.pauta === 'sin-medir') {
    problemas.push({
      titulo: 'Pauta sin medir',
      detalle: prof
        ? 'Invierte en anuncios pero no sabe cuánto le dejan. Sin medir, no se puede saber qué anuncio sirve y cuál solo gasta dinero que podría estar trayendo más consultas.'
        : 'Invierte en anuncios pero no sabe cuánto le dejan. Sin medir, no se puede saber qué anuncio sirve y cuál solo gasta dinero que podría estar trayendo más ventas.',
    });
    puntos += 1;
    oportunidades.push(prof
      ? 'Medir de dónde llega cada consulta (anuncio, recomendación, redes) para poner el dinero solo donde funciona y dejar de gastar a ciegas.'
      : 'Medir de dónde llega cada cliente (anuncio, recomendación, redes) para poner el dinero solo donde funciona y dejar de gastar a ciegas.');
  } else if (d.pauta === 'midiendo') {
    puntos += 3;
    oportunidades.push(prof
      ? 'Como ya mide su pauta, puede escalar lo que funciona y probar mensajes nuevos con poco riesgo, para atraer más consultas con el mismo esfuerzo.'
      : 'Como ya mide su pauta, puede escalar lo que funciona y probar mensajes nuevos con poco riesgo, para vender más con el mismo esfuerzo.');
  }

  // 4. Mensajes / atención
  if (msg.min >= 21) {
    problemas.push({
      titulo: 'Volumen alto de mensajes que difícilmente se atienden a mano',
      detalle: 'Recibe ' + msg.label.toLowerCase() + '. Con ese volumen, atender uno por uno retrasa las respuestas, y quien espera suele escribirle a ' + (prof ? 'otro profesional' : 'otro negocio') + '. Esa demora le está costando ' + (prof ? 'consultas' : 'ventas') + '.',
    });
    oportunidades.push(prof
      ? 'Ordenar y agilizar la atención de las preguntas repetidas (horarios, cómo agendar, qué incluye su servicio) para que usted se concentre en quienes están listos para una cita y recupere tiempo. Si le sirve, se puede sumar un asistente de WhatsApp que aprende de cómo responde usted, para responder y agendar; es una opción, no el centro del plan.'
      : 'Ordenar y agilizar la atención de las preguntas repetidas (precios, horarios, ubicación, agenda) para que usted se concentre en los clientes listos para comprar y recupere tiempo. Si le sirve, se puede sumar un asistente de WhatsApp que aprende de cómo responde usted; es una opción, no el centro del plan.');
  } else if (msg.min >= 6) {
    oportunidades.push('Con ' + msg.label.toLowerCase() + ' ya hay demanda que organizar: un orden simple de respuesta y seguimiento evita que se enfríen conversaciones y se escapen ' + (prof ? 'citas' : 'ventas') + '.');
    puntos += 1;
  } else {
    oportunidades.push(prof
      ? 'Hoy llegan pocos mensajes: el primer paso es generar más conversaciones de personas que buscan su servicio, y después organizar cómo se atienden y se agendan, para no perder lo que tanto costó atraer.'
      : 'Hoy llegan pocos mensajes: el primer paso es generar más conversaciones de personas que sí puedan comprarle, y después organizar cómo se atienden, para no perder lo que tanto costó atraer.');
  }

  // 5. Problema principal declarado
  const pp = d.problema;
  if (pp === 'responder') {
    problemas.push({
      titulo: prof ? 'Se le escapan consultas por la demora al responder' : 'Se le escapan clientes por la demora al responder',
      detalle: prof
        ? 'Usted mismo lo señala: no alcanza a responder a tiempo. Cada conversación sin respuesta oportuna es una consulta que se va con otro profesional, y esa agenda no vuelve.'
        : 'Usted mismo lo señala: no alcanza a responder a tiempo. Cada conversación sin respuesta oportuna es una venta que se va para la competencia, y esa plata no vuelve.',
    });
  } else if (pp === 'recompra') {
    problemas.push({
      titulo: prof ? 'No vuelven a agendar' : 'Los clientes no vuelven',
      detalle: prof
        ? 'Una persona que ya lo visitó es la más cercana a volver a agendar. Sin un recordatorio o un camino claro para pedir otra cita, depende de que se acuerden solos, y cada uno que no vuelve es una consulta que ya había costado conseguir.'
        : 'Un cliente que ya compró es el más barato de volver a vender. Sin un recordatorio o seguimiento, depende de que se acuerden solos, y cada uno que no vuelve es una venta que ya había costado conseguir.',
    });
    oportunidades.push(prof
      ? 'Un seguimiento sencillo después de cada cita (mensaje de gracias, recordatorio y una forma fácil de volver a agendar) para que esa relación no se enfríe.'
      : 'Un seguimiento sencillo después de cada compra o servicio (mensaje de gracias, recordatorio, oferta para volver) para que esa relación deje más plata y no se enfríe.');
  } else if (pp === 'margen') {
    problemas.push({
      titulo: prof ? 'Se atiende, pero queda poco margen' : 'Se vende, pero queda poco margen',
      detalle: prof
        ? 'Usted lo señala como su problema principal. Suele pasar cuando conseguir cada paciente o cliente cuesta de más, o cuando la persona viene una sola vez y no vuelve a agendar.'
        : 'Usted lo señala como su problema principal. Suele pasar cuando conseguir cada cliente cuesta de más, cuando se vende sin ofertas pensadas, o cuando el cliente compra una sola vez y no vuelve.',
    });
    oportunidades.push(prof
      ? 'Atraer consultas con pauta medida para pagar solo por lo que funciona, dejar un camino claro para agendar y hacer seguimiento para que quien ya lo conoce vuelva cuando lo necesite.'
      : 'Atraer clientes con pauta medida para pagar solo por lo que funciona, armar ofertas combinadas y hacer seguimiento para que cada cliente compre más veces.');
  } else if (pp === 'nosabe') {
    problemas.push({
      titulo: 'No se mide qué funciona',
      detalle: prof
        ? 'Sin saber de dónde llega cada consulta, no es posible decidir en qué invertir tiempo y dinero, y se sigue gastando esfuerzo en lo que tal vez no está llenando su agenda.'
        : 'Sin saber de dónde llega cada cliente, no es posible decidir en qué invertir tiempo y dinero, y se sigue gastando esfuerzo en lo que tal vez no está vendiendo.',
    });
  } else if (pp === 'desorden') {
    problemas.push({
      titulo: 'Todo depende de una sola persona',
      detalle: prof
        ? 'Cuando la atención, la agenda y el seguimiento dependen solo de usted, su práctica no puede crecer más allá de su tiempo, y usted se queda sin libertad.'
        : 'Cuando la atención, las ventas y el seguimiento dependen solo de usted, el negocio no puede crecer más allá de su tiempo, y usted se queda sin libertad.',
    });
    oportunidades.push(prof
      ? 'Dejar procesos claros y automáticos —agenda y recordatorios, y la respuesta a lo repetido— para que su práctica funcione también cuando usted no puede contestar, y así recuperar tiempo y libertad.'
      : 'Dejar procesos claros y automáticos para que el negocio funcione también cuando usted no puede contestar, y así recuperar tiempo y libertad.');
  } else if (pp === 'procesos') {
    problemas.push({
      titulo: 'Le toca hacerlo todo y no alcanza con los procesos',
      detalle: prof
        ? 'Usted lo señala como su problema principal: atiende, agenda, administra y además tiene que darse a conocer. Cuando todo pasa por usted, el día no alcanza y su práctica no puede crecer más allá de sus horas.'
        : 'Usted lo señala como su problema principal: atiende clientes, cierra caja, revisa inventario y además tiene que conseguir ventas. Cuando todo pasa por usted, el día no alcanza y el negocio no puede crecer más allá de sus horas.',
    });
    oportunidades.push(prof
      ? 'Un sistema que le ayude con la agenda, los recordatorios, la administración y la respuesta de mensajes, más contenido para su marca personal, para que usted se concentre en atender.'
      : 'Un software con IA o un POS que automatice la contabilidad, la nómina, el cierre de caja y el inventario, más publicidad en redes y respuesta de mensajes, para que usted se concentre en lo que solo usted puede hacer.');
  } else if (pp === 'pocos') {
    problemas.push({
      titulo: de(perfil, 'Pocos clientes nuevos', 'Pocas consultas nuevas', 'Pocos clientes nuevos', 'Todavía no hay primeros clientes constantes'),
      detalle: de(perfil,
        'Es el problema que usted señala como principal. Está ligado a cuánta gente conoce el negocio y a qué tan fácil es escribirle. Mientras eso no se ordene, las ventas siguen dependiendo de que alguien aparezca por casualidad.',
        'Es el problema que usted señala como principal. Está ligado a cuánta gente lo conoce y a qué tan fácil es escribirle o agendar. Mientras eso no se ordene, su agenda sigue dependiendo de que alguien aparezca por casualidad.',
        'Es el problema que usted señala como principal. Está ligado a cuánta gente conoce su emprendimiento y a qué tan fácil es pedirle el servicio. Mientras no tenga una marca personal visible y un canal para atraer, su agenda sigue dependiendo de que alguien aparezca por casualidad.',
        'Es el punto que usted señala como principal. Para una idea que arranca, está ligado a que todavía no hay una presencia digital ni un camino claro para conseguir los primeros clientes.'
      ),
    });
  }

  // 6. Meta
  if (d.meta === 'duplicar' && (puntos <= 4)) {
    problemas.push({
      titulo: 'La meta es grande para la base actual',
      detalle: prof
        ? 'Ampliar bastante su agenda pide un sistema que atraiga consultas nuevas de forma constante. Con lo que usted describe, hoy esa base todavía no está armada; un plan a la medida empieza por construirla, paso a paso.'
        : 'Duplicar ventas pide un sistema que traiga clientes nuevos de forma constante. Con lo que usted describe, hoy esa base todavía no está armada; un plan a la medida empieza por construirla, paso a paso.',
    });
  }
  if (d.meta === 'sinmeta') {
    problemas.push({
      titulo: prof ? 'Sin una meta definida' : 'Sin una meta de ventas definida',
      detalle: 'Sin una meta clara no se puede saber si lo que se hace está funcionando ni cuánto hace falta mejorar, y el esfuerzo se dispersa.',
    });
    oportunidades.push(prof
      ? 'Definir una meta concreta para los próximos meses —por ejemplo, cómo quiere ver su agenda— y medirla cada semana, para que cada acción tenga un para qué.'
      : 'Definir una meta de ventas concreta para los próximos meses y medirla cada semana, para que cada acción tenga un para qué.');
  }

  // Específico por tipo
  const t = POR_TIPO[perfil] || POR_TIPO[tipo];
  problemas.push({ titulo: de(perfil, 'Lo que más pesa en su sector', 'Lo que más pesa en su profesión', 'Lo que más pesa en su emprendimiento', 'Lo que más pesa para arrancar su idea'), detalle: t.problema });
  t.ideas.forEach((i) => oportunidades.push(i));

  // Nivel
  const nivel = puntos <= 3 ? 'Inicial' : puntos <= 7 ? 'En desarrollo' : 'Sólido';
  const nivelTxt = de(perfil, {
    Inicial: 'Su negocio tiene lo básico, pero todavía no tiene un sistema que traiga clientes de forma constante. Hay mucho espacio para vender más, ahorrar tiempo y ganar más libertad, con un plan hecho a su medida.',
    'En desarrollo': 'Su negocio ya tiene piezas importantes funcionando. Falta conectarlas y medirlas para que produzcan resultados constantes: más ventas, menos desgaste y más control de su tiempo.',
    Sólido: 'Su negocio tiene una base comercial buena. La oportunidad está en afinar, medir y escalar lo que ya funciona, para vender más sin que todo dependa de que usted esté encima todo el día.',
  }, {
    Inicial: 'Su práctica tiene lo básico, pero todavía no tiene un sistema que atraiga pacientes o clientes de forma constante. Hay mucho espacio para extender sus servicios, ordenar su agenda, ahorrar tiempo y ganar más libertad, con un plan hecho a su medida.',
    'En desarrollo': 'Su práctica ya tiene piezas importantes funcionando. Falta conectarlas y medirlas para que produzcan resultados constantes: más consultas, menos desgaste y más control de su tiempo.',
    Sólido: 'Su práctica tiene una base buena. La oportunidad está en afinar, medir y extender lo que ya funciona, para atender más sin que todo dependa de que usted esté encima todo el día.',
  }, {
    Inicial: 'Su emprendimiento tiene lo básico, pero todavía le falta una marca personal visible y un sistema que le traiga clientes de forma constante. Hay mucho espacio para llenar su agenda, organizarse para cobrar y ganar más libertad, con un plan hecho a su medida.',
    'En desarrollo': 'Su emprendimiento ya tiene piezas funcionando. Falta conectarlas: marca personal, captación de clientes y un orden para cobrar y atender.',
    Sólido: 'Su emprendimiento ya tiene una base. La oportunidad está en afinar su marca personal, medir lo que trae clientes y organizarse para crecer sin que todo dependa de usted todo el día.',
  }, {
    Inicial: 'Su idea está en el punto de partida. Todavía no tiene un sistema para validarla ni para conseguir los primeros clientes. Hay un gran espacio para aparecer en internet y dar el primer paso, con un plan hecho a su medida.',
    'En desarrollo': 'Su idea ya tiene algunas piezas. Falta conectar presencia digital, un mensaje claro y una forma de conseguir y atender a los primeros clientes.',
    Sólido: 'Aunque parte de una idea, ya hay una base para darse a conocer. La oportunidad está en ordenar, medir y conseguir más de esos primeros clientes, con un plan a su medida.',
  })[nivel];

  // Costo de no actuar (cualitativo + aritmética con sus propios datos)
  const costo = [];
  if (msg.min >= 6) {
    costo.push('Con ' + msg.label.toLowerCase() + ', usted maneja al menos ' + (msg.min * 30) + ' conversaciones al mes. Cada una que se responde tarde tiene más probabilidad de terminar ' + (prof ? 'en otro profesional, y esa consulta ya no es suya.' : 'en la competencia, y esa venta ya no es suya.'));
  }
  if (d.pauta === 'no' || d.canal === 'referidos' || d.canal === 'local' || d.canal === 'irregular') {
    costo.push(de(perfil,
      'Mientras no tenga un canal propio para atraer clientes, su crecimiento depende de que otros hablen de usted o pasen por la puerta, y los meses flojos se sienten más duros.',
      'Mientras no tenga un canal propio para atraer consultas, su crecimiento depende de que otros hablen de usted, y los meses flojos se sienten más duros.',
      'Mientras no tenga un canal propio para conseguir clientes, su emprendimiento depende de que otros hablen de usted, y su agenda no se puede llenar a voluntad.',
      'Mientras su idea no tenga un canal propio para darse a conocer, sigue dependiendo de que alguien se entere por casualidad, y se atrasa el arranque.'
    ));
  }
  if (d.pauta === 'sin-medir' || d.problema === 'nosabe') {
    costo.push(prof
      ? 'Cada mes que invierte sin medir es dinero que no se sabe si trabajó, y decisiones que se toman a ciegas, en lugar de poner la plata donde sí llena su agenda.'
      : 'Cada mes que invierte sin medir es dinero que no se sabe si trabajó, y decisiones que se toman a ciegas, en lugar de poner la plata donde sí vende.');
  }
  if (d.problema === 'recompra') {
    costo.push(prof
      ? 'Cada persona que no vuelve a agendar es una consulta que ya había costado conseguir y se pierde, mes tras mes.'
      : 'Cada cliente que no vuelve es una venta que ya había costado conseguir y se pierde, mes tras mes.');
  }
  costo.push(de(perfil,
    'Sus competidores que sí ordenan su atención y su publicidad van quedándose con los clientes que hoy podrían ser suyos. Esa diferencia crece cada mes, y se siente en las ventas, en el tiempo que usted pierde y en la libertad que no alcanza a tener.',
    'Otros profesionales que sí ordenan su atención y su presencia van quedándose con las consultas que hoy podrían ser suyas. Esa diferencia crece cada mes, y se siente en su agenda, en el tiempo que usted pierde y en la libertad que no alcanza a tener.',
    'Otros emprendimientos que sí se dan a conocer y ordenan cómo cobrar y atender van quedándose con los clientes que hoy podrían ser suyos. Esa diferencia crece cada mes, y se siente en su agenda, en lo que deja de cobrar y en la libertad que no alcanza a tener.',
    'Mientras la idea se queda en la cabeza, otras personas que sí se atreven a mostrarla y a buscar sus primeros clientes ocupan ese lugar. Cada mes sin un primer paso visible atrasa el arranque.'
  ));

  // Lo que podría ganar con un plan a la medida
  const ganancia = [];
  const metaMap = de(perfil, META_GANANCIA, META_GANANCIA_PROF, META_GANANCIA_EMP, META_GANANCIA_IDEA);
  ganancia.push(metaMap[d.meta] || metaMap.sinmeta);
  if (prof) {
    ganancia.push('Extender sus servicios: que más personas de su zona lo conozcan y le escriban a pedir una cita o una consulta, con un mensaje claro y una pauta medida, si hace falta.');
    ganancia.push('Ahorrar tiempo y tener más libertad: que las preguntas repetidas, la agenda y los recordatorios no dependan de que usted esté pegado al teléfono todo el día.');
    ganancia.push(salud
      ? 'Una agenda más estable: menos consultas perdidas por demora o por desorden, y un camino claro para que quien ya lo visitó vuelva a agendar cuando lo necesite.'
      : 'Una agenda más estable: menos consultas perdidas por demora o por desorden, y más pacientes o clientes que vuelven a agendar.');
  } else if (emp) {
    ganancia.push('Conseguir más clientes y una agenda más llena: que más personas de su zona lo conozcan, le escriban y le pidan el servicio.');
    ganancia.push('Crear su marca personal: que se vea con claridad quién es usted y qué hace, aunque todavía no tenga un local o una marca grande.');
    ganancia.push('Cobrar y organizarse: que el seguimiento, la agenda y el cobro no dependan de que usted lo recuerde todo a mano.');
  } else if (idea) {
    ganancia.push('Arrancar y validar su idea: pasar de lo que tiene en la cabeza a un primer paso concreto, con un mensaje claro.');
    ganancia.push('Conseguir sus primeros clientes: que personas de su zona se enteren y le escriban.');
    ganancia.push('Presencia digital: aparecer en internet de forma clara, para que su idea se pueda encontrar y probar.');
  } else {
    ganancia.push('Vender más: que más personas de su zona lo conozcan, le escriban y le compren, con un mensaje claro y una pauta medida, si hace falta.');
    ganancia.push('Ahorrar tiempo y tener más libertad: que las preguntas repetidas y el seguimiento no dependan de que usted esté pegado al teléfono todo el día.');
    ganancia.push('Ganar más plata: menos ventas perdidas por demora o por desorden, y más clientes que vuelven.');
  }
  if (pp === 'procesos') {
    ganancia.push(de(perfil,
      'Recuperar tiempo: que la caja, la contabilidad, la nómina, el inventario y los mensajes repetidos no dependan de que usted los haga todos a mano, y que usted se quede en lo que solo usted puede hacer.',
      'Recuperar tiempo: que la agenda, los recordatorios, la administración y los mensajes repetidos no dependan de que usted los haga todos a mano, y que usted se quede en atender.',
      'Recuperar tiempo: que cobrar, agendar y los mensajes repetidos no dependan de que usted lo haga todo a mano, y que usted se quede en atender y hacer crecer su emprendimiento.',
      'Arrancar con un orden simple: lo esencial para responder, agendar y cobrar, sin armar procesos de más antes de validar la idea.'
    ));
  }
  if (pp === 'responder' || pp === 'desorden' || msg.min >= 21) {
    ganancia.push(de(perfil,
      'Si le sirve, se puede sumar un asistente de WhatsApp que aprende de cómo responde usted, para atender lo frecuente y pasarle solo a quien está listo para comprar. Es una opción, no el centro del plan.',
      'Si le sirve, se puede sumar un asistente de WhatsApp que aprende de cómo responde usted, para atender lo frecuente y ayudarle a agendar, y pasarle solo a quien está listo para una cita. Es una opción, no el centro del plan.',
      'Si le sirve, se puede sumar un asistente de WhatsApp que aprende de cómo responde usted, para responder, agendar y ayudarle a cobrar lo repetido. Es una opción, no el centro del plan.',
      'Si le sirve, se puede sumar un asistente de WhatsApp que aprende de cómo responde usted, para atender las primeras conversaciones. Es una opción, no el centro del plan.'
    ));
  }

  const giro = (tipo === 'otro' && tipoOtro) ? de(perfil, (', un negocio de ' + tipoOtro), (', ' + tipoOtro), (', un emprendimiento de ' + tipoOtro), (', ' + tipoOtro)) : '';
  const aperMap = de(perfil, APERTURA_PROBLEMA, APERTURA_PROBLEMA_PROF, APERTURA_PROBLEMA_EMP, APERTURA_PROBLEMA_IDEA);
  const aperFallback = de(perfil, 'Vimos con atención cómo está vendiendo hoy.', 'Vimos con atención cómo está su práctica hoy.', 'Vimos con atención cómo está su emprendimiento hoy.', 'Vimos con atención cómo está su idea hoy.');
  const aperCierre = de(perfil,
    ' Este diagnóstico es para que vea, con claridad, lo que está frenando su crecimiento y lo que un plan a la medida puede desbloquear: vender más, ahorrar tiempo, ganar más plata y tener más libertad.',
    ' Este diagnóstico es para que vea, con claridad, lo que está frenando el crecimiento de su práctica y lo que un plan a la medida puede desbloquear: extender sus servicios, ordenar su agenda, ahorrar tiempo y tener más libertad.',
    ' Este diagnóstico es para que vea, con claridad, lo que está frenando su emprendimiento y lo que un plan a la medida puede desbloquear: más clientes, una agenda más llena, una marca personal que lo represente, y un orden para cobrar y organizarse.',
    ' Este diagnóstico es para que vea, con claridad, cómo pasar de la idea a un primer paso concreto: validarla, aparecer en internet y conseguir sus primeros clientes.'
  );
  const apertura = 'En Empresa Inteligente revisamos lo que nos contó de ' + d.negocio + giro + '. ' + (aperMap[pp] || aperFallback) + aperCierre;

  // Plan a la medida: soluciones elegidas por reglas, sin cifras ni promesas de resultados.
  const items = [];
  if (prof) {
    if (pp === 'procesos') {
      items.push({ t: 'Sistema de agenda, recordatorios y administración', d: 'Para que la agenda, los recordatorios, la administración y los mensajes repetidos no dependan de usted a mano, y usted se concentre en atender.' });
    }
    if (pp === 'pocos' || pp === 'margen' || d.canal !== 'pauta' || items.length < 2) {
      items.push({ t: 'Contenido profesional con video IA para su marca personal y pauta en Meta local', d: 'Para que más personas de su ciudad lo conozcan y le escriban a pedir una cita o una consulta, con un mensaje claro y una inversión que se mide.' });
    }
    items.push({ t: 'Página o embudo para captar consultas', d: 'Para que cada persona que quiere conocer su servicio tenga un camino claro para escribirle y agendar.' });
    if (pp === 'responder' || pp === 'desorden' || pp === 'procesos' || msg.min >= 21 || items.length < 3) {
      items.push({ t: 'Agenda y recordatorios automáticos', d: 'Para que usted recupere tiempo y baje las citas que se pierden. Si le sirve, se suma un asistente de WhatsApp que aprende del dueño, para responder y agendar: es una opción, no el centro del plan.' });
    }
    if ((pp === 'nosabe' || d.pauta === 'sin-medir' || pp === 'margen') && items.length < 4) {
      items.push({ t: 'Medición simple de lo que funciona', d: 'Para saber de dónde llega cada consulta y poner el dinero solo donde sí llena su agenda.' });
    }
  } else if (emp) {
    items.push({ t: 'Marca personal y contenido con video IA', d: 'Para que la gente sepa quién es usted y qué hace, aunque todavía no tenga un local o un logo grande, y le escriban con más confianza.' });
    items.push({ t: 'Pauta en Meta local para conseguir más clientes y llenar su agenda', d: 'Para dejar de esperar a que lo encuentren solos y probar qué mensaje trae clientes reales en su ciudad.' });
    items.push({ t: 'Un orden para cobrar, agendar y dar seguimiento', d: 'Para que el trabajo que ya hizo sí se convierta en plata, la agenda no se desordene y el cliente tenga una razón para volver.' });
    if (pp === 'responder' || pp === 'desorden' || pp === 'procesos' || msg.min >= 21 || items.length < 4) {
      items.push({ t: 'Automatización de lo repetido', d: 'Para que usted recupere tiempo. Si le sirve, se suma un asistente de WhatsApp que aprende del dueño, para responder, agendar y ayudarle con lo repetido: es una opción, no el centro del plan.' });
    }
  } else if (idea) {
    items.push({ t: 'Validar su idea con un mensaje claro y presencia digital', d: 'Para pasar de lo que tiene en la cabeza a algo que la gente pueda entender, encontrar y probar, sin armar de más.' });
    items.push({ t: 'Contenido y una pauta pequeña para conseguir sus primeros clientes', d: 'Para que personas de su zona se enteren de su idea y le escriban, y usted vea si despierta interés de verdad.' });
    items.push({ t: 'Una página o embudo simple para que le escriban', d: 'Para que cada persona interesada tenga un camino claro para contactarlo y dar el siguiente paso.' });
    if (items.length < 4) {
      items.push({ t: 'Un orden básico para responder', d: 'Para que las primeras conversaciones no se enfríen. Si le sirve, se suma un asistente de WhatsApp que aprende del dueño: es una opción, no el centro del plan.' });
    }
  } else {
    if (pp === 'procesos') {
      items.push({ t: 'Software a la medida / POS con IA para automatizar caja, contabilidad y nómina', d: 'Para que el cierre de caja, la contabilidad, la nómina y el inventario no dependan de usted a mano, y sumar publicidad en redes y respuesta de mensajes, de modo que usted se concentre en lo que solo usted puede hacer.' });
    }
    if (pp === 'pocos' || pp === 'margen' || d.canal !== 'pauta') {
      items.push({ t: 'Contenido profesional con video IA y pauta en Meta', d: 'Para que más personas de su ciudad lo conozcan y le escriban, con un mensaje claro y una inversión que se mide.' });
    }
    items.push({ t: 'Embudo de ventas y seguimiento', d: 'Para que cada persona que le escribe reciba respuesta, y cada cliente que ya compró tenga una razón para volver.' });
    if (pp === 'responder' || pp === 'desorden' || msg.min >= 21) {
      items.push({ t: 'Automatización de lo repetido', d: 'Para que usted recupere tiempo. Si le sirve, se suma un asistente de WhatsApp que aprende del dueño: es una opción, no el centro del plan.' });
    }
    if (pp === 'nosabe' || d.pauta === 'sin-medir' || pp === 'margen') {
      items.push({ t: 'Medición simple de lo que funciona', d: 'Para saber de dónde llega cada cliente y poner el dinero solo donde se vende.' });
    }
    if (pp === 'desorden' && items.length < 4) {
      items.push({ t: 'Software a la medida', d: 'Para ordenar lo que hoy vive en su cabeza y en chats sueltos, y que el negocio funcione sin depender de usted para todo.' });
    }
  }
  const plan = {
    titulo: de(perfil,
      'Le proponemos la mejor solución para que ' + d.negocio + ' crezca',
      'Le proponemos la mejor solución para que ' + d.negocio + ' pueda extender sus servicios',
      'Le proponemos la mejor solución para que su emprendimiento crezca',
      'Le proponemos la mejor solución para que su idea arranque'
    ),
    items: items.slice(0, 4),
    cierre: de(perfil,
      'La armamos a la medida de su negocio, con una meta clara y sin compromiso. Pídala ahora y la revisamos juntos en una llamada corta.',
      'La armamos a la medida de su profesión, con una meta clara y sin compromiso. Pídala ahora y la revisamos juntos en una llamada corta.',
      'La armamos a la medida de su emprendimiento, con una meta clara y sin compromiso. Pídala ahora y la revisamos juntos en una llamada corta.',
      'La armamos a la medida de su idea, con una meta clara y sin compromiso. Pídala ahora y la revisamos juntos en una llamada corta.'
    ),
  };

  // Prioridades (siguientes pasos sin precios)
  const siguientes = [];
  if (problemas.length) siguientes.push('Empezar por lo que más le está costando ahora: ' + problemas[0].titulo.toLowerCase() + '.');
  siguientes.push(de(perfil,
    'En Empresa Inteligente le preparamos una propuesta corta, a la medida de ' + d.negocio + ': qué haríamos, la meta de ventas y la inversión.',
    'En Empresa Inteligente le preparamos una propuesta corta, a la medida de ' + d.negocio + ': qué haríamos para extender sus servicios, cómo trabajar su agenda y la inversión.',
    'En Empresa Inteligente le preparamos una propuesta corta, a la medida de su emprendimiento: cómo conseguir más clientes, crear su marca personal, organizarse para cobrar y la inversión.',
    'En Empresa Inteligente le preparamos una propuesta corta, a la medida de su idea: cómo arrancar y validarla, conseguir los primeros clientes, aparecer en internet y la inversión.'
  ));
  siguientes.push('El siguiente paso es una llamada, para explicársela y resolver sus dudas. Si quiere verla, pídala en esta misma página y elija el momento en que le queda bien.');

  return {
    version: 2,
    negocio: d.negocio,
    tipo: etiquetaTipo(d),
    ciudad: d.ciudad,
    profesional: prof,
    perfilCliente: perfil || 'negocio',
    apertura,
    nivel,
    nivelTxt,
    perfil: {
      'Cómo consigue clientes hoy': CANALES[d.canal] || '—',
      'Mensajes que recibe': msg.label,
      'Publicidad': PAUTA[d.pauta] || '—',
      'Problema principal': PROBLEMAS[d.problema] || '—',
      'Meta': METAS[d.meta] || '—',
    },
    problemas,
    oportunidades,
    ganancia,
    plan,
    costo,
    siguientes,
  };
}

module.exports = { diagnosticar, etiquetaTipo, esProfesional, perfilDe, notaPerfil, TIPOS, CANALES, MENSAJES, PAUTA, PROBLEMAS, METAS };
