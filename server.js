'use strict';
// Página "Diagnóstico gratis" de Empresa Inteligente. Sin dependencias externas.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { diagnosticar, etiquetaTipo, esProfesional, perfilDe, notaPerfil, TIPOS, CANALES, MENSAJES, PAUTA, PROBLEMAS, METAS } = require('./diagnostico');

const PORT = process.env.PORT || 3000;
const ADMIN_CLAVE = process.env.ADMIN_CLAVE || '';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const NOTIFY_WEBHOOK_URL = process.env.NOTIFY_WEBHOOK_URL || ''; // opcional
const HL_API_KEY = process.env.HL_API_KEY || ''; // opcional (HighLevel)
const HL_LOCATION_ID = process.env.HL_LOCATION_ID || 'hFqQBCN30ENAvd7inxEz';
const PUBLIC = path.join(__dirname, 'public');
const FILE = path.join(DATA_DIR, 'envios.jsonl');

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { console.error('No pude crear DATA_DIR', e.message); }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/png',
};
const SEC_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};

function send(res, code, body, headers = {}) {
  res.writeHead(code, { ...SEC_HEADERS, ...headers });
  res.end(body);
}
function json(res, code, obj) {
  send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
}
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// --- Límite de envíos por IP (memoria) ---
const hits = new Map();
function limited(ip, max = 12, windowMs = 3600e3) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
const clientIp = (req) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('grande')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// --- Almacenamiento ---
function guardar(reg) {
  try { fs.appendFileSync(FILE, JSON.stringify(reg) + '\n'); } catch (e) { console.error('Error guardando', e.message); }
  // Respaldo: Render gratis puede perder el disco; los registros de log sí se conservan unos días.
  console.log('EI_REGISTRO ' + JSON.stringify(reg));
}
function leer() {
  try {
    return fs.readFileSync(FILE, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}

// --- Notificaciones opcionales ---
async function notificar(texto) {
  if (!NOTIFY_WEBHOOK_URL) return;
  try {
    await fetch(NOTIFY_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: texto, content: texto }), signal: AbortSignal.timeout(6000) });
  } catch (e) { console.error('Notificación falló', e.message); }
}
async function hl(pathname, method, body) {
  const r = await fetch('https://services.leadconnectorhq.com' + pathname, {
    method,
    headers: { Authorization: 'Bearer ' + HL_API_KEY, Version: '2021-07-28', 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const txt = await r.text();
  if (!r.ok) {
    let extra = '';
    try {
      const j = JSON.parse(txt);
      const msg = j.message || j.error || j.detail || '';
      extra = ' ' + (Array.isArray(msg) ? msg.join('; ') : String(msg)).slice(0, 240);
    } catch { extra = ' ' + String(txt).replace(/\s+/g, ' ').slice(0, 240); }
    throw new Error(method + ' ' + pathname.replace(/[0-9a-zA-Z]{20}/g, ':id') + ' -> HTTP ' + r.status + extra);
  }
  try { return JSON.parse(txt); } catch { return {}; }
}
// Un usuario de la subcuenta, en memoria, para asignar las tareas de llamada.
let hlUsuarioId;
let hlUsuarioEtiqueta = '';
async function hlAsignado() {
  if (hlUsuarioId !== undefined) return hlUsuarioId;
  try {
    const data = await hl('/users/?locationId=' + encodeURIComponent(HL_LOCATION_ID), 'GET');
    const users = Array.isArray(data.users) ? data.users : [];
    let pick = null;
    if (users.length === 1) pick = users[0];
    else {
      const admins = users.filter((u) => (u.roles && u.roles.role === 'admin') || u.role === 'admin');
      if (admins.length === 1) pick = admins[0];
      else console.error('HighLevel: no hay un usuario único o un admin claro (' + users.length + ' usuarios); la tarea queda sin asignar');
    }
    hlUsuarioId = (pick && pick.id) || null;
    if (pick) {
      hlUsuarioEtiqueta = [pick.name, pick.email, pick.id].filter(Boolean).join(' · ');
      console.log('HighLevel tareas asignadas a ' + hlUsuarioEtiqueta);
    } else hlUsuarioId = null;
  } catch (e) {
    console.error('HighLevel no se pudieron listar usuarios:', e.message);
    hlUsuarioId = null;
  }
  return hlUsuarioId;
}
// Próxima ocurrencia de la franja en hora de Colombia (UTC-5, sin horario de verano).
function proximaDue(diaKey, franjaKey, now = new Date()) {
  const startH = { manana: 8, tarde: 12, noche: 18 }[franjaKey] || 12;
  const endH = { manana: 12, tarde: 18, noche: 20 }[franjaKey] || 18;
  const at = (y, mo, d, h, min) => new Date(Date.UTC(y, mo, d, h + 5, min, 0));
  const wall = (dt) => {
    const t = new Date(dt.getTime() - 5 * 3600e3);
    return { y: t.getUTCFullYear(), mo: t.getUTCMonth(), d: t.getUTCDate(), dow: t.getUTCDay() };
  };
  const dayOk = (dow) => (diaKey === 'sabado' ? dow === 6 : dow >= 1 && dow <= 5);
  const w = wall(now);
  for (let i = 0; i <= 8; i++) {
    const p = wall(at(w.y, w.mo, w.d + i, 12, 0));
    if (!dayOk(p.dow)) continue;
    const start = at(p.y, p.mo, p.d, startH, 0);
    const end = at(p.y, p.mo, p.d, endH, 0);
    if (now < start) return start;
    if (now < end) return new Date(Math.min(now.getTime() + 5 * 60e3, end.getTime()));
  }
  return at(w.y, w.mo, w.d + 7, startH, 0);
}
// HighLevel es el registro permanente: contacto + etiqueta + nota con lo esencial.
async function highlevel(reg, tag, nota, tarea) {
  if (!HL_API_KEY || !reg.whatsapp) return;
  try {
    const up = await hl('/contacts/upsert', 'POST', {
      locationId: HL_LOCATION_ID, name: reg.contacto, companyName: reg.negocio, phone: '+57' + reg.whatsapp, city: reg.ciudad, country: 'CO', source: 'Diagnóstico web',
    });
    const cid = (up.contact && up.contact.id) || up.id;
    if (!cid) throw new Error('upsert sin id');
    await hl('/contacts/' + cid + '/tags', 'POST', { tags: [tag] });
    await hl('/contacts/' + cid + '/notes', 'POST', { body: nota });
    if (tarea) {
      const payload = { title: tarea.title, body: tarea.body, dueDate: tarea.dueDate, completed: false };
      const assignedTo = await hlAsignado();
      if (assignedTo) payload.assignedTo = assignedTo;
      await hl('/contacts/' + cid + '/tasks', 'POST', payload);
    }
  } catch (e) { console.error('HighLevel falló:', e.message); }
}
function notaEnvio(r, diag) {
  return [
    'DIAGNÓSTICO WEB (' + r.fecha + ')',
    'Negocio: ' + r.negocio, 'Tipo: ' + etiquetaTipo(r),
    ...((r.tipo === 'otro' && notaPerfil(r.tipoOtro)) ? [notaPerfil(r.tipoOtro)] : []),
    'Ciudad: ' + r.ciudad,
    'Contacto: ' + r.contacto, 'WhatsApp: ' + r.whatsapp, 'Instagram, Facebook o Google Maps: ' + (r.redes || 'no indicó'),
    'Cómo consigue clientes: ' + (CANALES[r.canal] || ''), 'Mensajes por día: ' + ((MENSAJES[r.mensajes] || {}).label || ''),
    'Pauta: ' + (PAUTA[r.pauta] || ''), 'Problema principal: ' + (PROBLEMAS[r.problema] || ''), 'Meta: ' + (METAS[r.meta] || ''),
    'Nivel del diagnóstico: ' + diag.nivel,
    'Problemas detectados: ' + diag.problemas.map((p) => p.titulo).join('; '),
  ].join('\n');
}
function notaPropuesta(r) {
  return 'QUIERE PROPUESTA (' + r.fecha + ')\nNegocio: ' + r.negocio + '\nContacto: ' + r.contacto + ' · WhatsApp ' + r.whatsapp + '\nLlamada preferida: ' + r.dia + ', ' + r.franja + '\nPrefiere: propuesta PDF por WhatsApp + llamada' + (r.nota ? '\nNota del cliente: ' + r.nota : '');
}
function notaTarea(r) {
  const probs = Array.isArray(r.problemas) ? r.problemas.filter(Boolean).join('; ') : '';
  return [
    'Teléfono: +57 ' + (r.whatsapp || ''),
    'Llamada preferida: ' + r.dia + ', ' + r.franja,
    'Prefiere: propuesta PDF por WhatsApp + llamada',
    'Nivel del diagnóstico: ' + (r.nivel || 'no disponible'),
    'Problemas detectados: ' + (probs || 'no disponible'),
    r.nota ? 'Nota del cliente: ' + r.nota : '',
  ].filter(Boolean).join('\n');
}

// --- Validación ---
const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
function normalizarTel(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  return /^3\d{9}$/.test(d) ? d : null;
}
function validar(b) {
  const errores = {};
  const d = {
    negocio: clip(b.negocio, 80), tipo: clip(b.tipo, 20), tipoOtro: clip(b.tipoOtro, 80), ciudad: clip(b.ciudad, 60), contacto: clip(b.contacto, 80),
    whatsapp: normalizarTel(b.whatsapp), redes: clip(b.redes, 500), canal: clip(b.canal, 20), mensajes: clip(b.mensajes, 10),
    pauta: clip(b.pauta, 20), problema: clip(b.problema, 20), meta: clip(b.meta, 20),
  };
  if (d.negocio.length < 2) errores.negocio = 'Escriba el nombre del negocio.';
  if (!TIPOS[d.tipo]) errores.tipo = 'Elija el tipo de negocio.';
  if (d.tipo === 'otro') {
    if (d.tipoOtro.length < 2) errores.tipoOtro = 'Escriba qué tipo de negocio tiene.';
  } else {
    d.tipoOtro = '';
  }
  if (d.ciudad.length < 2) errores.ciudad = 'Escriba la ciudad o municipio.';
  if (d.contacto.length < 2) errores.contacto = 'Escriba el nombre de contacto.';
  if (!d.whatsapp) errores.whatsapp = 'Escriba un WhatsApp válido de 10 dígitos (ej. 3001234567).';
  if (!CANALES[d.canal]) errores.canal = 'Elija una opción.';
  if (!MENSAJES[d.mensajes]) errores.mensajes = 'Elija una opción.';
  if (!PAUTA[d.pauta]) errores.pauta = 'Elija una opción.';
  if (!PROBLEMAS[d.problema]) errores.problema = 'Elija una opción.';
  if (!METAS[d.meta]) errores.meta = 'Elija una opción.';
  return { d, errores };
}
const FRANJAS = { manana: 'Mañana (8:00 a 12:00)', tarde: 'Tarde (12:00 a 18:00)', noche: 'Noche (18:00 a 20:00)' };
const DIAS = { 'lun-vie': 'Entre semana', sabado: 'Sábado' };

// --- Rutas API ---
async function apiDiagnostico(req, res) {
  if (limited(clientIp(req))) return json(res, 429, { ok: false, error: 'Demasiados envíos. Intente más tarde.' });
  let b; try { b = JSON.parse(await readBody(req)); } catch { return json(res, 400, { ok: false, error: 'Solicitud inválida.' }); }
  if (b.sitio) return json(res, 200, { ok: true, id: 'x', diagnostico: null }); // honeypot: bots
  const { d, errores } = validar(b);
  if (Object.keys(errores).length) return json(res, 422, { ok: false, errores });
  const diag = diagnosticar(d);
  const reg = { tipo_registro: 'envio', id: crypto.randomBytes(6).toString('hex'), fecha: new Date().toISOString(), ...d, nivel: diag.nivel, problemas: diag.problemas.map((p) => p.titulo) };
  guardar(reg);
  notificar('Nuevo diagnóstico web: ' + reg.negocio + ' (' + reg.ciudad + ') - ' + reg.contacto + ' ' + reg.whatsapp);
  highlevel(reg, 'diagnostico-web', notaEnvio(reg, diag));
  json(res, 200, { ok: true, id: reg.id, diagnostico: diag });
}
async function apiPropuesta(req, res) {
  if (limited(clientIp(req))) return json(res, 429, { ok: false, error: 'Demasiados envíos. Intente más tarde.' });
  let b; try { b = JSON.parse(await readBody(req)); } catch { return json(res, 400, { ok: false, error: 'Solicitud inválida.' }); }
  if (b.sitio) return json(res, 200, { ok: true });
  const dia = DIAS[b.dia] ? b.dia : null; const franja = FRANJAS[b.franja] ? b.franja : null;
  if (!dia || !franja) return json(res, 422, { ok: false, error: 'Elija el día y la franja para la llamada.' });
  const id = clip(b.id, 20);
  const previo = leer().find((r) => r.tipo_registro === 'envio' && r.id === id);
  const base = previo || { negocio: clip(b.negocio, 80), contacto: clip(b.contacto, 80), whatsapp: normalizarTel(b.whatsapp), ciudad: clip(b.ciudad, 60) };
  const reg = {
    tipo_registro: 'propuesta', id: crypto.randomBytes(6).toString('hex'), envio_id: id, fecha: new Date().toISOString(),
    negocio: base.negocio, contacto: base.contacto, whatsapp: base.whatsapp, ciudad: base.ciudad,
    dia: DIAS[dia], franja: FRANJAS[franja], nota: clip(b.nota, 200),
    nivel: base.nivel, problemas: Array.isArray(base.problemas) ? base.problemas : [],
  };
  guardar(reg);
  notificar('QUIERE PROPUESTA: ' + reg.negocio + ' - ' + reg.contacto + ' ' + reg.whatsapp + ' - llamada ' + reg.dia + ', ' + reg.franja);
  highlevel(reg, 'quiere-propuesta', notaPropuesta(reg), {
    title: 'Llamar a ' + (reg.contacto || 'cliente') + ' (' + (reg.negocio || 'negocio') + ') – propuesta',
    body: notaTarea(reg),
    dueDate: proximaDue(dia, franja).toISOString(),
  });
  json(res, 200, { ok: true });
}

// --- Admin ---
function claveOk(k) {
  if (!ADMIN_CLAVE || !k) return false;
  const a = crypto.createHash('sha256').update(String(k)).digest();
  const c = crypto.createHash('sha256').update(ADMIN_CLAVE).digest();
  return crypto.timingSafeEqual(a, c);
}
function adminHtml() {
  const todos = leer().reverse();
  const props = todos.filter((r) => r.tipo_registro === 'propuesta');
  const envios = todos.filter((r) => r.tipo_registro === 'envio');
  const f = (iso) => new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'short', timeStyle: 'short' });
  const wa = (n) => (n ? '<a href="tel:+57' + esc(n) + '">' + esc(n) + '</a>' : '—');
  const filaP = (r) => '<tr><td>' + f(r.fecha) + '</td><td>' + esc(r.negocio) + '</td><td>' + esc(r.contacto) + '</td><td>' + wa(r.whatsapp) + '</td><td>' + esc(r.ciudad) + '</td><td><b>' + esc(r.dia) + ' · ' + esc(r.franja) + '</b>' + (r.nota ? '<br>' + esc(r.nota) : '') + '</td></tr>';
  const filaE = (r) => '<tr><td>' + f(r.fecha) + '</td><td>' + esc(r.negocio) + '</td><td>' + esc(etiquetaTipo(r)) + '</td><td>' + esc(r.ciudad) + '</td><td>' + esc(r.contacto) + '</td><td>' + wa(r.whatsapp) + '</td><td>' + esc(r.redes) + '</td><td>' + esc(CANALES[r.canal] || '') + '</td><td>' + esc((MENSAJES[r.mensajes] || {}).label || '') + '</td><td>' + esc(PAUTA[r.pauta] || '') + '</td><td>' + esc(PROBLEMAS[r.problema] || '') + '</td><td>' + esc(METAS[r.meta] || '') + '</td><td>' + esc(r.nivel) + '</td></tr>';
  return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Admin · Diagnósticos</title><style>body{font:14px system-ui,sans-serif;background:#05070d;color:#fff;margin:0;padding:16px}h1{font-size:20px}h2{font-size:16px;color:#00C2FF;margin-top:28px}.w{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:640px}th,td{border-bottom:1px solid #1e2a44;padding:6px 8px;text-align:left;vertical-align:top}th{color:#8fa6d6;font-weight:600}a{color:#00C2FF}.n{color:#8fa6d6}</style></head><body><h1>Diagnóstico gratis · Admin</h1><p class="n">' + envios.length + ' diagnósticos · ' + props.length + ' solicitudes de propuesta (hora de Colombia). En Render gratis estos datos pueden borrarse al reiniciar; cada registro también queda en los logs.</p><h2>Quieren propuesta (llamada)</h2><div class="w"><table><tr><th>Fecha</th><th>Negocio</th><th>Contacto</th><th>WhatsApp</th><th>Ciudad</th><th>Llamada preferida</th></tr>' + (props.map(filaP).join('') || '<tr><td colspan=6 class="n">Sin solicitudes todavía</td></tr>') + '</table></div><h2>Todos los diagnósticos</h2><div class="w"><table><tr><th>Fecha</th><th>Negocio</th><th>Tipo</th><th>Ciudad</th><th>Contacto</th><th>WhatsApp</th><th>Redes / Maps</th><th>Clientes hoy</th><th>Mensajes</th><th>Pauta</th><th>Problema</th><th>Meta</th><th>Nivel</th></tr>' + (envios.map(filaE).join('') || '<tr><td colspan=13 class="n">Sin envíos todavía</td></tr>') + '</table></div></body></html>';
}

// --- Estáticos ---
function estatico(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  let file; try { file = path.normalize(path.join(PUBLIC, decodeURIComponent(rel))); } catch { return send(res, 400, 'Bad request'); }
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, 'Prohibido');
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'No encontrado', { 'Content-Type': 'text/plain; charset=utf-8' });
    const ext = path.extname(file);
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=86400';
    send(res, 200, buf, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x');
    const p = u.pathname;
    if (p === '/healthz') return send(res, 200, 'ok');
    if (req.method === 'POST' && p === '/api/diagnostico') return await apiDiagnostico(req, res);
    if (req.method === 'POST' && p === '/api/propuesta') return await apiPropuesta(req, res);
    if (p === '/admin' && req.method === 'GET') {
      if (!claveOk(u.searchParams.get('clave'))) return send(res, 401, 'No autorizado', { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' });
      return send(res, 200, adminHtml(), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' });
    }
    if (req.method === 'GET' || req.method === 'HEAD') return estatico(req, res, p);
    send(res, 405, 'Método no permitido');
  } catch (e) {
    console.error(e);
    send(res, 500, 'Error');
  }
});
server.listen(PORT, () => console.log('Diagnóstico gratis escuchando en ' + PORT + (ADMIN_CLAVE ? '' : ' (ADMIN_CLAVE no definida: /admin deshabilitado)')));
