// Tüm alıştırmaları GERÇEK tarayıcı motoruyla (Pyodide 0.27, Node içinde) çalıştırır.
// Uygulamadaki motorun PRELUDE'unu (uyumluluk katmanı dahil) aynen kullanır.
// Üçüncü taraf paket isteyenler atlanır (paketler CDN'den gelir; burada yalnız standart kütüphane var).
// Kullanım: node pyodide_verify.mjs dosya1.js [...]
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);   // npm install (package.json: pyodide)
const { loadPyodide } = require('pyodide');
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null; const files = process.argv.slice(2);
const window = { console }; globalThis.window = window;
for (const f of files) new Function('window', fs.readFileSync(f, 'utf8'))(window);
const L = window.PY_LESSONS || []; const lm = {}; L.forEach(l => lm[l.id] = l);
(window.PY_EXT || []).forEach(x => { if (lm[x.id]) lm[x.id].ex = (lm[x.id].ex || []).concat(x.ex || []); else L.push({ id: x.id + '(uzantı)', ex: x.ex || [] }); });
const items = [];
L.forEach(l => (l.ex || []).forEach((e, i) => { if (['code', 'predict', 'order'].includes(e.t) && !e.plain) items.push([l.id + '#' + (e.id || i), e]); }));
(window.PY_BANK || []).forEach(t => items.push(['bank#' + t.id, t]));
(window.PY_EXAMS || []).forEach(x => x.qs.forEach((q, i) => { if (['code', 'predict', 'order'].includes(q.t)) items.push(['exam ' + x.id + '#' + i, q]); }));
(window.PY_ARENA || []).forEach(a => { if (a.mode === 'func') items.push(['arena#' + a.id, { t: 'code', sol: a.sol, tests: a.tests, needs: a.needs }]); else [...(a.samples || []), ...(a.hidden || [])].forEach((c, i) => items.push(['arena#' + a.id + '/' + i, { t: 'arena', sol: a.sol, inp: c.in, gen: c.gen, out: c.out, needs: a.needs }])); });
(window.PY_INTERVIEW || []).forEach(q => { if (q.code) items.push(['mulakat#' + q.id, { t: 'iv', sol: q.code, out: q.out }]); });
(window.PY_MISTAKES || []).forEach(m => { items.push(['hata#' + m.id + '/bad', { t: 'mist', sol: m.bad, out: m.bad_out, err: m.bad_err }]); items.push(['hata#' + m.id + '/good', { t: 'mist', sol: m.good, out: m.good_out }]); });
const engine = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'pyworker.js'), 'utf8');
const PRELUDE = eval('`' + engine.match(/const PRELUDE = `([\s\S]*?)`;/)[1] + '`');
const py = await loadPyodide();
await py.runPythonAsync(PRELUDE);
{ const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
  py.FS.mkdirTree('/pp_lib'); py.FS.writeFile('/pp_lib/veri.py', fs.readFileSync(path.join(root, 'tools/pylib/veri.py'), 'utf8'));
  const walk = (d, rel) => { for (const n of fs.readdirSync(d)) { const p = path.join(d, n), r = rel + '/' + n; if (fs.statSync(p).isDirectory()) { py.FS.mkdirTree(r); walk(p, r); } else py.FS.writeFile(r, fs.readFileSync(p)); } };
  py.FS.mkdirTree('/data'); walk(path.join(root, 'data'), '/data');
  await py.runPythonAsync('import sys\nsys.path.insert(0, "/pp_lib")'); }
