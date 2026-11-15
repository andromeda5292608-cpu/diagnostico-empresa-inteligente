(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var form = $('#form'), paso = 1, TOTAL = 2, id = null, snap = null;
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function valor(n) {
    var el = form.elements[n];
    if (!el) return '';
    return String(el.value || '').trim(); // RadioNodeList.value devuelve la opción marcada
  }
  function mostrarPaso() {
    document.querySelectorAll('fieldset[data-paso]').forEach(function (f) { f.hidden = +f.dataset.paso !== paso; });
    $('#paso-txt').textContent = 'Paso ' + paso + ' de ' + TOTAL;
    $('#prog-bar').style.width = (paso * 100 / TOTAL) + '%';
    $('#atras').hidden = paso === 1;
    $('#siguiente').textContent = paso === TOTAL ? 'Ver mi diagnóstico' : 'Siguiente';
    $('#legal').hidden = paso !== TOTAL;
    $('#msg-form').textContent = '';
  }
  function mostrarTipoOtro(si) {
    var lab = $('#lab-tipo-otro'), inp = form.elements.tipoOtro;
    var ya = !lab.hidden;
    lab.hidden = !si; inp.required = si;
    if (!si) { inp.value = ''; lab.classList.remove('entra'); return; }
    if (!ya) { if (!reducir) lab.classList.add('entra'); inp.focus(); }
  }
  form.addEventListener('change', function (e) {
    var n = e.target.name;
    if (n === 'tipo') mostrarTipoOtro(valor('tipo') === 'otro');
    var err = $('[data-err="' + n + '"]'); if (err && valor(n)) err.textContent = '';
  });
  form.addEventListener('input', function (e) {
    var err = e.target.name && $('[data-err="' + e.target.name + '"]');
    if (err && valor(e.target.name)) err.textContent = '';
  });

  function validarPaso() {
    document.querySelectorAll('[data-err]').forEach(function (e) { e.textContent = ''; });
    var ok = true, primero = null, vistos = {};
    document.querySelectorAll('fieldset[data-paso="' + paso + '"] [required]').forEach(function (el) {
      if (vistos[el.name]) return; vistos[el.name] = 1;
      var v = valor(el.name), err = $('[data-err="' + el.name + '"]'), m = '';
      if (!v) m = el.type === 'radio' ? 'Elija la opción que más se parezca.' : el.tagName === 'SELECT' ? 'Elija una opción.' : 'Complete este campo.';
      else if (el.name === 'whatsapp') {
        var d = v.replace(/\D/g, ''); if (d.length === 12 && d.indexOf('57') === 0) d = d.slice(2);
        if (!/^3\d{9}$/.test(d)) m = 'Escriba un WhatsApp válido de 10 dígitos (ej. 3001234567).';
      }
      if (m) { ok = false; if (err) err.textContent = m; if (!primero) primero = el; }
    });
    if (primero) primero.focus();
    return ok;
  }
  function datos() { var o = {}; new FormData(form).forEach(function (v, k) { o[k] = v; }); return o; }

  function pintar(d) {
    $('#r-titulo').textContent = d.titulo || 'Lo que vemos en su negocio';
    var l = d.lineas || [];
    ['#r-l1', '#r-l2', '#r-l3'].forEach(function (s, i) { var el = $(s); el.textContent = l[i] || ''; el.hidden = !l[i]; });
  }
  function irResultado() {
    $('#vista-form').hidden = true; $('#vista-resultado').hidden = false; window.scrollTo(0, 0);
  }

  $('#atras').addEventListener('click', function () { if (paso > 1) { paso--; mostrarPaso(); } });
  $('#siguiente').addEventListener('click', async function () {
    if (!validarPaso()) return;
    if (paso < TOTAL) {
      paso++; mostrarPaso();
      window.scrollTo({ top: form.offsetTop - 80, behavior: reducir ? 'auto' : 'smooth' });
      var f = form.elements.negocio; if (f) f.focus({ preventScroll: true });
      return;
    }
    var btn = this; btn.disabled = true; btn.textContent = 'Preparando…';
    var carga = $('#carga'), t0 = Date.now();
    carga.hidden = false;
    function fallo(msg) { carga.hidden = true; $('#msg-form').textContent = msg; btn.disabled = false; btn.textContent = 'Ver mi diagnóstico'; }
    try {
      var r = await fetch('/api/diagnostico', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos()) });
      var j = await r.json();
      if (!r.ok || !j.ok) {
        if (j.errores) {
          Object.keys(j.errores).forEach(function (k) { var e = $('[data-err="' + k + '"]'); if (e) e.textContent = j.errores[k]; });
          var el = form.elements[Object.keys(j.errores)[0]];
          var fs = el && (el.closest ? el.closest('fieldset') : el[0] && el[0].closest('fieldset'));
          if (fs) { paso = +fs.dataset.paso; mostrarPaso(); }
          return fallo('Revise los campos marcados.');
        }
        return fallo(j.error || 'No pudimos procesar su envío. Intente de nuevo.');
      }
      if (!j.diagnostico) return fallo('No pudimos procesar su envío.');
      var resta = (reducir ? 0 : 900) - (Date.now() - t0); if (resta > 0) await new Promise(function (ok) { setTimeout(ok, resta); });
      carga.hidden = true;
      id = j.id; var dd = datos(); snap = { negocio: dd.negocio, contacto: dd.contacto, whatsapp: dd.whatsapp, ciudad: dd.ciudad };
      pintar(j.diagnostico); irResultado();
    } catch (e) {
      fallo('Sin conexión o el servidor está despertando. Intente de nuevo en unos segundos.');
    }
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'radio') { e.preventDefault(); $('#siguiente').click(); } });

  var fp = $('#form-prop');
  fp.addEventListener('submit', async function (e) {
    e.preventDefault();
    var m = $('#msg-prop'), b = $('#btn-prop'), txt = b.textContent; m.textContent = '';
    var o = {}; new FormData(fp).forEach(function (v, k) { o[k] = v; });
    o.id = id; Object.assign(o, snap || {});
    b.disabled = true; b.textContent = 'Enviando…';
    try {
      var r = await fetch('/api/propuesta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
      var j = await r.json();
      if (!r.ok || !j.ok) { m.textContent = j.error || 'No pudimos enviar su solicitud.'; b.disabled = false; b.textContent = txt; return; }
      fp.hidden = true; var ok = $('#ok-prop'); ok.hidden = false; ok.focus();
    } catch (err) { m.textContent = 'Sin conexión. Intente de nuevo.'; b.disabled = false; b.textContent = txt; }
  });
  mostrarPaso();
})();
