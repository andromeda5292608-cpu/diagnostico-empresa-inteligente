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
  // --- Avance, "lo que ya sabemos" y micro-respuestas ---
  var REQ = ['negocio', 'tipo', 'ciudad', 'contacto', 'whatsapp', 'canal', 'mensajes', 'pauta', 'problema', 'meta'];
  var RM = (window.EI_RESP && window.EI_RESP.R) || {}, TX = (window.EI_RESP && window.EI_RESP.TEXTO) || {};
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tokens = {};
  function valor(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function camposReq() {
    var list = REQ.slice();
    if (valor('tipo') === 'otro') list.push('tipoOtro');
    return list;
  }
  function actualizarAvance() {
    var req = camposReq(), n = req.filter(function (k) { return valor(k); }).length, pct = Math.round(n * 100 / req.length);
    $('#prog-bar').style.width = pct + '%'; $('#prog-pct').textContent = pct + ' %';
    $('.prog').setAttribute('aria-valuenow', pct);
  }
  function mostrarTipoOtro(si) {
    var lab = $('#lab-tipo-otro'), inp = form.elements.tipoOtro;
    if (!lab || !inp) return;
    if (si) {
      var ya = !lab.hidden;
      lab.hidden = false;
      inp.required = true;
      lab.classList.remove('entra');
      void lab.offsetWidth;
      if (!reducir) lab.classList.add('entra');
      if (!ya) inp.focus();
    } else {
      lab.hidden = true;
      lab.classList.remove('entra');
      inp.required = false;
      inp.value = '';
      quitarRespuesta('tipoOtro');
    }
  }
  function chip(n, texto) {
    var box = $('#chips'), c = box.querySelector('[data-c="' + n + '"]');
    if (!texto) { if (c) c.remove(); $('#sabemos').hidden = !box.children.length; return; }
    if (!c) { c = document.createElement('span'); c.dataset.c = n; box.appendChild(c); }
    c.textContent = texto; c.className = 'chip'; void c.offsetWidth; c.className = 'chip nuevo';
    $('#sabemos').hidden = false;
  }
  function quitarRespuesta(n) { var r = form.querySelector('.reply[data-r="' + n + '"]'); if (r) r.remove(); }
  function responder(n, contenido) {
    tokens[n] = (tokens[n] || 0) + 1; var tk = tokens[n];
    var lab = form.elements[n].closest('label'); if (!lab) return;
    quitarRespuesta(n);
    if (!contenido) return;
    var r = document.createElement('div'); r.className = 'reply'; r.dataset.r = n; r.setAttribute('role', 'status');
    r.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
    lab.insertAdjacentElement('afterend', r);
    setTimeout(function () {
      if (tokens[n] !== tk || !r.parentNode) return;
      var h = '';
      if (contenido.say) h = '<p>' + t(contenido.say) + '</p>';
      else h = '<p><b>' + (n === 'problema' ? 'Esto puede pasar porque' : 'Lo que vemos:') + '</b> ' + t(contenido.why) + '</p><p><b>Lo que necesita:</b> ' + t(contenido.fix) + '</p>';
      r.className = 'reply listo'; r.innerHTML = h;
      var b = r.getBoundingClientRect();
      if (b.bottom > window.innerHeight - 8) window.scrollBy({ top: b.bottom - window.innerHeight + 90, behavior: reducir ? 'auto' : 'smooth' });
    }, reducir ? 0 : 600);
  }
  function alCambiar(e) {
    var el = e.target, n = el.name; if (!n || n === 'sitio') return;
    actualizarAvance();
    var v = valor(n);
    if (n === 'tipo') {
      mostrarTipoOtro(v === 'otro');
      if (v === 'otro') {
        var otro = valor('tipoOtro');
        if (otro) {
          quitarRespuesta('tipo');
          responder('tipoOtro', TX.tipoOtro ? TX.tipoOtro(otro) : null);
          chip('tipo', 'Otro: ' + otro);
        } else {
          var c = RM.tipo && RM.tipo.otro;
          responder('tipo', c || { say: 'Cuéntenos qué tipo de negocio tiene y lo armamos a su medida.' });
          chip('tipo', '');
        }
        return;
      }
    }
    if (n === 'tipoOtro') {
      quitarRespuesta('tipo');
      responder('tipoOtro', v && TX.tipoOtro ? TX.tipoOtro(v) : null);
      chip('tipo', v ? 'Otro: ' + v : '');
      return;
    }
    if (RM[n]) {
      var c = RM[n][v];
      responder(n, c || null); chip(n, c ? c.chip : '');
    } else if (TX[n]) {
      responder(n, v ? TX[n](v) : null);
      if (n === 'negocio') chip('negocio', v);
      if (n === 'ciudad') chip('ciudad', v ? 'Ciudad: ' + v : '');
    }
  }
  form.addEventListener('change', alCambiar);
  form.addEventListener('input', function (e) {
    if (!e.target || !e.target.name) return;
    actualizarAvance();
    var err = $('[data-err="' + e.target.name + '"]');
    if (err && valor(e.target.name)) err.textContent = '';
  });

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
    var pl = d.plan;
    if (pl && pl.items && pl.items.length) {
      $('#r-plan-t').textContent = pl.titulo; $('#r-plan-c').textContent = pl.cierre;
      var pe = $('#r-plan-l'); pe.innerHTML = '';
      pl.items.forEach(function (x) { pe.appendChild(li('<b>' + t(x.t) + '</b><span>' + t(x.d) + '</span>')); });
      $('#r-plan').hidden = false;
    }
    var ul = $('#r-problemas'); ul.innerHTML = '';
    d.problemas.forEach(function (x) { ul.appendChild(li('<b>' + t(x.titulo) + '</b><span>' + t(x.detalle) + '</span>')); });
    [['#r-ganar', d.ganancia || []], ['#r-oport', d.oportunidades], ['#r-costo', d.costo], ['#r-sig', d.siguientes]].forEach(function (a) {
      var el = $(a[0]); if (!el) return; el.innerHTML = ''; (a[1] || []).forEach(function (s) { el.appendChild(li(t(s))); });
    });
  }
  function irResultado() {
    $('#vista-form').hidden = true; $('#vista-resultado').hidden = false; window.scrollTo(0, 0);
    var st = $('#sticky'); st.hidden = false;
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { st.hidden = en[0].isIntersecting; }).observe($('#cierre'));
  }

  $('#atras').addEventListener('click', function () { if (paso > 1) { paso--; mostrarPaso(); } });
  $('#siguiente').addEventListener('click', async function () {
    if (!validarPaso()) return;
    if (paso < TOTAL) { paso++; mostrarPaso(); window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' }); return; }
    var btn = this; btn.disabled = true; btn.textContent = 'Preparando su diagnóstico…';
    var carga = $('#carga'), ct = $('#carga-t'), t0 = Date.now(), frases = ['Revisando sus respuestas…', 'Buscando lo que está frenando sus ventas…', 'Armando su plan a la medida…'], fi = 0, iv;
    function cerrarCarga() { clearInterval(iv); carga.hidden = true; }
    ct.textContent = frases[0]; carga.hidden = false;
    iv = setInterval(function () { fi = Math.min(fi + 1, frases.length - 1); ct.textContent = frases[fi]; }, 700);
    try {
      var r = await fetch('/api/diagnostico', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos()) });
      var j = await r.json();
      var resta = (reducir ? 0 : 1800) - (Date.now() - t0); if (r.ok && j.ok && resta > 0) await new Promise(function (ok) { setTimeout(ok, resta); });
      cerrarCarga();
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
      cerrarCarga();
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
  mostrarPaso(); actualizarAvance();
})();
