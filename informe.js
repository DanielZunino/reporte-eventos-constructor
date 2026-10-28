/* =====================================================================
* INFORME DE REPORTE E INVESTIGACIÓN DE EVENTO — formato aprobado (caso 2026-004)
* Se arma en el navegador con pdfmake (texto real, no imagen) y se le agregan
* como anexo los PDF originales firmados con pdf-lib. Numeración de página continua.
* Integra Prevención SpA — Daniel Zunino Urrutia
* ===================================================================== */
(function (root) {
'use strict';
var C = { az: '#0b3d91', az2: '#1565c0', na: '#f28c28', na2: '#e67e22', ve: '#2e7d32', ro: '#c62828', tx: '#1f2733', gris: '#6b778c',
borde: '#c9d3e3', lab: '#eaf0f8', tira: '#f3f6fb', decl: '#f5f7fc' };
var W = 505;                         // ancho útil (A4 595 - márgenes 45+45)
var LH = 1.2;                        // alto de línea de Lato
var MED = null;                      // medidor de texto (se inyecta)
function s(x) { return x == null ? '' : String(x).trim(); }
function vacio(x) { x = s(x); return !x || x === '—' || x === '-' || x === '–' || /^(no s[eé]|pendiente)$/i.test(x); }
function ni(x, fem) { return vacio(x) ? (fem ? 'No informada' : 'No informado') : s(x); }
function dma(x) { x = s(x); var m = x.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '-' + m[2] + '-' + m[1] : x; }
function aFecha(x) { x = s(x); var m = x.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
m = x.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; }
function siNo(x) { x = s(x).toUpperCase(); return x === 'SI' || x === 'SÍ' ? 'Sí' : x === 'NO' ? 'No' : s(x); }
function frase(x) { x = s(x); if (x && x === x.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{3}/.test(x)) x = x.charAt(0) + x.slice(1).toLowerCase(); return x; }
function titulo(x) { return s(x).toLowerCase().replace(/(^|\s|-)(\S)/g, function (a, b, c) { return b + c.toUpperCase(); }); }
function rutF(r) { r = s(r).toUpperCase().replace(/[^0-9K]/g, ''); if (r.length < 2) return s(r); var c = r.slice(0, -1), dv = r.slice(-1);
return c.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv; }
function fonoF(t) { var d = s(t).replace(/\D/g, ''); if (d.length === 11 && d.indexOf('56') === 0) d = d.slice(2);
return d.length === 9 ? d[0] + ' ' + d.slice(1, 5) + ' ' + d.slice(5) : s(t); }
function quitaComillas(x) { return s(x).replace(/^[“"«]+|[”"»]+$/g, '').trim(); }
function tiene(d, t) { return (d.tipos || []).indexOf(t) > -1; }
function lesion(d) { return tiene(d, 'Accidente del trabajo') || tiene(d, 'Accidente de trayecto') || tiene(d, 'Posible enfermedad profesional'); }
function docOAL(d) { var a = tiene(d, 'Accidente del trabajo') || tiene(d, 'Accidente de trayecto'), e = tiene(d, 'Posible enfermedad profesional'); return a && e ? 'DIAT / DIEP' : a ? 'DIAT' : e ? 'DIEP' : 'DIAT / DIEP'; }
var FEM = /^(Muñeca|Mano|Cadera|Oreja|Rodilla|Pantorrilla|Canilla|Espalda|Nariz|Boca|Cara|Cabeza|Nuca|Zona|Pierna)/;
function parteTxt(n) { var m = s(n).match(/^(.*) (der|izq)\.$/); if (!m) return s(n); var b = m[1], dd = m[2] === 'der';
if (b === 'Dedos mano') return 'Dedos de la mano ' + (dd ? 'derecha' : 'izquierda'); if (b === 'Dedos pie') return 'Dedos del pie ' + (dd ? 'derecho' : 'izquierdo');
return b + ' ' + (FEM.test(b) ? (dd ? 'derecha' : 'izquierda') : (dd ? 'derecho' : 'izquierdo')); }
function esLK(d) { return tiene(d, 'Ley Karin'); }
function edadEn(nac, f) { var n = aFecha(nac); if (!n || !f) return null; var e = f.getFullYear() - n.getFullYear();
if (f < new Date(f.getFullYear(), n.getMonth(), n.getDate())) e--; return e; }
function antig(ing, f) { var i = aFecha(ing); if (!i || !f) return ''; var mm = (f.getFullYear() - i.getFullYear()) * 12 + (f.getMonth() - i.getMonth());
if (f.getDate() < i.getDate()) mm--; if (mm < 0) return ''; var a = Math.floor(mm / 12), m = mm % 12;
return (a ? a + (a === 1 ? ' año' : ' años') + (m ? ' y ' : '') : '') + (m || !a ? m + (m === 1 ? ' mes' : ' meses') : '') + ' al día del evento'; }
function rico(t, base) {
var out = [], re = /\*\*([^*]+)\*\*/g, i = 0, m; t = s(t);
while ((m = re.exec(t))) { if (m.index > i) out.push({ text: t.slice(i, m.index) }); out.push({ text: m[1], bold: true }); i = re.lastIndex; }
if (i < t.length) out.push({ text: t.slice(i) });
return Object.assign({ text: out.length ? out : '' }, base || {});
}
function parrafos(t) { return s(t).split(/\n\s*\n|\n/).map(function (p) { return p.trim(); }).filter(String); }
function viñetas(t) { // líneas con • -> lista; si no, párrafo
var ls = s(t).split('\n').map(function (x) { return x.trim(); }).filter(String);
if (ls.length && ls.every(function (x) { return /^[•\-·*]/.test(x); }))
return { ul: ls.map(function (x) { var y = quitaComillas(x.replace(/^[•\-·*]\s*/, '')).replace(/\.?$/, '.'); return rico(y); }), margin: [0, 0, 0, 0] };
return { stack: ls.map(function (x) { return rico(quitaComillas(x.replace(/^[•\-·*]\s*/, '')), { margin: [0, 0, 0, 3] }); }) };
}
function lineas(txt, size, bold, ancho) {
if (!MED) return Math.max(1, Math.ceil(s(txt).length * size * 0.5 / ancho));
var n = 0;
s(txt).split('\n').forEach(function (par) {
var pal = par.split(/\s+/).filter(String), lin = 0, cnt = 1, sp = MED(' ', size, bold);
pal.forEach(function (p) { var w = MED(p, size, bold); if (lin && lin + sp + w > ancho) { cnt++; lin = w; } else lin = lin ? lin + sp + w : w; });
n += cnt;
});
return Math.max(1, n);
}
function altoTexto(txt, size, bold, ancho) { return lineas(txt, size, bold, ancho) * size * LH; }
function sobre(n, x, y, w) { return { columns: [{ width: w, stack: [n] }], relativePosition: { x: x, y: y } }; }
function tituloSeccion(n, t, necesita) {
return { esSec: true, margin: [0, 14, 0, 6], stack: [
{ columns: [
{ width: 17, stack: [{ canvas: [{ type: 'rect', x: 0, y: 0, w: 17, h: 17, r: 2.5, color: C.na }] },
sobre({ text: String(n), color: '#fff', bold: true, fontSize: 9, alignment: 'center' }, 0, -14.6, 17)] },
{ text: t, color: C.az, bold: true, fontSize: 12.5, margin: [7, 0.5, 0, 0] }] },
{ canvas: [{ type: 'line', x1: 0, y1: 5, x2: W, y2: 5, lineWidth: 1.2, lineColor: C.az }] }] };
}
function subtitulo(t, necesita) { return { text: t, color: C.az2, bold: true, fontSize: 10, margin: [0, 9, 0, 4] }; }
var bordeL = function (c) { return { hLineWidth: function () { return 0.6; }, vLineWidth: function () { return 0.6; },
hLineColor: function () { return c || C.borde; }, vLineColor: function () { return c || C.borde; },
paddingLeft: function () { return 6; }, paddingRight: function () { return 6; }, paddingTop: function () { return 4.5; }, paddingBottom: function () { return 4.5; } }; };
function kv(pares) {
pares = pares.filter(Boolean);
var body = [], fila = [];
pares.forEach(function (p) {
var lab = { text: p[0], bold: true, fontSize: 7.6, color: C.az, fillColor: C.lab, margin: [0, 1, 0, 0] };
var val = typeof p[1] === 'object' && p[1] !== null && !Array.isArray(p[1]) ? p[1] : { text: s(p[1]), fontSize: 9 };
if (p[2] === 'full') { if (fila.length) { fila.push({ text: '', colSpan: 2 }, {}); body.push(fila); fila = []; }
val.colSpan = 3; body.push([lab, val, {}, {}]); return; }
fila.push(lab, val);
if (fila.length === 4) { body.push(fila); fila = []; }
});
if (fila.length) { fila[1].colSpan = 3; fila.push({}, {}); body.push(fila); }
return { table: { widths: [104, 138, 96, '*'], body: body, dontBreakRows: true }, layout: bordeL() };
}
function cajaRedonda(contenido, alto, opt) {
opt = opt || {};
var w = opt.w || W;
return { width: w, stack: [
{ canvas: [{ type: 'rect', x: 0, y: 0, w: w, h: alto, r: opt.r == null ? 6 : opt.r, color: opt.fondo || '#fff', lineColor: opt.borde || C.borde, lineWidth: opt.lw || 1 }] },
sobre({ stack: contenido }, opt.pad || 9, -alto + (opt.pad || 9), w - 2 * (opt.pad || 9))], margin: opt.margin || [0, 0, 0, 0] };
}
var CAT_TXT = { 'Acción insegura': 'ACCIÓN INSEGURA', 'Condición del equipo': 'CONDICIÓN DEL EQUIPO', 'Condición del entorno': 'CONDICIÓN DEL ENTORNO',
'Organización': 'ORGANIZACIÓN', 'Factor personal': 'FACTOR PERSONAL', 'Factor del trabajo': 'FACTOR DEL TRABAJO' };
function letrasArbol(arbol) {
var ns = (arbol || []).filter(function (n) { return s(n.txt); }), map = {};
var hijos = function (p) { return ns.filter(function (n) { return (n.padre || '') === p; }); };
var raiz = hijos('')[0];
if (!raiz) return { ns: ns, map: map, raiz: null, hijos: hijos };
var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
hijos(raiz.id).forEach(function (n, i) {
var L = ABC[i] || ('Z' + i); map[n.id] = L;
(function rec(p, pref) { hijos(p.id).forEach(function (h, j) { var k = pref + (pref.length > 1 && /\d$/.test(pref) ? '.' : '') + (j + 1); map[h.id] = k; rec(h, k); }); })(n, L);
});
hijos('').slice(1).forEach(function (r) { map[r.id] = map[r.id] || '?'; });
return { ns: ns, map: map, raiz: raiz, hijos: hijos };
}
function cajaCausa(n, A, ancho) {
var hs = A.hijos(n.id), fondo = !hs.length, principal = !!n.principal;
var col = fondo && !principal ? C.na2 : C.az2, fill = fondo && !principal ? '#fff6ec' : '#eef4fd';
var etq = 'CAUSA ' + A.map[n.id] + (n.cat && CAT_TXT[n.cat] ? ' · ' + CAT_TXT[n.cat] : '');
var marca = n.tipo === 'P' ? '[Permanente]' : '[Variación]';
var pill = principal ? 'CAUSA PRINCIPAL' : fondo ? 'CAUSA DE FONDO' : '';
var pad = 9, wi = ancho - pad * 2;
var hTxt = altoTexto(n.txt, 9, false, wi);
var alto = pad + 7.5 * LH + 5 + hTxt + (pill ? 18 : 2) + pad - 2; EST.v += 0;
var cont = [
{ text: [{ text: etq + '  ', bold: true, color: col, fontSize: 7.2 }, { text: marca, color: col, fontSize: 7.2, bold: true }], margin: [0, 0, 0, 5] },
{ text: s(n.txt), fontSize: 9, color: C.tx }];
if (pill) {
var pw = MED ? MED(pill, 6.6, true) + 18 : 80;
cont.push({ columns: [{ text: '' }, { width: pw, stack: [{ canvas: [{ type: 'rect', x: 0, y: 0, w: pw, h: 12, r: 6, color: C.na }] },
sobre({ text: pill, color: '#fff', bold: true, fontSize: 6.6, alignment: 'center' }, 0, -10.4, pw)] }], margin: [0, 5, 0, 0] });
}
return cajaRedonda(cont, alto, { w: ancho, fondo: fill, borde: col, lw: 1.1, r: 7, pad: pad });
}
function flecha(ancho, txt, cx) { // flecha corta hacia abajo con texto "¿por qué?"
cx = cx == null ? ancho / 2 : cx;
return { stack: [
{ canvas: [{ type: 'line', x1: cx, y1: 0, x2: cx, y2: 11, lineWidth: 1.4, lineColor: C.az },
{ type: 'polyline', closePath: true, color: C.az, points: [{ x: cx - 3.5, y: 9 }, { x: cx + 3.5, y: 9 }, { x: cx, y: 14 }] }] },
txt ? sobre({ text: txt, italics: true, fontSize: 7, color: C.gris }, cx + 6, -12, 120) : { text: '' }], margin: [0, 2, 0, 3] };
}
var EST = { v: 0 };
function altoCaja(n, A, ancho) { var pill = n.principal || !A.hijos(n.id).length; return 9 + 7.5 * LH + 5 + altoTexto(n.txt, 9, false, ancho - 18) + (pill ? 18 : 2) + 7; }
function arbolPdf(d) {
var A = letrasArbol(d.arbol);
if (!A.raiz) return null;
var ramas = A.hijos(A.raiz.id), out = [];
out.push({ text: 'Árbol de causas', color: C.az, bold: true, fontSize: 10.5, margin: [0, 12, 0, 1] });
out.push({ text: [{ text: 'Se lee desde el hecho final (arriba) hacia sus antecedentes. ' }, { text: 'Variación', bold: true }, { text: ' = algo distinto a lo habitual' },
ramas.concat(A.ns).some(function (n) { return n.tipo === 'P'; }) ? { text: '; ' } : { text: '.' },
ramas.concat(A.ns).some(function (n) { return n.tipo === 'P'; }) ? { text: 'Permanente', bold: true } : { text: '' },
ramas.concat(A.ns).some(function (n) { return n.tipo === 'P'; }) ? { text: ' = condición que siempre estaba.' } : { text: '' }],
fontSize: 7.4, color: C.gris, margin: [0, 0, 0, 8] });
var totalAlto = 40, wf = 300, hf = 9 + 7.2 * LH + 5 + altoTexto(A.raiz.txt, 9.5, false, wf - 18) + 9;
out.push({ columns: [{ text: '' }, cajaRedonda([{ text: 'HECHO FINAL', bold: true, color: C.ro, fontSize: 7.2, margin: [0, 0, 0, 5] },
{ text: s(A.raiz.txt), fontSize: 9.5 }], hf, { w: wf, fondo: '#fdecea', borde: C.ro, lw: 1.1, r: 7 }), { text: '' }] });
totalAlto += hf;
if (!ramas.length) return { stack: out, unbreakable: true, _alto: totalAlto };
for (var k = 0; k < ramas.length; k += 3) {
var fila = ramas.slice(k, k + 3), n = fila.length, gap = 20, cw = n === 1 ? 260 : (W - gap * (n - 1)) / n;
var x0 = n === 1 ? (W - cw) / 2 : 0, centros = fila.map(function (_, i) { return x0 + i * (cw + gap) + cw / 2; });
if (k === 0) { // conector desde el hecho final
var lin = [{ type: 'line', x1: W / 2, y1: 0, x2: W / 2, y2: 8, lineWidth: 1.4, lineColor: C.az }];
if (n > 1) lin.push({ type: 'line', x1: centros[0], y1: 8, x2: centros[n - 1], y2: 8, lineWidth: 1.4, lineColor: C.az });
centros.forEach(function (c) { lin.push({ type: 'line', x1: c, y1: 8, x2: c, y2: 16, lineWidth: 1.4, lineColor: C.az },
{ type: 'polyline', closePath: true, color: C.az, points: [{ x: c - 3.5, y: 14 }, { x: c + 3.5, y: 14 }, { x: c, y: 19 }] }); });
out.push({ stack: [{ canvas: lin }, sobre({ text: '¿por qué pasó?', italics: true, fontSize: 7, color: C.gris }, W / 2 + 6, -19, 120)], margin: [0, 2, 0, 4] });
} else out.push({ text: '', margin: [0, 8, 0, 0] });
var altFila = 0;
fila.forEach(function (r) { var h = altoCaja(r, A, cw); (function rec(p, prof) { A.hijos(p.id).forEach(function (x) { h += 21 + altoCaja(x, A, cw - Math.min(prof, 3) * 10); rec(x, prof + 1); }); })(r, 1); altFila = Math.max(altFila, h); });
totalAlto += altFila + 30;
out.push({ columns: fila.map(function (r) {
var st = [cajaCausa(r, A, cw)];
(function rec(p, prof) {
A.hijos(p.id).forEach(function (h) { var ind = Math.min(prof, 3) * 10;
st.push(flecha(cw, '¿por qué?', cw / 2));
st.push({ margin: [ind, 0, 0, 0], stack: [cajaCausa(h, A, cw - ind)] }); rec(h, prof + 1); });
})(r, 1);
return { width: cw, stack: st };
}), columnGap: gap, margin: [x0, 0, 0, 0] });
}
return { stack: out, unbreakable: true, _alto: totalAlto };
}
function construir(d, X) {
X = X || {};
var t = d.trabajador || {}, srv = d._srv || {}, lk = esLK(d), les = lesion(d);
var fEv = aFecha(d.fecha) || aFecha(d.fechaDMA), cont = [], nSec = 0;
var cliente = s(X.cliente) || 'CONSTRUCTOR CENTER';
var sec = function (tit, nec) { nSec++; return tituloSeccion(nSec, tit, nec); };
var secNum = {};
cont.push(cajaRedonda([{ text: 'REPORTE E INVESTIGACIÓN DE EVENTO', color: '#fff', bold: true, fontSize: 17 },
{ text: cliente.toUpperCase(), color: C.na, bold: true, fontSize: 9, margin: [0, 4, 0, 0] }], 62, { fondo: C.az, borde: C.az, r: 6, pad: 13 }));
var tipoTxt = (d.tipos || []).join(' + ') + (d.gravedad ? ' (' + d.gravedad.toLowerCase() + ')' : '');
var celda = function (l, v) { return { stack: [{ text: l, fontSize: 6.4, color: C.gris, bold: true, characterSpacing: 0.3 }, { text: v, bold: true, fontSize: 10, color: C.tx, margin: [0, 3, 0, 0] }], fillColor: C.tira }; };
cont.push({ margin: [0, 9, 0, 0], table: { widths: [150, 98, 92, '*'], body: [[celda('EMPRESA', ni(t.empresa, true)), celda('SUCURSAL', titulo(t.sucursal || d.sucursal)), celda('CASO N°', s(d.id)), celda('TIPO DE EVENTO', tipoTxt)]] },
layout: { hLineWidth: function () { return 0.6; }, vLineWidth: function () { return 0.6; }, hLineColor: function () { return C.borde; }, vLineColor: function () { return C.borde; },
paddingLeft: function () { return 8; }, paddingRight: function () { return 6; }, paddingTop: function () { return 6; }, paddingBottom: function () { return 7; } } });
if (d.gravedad === 'Grave' || d.gravedad === 'Fatal')
cont.push({ margin: [0, 8, 0, 0], table: { widths: ['*'], body: [[{ text: 'ACCIDENTE ' + d.gravedad.toUpperCase() + ': se suspenden las faenas afectadas y se avisa de inmediato a la Inspección del Trabajo y a la SEREMI de Salud (art. 76 Ley 16.744).', bold: true, color: '#8e0000', fontSize: 9, fillColor: '#fdecea' }]] }, layout: bordeL(C.ro) });
var horaTxt = vacio(d.hora) ? 'No informada' : s(d.hora) + ((d.horaDecl ? d.horaDecl === d.hora : (srv.declTrabajador || srv.autorreporte)) ? ' (según declaración)' : '');
var horario = vacio(d.horaEntrada) && vacio(d.horaSalida) ? 'No informado' : ni(d.horaEntrada) + ' a ' + ni(d.horaSalida);
var dot = vacio(d.hombres) && vacio(d.mujeres) ? 'No informada' : (s(d.hombres) || '0') + (+d.hombres === 1 ? ' hombre' : ' hombres') + ' / ' + (s(d.mujeres) || '0') + (+d.mujeres === 1 ? ' mujer' : ' mujeres');
var b1 = [sec('Datos generales del evento'), kv([['Fecha del evento', dma(d.fechaDMA || d.fecha)], ['Hora aproximada', horaTxt],
['Área / lugar exacto', ni(d.area)], ['Horario de trabajo ese día', horario],
['Dotación de la sucursal', dot], ['Dirección del lugar', ni(d.lugarDireccion, true)],
d.gravedad ? ['Gravedad', d.gravedad] : null])];
cont.push({ stack: b1 });
if (tiene(d, 'Daño material')) {
cont.push({ stack: [subtitulo('Daño material producido'), kv([
['Bien / vehículo afectado', ni(d.danoBien)], ['Patente / código', ni(d.danoCodigo)],
!vacio(d.danoMarca) || !vacio(d.danoPropietario) ? ['Marca / modelo / año', ni(d.danoMarca)] : null,
!vacio(d.danoMarca) || !vacio(d.danoPropietario) ? ['Propietario', ni(d.danoPropietario)] : null,
['Descripción del daño', ni(d.danoDescPdf || d.danoDesc, true)], ['¿Involucra terceros?', ni(siNo(d.danoTerceros))],
['Costo estimado', ni(d.danoCosto), 'full']])], unbreakable: true });
}
if (tiene(d, 'Accidente de trayecto'))
cont.push({ stack: [subtitulo('Datos del trayecto'), kv([['Sentido', ni(d.trayectoSentido)], ['Medio de transporte', ni(d.trayectoMedio)],
['Origen', ni(d.trayectoOrigen)], ['Destino', ni(d.trayectoDestino)], ['Medio de prueba', ni(d.trayectoPrueba), 'full']])], unbreakable: true });
if (tiene(d, 'Posible enfermedad profesional'))
cont.push({ stack: [subtitulo('Posible enfermedad profesional (DIEP)'), kv([['Agente / factor sospechado', ni((d.epAgente || []).join(', '))], ['Inicio de síntomas', ni(dma(d.epInicio))],
['Síntomas que refiere', ni(d.epSintomas), 'full'], ['Tiempo de exposición', ni(d.epExposicion)], ['Tareas y frecuencia', ni(d.epTareas)]])], unbreakable: true });
if (d.gravedad === 'Grave' || d.gravedad === 'Fatal') {
var P = d.protocolo || {}, PR = [['suspension', 'Suspender faenas afectadas'], ['inspeccion', 'Aviso a la Inspección del Trabajo'], ['seremi', 'Aviso a la SEREMI de Salud'], ['mutual', 'Aviso a la Mutual']];
cont.push({ stack: [subtitulo('Protocolo de accidente ' + d.gravedad.toLowerCase()), tablaAzul(['Acción', 'Estado', 'Fecha y hora', 'Detalle'], [150, 60, 80, '*'],
PR.map(function (x) { var o = P[x[0]] || {}; return [x[1], { text: o.e || 'Pendiente', bold: true, color: o.e === 'Hecho' ? C.ve : C.ro }, s(o.f).replace('T', ' ') || '—', s(o.det) || '—']; }))], unbreakable: true });
}
var e = edadEn(t.nacimiento, fEv), ant = antig(t.ingreso, fEv);
var nacTxt = vacio(t.nacimiento) ? 'No informado' : (e != null && e >= 15 && e <= 90 ? dma(t.nacimiento) + ' — ' + e + ' años' : dma(t.nacimiento) + ' (por confirmar)');
var ingTxt = vacio(t.ingreso) ? 'No informado' : (ant ? dma(t.ingreso) + ' — ' + ant : dma(t.ingreso) + ' (por confirmar)');
var est = vacio(d.estatura) ? 'No informado' : (/[,.]/.test(d.estatura) || +d.estatura < 3 ? s(d.estatura).replace('.', ',') + ' m' : (+d.estatura / 100).toFixed(2).replace('.', ',') + ' m');
cont.push({ stack: [sec(lk && (d.tipos || []).length === 1 ? 'Datos de la persona denunciante' : 'Datos del trabajador'), kv([
['Nombre completo', ni(t.nombre)], ['RUN (C.D.I.)', ni(rutF(t.run))],
['Dirección', ni(titulo(t.direccion) === t.direccion ? t.direccion : t.direccion, true)], ['Comuna', ni(titulo(t.comuna), true)],
['Teléfono', ni(fonoF(t.telefono))], ['Nacionalidad', ni(titulo(t.nacionalidad), true)],
['Fecha de nacimiento / Edad', nacTxt], les ? ['Estatura / Peso', est + ' / ' + (vacio(d.peso) ? 'No informado' : s(d.peso) + ' kg')] : ['Cargo / oficio', ni(frase(t.cargo || d.oficio))],
les ? ['Cargo / oficio', ni(frase(t.cargo || d.oficio))] : ['Tipo de contrato', ni(d.contrato)],
les ? ['Tipo de contrato', ni(d.contrato)] : ['Fecha de ingreso / Antigüedad', ingTxt],
les ? ['Fecha de ingreso / Antigüedad', ingTxt] : ['Sistema de salud', ni(t.salud)],
les ? ['Sistema de salud', ni(t.salud)] : ['Contacto de emergencia', ni(t.emergencia)],
les ? ['Contacto de emergencia', ni(t.emergencia)] : ['Jefatura directa', ni(t.jefatura, true)],
les ? ['Jefatura directa', ni(t.jefatura, true)] : null])], unbreakable: true });
if (les) {
var evaB = null;
if (d.eva !== '' && d.eva != null) {
var EV = ['#1b9e3e', '#5cb85c', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff7043', '#f4511e', '#e53935', '#b71c1c'];
evaB = { margin: [0, 6, 0, 0], table: { widths: Array(11).fill('*'), body: [EV.map(function (c, i) { var on = String(d.eva) === String(i);
return { text: String(i), alignment: 'center', bold: on, fontSize: on ? 11 : 8.5, color: i > 7 || on ? '#fff' : '#333', fillColor: on ? '#000' : c }; })] },
layout: { hLineWidth: function () { return 1.5; }, vLineWidth: function () { return 1.5; }, hLineColor: function () { return '#fff'; }, vLineColor: function () { return '#fff'; } } };
}
cont.push({ stack: [sec(tiene(d, 'Posible enfermedad profesional') && !tiene(d, 'Accidente del trabajo') && !tiene(d, 'Accidente de trayecto') ? 'Molestia y atención' : 'Lesión y atención', 160),
kv([['Parte(s) del cuerpo', ni((d.partes || []).map(parteTxt).join(', ')), 'full'], ['Tipo de lesión', ni(d.tipoLesion)], ['Dolor (EVA 0 a 10)', d.eva === '' || d.eva == null ? 'No informado' : String(d.eva)],
['¿Requiere atención inmediata?', ni(siNo(d.requiereAtencion))], ['¿Acepta derivación al OAL?', ni(siNo(d.aceptaDerivacion))],
s(d.aceptaDerivacion).toUpperCase() === 'NO' ? ['Motivo de la negativa', ni(d.motivoNegativa), 'full'] : null,
['Centro de atención', ni(d.centro)], ['Folio ' + docOAL(d), ni(d.folioDiat)],
['Reposo', vacio(d.reposoDesde) ? 'No informado' : dma(d.reposoDesde) + (d.reposoHasta ? ' al ' + dma(d.reposoHasta) : '')], ['Días perdidos', ni(d.diasPerdidos)],
['Fecha de alta', ni(dma(d.fechaAlta), true)]]), evaB || { text: '' }], unbreakable: true });
}
if (!lk || (d.tipos || []).length > 1) cont.push(bloqueDeclaracion(d, X, sec, secNum));
if (lk) cont.push({ stack: [sec('Denuncia Ley Karin (Ley 21.643)'), kv([['Conducta denunciada', ni((d.lkConducta || []).join(', ')), 'full'],
['Recepción de la denuncia', ni(dma(d.lkRecepcion), true)], ['Forma de recepción', ni(d.lkForma, true)], ['Persona denunciada', ni(d.lkDenunciado, true), 'full'],
['Relato de los hechos', ni(d.lkRelato), 'full'], ['Medidas de resguardo', ni((d.lkResguardo || []).join(', ')), 'full'], ['Investigación', ni(d.lkInvestiga, true)],
['Aviso a la Dirección del Trabajo', ni(dma(d.lkAvisoDT))], ['Derivación psicológica OAL', ni(siNo(d.lkPsico), true)]])] });
var tl = lineaTiempo(d);
if (tl || (d.testigos || []).some(function (w) { return s(w.nombre); })) {
var bloq = [sec('Investigación del evento', tl ? Math.min((tl._alto || 200) + 30, 600) : 120)];
if (tl) bloq.push(tl);
var tes = (d.testigos || []).filter(function (w) { return s(w.nombre); });
if (tes.length) {
bloq.push(subtitulo('Testigos'));
bloq.push(tablaAzul(['N°', 'Nombre', 'Calidad', 'Lo que informa'], [20, 120, 80, '*'], tes.map(function (w, i) {
return [String(i + 1), { text: [{ text: s(w.nombre) }, { text: w.externo === 'SI' ? '\nExterno' + (w.empresaExt ? ': ' + w.empresaExt : '') : (w.cargo ? '\n' + frase(w.cargo) : ''), fontSize: 7.5, color: C.gris }] },
ni(w.clase), vacio(w.relato) ? { text: 'Sin relato registrado (ver anexos si respondió por enlace).', color: C.gris, italics: true } : { stack: parrafos(w.relato).map(function (p) { return rico(p, { margin: [0, 0, 0, 3] }); }) }];
})));
}
cont.push({ stack: bloq });
}
var hayCausas = ['accInseguras', 'condInseguras', 'factPersonales', 'factTrabajo'].some(function (k) { return !vacio(d[k]); });
var arb = arbolPdf(d);
if (hayCausas || arb) {
secNum.causas = nSec + 1;
var bc = [sec('Causas del evento', 200)];
if (hayCausas) bc.push(cuadrosCausas(d));
cont.push({ stack: bc });
if (arb) cont.push(arb);
}
var A = letrasArbol(d.arbol);
var meds = (d.inmediatas || []).map(function (m) { return Object.assign({ _inm: true }, m); }).concat(d.medidas || []).filter(function (m) { return s(m.medida); });
var vistas = {}; meds = meds.filter(function (m) { var k = s(m.medida).toLowerCase().replace(/\W+/g, ''); if (vistas[k]) return false; vistas[k] = 1; return true; });
if (meds.length) {
cont.push({ stack: [sec('Medidas correctivas', 110), tablaAzul(['N°', 'Medida', 'Atiende', 'Responsable / firma', 'Plazo', 'Estado'], [20, '*', 52, 108, 58, 56],
meds.map(function (m, i) {
var at = (m.atiende || []).map(function (id) { return A.map[id] ? 'Causa ' + A.map[id] : ''; }).filter(String);
var resp = (m.responsables && m.responsables.length ? m.responsables : s(m.responsable).split(/\s*;\s*|\n/)).filter(String);
var cum = m.estado === 'Cumplida';
return [{ text: String(i + 1), alignment: 'center' }, { text: s(m.medida) }, { text: at.length ? at.join('\n') : 'General', alignment: 'center' },
{ text: resp.length ? resp.join('\n') : 'Por asignar', color: resp.length ? C.tx : C.ro }, { text: m._inm ? 'Inmediato' : (dma(m.plazo) || 'Por definir'), alignment: 'center' },
{ text: cum ? 'Cumplida' + (m.cumplida ? '\n' + dma(m.cumplida) : '') : 'Pendiente', bold: true, color: cum ? C.ve : C.na2, alignment: 'center' }];
}), true)] });
}
var concl = (d.conclusiones || []).filter(function (c) { return c && !vacio(c.x); });
if (concl.length) {
var CC = [C.az, C.ro, C.na, C.az2, C.ve, '#6a1b9a', '#00838f'];
cont.push({ stack: [sec('Conclusiones', 120), { _alto: concl.reduce(function (a, c) { return a + Math.ceil((s(c.x).length + 30) / 105) * 10.5 + 11; }, 0), table: { widths: [22, '*'], dontBreakRows: true, body: concl.map(function (c, i) {
return [{ stack: [{ canvas: [{ type: 'rect', x: 0, y: 0, w: 15, h: 15, r: 2.5, color: CC[i % CC.length] }] }, sobre({ text: String(i + 1), color: '#fff', bold: true, fontSize: 8.5, alignment: 'center' }, 0, -13.2, 15)], fillColor: '#f7f9fd' },
{ text: [{ text: s(c.t) ? s(c.t).replace(/\.?$/, '. ') : '', bold: true }].concat(rico(c.x).text), fontSize: 8.8, fillColor: '#f7f9fd', lineHeight: 1.08 }];
}) }, layout: { hLineWidth: function () { return 0.6; }, vLineWidth: function (i, n) { return i === 1 ? 0 : 0.6; }, hLineColor: function () { return C.borde; }, vLineColor: function () { return C.borde; },
paddingLeft: function (i) { return i ? 2 : 5; }, paddingRight: function () { return 6; }, paddingTop: function () { return 5; }, paddingBottom: function () { return 5; } } },
vacio(d.porConfirmar) ? { text: '' } : { text: [{ text: 'Por confirmar: ', bold: true }, { text: s(d.porConfirmar) }], fontSize: 7.6, color: C.gris, margin: [0, 4, 0, 0] }] });
}
var parts = (d.participantes || []).filter(function (p) { return s(p.nombre); });
if (!parts.length) parts = [{}, {}];
cont.push({ stack: [sec('Participantes de la investigación', 110), tablaAzul(['N°', 'Nombre', 'RUN', 'Cargo', 'Firma'], [20, 160, 80, 110, '*'],
parts.map(function (p, i) { return [{ text: String(i + 1), alignment: 'center', margin: [0, 10, 0, 10] }, { text: s(p.nombre), margin: [0, 10, 0, 10] },
{ text: rutF(p.run), alignment: 'center', margin: [0, 10, 0, 10] }, { text: frase(p.cargo), margin: [0, 10, 0, 10] }, { text: '' }]; }), true)] });
var fotos = (X.fotos || []).filter(function (f) { return f.data; });
var vids = (X.videos || srv.videos || []);
if (fotos.length || vids.length) {
var bf = [sec('Registro fotográfico' + (vids.length ? ' y videos' : ''), 260)];
fotos.forEach(function (f, i) { f._n = i + 1; });
var i = 0;
while (i < fotos.length) {
var f = fotos[i], ancha = f.w && f.h && f.w > f.h * 1.25;
if (ancha) { bf.push({ _alto: 200, stack: [{ image: f.data, fit: [380, f.w / f.h > 4 ? 90 : 170], alignment: 'center' }, pie(f)], margin: [0, 6, 0, 6], unbreakable: true }); i++; continue; }
var grupo = []; while (i < fotos.length && grupo.length < 3 && !(fotos[i].w > fotos[i].h * 1.25)) grupo.push(fotos[i++]);
bf.push({ _alto: 275, columns: grupo.map(function (g) { return { width: (W - 24) / 3, stack: [{ image: g.data, fit: [(W - 24) / 3, 245], alignment: 'center' }, pie(g)] }; }), columnGap: 12, margin: [0, 6, 0, 6], unbreakable: true });
}
if (vids.length) {
bf.push(subtitulo('Videos (medios de prueba en la carpeta del caso)'));
bf.push({ ul: vids.map(function (v, k) { return { text: [{ text: 'Video ' + (k + 1) + (s(v.nota) ? ' — ' + s(v.nota) : '') + ': ' }, { text: s(v.nombre) || 'ver video', link: v.url, color: C.az2, decoration: 'underline' }], fontSize: 8.6 }; }) });
}
cont.push({ stack: bf });
}
cont.push({ text: 'Registrado por: ' + (s(d.registradoPor) || s(X.usuario)) + (/asesor/i.test(s(d.registradoPor)) || !/Zunino/i.test(s(d.registradoPor)) ? '' : ', Asesor en Prevención de Riesgos') +
' · Documento generado el ' + s(X.generado || '').slice(0, 10) + '.', fontSize: 7.6, color: C.gris, margin: [0, 12, 0, 0] });
return cont;
}
function pie(f) { return { text: [{ text: 'Foto ' + f._n, bold: true }, { text: s(f.nota) ? ' — ' + s(f.nota) : '' }], fontSize: 7.4, color: C.gris, alignment: 'center', margin: [0, 4, 0, 0] }; }
function tablaAzul(cabeza, anchos, filas, cebra) {
var est = 22; filas.forEach(function (r) { var mx = 1; r.forEach(function (c, k) { var w = typeof anchos[k] === 'number' ? anchos[k] : 180, tx = typeof c === 'object' ? JSON.stringify(c.text || c.stack || '') : String(c);
mx = Math.max(mx, Math.ceil(tx.length * 4.4 / Math.max(w - 10, 10))); }); est += mx * 10.5 + 13; });
return { _alto: est, table: { headerRows: 1, widths: anchos, dontBreakRows: true, body: [cabeza.map(function (h) { return { text: h, bold: true, color: '#fff', fillColor: C.az, fontSize: 7.8, alignment: 'center' }; })]
.concat(filas.map(function (r, i) { return r.map(function (c) { c = typeof c === 'object' ? c : { text: s(c) }; c.fontSize = c.fontSize || 8.6; if (cebra && i % 2 === 1 && !c.fillColor) c.fillColor = '#eef3fb'; return c; }); })) },
layout: { hLineWidth: function () { return 0.6; }, vLineWidth: function () { return 0.6; }, hLineColor: function () { return C.borde; }, vLineColor: function () { return C.borde; },
paddingLeft: function () { return 5; }, paddingRight: function () { return 5; }, paddingTop: function (i) { return i ? 6 : 5; }, paddingBottom: function (i) { return i ? 6 : 5; } } };
}
function bloqueDeclaracion(d, X, sec) {
var t = d.trabajador || {}, srv = d._srv || {};
var relato = s(d.declRelato), que = s(d.declQue), sug = s(d.declSugerencia);
if (!relato && !que) { // casos antiguos: separar el texto armado
var dec = s(d.declaracion);
var m1 = dec.match(/^Qué pasó:\s*(.+?)\.?\s*(\n|$)/i); if (m1) { que = m1[1]; dec = dec.replace(m1[0], ''); }
var m3 = dec.match(/Cómo se podría evitar \(opinión del trabajador\):\s*([\s\S]+)$/i); if (m3) { sug = m3[1].trim(); dec = dec.replace(m3[0], ''); }
dec = dec.replace(/^Qué pudo haber pasado:.*$/im, function (x) { que = que ? que + '. ' + x : x; return ''; });
relato = dec.trim();
}
var firma = X.firmaTrab, fechaDecl = dma(d.fechaDeclaracion) || s((firma && firma.fecha) || '').slice(0, 10);
var b = [sec('Declaración del trabajador', 260), kv([['¿Qué labor realizaba?', ni(d.labor, true)], ['¿Trabajo habitual?', ni(siNo(d.habitual))],
['¿Practica algún deporte?', vacio(d.deporte) ? 'No' : s(d.deporte)], ['Fecha de la declaración', fechaDecl ? fechaDecl + (firma ? ' (firma electrónica)' : '') : 'No informada']])];
var caja = [{ text: 'YO, ' + s(t.nombre) + ', DECLARO QUE:', bold: true, fontSize: 9.2, color: C.az, margin: [0, 0, 0, 8] }];
if (que) caja.push({ text: [{ text: 'Qué pasó: ', bold: true }, { text: que.replace(/\.?$/, '.') }], fontSize: 9, margin: [0, 0, 0, 7] });
if (relato) caja.push({ text: '“' + quitaComillas(relato) + '”', italics: true, fontSize: 9, lineHeight: 1.12, margin: [0, 0, 0, 8] });
else caja.push({ text: 'Sin relato registrado.', italics: true, color: C.gris, fontSize: 9, margin: [0, 0, 0, 8] });
var anexoTxt = X.anexos && X.anexos.length ? 'Transcripción literal de la declaración del trabajador. Documento original firmado: Anexo 1.' : 'Transcripción literal de la declaración del trabajador.';
caja.push({ columns: [
{ width: '*', stack: [{ text: 'Declaro que lo informado es verdadero y corresponde a lo que sé de los hechos.', italics: true, fontSize: 7.8, color: '#33435c' },
{ text: anexoTxt, fontSize: 6.6, color: C.gris, margin: [0, 2, 0, 0] }], margin: [0, firma ? 26 : 22, 0, 0] },
{ width: 150, stack: firma && firma.data ? [{ image: firma.data, fit: [118, 42], alignment: 'center' },
{ text: 'Firma electrónica simple (Ley 19.799)', fontSize: 6.6, color: C.ve, alignment: 'center', margin: [0, 2, 0, 0] },
{ text: s(firma.fecha), fontSize: 6.6, color: C.ve, alignment: 'center' }]
: [{ canvas: [{ type: 'line', x1: 10, y1: 38, x2: 140, y2: 38, lineWidth: 0.7, lineColor: '#333' }] }, { text: 'Firma del trabajador', fontSize: 7, color: C.gris, alignment: 'center', margin: [0, 2, 0, 0] }] }] });
if (sug) caja.push({ text: [{ text: 'Cómo se podría evitar (opinión del trabajador): ', bold: true }, { text: sug }], fontSize: 8.8, margin: [0, 8, 0, 0] });
b.push({ margin: [0, 8, 0, 0], table: { widths: ['*'], body: [[{ stack: caja, fillColor: C.decl }]] },
layout: { hLineWidth: function () { return 0.6; }, vLineWidth: function (i) { return i === 0 ? 3 : 0.6; }, hLineColor: function () { return C.borde; },
vLineColor: function (i) { return i === 0 ? C.az : C.borde; }, paddingLeft: function () { return 10; }, paddingRight: function () { return 10; }, paddingTop: function () { return 9; }, paddingBottom: function () { return 9; } } });
var tom = X.firmaTom || {}, nomR = s(tom.nombre || d.entrevistador), carR = s(tom.cargo || d.entrevistadorCargo);
var linea = '____________________';
b.push({ margin: [0, 8, 0, 0], table: { widths: ['*'], body: [[{ fillColor: C.decl, text: [{ text: 'Certificación de quien recibe la declaración. ', bold: true },
{ text: 'Yo, ' }, { text: nomR || linea, bold: !!nomR }, { text: ', cargo ' }, { text: carR || linea, bold: !!carR },
{ text: ', certifico que la declaración anterior fue entregada ante mí por el trabajador ' + s(t.nombre) + ', de la empresa ' }, { text: ni(t.empresa, true), bold: true },
{ text: ', y que se ajusta a los hechos relatados y registrados en este documento.' }], fontSize: 8.8, lineHeight: 1.1 }]] },
layout: { hLineWidth: function () { return 0.6; }, vLineWidth: function () { return 0.6; }, hLineColor: function () { return C.borde; }, vLineColor: function () { return C.borde; },
paddingLeft: function () { return 10; }, paddingRight: function () { return 10; }, paddingTop: function () { return 8; }, paddingBottom: function () { return 8; } } });
b.push({ columns: [{ text: '' }, { width: 230, stack: [
tom.data ? { image: tom.data, fit: [120, 40], alignment: 'center' } : { text: '', margin: [0, 34, 0, 0] },
{ canvas: [{ type: 'line', x1: 0, y1: 2, x2: 230, y2: 2, lineWidth: 0.7, lineColor: '#333' }] },
{ text: nomR && tom.data ? nomR + (carR ? ' — ' + carR : '') : 'Nombre y firma de quien recibe la declaración', fontSize: 7, color: C.gris, alignment: 'center', margin: [0, 3, 0, 0] }] }], margin: [0, 6, 0, 0] });
return { stack: b, unbreakable: true, _alto: 330 + Math.ceil((relato.length + que.length + sug.length) / 95) * 11 };
}
function lineaTiempo(d) {
var txt = s(d.descripcion);
if (!txt) return null;
var p = { a: '', d: '', s: '' }, m = txt.split(/\n?\s*(ANTES|DURANTE|DESPU[ÉE]S)\s*(?:\([^)]*\))?\s*:\s*/i);
if (m.length > 1) { for (var i = 1; i < m.length; i += 2) { var k = /^A/i.test(m[i]) ? 'a' : /^DU/i.test(m[i]) ? 'd' : 's'; p[k] = (p[k] ? p[k] + '\n' : '') + s(m[i + 1]); } }
else p.d = txt;
var col = [[C.az2, '#eef4fd', 'ANTES', p.a], [C.na, '#fff4e8', 'DURANTE', p.d], [C.ve, '#edf7ee', 'DESPUÉS', p.s]];
var cw = W / 3, cs = [];
cs.push({ type: 'line', x1: cw / 2, y1: 16, x2: W - cw / 2, y2: 16, lineWidth: 1.6, lineColor: '#9fb0cc' });
col.forEach(function (c, i) { var x = cw * i + cw / 2; cs.push({ type: 'ellipse', x: x, y: 16, r1: 8, r2: 8, color: '#fff', lineColor: c[0], lineWidth: 2.2 }, { type: 'ellipse', x: x, y: 16, r1: 3.6, r2: 3.6, color: c[0] }); });
var cab = { columns: col.map(function (c) { return { width: cw, text: c[2], bold: true, color: c[0], fontSize: 7.6, alignment: 'center' }; }) };
var cuerpo = col.map(function (c, i) {
var ps = parrafos(c[3]); return { fillColor: c[1], stack: ps.length ? ps.map(function (x) { return rico(x, { fontSize: 8.8, margin: [0, 0, 0, 7], lineHeight: 1.08 }); }) : [{ text: 'No informado', color: C.gris, fontSize: 8.8 }],
border: [true, true, true, true], borderColor: [c[0], c[0], c[0], c[0]] };
});
var mx = Math.max(p.a.length, p.d.length, p.s.length);
return { _alto: 70 + Math.ceil(mx / 30) * 10.5, stack: [cab, { canvas: cs, margin: [0, 1, 0, 0] }, { margin: [0, 4, 0, 0], table: { widths: ['*', '*', '*'], body: [cuerpo] },
layout: { hLineWidth: function () { return 1; }, vLineWidth: function () { return 1; }, paddingLeft: function () { return 7; }, paddingRight: function () { return 7; }, paddingTop: function () { return 7; }, paddingBottom: function () { return 2; } } }],
unbreakable: true };
}
function cuadrosCausas(d) {
var X4 = [['CAUSAS INMEDIATAS — ACCIONES INSEGURAS', d.accInseguras, C.ro, '#fdecea'], ['CAUSAS INMEDIATAS — CONDICIONES INSEGURAS', d.condInseguras, C.na, '#fff4e8'],
['CAUSAS BÁSICAS — FACTORES PERSONALES', d.factPersonales, C.az2, '#eef4fd'], ['CAUSAS BÁSICAS — FACTORES DEL TRABAJO', d.factTrabajo, C.az, '#eef4fd']];
var cab = function (x) { return { text: x[0], bold: true, color: '#fff', fontSize: 7.6, fillColor: x[2], border: [true, true, true, false], borderColor: [x[2], x[2], x[2], x[2]], margin: [2, 2, 0, 2] }; };
var cue = function (x) { var v = vacio(x[1]) ? { text: 'Sin causas identificadas en esta categoría.', color: C.gris, italics: true } : viñetas(x[1]);
v.fontSize = 8.8; v.fillColor = x[3]; v.border = [true, false, true, true]; v.borderColor = [x[2], x[2], x[2], x[2]]; v.margin = [2, 3, 0, 3]; return v; };
var sp = { text: '', border: [false, false, false, false] };
var fila = function (a, b) { return [[cab(a), sp, cab(b)], [cue(a), sp, cue(b)]]; };
return { stack: [0, 2].map(function (k) { return { margin: [0, k ? 9 : 2, 0, 0], table: { widths: ['*', 10, '*'], dontBreakRows: true, body: fila(X4[k], X4[k + 1]) },
layout: { hLineWidth: function () { return 0.8; }, vLineWidth: function () { return 0.8; }, paddingLeft: function () { return 6; }, paddingRight: function () { return 6; }, paddingTop: function () { return 4; }, paddingBottom: function () { return 4; } } }; }), unbreakable: true };
}
function sinUnb(n) { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(sinUnb); return; }
delete n.unbreakable; ['stack', 'columns', 'ul', 'ol'].forEach(function (k) { if (n[k]) sinUnb(n[k]); });
if (n.table && n.table.body) n.table.body.forEach(function (r) { r.forEach(sinUnb); }); }
function plano(cont) {
var out = [];
cont.forEach(function (n) {
if (!n || typeof n !== 'object') return;
var tieneSec = n.stack && n.stack[0] && n.stack[0].esSec;
if (n.unbreakable && n._alto != null && n._alto > 690) n.unbreakable = false;   // más alto que una página: se deja cortar
if (n.unbreakable) { var u = true; sinUnb(n.stack || n.columns || []); if (n.table) sinUnb(n); n.unbreakable = u;
if (tieneSec) delete n.stack[0].id; out.push(n); return; }
if (tieneSec) { // el título va siempre pegado a lo primero que sigue (sin títulos huérfanos)
var resto = n.stack.slice(1), prim = resto.shift(), sc = n.stack[0]; delete sc.id;
var g = { stack: [sc, prim] }, alto = prim && prim._alto != null ? prim._alto : 300;
sinUnb(g.stack); if (alto < 640) g.unbreakable = true; out.push(g);
resto.forEach(function (r) { var u = !!r.unbreakable && !(r._alto > 690); sinUnb(r); if (u) r.unbreakable = true; out.push(r); }); return; }
var u2 = !!n.unbreakable; sinUnb(n); if (u2) n.unbreakable = true; out.push(n);
});
return out;
}
function docDef(d, X, nAnexo, anexosInfo) {
var cont = plano(construir(d, X));
(anexosInfo || []).forEach(function (a, ia) {
for (var p = 0; p < a.paginas; p++) cont.push({ text: '', pageBreak: 'before', anexo: true });
});
var total = function (pc) { return pc; };
var nAx = (anexosInfo || []).reduce(function (s, a) { return s + a.paginas; }, 0);
var mapaAnexo = function (pagina, pc) { // devuelve {n, de, titulo, pie} si la página es de anexo
var ini = pc - nAx; if (pagina <= ini) return null; var k = pagina - ini;
for (var i = 0; i < anexosInfo.length; i++) { if (k <= anexosInfo[i].paginas) return { num: i + 1, p: k, de: anexosInfo[i].paginas, t: anexosInfo[i].titulo, pie: anexosInfo[i].pie }; k -= anexosInfo[i].paginas; }
return null;
};
var asesor = s(X.asesor) || 'Daniel Zunino Urrutia — Asesor en Prevención de Riesgos (Reg. BB/P-226)';
return {
pageSize: 'A4', pageMargins: [45, 40, 45, 52],
info: { title: 'Reporte e Investigación de Evento — Caso ' + s(d.id), author: asesor.split(' — ')[0] + ' — Integra Prevención SpA', subject: (d.tipos || []).join(' + '), creator: 'Portal Integra Prevención' },
defaultStyle: { font: 'Lato', fontSize: 9, color: C.tx, lineHeight: 1.05 },
background: function (pagina, tam) {
var a = mapaAnexo(pagina, X._pc || 0);
var fondo = [{ canvas: [{ type: 'rect', x: 0, y: 0, w: tam.width, h: 11, color: C.az }, { type: 'rect', x: 0, y: 0, w: 108, h: 11, color: C.na }] }];
if (a) { var txt = 'ANEXO ' + a.num + ' — ' + a.t + (a.de > 1 ? ' (' + a.p + '/' + a.de + ')' : ''), w = (MED ? MED(txt, 7.4, true) : txt.length * 4) + 34;
fondo.push({ absolutePosition: { x: tam.width - 45 - w, y: 18 }, columns: [{ width: w, stack: [{ canvas: [{ type: 'rect', x: 0, y: 0, w: w, h: 17, r: 5, color: C.na }] },
sobre({ text: txt, color: '#fff', bold: true, fontSize: 7.4, alignment: 'center' }, 0, -13.2, w)] }] }); }
return fondo;
},
footer: function (pagina, pc) {
var a = mapaAnexo(pagina, pc);
return { margin: [45, 14, 45, 0], stack: [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: W, y2: 0, lineWidth: 0.6, lineColor: '#b9c6dc' }] },
{ columns: [{ text: a ? s(a.pie) + ' · Integra Prevención SpA' : asesor + ' · Integra Prevención SpA', fontSize: 6.8, color: C.gris },
{ text: 'Caso N° ' + s(d.id) + ' · Página ' + pagina + ' de ' + pc, fontSize: 6.8, color: C.gris, alignment: 'right', width: 150 }], margin: [0, 6, 0, 0] }] };
},
content: cont
};
}
function b64aBytes(b) { var bin = atob(b), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
async function generar(d, X, libs) {
libs = libs || {};
var pdfMake = libs.pdfMake || root.pdfMake, PDFLib = libs.PDFLib || root.PDFLib;
MED = libs.medidor || MED;
var anexos = [];
for (var i = 0; i < (X.anexos || []).length; i++) {
var a = X.anexos[i];
try { var bytes = a.bytes || b64aBytes(a.b64); var doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
anexos.push({ titulo: a.titulo, pie: a.pie, paginas: doc.getPageCount(), doc: doc, bytes: bytes }); } catch (e) { console.warn('anexo', e); }
}
X.anexos = anexos;
var dd = docDef(d, X, 0, anexos);
var buf = await new Promise(function (ok, ko) { try { pdfMake.createPdf(dd, null, libs.fuentes).getBuffer(function (b) { ok(b); }); } catch (e) { ko(e); } });
var base = await PDFLib.PDFDocument.load(buf);
var pc = base.getPageCount();
if (anexos.length) {
X._pc = pc; dd = docDef(d, X, 0, anexos);
buf = await new Promise(function (ok) { pdfMake.createPdf(dd, null, libs.fuentes).getBuffer(function (b) { ok(b); }); });
base = await PDFLib.PDFDocument.load(buf); pc = base.getPageCount();
var nAx = anexos.reduce(function (s, a) { return s + a.paginas; }, 0), pag = pc - nAx;
for (var k = 0; k < anexos.length; k++) {
var orig = anexos[k].doc;
for (var j = 0; j < anexos[k].paginas; j++) {
var emb = await base.embedPage(orig.getPage(j)), dest = base.getPage(pag++);
var Wp = dest.getWidth(), Hp = dest.getHeight(), ow = emb.width, oh = emb.height;
var esc = Math.min((Wp - 70) / ow, (Hp - 48 - 58) / oh);
dest.drawPage(emb, { x: (Wp - ow * esc) / 2, y: Hp - 44 - oh * esc, width: ow * esc, height: oh * esc });
}
}
}
base.setTitle('Reporte e Investigación de Evento — Caso ' + s(d.id));
return await base.save();
}
function nombreArchivo(d) {
var p = titulo(s((d.trabajador || {}).nombre)).split(' ').filter(String);
var r = p.length >= 4 ? [p[0], p[2]] : p.length === 3 ? [p[0], p[1]] : p;
var base = esLK(d) ? 'Informe Ley Karin ' + s(d.id) : 'Informe ' + r.join(' ');
return (base + ' ' + dma(d.fechaDMA || d.fecha)).replace(/[\/\\:*?"<>|_]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 110) + '.pdf';
}
root.Informe = { generar: generar, docDef: docDef, nombreArchivo: nombreArchivo, letrasArbol: letrasArbol, setMedidor: function (f) { MED = f; } };
})(typeof window !== 'undefined' ? window : global);
