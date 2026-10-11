// Mis tareas - servidor básico sin dependencias (Node.js)
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || __dirname;
fs.mkdirSync(DATA_DIR, { recursive: true });
const DATA = path.join(DATA_DIR, 'tareas.json');
const INDEX = path.join(__dirname, 'public', 'index.html');

function load() {
  try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch { return []; }
}
function save(t) { fs.writeFileSync(DATA + '.tmp', JSON.stringify(t, null, 2)); fs.renameSync(DATA + '.tmp', DATA); }
function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(obj === undefined ? '' : JSON.stringify(obj));
}
// Categorías permitidas (deben coincidir con CATEGORIAS de public/index.html). '' = sin categoría.
const CATEGORIAS = ['', 'Trabajo', 'Personal', 'Casa', 'Compras', 'Salud', 'Estudio'];
const LIMITE = 1e5; // 100 KB por petición

function errorHttp(status, msg) { const e = new Error(msg); e.status = status; return e; }
// Devuelve la categoría válida o lanza 400 si no está en la lista.
function normCat(v) {
  const c = (v === undefined || v === null) ? '' : (typeof v === 'string' ? v.trim() : null);
  if (c === null || !CATEGORIAS.includes(c)) throw errorHttp(400, 'Categoría no válida');
  return c;
}
// Devuelve '' (sin fecha) o una fecha YYYY-MM-DD que exista de verdad; si no, lanza 400.
function normFecha(v) {
  if (v === undefined || v === null || v === '') return '';
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw errorHttp(400, 'Fecha no válida');
  const [y, m, d] = v.split('-').map(Number);
  const f = new Date(Date.UTC(y, m - 1, d));
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== m - 1 || f.getUTCDate() !== d) throw errorHttp(400, 'Fecha no válida');
  return v;
}
function body(req) {
  return new Promise((ok, fail) => {
    if (Number(req.headers['content-length']) > LIMITE) return fail(errorHttp(413, 'Petición demasiado grande'));
    const partes = []; let total = 0, excedido = false;
    req.on('data', c => {
      if (excedido) return;
      total += c.length;
      if (total > LIMITE) { excedido = true; partes.length = 0; return fail(errorHttp(413, 'Petición demasiado grande')); }
      partes.push(c);
    });
    req.on('end', () => {
      if (excedido) return;
      const d = Buffer.concat(partes).toString('utf8');
      try { ok(d ? JSON.parse(d) : {}); } catch (e) { fail(errorHttp(400, 'Petición inválida')); }
    });
    req.on('error', fail);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const m = url.pathname.match(/^\/api\/tareas(?:\/([\w-]+))?$/);
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(INDEX).pipe(res);
    }
    if (!m) return json(res, 404, { error: 'No encontrado' });
    const id = m[1];
    let tareas = load();
    if (req.method === 'GET' && !id) return json(res, 200, tareas);
    if (req.method === 'POST' && !id) {
      const { texto, categoria, prioridad, vence } = await body(req);
      if (!texto || !String(texto).trim()) return json(res, 400, { error: 'El texto es obligatorio' });
      let pr = typeof prioridad === 'string' ? prioridad.toLowerCase() : '';
      if (pr !== 'alta' && pr !== 'media' && pr !== 'baja') pr = 'media';
      const v = normFecha(vence);
      const t = { id: crypto.randomUUID(), texto: String(texto).trim().slice(0, 200), hecha: false, categoria: normCat(categoria), creada: new Date().toISOString(), prioridad: pr, vence: v };
      tareas.push(t); save(tareas); return json(res, 201, t);
    }
    const t = tareas.find(x => x.id === id);
    if (id && !t) return json(res, 404, { error: 'Tarea no encontrada' });
    if (req.method === 'PATCH' && id) {
      const b = await body(req);
      const hasHecha = typeof b.hecha === 'boolean';
      const hasTexto = typeof b.texto === 'string';
      const hasCat = 'categoria' in b;
      const hasPr = 'prioridad' in b;
      const hasVen = 'vence' in b;
      // Validar todo antes de modificar la tarea
      const txt = hasTexto ? b.texto.trim() : '';
      if (hasTexto && !txt) return json(res, 400, { error: 'El texto es obligatorio' });
      const cat = hasCat ? normCat(b.categoria) : null;
      const ven = hasVen ? normFecha(b.vence) : null;
      const estabaHecha = !!t.hecha;
      if (!hasHecha && !hasTexto && !hasCat && !hasPr && !hasVen) {
        t.hecha = !t.hecha;
      } else {
        if (hasHecha) t.hecha = b.hecha;
        if (hasTexto) t.texto = txt.slice(0, 200);
        if (hasCat) t.categoria = cat;
        if (hasPr) {
          const pr = typeof b.prioridad === 'string' ? b.prioridad.toLowerCase() : '';
          if (pr === 'alta' || pr === 'media' || pr === 'baja') t.prioridad = pr;
        }
        if (hasVen) t.vence = ven;
      }
      // 'completada' solo cambia cuando cambia 'hecha' (editar texto no la toca)
      if (!!t.hecha !== estabaHecha) {
        if (t.hecha) t.completada = new Date().toISOString();
        else delete t.completada;
      }
      save(tareas); return json(res, 200, t);
    }
    if (req.method === 'DELETE' && id) {
      save(tareas.filter(x => x.id !== id)); res.writeHead(204); return res.end();
    }
    if (req.method === 'DELETE' && !id && url.searchParams.get('hechas') === '1') {
      save(tareas.filter(x => !x.hecha)); res.writeHead(204); return res.end();
    }
    json(res, 405, { error: 'Método no permitido' });
  } catch (e) {
    const status = e && e.status ? e.status : 400;
    if (status === 413) res.setHeader('Connection', 'close');
    json(res, status, { error: status === 400 && !e.status ? 'Petición inválida' : e.message });
  }
}).listen(PORT, HOST, () => console.log(`Mis tareas en http://${HOST}:${PORT}`));
