'use strict';
// Detección de profesionales independientes a partir del texto de «Otro».
// Una sola fuente, usable en el servidor (CommonJS) y en el navegador.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EI_PROF = factory();
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this, function () {
  var STEMS = [
    'psicolog', 'abogad', 'coach', 'contador', 'contadur', 'terapeut',
    'nutricion', 'fisioterap', 'odont', 'arquitect', 'disenador', 'disenadora',
    'fotograf', 'independiente', 'freelance', 'consultor', 'asesor',
    'profesor', 'profesora', 'tutor', 'tutora',
  ];
  var PALABRAS = /\b(medico|medica|doctora?|dra?)\b/;
  var SALUD = /psicolog|terapeut|nutricion|fisioterap|\b(medico|medica|doctora?|dra?)\b|odont/;

  function normalizar(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function esProfesional(texto) {
    var t = normalizar(texto);
    if (!t) return false;
    for (var i = 0; i < STEMS.length; i++) {
      if (t.indexOf(STEMS[i]) !== -1) return true;
    }
    return PALABRAS.test(t);
  }

  function esSaludEtica(texto) {
    return SALUD.test(normalizar(texto));
  }

  return { normalizar: normalizar, esProfesional: esProfesional, esSaludEtica: esSaludEtica };
});
