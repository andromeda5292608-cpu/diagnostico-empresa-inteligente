'use strict';
// Pruebas del enganche por nicho. Sin dependencias: `node test/nichos.test.js`.
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

// server.js crea DATA_DIR al cargarse: se apunta a una carpeta temporal para no tocar data/.
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ei-test-'));

const { diagnosticar, detectarNicho, perfilDe, NICHOS, TIPOS, PROBLEMAS } = require('../diagnostico');
const { TIPO_NICHO, FAMILIAS } = require('../nichos-datos');
const prof = require('../public/profesional');
const { mensajeGenerador, notaEnvio, notaPropuesta, validar, LARGO_MENSAJE } = require('../server');

let ok = 0;
const fallas = [];
function prueba(nombre, fn) {
  try { fn(); ok++; } catch (e) { fallas.push(nombre + '\n    ' + e.message.split('\n').join('\n    ')); }
}
const otro = (tipoOtro, negocio = 'Mi Negocio') => detectarNicho({ tipo: 'otro', tipoOtro, negocio }).id;

// ---------- 1. Detección ----------
const CASOS_OTRO = [
  ['restaurante', 'restaurante'],
  ['Asadero', 'restaurante'],
  ['pizzería', 'restaurante'],
  ['clínica estética', 'estetica_clinica'],
  ['uñas', 'unas'],
  ['Uñas acrílicas', 'unas'],
  ['Manicure y pedicure', 'unas'],
  ['ferretería', 'ferreteria'],
  ['barbería', 'belleza'],
  ['Barbería y peluquería', 'belleza'],
  ['bar de música en vivo', 'bar'],
  ['España', 'generico'],
  ['espacio de coworking', 'generico'],
  ['clases de español', 'educacion'],
  ['barrio', 'generico'],
  ['barra de jugos', 'generico'],
  ['unas cosas', 'generico'],
  ['vendo unas cosas', 'generico'],
  ['asdfgh', 'generico'],
  ['', 'generico'],
  ['odontóloga independiente', 'odontologia'],
  ['idea de abrir una pizzería', 'restaurante'],
  ['gym', 'gimnasio'],
  ['Gimnasio', 'gimnasio'],
  ['crossfit', 'gimnasio'],
  ['box de entrenamiento', 'gimnasio'],
  ['yoga', 'gimnasio'],
  ['estudio de pilates', 'gimnasio'],
  ['clínica veterinaria', 'veterinaria'],
  ['peluquería canina', 'veterinaria'],
  ['clínica dental', 'odontologia'],
  ['estética', 'belleza'],
  ['medicina estética', 'estetica_clinica'],
  ['dermatología', 'estetica_clinica'],
  ['spa de uñas', 'unas'],
  ['spa y masajes', 'spa'],
  ['restaurante bar', 'restaurante'],
  ['café bar', 'bar'],
  ['cafetería', 'cafe'],
  ['heladería', 'cafe'],
  ['comidas rápidas', 'domicilios'],
  ['panadería', 'domicilios'],
  ['perros calientes', 'domicilios'],
  ['materiales de construcción', 'ferreteria'],
  ['remodelaciones y acabados', 'construccion'],
  ['tienda de ropa', 'moda'],
  ['minimercado', 'comercio'],
  ['droguería', 'comercio'],
  ['reparación de celulares', 'celulares'],
  ['hostal', 'hotel'],
  ['glamping', 'hotel'],
  ['bienes raíces', 'inmobiliaria'],
  ['taller mecánico', 'taller'],
  ['lavadero de carros', 'taller'],
  ['academia de inglés', 'educacion'],
  ['abogado', 'servicios'],
  ['contadora', 'servicios'],
  ['organizador de bodas', 'eventos'],
  ['psicóloga', 'clinica'],
  ['médico general', 'clinica'],
];
for (const [texto, esperado] of CASOS_OTRO) {
  prueba('detección «' + texto + '» → ' + esperado, () => assert.equal(otro(texto), esperado));
}

