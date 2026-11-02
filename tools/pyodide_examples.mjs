// Ders gövdelerindeki <pre class="py"> örneklerini GERÇEK tarayıcı motoruyla (Pyodide) çalıştırır.
// Uygulamadaki gibi: her ders kendi kalıcı ad alanında (defter modu), paketler importlardan yüklenir.
// Kullanım: node pyodide_examples.mjs dosya1.js [...]
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);   // npm install (package.json: pyodide)
const { loadPyodide } = require('pyodide');
const window = { console }; globalThis.window = window;
for (const f of process.argv.slice(2)) new Function('window', fs.readFileSync(f, 'utf8'))(window);
const items = [];
(window.PY_LESSONS || []).forEach(l => items.push([l.id, l.body || '', l.needs || []]));
(window.PY_EXT || []).forEach(x => items.push([x.id + ' (uzantı)', x.html || '', []]));
const unesc = s => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const engine = fs.readFileSync(path.join(root, 'engine.js'), 'utf8');
const PRELUDE = eval('`' + engine.match(/const PRELUDE = `([\s\S]*?)`;/)[1] + '`');
const py = await loadPyodide();
await py.runPythonAsync(PRELUDE);
py.FS.mkdirTree('/pp_lib'); py.FS.writeFile('/pp_lib/veri.py', fs.readFileSync(path.join(root, 'tools/pylib/veri.py'), 'utf8'));
const walk = (d, rel) => { for (const n of fs.readdirSync(d)) { const p = path.join(d, n), r = rel + '/' + n; if (fs.statSync(p).isDirectory()) { py.FS.mkdirTree(r); walk(p, r); } else py.FS.writeFile(r, fs.readFileSync(p)); } };
py.FS.mkdirTree('/data'); walk(path.join(root, 'data'), '/data');
await py.runPythonAsync('import sys\nsys.path.insert(0, "/pp_lib")');
const run = py.globals.get('_pp_run'); const LOADED = new Set(); const q = { messageCallback: () => {} };
let total = 0, bad = 0, yok = 0;
for (const [lid, body, needs] of items) {
  const blocks = [...body.matchAll(/<pre class="py">([\s\S]*?)<\/pre>/g)].map(m => unesc(m[1]).replace(/^\n+|\n+$/g, ''));
  if (!blocks.length) continue;
  const ns = 'ex:' + lid;
  for (let i = 0; i < blocks.length; i++) {
    const code = blocks[i]; total++;
    if (/input\(/.test(code)) continue;
    const need = [...needs].filter(x => !LOADED.has(x));
    if (/veri\.(oku|hepsi)\b/.test(code)) need.push('pandas'); if (/veri\.baglan\b/.test(code)) need.push('sqlite3'); if (/\bhashlib\b/.test(code)) need.push('hashlib');
    const nn = need.filter(x => !LOADED.has(x));
    if (nn.length) { try { await py.loadPackage(nn, q); nn.forEach(x => LOADED.add(x)); if (nn.includes('hashlib')) await py.runPythonAsync('import sys\nfor _m in ("hashlib", "_hashlib", "hmac", "secrets"): sys.modules.pop(_m, None)'); } catch (x) {} }
    try { await py.loadPackagesFromImports(code, q); } catch (x) {}
    if (/matplotlib/.test(code) && !LOADED.has('agg')) { try { await py.runPythonAsync('import matplotlib\nmatplotlib.use("Agg")'); LOADED.add('agg'); } catch (x) {} }
    if (/\bpolars\b/.test(code)) { if (/parquet|duckdb|to_arrow|to_pandas|pyarrow/.test(code) && !LOADED.has('pyarrow')) { try { await py.loadPackage(['pyarrow'], q); LOADED.add('pyarrow'); } catch (x) {} } await py.runPythonAsync('_pp_polars_patch()'); }
    if (process.env.TRACE) console.log('> ' + lid + ' #' + i);
    let r; const t1 = Date.now();
    try { r = JSON.parse(run(code, '', [], '<ornek>', ns, null)); } catch (x) { r = { err: { type: 'JS', msg: String(x).slice(-300) } }; }
    if (Date.now() - t1 > 8000) console.log('YAVAŞ ' + lid + ' örnek#' + i + ' ' + Math.round((Date.now() - t1) / 1000) + ' sn');
    if (r.err) {
      if (r.err.type === 'ModuleNotFoundError') { yok++; console.log('YOK ' + lid + ' örnek#' + i + ': ' + r.err.msg); }
      else { bad++; console.log('HATA ' + lid + ' örnek#' + i + ': ' + r.err.type + ': ' + String(r.err.msg).slice(0, 300)); }
    }
  }
  await py.runPythonAsync('_PP_NS.clear()');
}
console.log(`pyodide örnek: ${total}, hata=${bad}, paket-yok=${yok}`);
