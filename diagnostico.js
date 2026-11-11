'use strict';
// Diagnóstico preliminar por reglas. Determinista: mismas respuestas => mismo resultado.
// Sin precios, sin cifras inventadas: solo se usan datos que el negocio escribió.

const TIPOS = {
  estetica: 'Estética / salud',
  celulares: 'Celulares / tecnología',
  restaurante: 'Restaurante / comida',
  otro: 'Otro tipo de negocio',
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
  responder: 'No alcanzo a responder a todos a tiempo',
  recompra: 'Los clientes compran una vez y no vuelven',
  nosabe: 'No sé qué está funcionando y qué no',
  desorden: 'Todo depende de mí y está desordenado',
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
    return { instagram: false, facebook: false, web: false, ninguna: true };
  const instagram = /instagram|(^|\s)@[a-z0-9._]{2,}|\big[: ]/.test(t);
  const facebook = /facebook|fb\.com|\bfb[: ]/.test(t);
  const sinSociales = t.replace(/(instagram|facebook|fb)\.com\/?\S*/g, ' ');
  const web = /(https?:\/\/|www\.)/.test(sinSociales) || /\b[a-z0-9-]{2,}\.(com|co|net|org|shop|store|site|app)\b/.test(sinSociales);
  return { instagram, facebook, web, ninguna: !(instagram || facebook || web) };
}

// Piezas específicas por tipo de negocio
const POR_TIPO = {
  estetica: {
    ideas: [
      'Agendar citas por WhatsApp con confirmación y recordatorio el día anterior, para bajar las citas que se pierden.',
      'Mostrar en redes casos reales con permiso del cliente (antes y después, procesos, equipo), que es lo que más confianza da en salud y estética.',
      'Pedir reseñas en Google después de cada servicio: es lo primero que mira alguien nuevo antes de reservar.',
    ],
    problema: 'En estética y salud la decisión se toma por confianza: quien no ve resultados reales ni reseñas, no agenda.',
  },
  celulares: {
    ideas: [
      'Responder cotizaciones de reparación y accesorios por WhatsApp en minutos, con precios claros y tiempo de entrega.',
      'Avisar al cliente por mensaje cuando su equipo está listo y ofrecerle una revisión o garantía para que vuelva.',
      'Publicar reparaciones y accesorios reales del local; el cliente de tecnología compara rápido y compra donde ve movimiento.',
    ],
    problema: 'En celulares y tecnología el cliente pregunta a varios locales a la vez; el que responde primero y con claridad se queda con la venta.',
  },
  restaurante: {
    ideas: [
      'Menú, horarios y ubicación siempre actualizados y fáciles de pedir por WhatsApp, con respuesta inmediata a las preguntas repetidas.',
      'Videos cortos de los platos y del lugar, publicados con constancia: en comida, el antojo se genera con la imagen.',
      'Una promoción semanal o por fechas especiales, medida, para saber qué trae gente al local.',
    ],
    problema: 'En restaurantes la gente decide en segundos mirando fotos y videos; sin contenido constante, el negocio no entra en la lista de opciones.',
  },
  otro: {
    ideas: [
      'Dejar claro en redes y en Google qué vende, dónde está y cómo pedir, para que un cliente nuevo entienda en diez segundos.',
      'Responder rápido por WhatsApp con respuestas preparadas para las preguntas que más llegan.',
      'Llevar un registro simple de cada cliente y de dónde llegó, para repetir lo que funciona.',
    ],
    problema: 'Cuando un cliente nuevo no entiende rápido qué ofrece el negocio y cómo comprar, se va con quien se lo explica mejor.',
  },
};