prueba('«odontóloga independiente» → odontologia + perfil profesional', () => {
  assert.equal(otro('odontóloga independiente'), 'odontologia');
  assert.equal(perfilDe('odontóloga independiente'), 'profesional');
});
prueba('«idea de abrir una pizzería» → restaurante + perfil idea', () => {
  assert.equal(otro('idea de abrir una pizzería'), 'restaurante');
  assert.equal(perfilDe('idea de abrir una pizzería'), 'idea');
});
prueba('tipo restaurante + negocio «Bar La Terraza» → bar', () => {
  assert.equal(detectarNicho({ tipo: 'restaurante', negocio: 'Bar La Terraza' }).id, 'bar');
});
prueba('tipo restaurante + negocio «Restaurante Bar El Patio» → restaurante', () => {
  assert.equal(detectarNicho({ tipo: 'restaurante', negocio: 'Restaurante Bar El Patio' }).id, 'restaurante');
});
prueba('tipo moda + negocio «Bar X» → moda (no cambia de familia)', () => {
  assert.equal(detectarNicho({ tipo: 'moda', negocio: 'Bar X' }).id, 'moda');
});
prueba('tipo comercio + «Ferretería El Tornillo» → ferreteria', () => {
  assert.equal(detectarNicho({ tipo: 'comercio', negocio: 'Ferretería El Tornillo' }).id, 'ferreteria');
});
prueba('tipo comercio + «Pizzería Roma» → comercio', () => {
  assert.equal(detectarNicho({ tipo: 'comercio', negocio: 'Pizzería Roma' }).id, 'comercio');
});
prueba('tipo estetica + «Uñas Divinas» → unas; + «Spa Zen» → spa; + «Clínica Estética Piel» → estetica_clinica', () => {
  assert.equal(detectarNicho({ tipo: 'estetica', negocio: 'Uñas Divinas' }).id, 'unas');
  assert.equal(detectarNicho({ tipo: 'estetica', negocio: 'Spa Zen' }).id, 'spa');
  assert.equal(detectarNicho({ tipo: 'estetica', negocio: 'Clínica Estética Piel' }).id, 'estetica_clinica');
  assert.equal(detectarNicho({ tipo: 'estetica', negocio: 'Salón Glamour' }).id, 'belleza');
});
prueba('tipo clinica + «Dermatología Integral» → estetica_clinica; + «Odontología Sonrisa» → clinica', () => {
  assert.equal(detectarNicho({ tipo: 'clinica', negocio: 'Dermatología Integral' }).id, 'estetica_clinica');
  assert.equal(detectarNicho({ tipo: 'clinica', negocio: 'Odontología Sonrisa' }).id, 'clinica');
});
prueba('tipo otro sin pistas + negocio «Asadero El Paisa» → restaurante', () => {
  assert.equal(detectarNicho({ tipo: 'otro', tipoOtro: 'de todo un poco', negocio: 'Asadero El Paisa' }).id, 'restaurante');
});
prueba('tipo otro: el texto de Otro manda sobre el nombre', () => {
  assert.equal(detectarNicho({ tipo: 'otro', tipoOtro: 'hostal', negocio: 'Bar La Terraza' }).id, 'hotel');
});
prueba('cada tipo del selector tiene nicho por defecto válido (salvo otro)', () => {
  for (const t of Object.keys(TIPOS)) {
    if (t === 'otro') continue;
    assert.ok(TIPO_NICHO[t] && NICHOS[TIPO_NICHO[t]], t);
    assert.equal(detectarNicho({ tipo: t, negocio: 'Nombre Neutro' }).id, TIPO_NICHO[t]);
  }
  for (const [t, fam] of Object.entries(FAMILIAS)) assert.ok(fam.includes(TIPO_NICHO[t]), t);
});
prueba('hay 24 nichos con los ids del .md', () => {
  const ids = ['restaurante', 'bar', 'cafe', 'domicilios', 'clinica', 'odontologia', 'estetica_clinica', 'belleza', 'unas', 'spa', 'gimnasio', 'moda', 'ferreteria', 'comercio', 'celulares', 'hotel', 'inmobiliaria', 'taller', 'veterinaria', 'educacion', 'servicios', 'construccion', 'eventos', 'generico'];
  assert.deepEqual(Object.keys(NICHOS).sort(), ids.sort());
  for (const id of ['clinica', 'odontologia', 'estetica_clinica', 'spa', 'veterinaria']) assert.equal(NICHOS[id].salud, true, id);
});

