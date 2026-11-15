'use strict';
// Detección del nicho y piezas del enganche por nicho. Sin dependencias; solo servidor.
const { normalizar } = require('./public/profesional');
const { NICHOS, TIPO_NICHO, FAMILIAS, REGLAS } = require('./nichos-datos');

// Ids de nicho que coinciden con el texto, en orden de prioridad (sin repetir).
function coincidencias(texto) {
  const t = normalizar(texto);
  if (!t) return [];
  const ids = [];
  for (const [id, re] of REGLAS) if (re.test(t) && !ids.includes(id)) ids.push(id);
  return ids;
}

// El primero por prioridad; si se da `permitidos`, solo dentro de esa familia.
function primero(texto, permitidos) {
  const ids = coincidencias(texto);
  return (permitidos ? ids.filter((id) => permitidos.includes(id)) : ids)[0] || '';
}

function resultado(id, fuente) {
  const n = NICHOS[id] ? id : 'generico';
  return { id: n, nombre: NICHOS[n].nombre, fuente };
}

// { tipo, tipoOtro, negocio } → { id, nombre, fuente }
// fuente: 'tipo' | 'negocio' | 'tipoOtro' | 'generico'
function detectarNicho(d) {
  const tipo = String((d && d.tipo) || '');
  const negocio = (d && d.negocio) || '';
  if (tipo && tipo !== 'otro' && TIPO_NICHO[tipo]) {
    // El nombre del negocio solo afina dentro de la familia que eligió el cliente.
    const fam = FAMILIAS[tipo];
    const afinado = fam ? primero(negocio, fam) : '';
    if (afinado && afinado !== TIPO_NICHO[tipo]) return resultado(afinado, 'negocio');
    return resultado(TIPO_NICHO[tipo], 'tipo');
  }
  const porTexto = primero(d && d.tipoOtro);
  if (porTexto) return resultado(porTexto, 'tipoOtro');
  const porNombre = primero(negocio);
  if (porNombre) return resultado(porNombre, 'negocio');
  return resultado('generico', 'generico');
}

// --- Piezas de texto por nicho ---
function espejo(id, codigo) {
  const n = NICHOS[id];
  if (!n) return '';
  const e = n.espejo || {};
  if (e[codigo]) return e[codigo];
  if (codigo === 'desorden') return e.procesos || '';
  if (codigo === 'nosabe') return 'Hoy no tiene claro qué le ayuda de verdad a ' + n.meta + ', y así es difícil decidir dónde poner el tiempo y el dinero.';
  if (codigo === 'margen') return 'Hoy trabaja, pero le queda poco margen: mucho tiempo se va en ' + n.tareas + ', y eso es trabajar mucho para ganar menos.';
  return '';
}

// Cláusula corta de un problema para «A eso se suma que …», con la palabra del nicho.
function corto(id, codigo, base) {
  const g = (NICHOS[id] && NICHOS[id].gente) || 'clientes';
  if (codigo === 'pocos') return 'llegan pocos ' + g + ' nuevos';
  if (codigo === 'recompra') return 'los ' + g + ' vienen una vez y no vuelven';
  return base[codigo];
}

// Línea 2 para quien aún no abre (perfil «idea»).
function porQueIdea(id) {
  const n = NICHOS[id];
  return 'Cuando abra, la gente va a querer ' + n.cliente + '; por eso conviene, desde el arranque, ' + n.arranque + '.';
}

function nombreNicho(id) {
  return !id || id === 'generico' || !NICHOS[id] ? 'general' : NICHOS[id].nombre;
}

module.exports = { detectarNicho, coincidencias, espejo, corto, porQueIdea, nombreNicho, NICHOS, TIPO_NICHO, FAMILIAS };
