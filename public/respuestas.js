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
      otro: { chip: 'Su tipo de negocio', say: 'Cuéntenos qué tipo de negocio tiene y lo armamos a su medida.' }
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
      procesos: { chip: 'Le toca hacerlo todo', why: 'usted atiende clientes, cierra caja, revisa inventario y además consigue ventas: todo depende de una sola persona, y el día no alcanza.', fix: 'ahorrar tiempo con un software con IA o un POS que automatice la contabilidad, la nómina, el cierre de caja y el inventario, más publicidad en redes y respuesta de mensajes, para que usted se concentre en lo que solo usted puede hacer.' },
      margen: { chip: 'Margen bajo', why: 'conseguir cada cliente cuesta de más, se vende sin ofertas pensadas, o el cliente compra una sola vez.', fix: 'atraer con pauta medida, armar ofertas combinadas y hacer seguimiento para que cada cliente le compre más veces.' }
    },
    meta: {
      poco: { chip: 'Meta: vender un poco más', why: 'es una meta realista, y muchas veces se logra ordenando lo que ya existe.', fix: 'ajustes puntuales de atención, seguimiento y pauta, sin armar nada innecesario.' },
      bastante: { chip: 'Meta: vender bastante más', why: 'vender bastante más pide traer más clientes que sí compren y no dejar ir a los que ya escriben.', fix: 'contenido y pauta para atraer, más un embudo de seguimiento para cerrar.' },
      duplicar: { chip: 'Meta: duplicar ventas', why: 'es una meta grande, y se construye con un sistema que traiga clientes todos los días.', fix: 'un plan por etapas, a la medida: atraer, atender y hacer volver, con medición desde el primer día.' },
      sinmeta: { chip: 'Meta por definir', why: 'sin una meta clara es difícil saber si lo que se hace funciona.', fix: 'definirla juntos en la llamada, con los números de su propio negocio.' }
    }
  };
  var A2 = A;
  var R_PROF = {
    canal: {
      referidos: { chip: 'Pacientes o clientes por recomendación', why: 'las recomendaciones son oro, pero no se pueden encender cuando uno quiere.', fix: 'contenido profesional para su marca personal que multiplique esas recomendaciones, y una pauta en Meta pequeña para tener consultas nuevas a voluntad.' },
      redes: { chip: 'Redes sin pauta', why: 'sin pauta, que lo vean depende del algoritmo y de que alguien abra la red justo ese día.', fix: 'video con IA para su marca personal y pauta en Meta dirigida a quien busca su servicio, con un camino directo a agendar por WhatsApp.' },
      pauta: { chip: 'Ya hace anuncios', why: 'usted ya dio un paso que muchos no dan; ahora el reto es que cada peso se note.', fix: 'un embudo para captar consultas, con seguimiento y medición, para convertir más de lo que ya le llega.' },
      google: { chip: 'Lo encuentran en Google', why: 'quien lo busca en Google ya quiere una cita, y se decide por claridad, reseñas y rapidez para agendar.', fix: 'una ficha cuidada y contenido en video que lleve a la gente directo a escribirle o reservar.' },
      local: { chip: 'Quienes llegan por su zona', why: 'hoy lo conoce sobre todo quien ya pasa cerca o lo tiene de referencia.', fix: 'llevar su marca personal a internet con contenido profesional en video y pauta en Meta en su ciudad.' },
      irregular: { chip: 'Casi no llegan consultas nuevas', why: 'todavía no hay un canal que trabaje para usted todos los días.', fix: 'construir ese canal: contenido con video IA para su marca personal, pauta en Meta y un camino claro para agendar, paso a paso.' }
    },
    mensajes: {
      '0-5': { chip: 'Pocas consultas al día', why: 'hoy hay pocas conversaciones nuevas, y de ahí salen las citas.', fix: 'primero atraer más personas que buscan su servicio (contenido y pauta) y luego organizar cómo se atienden y se agendan.' },
      '6-20': { chip: 'Entre 6 y 20 mensajes al día', why: 'ya hay demanda, y una conversación sin seguimiento se enfría rápido.', fix: 'un orden simple de respuesta, agenda y recordatorios para que ninguna consulta se quede a medias.' },
      '21-50': { chip: 'Entre 21 y 50 mensajes al día', why: 'atender a mano a tanta gente retrasa las respuestas, y quien espera le escribe a otro profesional.', fix: 'automatizar las preguntas repetidas y la agenda; si le sirve, sumar un ' + A2 + ' para responder y agendar.' },
      '50+': { chip: 'Más de 50 mensajes al día', why: 'es mucha demanda para una sola persona, y parte se está quedando sin respuesta a tiempo.', fix: 'automatización de agenda y seguimiento y, si le sirve, un ' + A2 + ' que le pase solo a quien está listo para agendar.' }
    },
    pauta: {
      no: { chip: 'Sin pauta', why: 'hoy solo le escribe quien ya lo conoce.', fix: 'una pauta pequeña en Meta, solo en su ciudad, para probar qué mensaje trae consultas reales.' },
      'sin-medir': { chip: 'Pauta sin medir', why: 'sin medir, no se sabe qué anuncio sirve y cuál solo gasta.', fix: 'medir cada consulta que llega y mover la plata solo a lo que sí llena su agenda.' },
      midiendo: { chip: 'Pauta medida', why: 'medir le da una ventaja grande sobre quien invierte a ciegas.', fix: 'escalar lo que ya funciona y probar mensajes nuevos con video IA para su marca personal, con poco riesgo.' }
    },
    problema: {
      pocos: { chip: 'Pocas consultas nuevas', why: 'poca gente lo conoce, o no le resulta fácil escribirle o agendar.', fix: 'contenido profesional con video IA para su marca personal y pauta en Meta, para que le lleguen consultas nuevas con constancia.' },
      responder: { chip: 'No alcanza a responder', why: 'los mensajes llegan todos juntos, y quien no recibe respuesta a tiempo se va con otro profesional.', fix: 'automatizar lo repetido, la agenda y los recordatorios; si le sirve, un ' + A2 + ' para responder y agendar.' },
      recompra: { chip: 'No vuelven a agendar', why: 'después de la cita no hay un recordatorio ni un camino claro para volver.', fix: 'un seguimiento sencillo: agradecimiento, recordatorio y una forma fácil de volver a agendar, de forma automática.' },
      nosabe: { chip: 'No sabe qué funciona', why: 'sin medir de dónde llega cada consulta, el tiempo y el dinero se reparten a ciegas.', fix: 'un tablero simple que muestre qué trae pacientes o clientes, para invertir solo donde sí hay agenda.' },
      desorden: { chip: 'Todo depende de usted', why: 'toda la atención, la agenda y el seguimiento pasan por usted.', fix: 'automatizar lo repetitivo, la agenda y los recordatorios, para ordenar su práctica y recuperarle tiempo.' },
      procesos: { chip: 'Le toca hacerlo todo', why: 'usted atiende, agenda, administra y además tiene que darse a conocer: todo depende de una sola persona, y el día no alcanza.', fix: 'ahorrar tiempo con agenda y recordatorios automáticos, y un sistema que le ayude con la administración y la respuesta de mensajes, para que usted se concentre en atender.' },
      margen: { chip: 'Margen bajo', why: 'conseguir cada paciente o cliente cuesta de más, o la persona viene una sola vez y no vuelve a agendar.', fix: 'atraer con pauta medida, dejar un camino claro para agendar y hacer seguimiento para que quien ya lo conoce vuelva cuando lo necesite.' }
    },
    meta: {
      poco: { chip: 'Meta: atender un poco más', why: 'es una meta realista, y muchas veces se logra ordenando lo que ya existe.', fix: 'ajustes puntuales de atención, agenda y pauta, sin armar nada innecesario.' },
      bastante: { chip: 'Meta: ampliar bastante su agenda', why: 'ampliar su agenda pide atraer más personas que sí agenden y no dejar ir a quienes ya escriben.', fix: 'contenido y pauta para su marca personal, más un embudo para captar y agendar consultas.' },
      duplicar: { chip: 'Meta: extender sus servicios', why: 'es una meta grande, y se construye con un sistema que atraiga consultas de forma constante.', fix: 'un plan por etapas, a la medida: darse a conocer, atender y facilitar que vuelvan a agendar, con medición desde el primer día.' },
      sinmeta: { chip: 'Meta por definir', why: 'sin una meta clara es difícil saber si lo que se hace funciona.', fix: 'definirla juntos en la llamada, a partir de su propia práctica.' }
    }
  };
  var TEXTO = {
    negocio: function (v) { return { say: 'Mucho gusto con ' + v + '. Vamos a armar esto a la medida de su negocio, no con un paquete genérico.' }; },
    ciudad: function (v) { return { say: 'Perfecto, ' + v + '. Una pauta dirigida solo a su zona hace que cada peso llegue a quien sí puede comprarle.' }; },
    contacto: function (v) { return { say: 'Mucho gusto, ' + v.split(' ')[0] + '. Un par de datos más y le mostramos lo que puede estar frenando sus ventas.' }; },
    whatsapp: function () { return { say: 'Es para enviarle lo que le preparemos y coordinar su llamada, si usted la pide.' }; },
    redes: function () { return { say: 'Excelente. Con ese enlace podemos ver cómo lo ve hoy un cliente nuevo, y su propuesta sale mucho más a la medida.' }; },
    tipoOtro: function (v) { return { say: 'Perfecto, ' + v + '. Armamos el plan a la medida de cómo le compran sus clientes, no con un paquete genérico.' }; }
  };
  var TEXTO_PROF = {
    negocio: function (v) { return { say: 'Mucho gusto con ' + v + '. Vamos a armar esto a la medida de su profesión, para ayudarle a extender sus servicios, no con un paquete genérico.' }; },
    ciudad: function (v) { return { say: 'Perfecto, ' + v + '. Una pauta dirigida solo a su zona hace que cada peso llegue a quien busca su servicio.' }; },
    contacto: function (v) { return { say: 'Mucho gusto, ' + v.split(' ')[0] + '. Un par de datos más y le mostramos lo que puede estar frenando el crecimiento de su práctica.' }; },
    whatsapp: function () { return { say: 'Es para enviarle lo que le preparemos y coordinar su llamada, si usted la pide.' }; },
    redes: function () { return { say: 'Excelente. Con ese enlace podemos ver cómo lo ve hoy quien busca su servicio, y su propuesta sale mucho más a la medida.' }; },
    tipoOtro: function (v) { return { say: 'Perfecto, ' + v + '. Armamos el plan a la medida de su profesión, para ayudarle a extender sus servicios, no con un paquete genérico.' }; }
  };
  // El de «Otro» antes de escribir: también cubre profesión, sin añadir opciones a la lista.
  R.tipo.otro = { chip: 'Su tipo de negocio o profesión', say: 'Cuéntenos qué tipo de negocio o profesión tiene y lo armamos a su medida.' };
  window.EI_RESP = { R: R, R_PROF: R_PROF, TEXTO: TEXTO, TEXTO_PROF: TEXTO_PROF };
})();
