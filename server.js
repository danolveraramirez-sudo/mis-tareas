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
function body(req) {
  return new Promise((ok, fail) => {
    let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); });
    req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch (e) { fail(e); } });
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
      const { texto } = await body(req);
      if (!texto || !String(texto).trim()) return json(res, 400, { error: 'El texto es obligatorio' });
      const t = { id: crypto.randomUUID(), texto: String(texto).trim().slice(0, 200), hecha: false, creada: new Date().toISOString() };
      tareas.push(t); save(tareas); return json(res, 201, t);
    }
    const t = tareas.find(x => x.id === id);
    if (id && !t) return json(res, 404, { error: 'Tarea no encontrada' });
    if (req.method === 'PATCH' && id) {
      const b = await body(req);
      t.hecha = typeof b.hecha === 'boolean' ? b.hecha : !t.hecha;
      save(tareas); return json(res, 200, t);
    }
    if (req.method === 'DELETE' && id) {
      save(tareas.filter(x => x.id !== id)); res.writeHead(204); return res.end();
    }
    if (req.method === 'DELETE' && !id && url.searchParams.get('hechas') === '1') {
      save(tareas.filter(x => !x.hecha)); res.writeHead(204); return res.end();
    }
    json(res, 405, { error: 'Método no permitido' });
  } catch (e) { json(res, 400, { error: 'Petición inválida' }); }
}).listen(PORT, HOST, () => console.log(`Mis tareas en http://${HOST}:${PORT}`));
