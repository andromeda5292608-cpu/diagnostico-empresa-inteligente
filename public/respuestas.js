// Micro-respuestas del diagnóstico: reglas fijas, sin llamadas externas ni cifras inventadas.
// Voz de Empresa Inteligente, trato de "usted". Nunca la palabra "bot".
(function () {
  'use strict';
  var A = 'asistente de WhatsApp que aprende del dueño';
  var R = {
    tipo: {
      estetica: { chip: 'Estética / salud', why: 'en estética y salud se compra por confianza: quien ve casos reales y reseñas, agenda.', fix: 'contenido profesional con video IA y reseñas visibles, para que lo elijan a usted antes de la cita.' },
      celulares: { chip: 'Celulares / tecnología', why: 'el cliente de tecnología pregunta a varios locales a la vez y compra donde le responden primero.', fix: 'respuestas rápidas y claras, y contenido en video que muestre que su local tiene movimiento.' },
      restaurante: { chip: 'Restaurante / comida', why: 'en comida la gente decide en segundos mirando video y fotos: el antojo entra por los ojos.', fix: 'videos profesionales de sus platos con IA y pauta en Meta dirigida a quienes están cerca.' },
      otro: { chip: 'Su tipo de negocio', why: 'cada negocio tiene su propia forma de vender, y un paquete genérico casi nunca encaja.', fix: 'un plan armado a la medida de lo que usted vende y de cómo le compran sus clientes.' }
    },
    canal: {
      referidos: { chip: 'Clientes por recomendación', why: 'las recomendaciones son oro, pero no se pueden encender cuando uno quiere.', fix: 'contenido profesional que multiplique esas recomendaciones y una pauta en Meta pequeña para tener clientes nuevos a voluntad.' },
      redes: { chip: 'Redes sin pauta', why: 'sin pauta, que lo vean depende del algoritmo y de que alguien abra la red justo ese día.', fix: 'video con IA y pauta en Meta dirigida a quien sí puede comprarle, con un camino directo a su WhatsApp.' },
      pauta: { chip: 'Ya hace anuncios', why: 'usted ya dio un paso que muchos no dan; ahora el reto es que cada peso se note.', fix: 'un embudo de ventas con seguimiento y medición, para convertir más de lo que ya le llega.' },
      google: { chip: 'Lo encuentran en Google', why: 'quien lo busca en Google ya quiere comprar, y se decide por fotos, reseñas y rapidez.', fix: 'una ficha cuidada y contenido en video que lleve a la gente directo a escribirle.' },
      local: { chip: 'Clientes que pasan por el local', why: 'su vitrina hoy solo la ve quien pasa por la puerta.', fix: 'llevar su vitrina a internet con contenido profesional en video y pauta en Meta en su ciudad.' },
      irregular: { chip: 'Casi no llegan clientes nuevos', why: 'todavía no hay un canal que trabaje para usted todos los días.', fix: 'construir ese canal: contenido con video IA, pauta en Meta y seguimiento, paso a paso.' }
    },
    mensajes: {
      '0-5': { chip: 'Pocos mensajes al día', why: 'hoy hay pocas conversaciones nuevas, y de ahí salen las ventas.', fix: 'primero atraer más personas que sí compran (contenido y pauta) y luego organizar cómo se atienden.' },
      '6-20': { chip: 'Entre 6 y 20 mensajes al día', why: 'ya hay demanda, y una conversación sin seguimiento se enfría rápido.', fix: 'un orden simple de respuesta y seguimiento para que ninguna venta se quede a medias.' },
      '21-50': { chip: 'Entre 21 y 50 mensajes al día', why: 'atender a mano a tanta gente retrasa las respuestas, y quien espera le escribe a otro.', fix: 'automatizar las preguntas repetidas; si le sirve, sumar un ' + A + '.' },
      '50+': { chip: 'Más de 50 mensajes al día', why: 'es mucha demanda para una sola persona, y parte se está quedando sin respuesta a tiempo.', fix: 'automatización del seguimiento y, si le sirve, un ' + A + ' que le pase solo a quien está listo para comprar.' }
    },
    pauta: {
      no: { chip: 'Sin pauta', why: 'hoy solo le compra quien ya lo conoce.', fix: 'una pauta pequeña en Meta, solo en su ciudad, para probar qué mensaje trae clientes reales.' },
      'sin-medir': { chip: 'Pauta sin medir', why: 'sin medir, no se sabe qué anuncio sirve y cuál solo gasta.', fix: 'medir cada cliente que llega y mover la plata solo a lo que sí vende.' },
      midiendo: { chip: 'Pauta medida', why: 'medir le da una ventaja grande sobre quien invierte a ciegas.', fix: 'escalar lo que ya funciona y probar mensajes nuevos con video IA, con poco riesgo.' }
    },
    problema: {
      pocos: { chip: 'Pocos clientes nuevos', why: 'poca gente conoce el negocio, o no le resulta fácil escribirle.', fix: 'contenido profesional con video IA y pauta en Meta para que le lleguen clientes nuevos con constancia.' },
      responder: { chip: 'No alcanza a responder', why: 'los mensajes llegan todos juntos, y quien no recibe respuesta a tiempo se va.', fix: 'automatizar lo repetido y ordenar el seguimiento; si le sirve, un ' + A + '.' },
      recompra: { chip: 'No vuelven a comprar', why: 'después de la venta no hay nada que invite al cliente a volver.', fix: 'un embudo de seguimiento: gracias, recordatorio y una razón para volver, de forma automática.' },
      nosabe: { chip: 'No sabe qué funciona', why: 'sin medir de dónde llega cada cliente, el tiempo y el dinero se reparten a ciegas.', fix: 'un tablero simple que muestre qué trae clientes, para invertir solo donde se vende.' },
      desorden: { chip: 'Todo depende de usted', why: 'toda la atención, la venta y el seguimiento pasan por usted.', fix: 'automatizar lo repetitivo y, si hace falta, un software a la medida que ordene el negocio y le devuelva tiempo.' },
      margen: { chip: 'Margen bajo', why: 'conseguir cada cliente cuesta de más, se vende sin ofertas pensadas, o el cliente compra una sola vez.', fix: 'atraer con pauta medida, armar ofertas combinadas y hacer seguimiento para que cada cliente le compre más veces.' }
    },
    meta: {
      poco: { chip: 'Meta: vender un poco más', why: 'es una meta realista, y muchas veces se logra ordenando lo que ya existe.', fix: 'ajustes puntuales de atención, seguimiento y pauta, sin armar nada innecesario.' },
      bastante: { chip: 'Meta: vender bastante más', why: 'vender bastante más pide traer más clientes que sí compren y no dejar ir a los que ya escriben.', fix: 'contenido y pauta para atraer, más un embudo de seguimiento para cerrar.' },
      duplicar: { chip: 'Meta: duplicar ventas', why: 'es una meta grande, y se construye con un sistema que traiga clientes todos los días.', fix: 'un plan por etapas, a la medida: atraer, atender y hacer volver, con medición desde el primer día.' },
      sinmeta: { chip: 'Meta por definir', why: 'sin una meta clara es difícil saber si lo que se hace funciona.', fix: 'definirla juntos en la llamada, con los números de su propio negocio.' }
    }
  };
  var TEXTO = {
    negocio: function (v) { return { say: 'Mucho gusto con ' + v + '. Vamos a armar esto a la medida de su negocio, no con un paquete genérico.' }; },
    ciudad: function (v) { return { say: 'Perfecto, ' + v + '. Una pauta dirigida solo a su zona hace que cada peso llegue a quien sí puede comprarle.' }; },
    contacto: function (v) { return { say: 'Mucho gusto, ' + v.split(' ')[0] + '. Un par de datos más y le mostramos lo que puede estar frenando sus ventas.' }; },
    whatsapp: function () { return { say: 'Es para enviarle lo que le preparemos y coordinar su llamada, si usted la pide.' }; },
    redes: function () { return { say: 'Excelente. Con ese enlace podemos ver cómo lo ve hoy un cliente nuevo, y su propuesta sale mucho más a la medida.' }; }
  };
  window.EI_RESP = { R: R, TEXTO: TEXTO };
})();
