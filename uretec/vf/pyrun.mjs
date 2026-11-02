// node pyrun.mjs dosya.py [paket,...] — veri modülü ve veriyle Pyodide'de çalıştırır
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const require = createRequire('/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/pyo/');
const { loadPyodide } = require('pyodide'); const root = '/home/claude/py';
const py = await loadPyodide();
py.FS.mkdirTree('/pp_lib'); py.FS.writeFile('/pp_lib/veri.py', fs.readFileSync(root + '/tools/pylib/veri.py', 'utf8'));
const walk = (d, rel) => { for (const n of fs.readdirSync(d)) { const p = path.join(d, n), r = rel + '/' + n; if (fs.statSync(p).isDirectory()) { py.FS.mkdirTree(r); walk(p, r); } else py.FS.writeFile(r, fs.readFileSync(p)); } };
py.FS.mkdirTree('/data'); walk(root + '/data', '/data');
const code = fs.readFileSync(process.argv[2], 'utf8');
await py.loadPackage((process.argv[3] || '').split(',').filter(Boolean), { messageCallback: () => {} });
await py.loadPackagesFromImports(code, { messageCallback: () => {} });
await py.runPythonAsync('import sys\nsys.path.insert(0, "/pp_lib")\n' + code);