// profesional.js: «unas cosas» ya no es emprendedor; «uñas» sí; los demás stems siguen.
prueba('profesional.js: uñas/unas', () => {
  assert.equal(prof.normalizar('Uñas'), 'unyas');
  assert.equal(prof.normalizar('pezuñas'), 'pezunas');
  assert.equal(prof.perfilDe('unas cosas'), '');
  assert.equal(prof.perfilDe('vendo unas cosas'), '');
  assert.equal(prof.perfilDe('uñas a domicilio'), 'emprendedor');
  assert.equal(prof.perfilDe('uñas'), 'emprendedor');
  assert.equal(prof.perfilDe('extensiones de pestañas'), 'emprendedor');
  assert.equal(prof.perfilDe('diseñadora gráfica'), 'profesional');
  assert.equal(prof.perfilDe('psicóloga'), 'profesional');
  assert.equal(prof.perfilDe('tengo una idea de negocio'), 'idea');
  assert.equal(prof.perfilDe('manicurista'), 'emprendedor');
});

// ---------- 2. diagnosticar(): reglas de copy ----------
const PROHIBIDO = [/\bbot\b/i, /garantiz/i, /sin dolor/i, /sin riesgo/i, /\d+\s*%/, /\bel mejor\b|\bla mejor\b/i, /\d/];
const TUTEO = [/(^|[\s¿¡«(])tus?(?=[\s,.;:!?»)])/i, /\bpuedes\b/i, /\btienes\b/i, /\bquieres\b/i, /\bte\b/i];
const CODIGOS = Object.keys(PROBLEMAS);
const SEIS = ['pocos', 'responder', 'recompra', 'nosabe', 'margen', 'procesos'];
const NOMBRE_80 = 'Restaurante y Parrilla Los Grandes Sabores de la Abuela Rosa en el Parque Principal'.slice(0, 80);
assert.equal(NOMBRE_80.length, 80);

function revisar(r, ctx) {
  assert.equal(r.lineas.length, 3, ctx + ': 3 líneas');
  r.lineas.forEach((l, i) => {
    assert.ok(typeof l === 'string' && l.trim().length > 20, ctx + ': línea ' + (i + 1) + ' vacía');
    for (const re of PROHIBIDO) assert.ok(!re.test(l), ctx + ': línea ' + (i + 1) + ' contiene ' + re + ' → ' + l);
    for (const re of TUTEO) assert.ok(!re.test(l), ctx + ': línea ' + (i + 1) + ' tutea ' + re + ' → ' + l);
  });
  assert.ok(r.lineas[0].length <= 330, ctx + ': línea 1 mide ' + r.lineas[0].length);
  assert.ok(r.lineas[1].length <= 260, ctx + ': línea 2 mide ' + r.lineas[1].length);
  assert.ok(/propuesta/.test(r.lineas[2]), ctx + ': línea 3 sin «propuesta»');
  assert.ok(/\b(usted|su|sus|le)\b/i.test(r.lineas.join(' ')), ctx + ': no habla de usted');
  assert.ok(r.nicho && NICHOS[r.nicho.id], ctx + ': sin nicho');
}

// Un caso por nicho: con tipo del selector cuando existe, si no por «Otro».
const CASO_NICHO = {
  restaurante: { tipo: 'restaurante' }, bar: { tipo: 'restaurante', negocio: 'Bar La Terraza' }, cafe: { tipo: 'restaurante', negocio: 'Café del Parque' },
  domicilios: { tipo: 'domicilios' }, clinica: { tipo: 'clinica' }, odontologia: { tipo: 'odontologia' },
  estetica_clinica: { tipo: 'otro', tipoOtro: 'clínica estética' }, belleza: { tipo: 'estetica' }, unas: { tipo: 'otro', tipoOtro: 'uñas' },
  spa: { tipo: 'estetica', negocio: 'Spa Zen' }, gimnasio: { tipo: 'gimnasio' }, moda: { tipo: 'moda' },
  ferreteria: { tipo: 'comercio', negocio: 'Ferretería El Tornillo' }, comercio: { tipo: 'comercio' }, celulares: { tipo: 'celulares' },
  hotel: { tipo: 'hotel' }, inmobiliaria: { tipo: 'inmobiliaria' }, taller: { tipo: 'taller' }, veterinaria: { tipo: 'veterinaria' },
  educacion: { tipo: 'educacion' }, servicios: { tipo: 'servicios' }, construccion: { tipo: 'construccion' }, eventos: { tipo: 'eventos' },
  generico: { tipo: 'otro', tipoOtro: 'asdfgh' },
};
prueba('hay un caso de prueba por cada nicho', () => assert.deepEqual(Object.keys(CASO_NICHO).sort(), Object.keys(NICHOS).sort()));