function diagnosticar(d) {
  const tipo = TIPOS[d.tipo] ? d.tipo : 'otro';
  const redes = tieneRedes(d.redes);
  const msg = MENSAJES[d.mensajes] || MENSAJES['0-5'];
  const problemas = [];
  const oportunidades = [];
  let puntos = 0; // 0..N, solo para clasificar el nivel; no se muestra como cifra

  // 1. Presencia digital
  const nRedes = [redes.instagram, redes.facebook, redes.web].filter(Boolean).length;
  if (redes.ninguna || nRedes === 0) {
    problemas.push({
      titulo: 'Presencia digital casi invisible',
      detalle: 'No indicó ningún perfil de Instagram, Facebook ni página web. Hoy un cliente nuevo que lo busca en internet no encuentra dónde confiar.',
    });
  } else if (nRedes === 1) {
    problemas.push({
      titulo: 'Presencia digital en un solo lugar',
      detalle: 'Solo indicó un canal (' + [redes.instagram && 'Instagram', redes.facebook && 'Facebook', redes.web && 'página web'].filter(Boolean).join('') + '). Quien lo busca en otro sitio no lo encuentra, y no hay a dónde llevar al cliente que llega por recomendación.',
    });
    puntos += 1;
  } else {
    puntos += 2;
    oportunidades.push('Ya tiene presencia en más de un canal: lo que falta es que todos digan lo mismo y lleven al cliente a escribirle.');
  }

  // 2. Cómo consiguen clientes
  const canal = d.canal;
  if (canal === 'referidos' || canal === 'local') {
    problemas.push({
      titulo: 'Depende de clientes que llegan solos',
      detalle: 'Hoy sus clientes llegan por ' + (canal === 'referidos' ? 'recomendaciones' : 'quienes pasan por el local') + '. Es buen punto de partida, pero no puede crecer a voluntad: si baja el flujo, no tiene una palanca para subirlo.',
    });
    puntos += 1;
  } else if (canal === 'irregular') {
    problemas.push({
      titulo: 'Sin una fuente constante de clientes nuevos',
      detalle: 'Indicó que casi no llegan clientes nuevos. Sin un canal que funcione todos los días, las ventas dependen de la suerte de cada semana.',
    });
  } else if (canal === 'redes') {
    problemas.push({
      titulo: 'Redes sin una ruta clara hacia la venta',
      detalle: 'Publica en redes, pero sin pauta el alcance depende del algoritmo y de que alguien vea la publicación justo ese día.',
    });
    puntos += 2;
  } else if (canal === 'pauta') {
    puntos += 3;
  } else if (canal === 'google') {
    puntos += 2;
    oportunidades.push('Google es un canal donde el cliente ya quiere comprar. Cuidar la ficha, las fotos y las reseñas rinde mucho.');
  }

  // 3. Pauta
  if (d.pauta === 'no') {
    problemas.push({
      titulo: 'Sin publicidad pagada',
      detalle: 'No hace pauta, así que solo le compra quien ya lo conoce. La pauta bien hecha permite llegar, en su zona, a quien todavía no sabe que existe.',
    });
    oportunidades.push('Una pauta pequeña, dirigida solo a su ciudad o municipio, para probar qué mensaje trae clientes reales.');
  } else if (d.pauta === 'sin-medir') {
    problemas.push({
      titulo: 'Pauta sin medir',
      detalle: 'Invierte en anuncios pero no sabe cuánto le dejan. Sin medir, no se puede saber qué anuncio sirve y cuál solo gasta dinero.',
    });
    puntos += 1;
    oportunidades.push('Medir de dónde llega cada cliente (anuncio, recomendación, redes) para poner el dinero solo donde funciona.');
  } else if (d.pauta === 'midiendo') {
    puntos += 3;
    oportunidades.push('Como ya mide su pauta, puede escalar lo que funciona y probar mensajes nuevos con poco riesgo.');
  }

  // 4. Mensajes / atención
  if (msg.min >= 21) {
    problemas.push({
      titulo: 'Volumen alto de mensajes que difícilmente se atienden a mano',
      detalle: 'Recibe ' + msg.label.toLowerCase() + '. Con ese volumen, atender uno por uno retrasa las respuestas, y quien espera suele escribirle a otro negocio.',
    });
    oportunidades.push('Automatizar las respuestas a las preguntas repetidas (precios, horarios, ubicación, agenda) para que usted atienda solo los clientes listos para comprar.');
  } else if (msg.min >= 6) {
    oportunidades.push('Con ' + msg.label.toLowerCase() + ' ya hay demanda que organizar: un orden simple de respuesta y seguimiento evita que se enfríen conversaciones.');
    puntos += 1;
  } else {
    oportunidades.push('Hoy llegan pocos mensajes: el primer paso es generar más conversaciones, y después organizar cómo se atienden.');
  }

  // 5. Problema principal declarado
  const pp = d.problema;
  if (pp === 'responder') {
    problemas.push({
      titulo: 'Se le escapan clientes por la demora al responder',
      detalle: 'Usted mismo lo señala: no alcanza a responder a tiempo. Cada conversación sin respuesta oportuna es una venta que se va para la competencia.',
    });
  } else if (pp === 'recompra') {
    problemas.push({
      titulo: 'Los clientes no vuelven',
      detalle: 'Un cliente que ya compró es el más barato de volver a vender. Sin un recordatorio o seguimiento, depende de que se acuerden solos.',
    });
    oportunidades.push('Un seguimiento sencillo después de cada compra o servicio (mensaje de gracias, recordatorio, oferta para volver).');
  } else if (pp === 'nosabe') {
    problemas.push({
      titulo: 'No se mide qué funciona',
      detalle: 'Sin saber de dónde llega cada cliente, no es posible decidir en qué invertir tiempo y dinero.',
    });
  } else if (pp === 'desorden') {
    problemas.push({
      titulo: 'Todo depende de una sola persona',
      detalle: 'Cuando la atención, las ventas y el seguimiento dependen solo de usted, el negocio no puede crecer más allá de su tiempo.',
    });
    oportunidades.push('Dejar procesos claros y automáticos para que el negocio funcione también cuando usted no puede contestar.');
  } else if (pp === 'pocos') {
    problemas.push({
      titulo: 'Pocos clientes nuevos',
      detalle: 'Es el problema que usted señala como principal. Está ligado a cuánta gente conoce el negocio y a qué tan fácil es escribirle.',
    });
  }

  // 6. Meta
  if (d.meta === 'duplicar' && (puntos <= 4)) {
    problemas.push({
      titulo: 'La meta es grande para la base actual',
      detalle: 'Duplicar ventas pide un sistema que traiga clientes nuevos de forma constante. Con lo que usted describe, hoy esa base todavía no está armada.',
    });
  }
  if (d.meta === 'sinmeta') {
    problemas.push({
      titulo: 'Sin una meta de ventas definida',
      detalle: 'Sin una meta clara no se puede saber si lo que se hace está funcionando ni cuánto hace falta mejorar.',
    });
    oportunidades.push('Definir una meta de ventas concreta para los próximos meses y medirla cada semana.');
  }

  // Específico por tipo
  const t = POR_TIPO[tipo];
  problemas.push({ titulo: 'Lo que más pesa en su sector', detalle: t.problema });
  t.ideas.forEach((i) => oportunidades.push(i));

  // Nivel
  const nivel = puntos <= 3 ? 'Inicial' : puntos <= 7 ? 'En desarrollo' : 'Sólido';
  const nivelTxt = {
    Inicial: 'Su negocio tiene lo básico, pero todavía no tiene un sistema que traiga clientes de forma constante. Hay mucho espacio para mejorar con pasos sencillos.',
    'En desarrollo': 'Su negocio ya tiene piezas importantes funcionando. Falta conectarlas y medirlas para que produzcan resultados constantes.',
    Sólido: 'Su negocio tiene una base comercial buena. La oportunidad está en afinar, medir y escalar lo que ya funciona.',
  }[nivel];

  // Costo de no actuar (cualitativo + aritmética con sus propios datos)
  const costo = [];
  if (msg.min >= 6) {
    costo.push('Con ' + msg.label.toLowerCase() + ', usted maneja al menos ' + (msg.min * 30) + ' conversaciones al mes. Cada una que se responde tarde tiene más probabilidad de terminar en la competencia.');
  }
  if (d.pauta === 'no' || d.canal === 'referidos' || d.canal === 'local' || d.canal === 'irregular') {
    costo.push('Mientras no tenga un canal propio para atraer clientes, su crecimiento depende de que otros hablen de usted o pasen por la puerta.');
  }
  if (d.pauta === 'sin-medir' || d.problema === 'nosabe') {
    costo.push('Cada mes que invierte sin medir es dinero que no se sabe si trabajó, y decisiones que se toman a ciegas.');
  }
  if (d.problema === 'recompra') {
    costo.push('Cada cliente que no vuelve es una venta que ya había costado conseguir y se pierde.');
  }
  costo.push('Sus competidores que sí ordenan su atención y su publicidad van quedándose con los clientes que hoy podrían ser suyos. Esa diferencia crece cada mes.');

  // Prioridades (siguientes pasos sin precios)
  const siguientes = [];
  if (problemas.length) siguientes.push('Resolver primero: ' + problemas[0].titulo.toLowerCase() + '.');
  siguientes.push('Definir una meta de ventas concreta y medirla cada semana.');
  siguientes.push('Revisar con detalle sus redes y su ficha de Google, algo que se hace en la llamada.');

  return {
    version: 1,
    negocio: d.negocio,
    tipo: TIPOS[tipo],
    ciudad: d.ciudad,
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
    costo,
    siguientes,
  };
}

module.exports = { diagnosticar, TIPOS, CANALES, MENSAJES, PAUTA, PROBLEMAS, METAS };
