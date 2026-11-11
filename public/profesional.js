'use strict';
// Detecta el perfil a partir del texto de «Otro»: profesional, emprendedor o idea.
// Una sola fuente, usable en el servidor (CommonJS) y en el navegador.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EI_PROF = factory();
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this, function () {
  var PROF_STEMS = [
    'psicolog', 'abogad', 'coach', 'contador', 'contadur', 'terapeut',
    'nutricion', 'fisioterap', 'odont', 'arquitect', 'disenador', 'disenadora',
    'fotograf', 'consultor', 'asesor', 'profesor', 'profesora', 'tutor', 'tutora',
  ];
  var PROF_PALABRAS = /\b(medico|medica|doctora?|dra?)\b/;
  var SALUD = /psicolog|terapeut|nutricion|fisioterap|\b(medico|medica|doctora?|dra?)\b|odont/;
  var IDEA_RE = /\b(idea|ideas)\b|por iniciar|por arrancar|quiero emprender|quiero montar|quiero empezar|quiero arrancar|quiero poner|quiero iniciar|todavia no (empiezo|inicio|he empezado|he iniciado)|aun no (empiezo|inicio|he empezado|he iniciado)|no he (empezado|iniciado|arrancado)|solo una idea|tengo una idea|es una idea|aun no existe|todavia no existe/;
  var EMP_STEMS = [
    'emprendimiento', 'emprendedor', 'emprendedora', 'independiente', 'freelance',
    'manicur', 'pedicur', 'maquillaj', 'pestan', 'artesani', 'catalogo',
    'reposter', 'confeccion',
  ];
  var EMP_RE = /\ba domicilio\b|\bsin marca\b|por mi cuenta|cuenta propia|\bunas\b|\bcejas\b/;

  function normalizar(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function tieneStems(t, stems) {
    for (var i = 0; i < stems.length; i++) {
      if (t.indexOf(stems[i]) !== -1) return true;
    }
    return false;
  }

  function esIdea(texto) {
    return IDEA_RE.test(normalizar(texto));
  }

  function esProfesional(texto) {
    var t = normalizar(texto);
    if (!t) return false;
    return tieneStems(t, PROF_STEMS) || PROF_PALABRAS.test(t);
  }

  function esEmprendedor(texto) {
    var t = normalizar(texto);
    if (!t) return false;
    return tieneStems(t, EMP_STEMS) || EMP_RE.test(t);
  }

  function esSaludEtica(texto) {
    return SALUD.test(normalizar(texto));
  }

  // Prioridad: idea (aún no arranca) → profesión → emprendimiento independiente.
  function perfilDe(texto) {
    if (esIdea(texto)) return 'idea';
    if (esProfesional(texto)) return 'profesional';
    if (esEmprendedor(texto)) return 'emprendedor';
    return '';
  }

  function etiquetaPerfil(texto) {
    var p = perfilDe(texto);
    if (p === 'profesional') return 'Profesión: ';
    if (p === 'emprendedor') return 'Emprendimiento: ';
    if (p === 'idea') return 'Idea: ';
    return 'Otro: ';
  }

  function notaPerfil(texto) {
    var p = perfilDe(texto);
    if (p === 'profesional') return 'Perfil: profesional independiente';
    if (p === 'emprendedor') return 'Perfil: emprendedor independiente';
    if (p === 'idea') return 'Perfil: idea por iniciar';
    return '';
  }

  return {
    normalizar: normalizar,
    perfilDe: perfilDe,
    esProfesional: esProfesional,
    esEmprendedor: esEmprendedor,
    esIdea: esIdea,
    esSaludEtica: esSaludEtica,
    etiquetaPerfil: etiquetaPerfil,
    notaPerfil: notaPerfil,
  };
});