for (const [id, caso] of Object.entries(CASO_NICHO)) {
  const base = { negocio: 'Nombre Neutro', ciudad: 'Medellín', ...caso };
  prueba('diagnosticar ' + id + ' detecta su nicho', () => assert.equal(diagnosticar({ ...base, problemas: ['pocos'] }).nicho.id, id));
  for (const c of CODIGOS) {
    prueba('diagnosticar ' + id + ' × ' + c, () => revisar(diagnosticar({ ...base, problemas: [c] }), id + '×' + c));
  }
  prueba('diagnosticar ' + id + ' × los 6 + nombre de 80', () => {
    revisar(diagnosticar({ ...base, problemas: SEIS }), id + '×6');
    revisar(diagnosticar({ ...base, negocio: NOMBRE_80, problemas: SEIS }), id + '×6×80');
    revisar(diagnosticar({ ...base, negocio: NOMBRE_80, problemas: CODIGOS }), id + '×7×80');
  });
}

// Perfiles combinados con nicho.
const PERFILES = [
  ['odontóloga independiente', 'profesional', 'odontologia'],
  ['manicurista a domicilio', 'emprendedor', 'unas'],
  ['idea de abrir una pizzería', 'idea', 'restaurante'],
  ['abogado', 'profesional', 'servicios'],
  ['psicóloga', 'profesional', 'clinica'],
];
for (const [texto, perfil, nicho] of PERFILES) {
  for (const c of CODIGOS) {
    prueba('perfil «' + texto + '» × ' + c, () => {
      const r = diagnosticar({ tipo: 'otro', tipoOtro: texto, negocio: NOMBRE_80, problemas: [c] });
      assert.equal(r.perfilCliente, perfil);
      assert.equal(r.nicho.id, nicho);
      revisar(r, texto + '×' + c);
      assert.ok(!/su negocio/.test(r.lineas.join(' ')), 'no debe decir «su negocio»: ' + r.lineas.join(' | '));
    });
  }
}
prueba('idea + nicho conserva espejo y propuesta de idea; la línea 2 es del nicho', () => {
  const r = diagnosticar({ tipo: 'otro', tipoOtro: 'idea de abrir una pizzería', negocio: 'Pizza Ya', problemas: ['pocos'] });
  assert.match(r.lineas[0], /primeros clientes/);
  assert.match(r.lineas[1], /reserv/);
  assert.match(r.lineas[2], /para arrancar/);
  assert.equal(r.titulo, 'Lo que vemos en su idea');
});
prueba('profesional + nicho: línea 2 y meta del nicho, propuesta para su práctica', () => {
  const r = diagnosticar({ tipo: 'otro', tipoOtro: 'odontóloga independiente', negocio: 'Dra. Ana', problemas: ['pocos'] });
  assert.match(r.lineas[1], /odontología/);
  assert.match(r.lineas[2], /su práctica, pensada para .*valoración/);
});