await py.runPythonAsync(`
import sys, re as _re
_STD = set(sys.stdlib_module_names) | {"_pp", "veri"}
def _pp_third(src):
    import ast as _ast
    mods = set()
    try:
        for n in _ast.walk(_ast.parse(src)):
            if isinstance(n, _ast.Import): mods |= {a.name.split(".")[0] for a in n.names}
            elif isinstance(n, _ast.ImportFrom) and n.module and not n.level: mods.add(n.module.split(".")[0])
    except SyntaxError:
        mods = set(_re.findall(r"^\\s*(?:import|from)\\s+([A-Za-z_]\\w*)", src, _re.M))
    if "pbkdf2_hmac" in src or "scrypt" in src: mods.add("hashlib(openssl)")
    if _re.search(r"veri\\.(oku|hepsi)\\b", src): mods.add("pandas")
    if _re.search(r"veri\\.baglan\\b", src): mods.add("sqlite3")
    import importlib.util as _iu
    def _ok(m):
        if m not in _STD: return False
        try: return _iu.find_spec(m) is not None
        except Exception: return False
    return sorted(m for m in mods if not _ok(m))
`);
const third = py.globals.get('_pp_third'); const run = py.globals.get('_pp_run');
const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').trim();
const LOADED = new Set(); let ok = 0, bad = 0, skip = 0; const skipped = {};
let k = 0; const T0 = Date.now();
for (const [name, e] of items) {
  if (ONLY && !ONLY.test(name)) continue;
  if (process.env.START && k < +process.env.START) { k++; continue; }
  if (process.env.TRACE) console.log('> ' + name);
  if (++k % 50 === 0) console.log('… ' + k + '/' + items.length + ' (' + Math.round((Date.now() - T0) / 1000) + ' sn) ' + name);
  const t1 = Date.now();
  const code = e.t === 'predict' ? e.code : e.t === 'order' ? e.lines.join('\n') + '\n' : e.sol;
  const tests = e.t === 'predict' ? '' : (e.tests || '');
  const src = code + '\n' + tests + '\n' + (e.gen || '');
  if (process.env.NOPKG) { const t = third(src).toJs(); if (t.length || (e.needs && e.needs.length)) { skip++; (t.length ? t : e.needs).forEach(m => skipped[m] = (skipped[m] || 0) + 1); continue; } }
  else {
    const need = [...(e.needs || [])]; if (/veri\.(oku|hepsi)\b/.test(src)) need.push('pandas'); if (/veri\.baglan\b/.test(src)) need.push('sqlite3'); if (/\bhashlib\b/.test(src)) need.push('hashlib');
    const nn = need.filter(x => !LOADED.has(x));
    if (nn.length) { try { await py.loadPackage(nn, { messageCallback: () => {} }); nn.forEach(x => LOADED.add(x)); if (nn.includes('hashlib')) await py.runPythonAsync('import sys\nfor _m in ("hashlib", "_hashlib", "hmac", "secrets"): sys.modules.pop(_m, None)'); } catch (x) { nn.forEach(m => skipped['yok:' + m] = (skipped['yok:' + m] || 0) + 1); } }
    try { await py.loadPackagesFromImports(src, { messageCallback: () => {} }); } catch (x) {}
    if (/\bpolars\b/.test(src)) { if (/parquet|duckdb|to_arrow|to_pandas|pyarrow/.test(src) && !LOADED.has('pyarrow')) { try { await py.loadPackage(['pyarrow'], { messageCallback: () => {} }); LOADED.add('pyarrow'); } catch (x) {} } await py.runPythonAsync('_pp_polars_patch()'); }
    if (/matplotlib/.test(src) && !LOADED.has('agg')) { try { await py.runPythonAsync('import matplotlib\nmatplotlib.use("Agg")'); LOADED.add('agg'); } catch (x) {} }
  }
  let raw = null;
  if (e.t === 'arena') { raw = e.inp; if (e.gen) { const g = JSON.parse(run(e.gen, '', [], '<gen>', '')); raw = g.out; } }
  let r; try { r = JSON.parse(run(code, tests, (e.stdin || []).map(String), '<kodun>', 'v:' + name, raw)); } catch (x) { r = { out: '', err: { type: 'JS', msg: String(x).slice(-300) } }; }
  await py.runPythonAsync('_PP_NS.clear()');
  let msg = '';
  if (e.t === 'predict') {
    const want = e.o[e.a];
    if (e.raises) { if (!r.err || !want.includes(r.err.type)) msg = 'hata türü: ' + (r.err ? r.err.type : 'yok'); }
    else if (r.err) msg = r.err.type + ': ' + r.err.msg; else if (norm(r.out) !== norm(want)) msg = 'çıktı farklı:\n  beklenen: ' + JSON.stringify(norm(want)) + '\n  gelen   : ' + JSON.stringify(norm(r.out));
  } else if (e.t === 'arena' || e.t === 'iv' || e.t === 'mist') {
    if (e.err) { if (!r.err || r.err.type !== e.err) msg = 'beklenen hata ' + e.err + ', gelen ' + (r.err ? r.err.type : 'yok'); }
    else if (r.err && !(e.t === 'iv' && e.out && e.out.includes(r.err.type))) msg = r.err.type + ': ' + r.err.msg;
    else if (e.out != null && !r.err && norm(r.out) !== norm(e.out)) msg = 'çıktı farklı:\n  beklenen: ' + JSON.stringify(norm(e.out)).slice(0, 200) + '\n  gelen   : ' + JSON.stringify(norm(r.out)).slice(0, 200);
  } else {
    if (r.err) msg = r.err.type + ' (' + r.err.phase + (r.err.line ? ' satır ' + r.err.line : '') + '): ' + r.err.msg;
    else if (e.expect != null && norm(r.out) !== norm(e.expect)) msg = 'çıktı farklı:\n  beklenen: ' + JSON.stringify(norm(e.expect)).slice(0, 300) + '\n  gelen   : ' + JSON.stringify(norm(r.out)).slice(0, 300);
  }
  if (Date.now() - t1 > 8000) console.log('YAVAŞ ' + name + ' ' + Math.round((Date.now() - t1) / 1000) + ' sn');
  if (msg) { bad++; console.log('FAIL ' + name + '\n    ' + msg.slice(0, 600)); } else ok++;
}
console.log(`pyodide: PASS=${ok} FAIL=${bad} atlanan(paket)=${skip} ${JSON.stringify(skipped)}`);
