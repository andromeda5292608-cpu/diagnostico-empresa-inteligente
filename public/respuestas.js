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
      otro: { chip: 'Su tipo de negocio, emprendimiento o idea', say: 'Cuéntenos qué tipo de negocio, emprendimiento o idea tiene y lo armamos a su medida.' }
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
  R.tipo.otro = { chip: 'Su tipo de negocio, emprendimiento o idea', say: 'Cuéntenos qué tipo de negocio, emprendimiento o idea tiene y lo armamos a su medida.' };
  var R_EMP = {
    canal: {
      referidos: { chip: 'Clientes por recomendación', why: 'las recomendaciones ayudan, pero no se pueden encender cuando uno quiere llenar la agenda.', fix: 'una marca personal visible y una pauta en Meta pequeña, para conseguir más clientes a voluntad.' },
      redes: { chip: 'Redes sin pauta', why: 'sin pauta, que lo vean depende del algoritmo, y su emprendimiento no llega a quien sí le pediría el servicio.', fix: 'contenido para su marca personal y pauta en Meta en su ciudad, con un camino claro para escribirle o agendar.' },
      pauta: { chip: 'Ya hace anuncios', why: 'usted ya invierte en darse a conocer; ahora el reto es que eso sí llene su agenda y se pueda medir.', fix: 'un orden para cobrar y dar seguimiento, y medir qué mensaje trae clientes de verdad.' },
      google: { chip: 'Lo encuentran en Google', why: 'quien lo busca ya quiere pedirle el servicio, y se decide por claridad y rapidez para escribirle.', fix: 'una ficha o perfil cuidado y contenido que lleve a la gente a agendar o a pedirle el servicio.' },
      local: { chip: 'Quienes llegan por su zona', why: 'hoy lo conoce sobre todo quien ya pasa cerca o se lo recomendaron en persona.', fix: 'llevar su marca personal a internet y una pauta en Meta en su ciudad, para llenar la agenda también desde ahí.' },
      irregular: { chip: 'Casi no llegan clientes nuevos', why: 'todavía no hay un canal que le traiga clientes todos los días, y la agenda se siente flaca.', fix: 'construir ese canal: marca personal, contenido y pauta en Meta, paso a paso.' }
    },
    mensajes: {
      '0-5': { chip: 'Pocos mensajes al día', why: 'hoy hay pocas conversaciones nuevas, y de ahí salen los clientes y la agenda.', fix: 'primero darse a conocer con marca personal y pauta, y luego organizar cómo se atiende y se cobra.' },
      '6-20': { chip: 'Entre 6 y 20 mensajes al día', why: 'ya hay demanda, y una conversación sin seguimiento se enfría y se deja de cobrar.', fix: 'un orden simple de respuesta, agenda y cobro, para que ningún cliente se quede a medias.' },
      '21-50': { chip: 'Entre 21 y 50 mensajes al día', why: 'atender y cobrar a mano a tanta gente retrasa las respuestas, y quien espera le escribe a otra persona.', fix: 'automatizar lo repetido; si le sirve, sumar un ' + A + ' para responder, agendar y ayudarle a organizar el cobro.' },
      '50+': { chip: 'Más de 50 mensajes al día', why: 'es mucha demanda para una sola persona, y parte se queda sin respuesta o sin cobro a tiempo.', fix: 'automatización de agenda y seguimiento y, si le sirve, un ' + A + ' que le pase solo a quien está listo para agendar o pagar.' }
    },
    pauta: {
      no: { chip: 'Sin pauta', why: 'hoy solo le llega quien ya lo conoce, y cuesta llenar la agenda a voluntad.', fix: 'una pauta pequeña en Meta, solo en su ciudad, para probar qué mensaje trae clientes reales.' },
      'sin-medir': { chip: 'Pauta sin medir', why: 'sin medir, no se sabe qué anuncio llena la agenda y cuál solo gasta.', fix: 'medir cada cliente que llega y mover la plata solo a lo que sí funciona.' },
      midiendo: { chip: 'Pauta medida', why: 'medir le da una ventaja grande para hacer crecer el emprendimiento sin gastar a ciegas.', fix: 'escalar lo que ya trae clientes y reforzar su marca personal con video, con poco riesgo.' }
    },
    problema: {
      pocos: { chip: 'Pocos clientes nuevos', why: 'poca gente conoce su emprendimiento, o no le resulta fácil pedirle el servicio.', fix: 'marca personal con video IA y pauta en Meta, para conseguir más clientes y llenar su agenda con constancia.' },
      responder: { chip: 'No alcanza a responder', why: 'los mensajes llegan todos juntos, y quien no recibe respuesta a tiempo se va con otra persona.', fix: 'automatizar lo repetido, la agenda y, si le sirve, un ' + A + ' para responder y agendar.' },
      recompra: { chip: 'No vuelven', why: 'después del servicio no hay un recordatorio ni una forma fácil de volver a pedirle o de pagar de nuevo.', fix: 'un seguimiento sencillo: agradecimiento, recordatorio y una forma clara de volver a agendar o comprar.' },
      nosabe: { chip: 'No sabe qué funciona', why: 'sin medir de dónde llega cada cliente, el tiempo y el dinero se reparten a ciegas.', fix: 'un tablero simple que muestre qué llena su agenda, para invertir solo ahí.' },
      desorden: { chip: 'Todo depende de usted', why: 'atender, cobrar y darse a conocer pasan por usted, y el emprendimiento se desordena.', fix: 'un orden para cobrar, agendar y dar seguimiento, y automatizar lo repetido para recuperarle tiempo.' },
      procesos: { chip: 'Le toca hacerlo todo', why: 'usted atiende, cobra, agenda y además tiene que conseguir clientes: el día no alcanza.', fix: 'organizarse para cobrar y agendar, más marca personal y respuesta de mensajes, para que usted se concentre en atender y crecer.' },
      margen: { chip: 'Margen bajo', why: 'cuesta cobrar lo que su trabajo vale, o conseguir cada cliente sale caro, o la persona no vuelve.', fix: 'atraer con pauta medida, dejar claro cómo se cobra y hacer seguimiento para que quien ya lo conoce vuelva.' }
    },
    meta: {
      poco: { chip: 'Meta: un poco más de clientes', why: 'es una meta realista, y muchas veces se logra dándose a conocer mejor y ordenando cómo se cobra.', fix: 'ajustes de marca personal, pauta y un orden para agendar y cobrar, sin armar nada innecesario.' },
      bastante: { chip: 'Meta: llenar bastante más su agenda', why: 'llenar la agenda pide más clientes que sí le pidan el servicio y no dejar ir a quienes ya escriben.', fix: 'marca personal y pauta para atraer, más un orden de seguimiento y cobro para cerrar.' },
      duplicar: { chip: 'Meta: hacer crecer mucho su emprendimiento', why: 'es una meta grande, y se construye con una marca personal clara y un sistema que traiga clientes de forma constante.', fix: 'un plan por etapas: darse a conocer, atender, cobrar y hacer que vuelvan, con medición desde el primer día.' },
      sinmeta: { chip: 'Meta por definir', why: 'sin una meta clara es difícil saber si lo que se hace llena la agenda.', fix: 'definirla juntos en la llamada, a partir de su propio emprendimiento.' }
    }
  };
  var R_IDEA = {
    canal: {
      referidos: { chip: 'La idea se mueve por recomendación', why: 'que hablen de su idea es un buen comienzo, pero no basta para validarla ni para conseguir los primeros clientes a voluntad.', fix: 'presencia digital y un mensaje claro, más una pauta pequeña, para que más personas la conozcan y la prueben.' },
      redes: { chip: 'Redes sin pauta', why: 'publicar sin un plan no alcanza para validar la idea ni para llegar a los primeros clientes.', fix: 'un mensaje claro, contenido sencillo y una pauta pequeña dirigida a su zona.' },
      pauta: { chip: 'Ya hace anuncios', why: 'usted ya está buscando sus primeros clientes; ahora el reto es validar qué mensaje sí despierta interés.', fix: 'medir esas primeras conversaciones y tener un camino claro para que le escriban.' },
      google: { chip: 'Lo buscan en Google', why: 'si ya lo buscan, es una señal de interés; falta que encuentren un mensaje claro y una forma de escribirle.', fix: 'una presencia digital simple que explique la idea y lleve a la primera conversación.' },
      local: { chip: 'Se entera quien está cerca', why: 'hoy la idea solo la conoce quien ya está cerca o se la han contado en persona.', fix: 'llevarla a internet con un mensaje claro y una pauta pequeña en su ciudad.' },
      irregular: { chip: 'Todavía no llegan clientes', why: 'es normal al arrancar: aún no hay un canal para validar la idea ni para conseguir los primeros clientes.', fix: 'presencia digital, un mensaje claro y una pauta pequeña, paso a paso.' }
    },
    mensajes: {
      '0-5': { chip: 'Pocas conversaciones todavía', why: 'hoy hay pocas conversaciones, y para una idea que arranca de ahí salen los primeros clientes.', fix: 'primero aparecer en internet y atraer a las primeras personas, y luego organizar cómo se les responde.' },
      '6-20': { chip: 'Entre 6 y 20 mensajes al día', why: 'ya hay interés, y una conversación sin un siguiente paso claro se enfría antes de validar la idea.', fix: 'un orden simple para responder y acompañar a esas primeras personas.' },
      '21-50': { chip: 'Entre 21 y 50 mensajes al día', why: 'si ya le escriben tanto, hay interés; el riesgo es que se enfríen por no alcanzar a responder.', fix: 'ordenar las respuestas; si le sirve, sumar un ' + A + ' para las primeras conversaciones.' },
      '50+': { chip: 'Más de 50 mensajes al día', why: 'hay mucha demanda temprana para atenderla a mano, y parte se puede quedar sin respuesta.', fix: 'un orden de respuesta y, si le sirve, un ' + A + ' que le pase solo a quien está listo para el siguiente paso.' }
    },
    pauta: {
      no: { chip: 'Sin pauta todavía', why: 'sin una pauta pequeña, su idea solo la conoce quien ya se enteró por casualidad.', fix: 'una pauta pequeña en Meta, en su zona, para validar qué mensaje trae las primeras conversaciones.' },
      'sin-medir': { chip: 'Pauta sin medir', why: 'sin medir, no se sabe si la idea está despertando interés o si solo se está gastando.', fix: 'medir cada conversación que llega y ajustar el mensaje con lo que sí funciona.' },
      midiendo: { chip: 'Pauta medida', why: 'medir desde el arranque le permite validar la idea con menos riesgo.', fix: 'seguir con lo que sí trae primeros clientes y pulir el mensaje.' }
    },
    problema: {
      pocos: { chip: 'Aún no hay primeros clientes constantes', why: 'la idea todavía no tiene una presencia digital ni un camino claro para que las primeras personas le escriban.', fix: 'validar la idea con un mensaje claro, aparecer en internet y una pauta pequeña para conseguir los primeros clientes.' },
      responder: { chip: 'No alcanza a responder', why: 'si ya le escriben y no hay una forma de responder a tiempo, se enfría el interés antes de arrancar.', fix: 'un orden básico de respuesta; si le sirve, un ' + A + ' para las primeras conversaciones.' },
      recompra: { chip: 'Aún es pronto para que vuelvan', why: 'el primer paso de una idea es conseguir y atender a las primeras personas; después se arma el camino para que vuelvan.', fix: 'validar, atraer a los primeros clientes y, desde el inicio, dejar una forma simple de seguir en contacto.' },
      nosabe: { chip: 'No sabe qué va a funcionar', why: 'al arrancar es normal no saberlo; sin una prueba clara, se avanza a ciegas.', fix: 'validar la idea con un mensaje, presencia digital y una forma simple de medir las primeras conversaciones.' },
      desorden: { chip: 'Todo está en la cabeza', why: 'al iniciar es fácil que la idea y los primeros contactos vivan en chats sueltos, y se atrasa el arranque.', fix: 'un orden simple para responder y dar el siguiente paso, sin armar procesos de más.' },
      procesos: { chip: 'Todavía no hay procesos', why: 'es normal al iniciar: aún no hay una forma armada de atender, cobrar o darse a conocer.', fix: 'arrancar con lo esencial: mensaje claro, presencia digital y un orden básico para responder, sin complicarse.' },
      margen: { chip: 'Aún es pronto para el margen', why: 'antes de preocuparse por el margen, hace falta validar la idea, fijar cómo cobrar y conseguir las primeras ventas.', fix: 'definir un mensaje y una forma de cobrar clara, y atraer a los primeros clientes para probarlo.' }
    },
    meta: {
      poco: { chip: 'Meta: dar los primeros pasos', why: 'es el punto de partida correcto para una idea: validarla y conseguir las primeras personas.', fix: 'un plan corto de presencia digital, mensaje claro y pauta pequeña, sin armar nada innecesario.' },
      bastante: { chip: 'Meta: ver la idea crecer', why: 'para que crezca de verdad, primero hay que validarla y conseguir los primeros clientes con constancia.', fix: 'presencia digital y pauta para atraer, más un camino claro para que le escriban.' },
      duplicar: { chip: 'Meta: un salto grande desde la idea', why: 'es una meta grande; para una idea que arranca se construye validando, apareciendo en internet y consiguiendo los primeros clientes de forma constante.', fix: 'un plan por etapas: validar, darse a conocer y atender las primeras conversaciones.' },
      sinmeta: { chip: 'Meta por definir', why: 'en una idea que arranca es normal no tenerla aún clara.', fix: 'definirla juntos en la llamada: qué validar primero y cómo conseguir las primeras personas.' }
    }
  };
  var TEXTO_EMP = {
    negocio: function (v) { return { say: 'Mucho gusto con ' + v + '. Vamos a armar esto a la medida de su emprendimiento: más clientes, agenda y un orden para cobrar, no con un paquete genérico.' }; },
    ciudad: function (v) { return { say: 'Perfecto, ' + v + '. Una pauta dirigida solo a su zona ayuda a conseguir clientes cerca y a llenar su agenda.' }; },
    contacto: function (v) { return { say: 'Mucho gusto, ' + v.split(' ')[0] + '. Un par de datos más y le mostramos cómo hacer crecer su emprendimiento.' }; },
    whatsapp: function () { return { say: 'Es para enviarle lo que le preparemos y coordinar su llamada, si usted la pide.' }; },
    redes: function () { return { say: 'Excelente. Con ese enlace vemos cómo se muestra hoy su emprendimiento, y la propuesta sale más a la medida.' }; },
    tipoOtro: function (v) { return { say: 'Perfecto, ' + v + '. Armamos el plan a la medida de su emprendimiento: conseguir más clientes, llenar su agenda, crear su marca personal y organizarse para cobrar, no con un paquete genérico.' }; }
  };
  var TEXTO_IDEA = {
    negocio: function (v) { return { say: 'Mucho gusto con ' + v + '. Vamos a armar esto para ayudarle a arrancar su idea, no con un paquete genérico.' }; },
    ciudad: function (v) { return { say: 'Perfecto, ' + v + '. Una presencia y una pauta en su zona sirven para validar la idea con personas cercanas.' }; },
    contacto: function (v) { return { say: 'Mucho gusto, ' + v.split(' ')[0] + '. Un par de datos más y le mostramos cómo arrancar y validar su idea.' }; },
    whatsapp: function () { return { say: 'Es para enviarle lo que le preparemos y coordinar su llamada, si usted la pide.' }; },
    redes: function () { return { say: 'Excelente. Si ya tiene un enlace, nos ayuda a ver cómo se muestra su idea; si no, el plan empieza por esa presencia.' }; },
    tipoOtro: function (v) { return { say: 'Perfecto, ' + v + '. Armamos el plan para ayudarle a arrancar y validar su idea, conseguir sus primeros clientes y tener presencia digital, no con un paquete genérico.' }; }
  };
  window.EI_RESP = { R: R, R_PROF: R_PROF, R_EMP: R_EMP, R_IDEA: R_IDEA, TEXTO: TEXTO, TEXTO_PROF: TEXTO_PROF, TEXTO_EMP: TEXTO_EMP, TEXTO_IDEA: TEXTO_IDEA };
})();