// Genérico: igual que antes (perfiles sin nicho incluidos).
prueba('generico sin perfil usa el texto de siempre', () => {
  const r = diagnosticar({ tipo: 'otro', tipoOtro: 'asdfgh', negocio: 'X', problemas: ['pocos'] });
  assert.deepEqual(r.lineas, [
    'Hoy le llegan pocos clientes nuevos, y eso se siente en las ventas.',
    'Cuando un cliente nuevo no entiende rápido qué ofrece y cómo comprarle, se va con quien se lo explica mejor, y esa venta no vuelve.',
    'Por eso le armamos una propuesta concreta para X: qué haríamos, en qué orden y cuánto es la inversión, en una sola página. Mientras todo siga igual, esas ventas se las sigue llevando otro.',
  ]);
});
prueba('generico con perfil emprendedor conserva su texto', () => {
  const r = diagnosticar({ tipo: 'otro', tipoOtro: 'emprendimiento independiente', negocio: 'X', problemas: ['pocos'] });
  assert.equal(r.nicho.id, 'generico');
  assert.match(r.lineas[1], /^En un emprendimiento/);
});
prueba('con más de 3 extras se resume la línea 1', () => {
  const r = diagnosticar({ tipo: 'restaurante', negocio: 'X', problemas: SEIS });
  assert.match(r.lineas[0], /A eso se suma que .*entre otros temas\.$/);
});

// ---------- 3. Variación entre nichos ----------
prueba('las 3 líneas cambian entre restaurante, clínica y uñas', () => {
  for (const c of CODIGOS) {
    const a = diagnosticar({ tipo: 'restaurante', negocio: 'N', problemas: [c] }).lineas;
    const b = diagnosticar({ tipo: 'clinica', negocio: 'N', problemas: [c] }).lineas;
    const u = diagnosticar({ tipo: 'otro', tipoOtro: 'uñas', negocio: 'N', problemas: [c] }).lineas;
    for (let i = 0; i < 3; i++) {
      assert.notEqual(a[i], b[i], c + ' línea ' + (i + 1) + ' rest=clin');
      assert.notEqual(a[i], u[i], c + ' línea ' + (i + 1) + ' rest=uñas');
      assert.notEqual(b[i], u[i], c + ' línea ' + (i + 1) + ' clin=uñas');
    }
  }
});
prueba('ejemplo restaurante × pocos habla de mesas, reservas y música en vivo', () => {
  const l = diagnosticar({ tipo: 'restaurante', negocio: 'La Brasa', problemas: ['pocos'] }).lineas;
  assert.match(l[0], /mesas/); assert.match(l[0], /reservas/); assert.match(l[0], /música en vivo/);
  assert.match(l[1], /video/); assert.match(l[1], /asistente de WhatsApp/);
  assert.match(l[2], /llenar más mesas/);
});
prueba('salud: sin promesas de resultado ni diagnósticos', () => {
  for (const id of Object.keys(NICHOS).filter((k) => NICHOS[k].salud)) {
    for (const c of CODIGOS) {
      const t = diagnosticar({ ...CASO_NICHO[id], negocio: 'N', problemas: [c] }).lineas.join(' ');
      assert.ok(!/\bcura|elimina|antes y después|resultados (reales|seguros)/i.test(t), id + ': ' + t);
    }
  }
});

