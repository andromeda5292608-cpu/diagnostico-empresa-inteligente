(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var form = $('#form'), paso = 1, TOTAL = 3, id = null, snap = null;
  var titulos = ['Su negocio', 'Su contacto', 'Sus ventas'];

  function mostrarPaso() {
    document.querySelectorAll('fieldset[data-paso]').forEach(function (f) { f.hidden = +f.dataset.paso !== paso; });
    document.querySelectorAll('.steps i').forEach(function (e, i) { e.className = i < paso ? 'on' : ''; });
    $('#paso-txt').textContent = 'Paso ' + paso + ' de ' + TOTAL + ' · ' + titulos[paso - 1];
    $('#atras').hidden = paso === 1;
    $('#siguiente').textContent = paso === TOTAL ? 'Ver mi diagnóstico' : 'Siguiente';
    $('#legal').hidden = paso !== TOTAL;
    $('#msg-form').textContent = '';
  }
  function limpiarErr() { document.querySelectorAll('[data-err]').forEach(function (e) { e.textContent = ''; }); }
  function validarPaso() {
    limpiarErr();
    var ok = true, primero = null;
    document.querySelectorAll('fieldset[data-paso="' + paso + '"] [required]').forEach(function (el) {
      var v = el.value.trim(), err = $('[data-err="' + el.name + '"]'), m = '';
      if (!v) m = el.tagName === 'SELECT' ? 'Elija una opción.' : 'Complete este campo.';
      else if (el.name === 'whatsapp') {
        var d = v.replace(/\D/g, ''); if (d.length === 12 && d.indexOf('57') === 0) d = d.slice(2);
        if (!/^3\d{9}$/.test(d)) m = 'Escriba un WhatsApp válido de 10 dígitos (ej. 3001234567).';
      }
      if (m) { ok = false; if (err) err.textContent = m; if (!primero) primero = el; }
    });
    if (primero) primero.focus();
    return ok;
  }
  function datos() {
    var o = {}; new FormData(form).forEach(function (v, k) { o[k] = v; }); return o;
  }
  function li(html) { var e = document.createElement('li'); e.innerHTML = html; return e; }
  function t(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }

  function pintar(d) {
    $('#r-fecha').textContent = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' });
    $('#r-negocio').textContent = d.negocio + ' · ' + d.tipo + ' · ' + d.ciudad;
    var ap = $('#r-apertura');
    if (ap) ap.textContent = d.apertura || '';
    $('#r-nivel').textContent = d.nivel; $('#r-nivel-txt').textContent = d.nivelTxt;
    var p = $('#r-perfil'); p.innerHTML = '';
    Object.keys(d.perfil).forEach(function (k) { var x = document.createElement('div'); x.innerHTML = '<dt>' + t(k) + '</dt><dd>' + t(d.perfil[k]) + '</dd>'; p.appendChild(x); });
    var ul = $('#r-problemas'); ul.innerHTML = '';
    d.problemas.forEach(function (x) { ul.appendChild(li('<b>' + t(x.titulo) + '</b><span>' + t(x.detalle) + '</span>')); });
    [['#r-ganar', d.ganancia || []], ['#r-oport', d.oportunidades], ['#r-costo', d.costo], ['#r-sig', d.siguientes]].forEach(function (a) {
      var el = $(a[0]); if (!el) return; el.innerHTML = ''; (a[1] || []).forEach(function (s) { el.appendChild(li(t(s))); });
    });
  }
  function irResultado() {
    $('#vista-form').hidden = true; $('#vista-resultado').hidden = false; window.scrollTo(0, 0);
  }

  $('#atras').addEventListener('click', function () { if (paso > 1) { paso--; mostrarPaso(); } });
  $('#siguiente').addEventListener('click', async function () {
    if (!validarPaso()) return;
    if (paso < TOTAL) { paso++; mostrarPaso(); window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' }); return; }
    var btn = this; btn.disabled = true; btn.textContent = 'Preparando su diagnóstico…';
    try {
      var r = await fetch('/api/diagnostico', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos()) });
      var j = await r.json();
      if (!r.ok || !j.ok) {
        if (j.errores) {
          Object.keys(j.errores).forEach(function (k) { var e = $('[data-err="' + k + '"]'); if (e) e.textContent = j.errores[k]; });
          var f = Object.keys(j.errores)[0], el = form.elements[f];
          if (el) { var fs = el.closest('fieldset'); if (fs) { paso = +fs.dataset.paso; mostrarPaso(); } }
          $('#msg-form').textContent = 'Revise los campos marcados.';
        } else $('#msg-form').textContent = j.error || 'No pudimos procesar su envío. Intente de nuevo.';
        btn.disabled = false; btn.textContent = 'Ver mi diagnóstico'; return;
      }
      if (!j.diagnostico) { $('#msg-form').textContent = 'No pudimos procesar su envío.'; btn.disabled = false; return; }
      id = j.id; var dd = datos(); snap = { negocio: dd.negocio, contacto: dd.contacto, whatsapp: dd.whatsapp, ciudad: dd.ciudad };
      pintar(j.diagnostico); irResultado();
    } catch (e) {
      $('#msg-form').textContent = 'Sin conexión o el servidor está despertando. Intente de nuevo en unos segundos.';
      btn.disabled = false; btn.textContent = 'Ver mi diagnóstico';
    }
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); $('#siguiente').click(); } });
  $('#imprimir').addEventListener('click', function () { window.print(); });

  var fp = $('#form-prop');
  fp.addEventListener('submit', async function (e) {
    e.preventDefault();
    var m = $('#msg-prop'); m.textContent = '';
    var o = {}; new FormData(fp).forEach(function (v, k) { o[k] = v; });
    if (!o.dia || !o.franja) { m.textContent = 'Elija el día y la franja para la llamada.'; return; }
    o.id = id; Object.assign(o, snap || {});
    var b = $('#btn-prop'); b.disabled = true; b.textContent = 'Enviando…';
    try {
      var r = await fetch('/api/propuesta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
      var j = await r.json();
      if (!r.ok || !j.ok) { m.textContent = j.error || 'No pudimos enviar su solicitud.'; b.disabled = false; b.textContent = 'Quiero mi propuesta'; return; }
      fp.hidden = true; $('#ok-prop').hidden = false;
    } catch (err) { m.textContent = 'Sin conexión. Intente de nuevo.'; b.disabled = false; b.textContent = 'Quiero mi propuesta'; }
  });
  mostrarPaso();
})();