// ---------- 4. Mensaje para el Generador ----------
function peorCaso(tipo, tipoOtro) {
  const largo = (s, n) => (s.repeat(20)).slice(0, n);
  return {
    negocio: NOMBRE_80, tipo, tipoOtro: tipoOtro ? (tipoOtro + ' ' + largo('x', 80)).slice(0, 80) : '',
    contacto: largo('María Fernanda Rodríguez Gutiérrez ', 80), ciudad: largo('San José de los Campanos ', 60),
    whatsapp: '3001234567', problemas_cod: SEIS, problemas: SEIS.map((c) => PROBLEMAS[c]),
  };
}
for (const [tipo, tipoOtro] of [['restaurante'], ['clinica'], ['otro', 'odontóloga independiente'], ['otro', 'idea de abrir una pizzería'], ['otro', 'asdfgh'], ['servicios'], ['inmobiliaria'], ['estetica']]) {
  prueba('mensajeGenerador peor caso ' + tipo + ' ' + (tipoOtro || ''), () => {
    const r = peorCaso(tipo, tipoOtro);
    for (const regs of [r, { ...r, problemas_cod: CODIGOS, problemas: CODIGOS.map((c) => PROBLEMAS[c]) }]) {
      const m = mensajeGenerador(regs);
      assert.ok(m.length <= LARGO_MENSAJE && LARGO_MENSAJE === 1600, 'mide ' + m.length);
      for (const s of ['Haz la propuesta de ' + NOMBRE_80, 'Nicho:', 'Tipo de negocio:', 'Pedido:', 'Contacto: ', 'WhatsApp del cliente: +57 3001234567', 'Enganche mostrado: ']) assert.ok(m.includes(s), 'falta ' + s);
    }
  });
}
prueba('mensajeGenerador recorta el enganche si se pasa (forzado)', () => {
  const r = peorCaso('restaurante');
  r.negocio = 'N'.repeat(80); r.contacto = 'C'.repeat(850); // fuera de lo que deja validar(), solo para forzar el recorte
  const m = mensajeGenerador(r);
  assert.ok(m.length <= 1600, 'mide ' + m.length);
  assert.match(m, /Enganche mostrado: .*…/);
  assert.match(m, /Pedido: propuesta PDF por WhatsApp$/);
});
prueba('mensajeGenerador: Nicho general y nombre del nicho', () => {
  assert.match(mensajeGenerador({ negocio: 'X', tipo: 'otro', tipoOtro: 'asdfgh', problemas_cod: ['pocos'] }), /\nNicho: general\n/);
  const m = mensajeGenerador({ negocio: 'Bar La Terraza', tipo: 'restaurante', problemas_cod: ['pocos'] });
  assert.match(m, /Tipo de negocio: Restaurante, bar o café\nNicho: Bar o música en vivo\n/);
});
prueba('notaEnvio y notaPropuesta llevan Nicho', () => {
  const r = { ...peorCaso('clinica'), fecha: '2026-11-15' };
  assert.match(notaEnvio(r, diagnosticar(r)), /\nNicho: Clínica o consultorio\n/);
  assert.match(notaPropuesta({ ...r, nicho: 'clinica' }), /\nNicho: Clínica o consultorio\n/);
});
prueba('validar acepta los tipos nuevos y los viejos', () => {
  for (const t of Object.keys(TIPOS)) {
    assert.ok(t.length <= 20, t);
    const { errores } = validar({ negocio: 'Neg', tipo: t, tipoOtro: t === 'otro' ? 'algo' : '', ciudad: 'Cali', contacto: 'Ana', whatsapp: '3001234567', problemas: ['pocos'] });
    assert.deepEqual(errores, {}, t);
  }
  assert.ok(validar({ tipo: 'inventado' }).errores.tipo);
});

// ---------- 5. Registros viejos ----------
prueba('registros viejos siguen funcionando', () => {
  const viejos = [
    { tipo: 'estetica', problema: 'pocos', negocio: 'Estética Luz' },
    { tipo: 'celulares', problema: 'responder', negocio: 'Cel Store' },
    { tipo: 'restaurante', problema: 'recompra', negocio: 'Sabor' },
    { tipo: 'otro', tipoOtro: 'consultoría', problema: 'margen', negocio: 'Acme' },
    { tipo: 'otro', tipoOtro: 'algo raro', problema: 'desorden', negocio: 'Acme' },
    { tipo: 'estetica', problema: 'pocos,margen', negocio: 'Estética Luz' },
  ];
  for (const v of viejos) {
    const r = diagnosticar(v);
    revisar(r, JSON.stringify(v));
    assert.ok(mensajeGenerador({ ...v, whatsapp: '3001234567' }).includes('Nicho:'));
  }
  assert.equal(diagnosticar({ tipo: 'estetica', problema: 'pocos', negocio: 'X' }).nicho.id, 'belleza');
  assert.equal(diagnosticar({ tipo: 'celulares', problema: 'pocos', negocio: 'X' }).nicho.id, 'celulares');
});
prueba('nicho guardado en el registro se respeta; inválido se recalcula', () => {
  assert.equal(diagnosticar({ tipo: 'otro', tipoOtro: 'asdfgh', negocio: 'X', nicho: 'hotel', problema: 'pocos' }).nicho.id, 'hotel');
  assert.equal(diagnosticar({ tipo: 'restaurante', negocio: 'X', nicho: 'nada', problema: 'pocos' }).nicho.id, 'restaurante');
});

// ---------- Resultado ----------
fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
if (fallas.length) {
  console.error(fallas.length + ' prueba(s) fallaron:\n- ' + fallas.join('\n- '));
  console.error(ok + ' pasaron.');
  process.exit(1);
}
console.log('OK: ' + ok + ' pruebas pasaron.');
