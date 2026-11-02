"""Spec (Python) -> PY_BANK JS dosyası. Kullanım: python3 gen.py specNN.py cikti.js"""
import sys, runpy
ORDER = ['id','lv','topic','diff','t','kind','title','q','code','o','a','raises','lines','start','sol','tests','expect','stdin','guide','example','hint','hints','why','tags','min']
CODEF = {'code','start','sol','tests','expect','example'}
def s(v):
    return "'" + v.replace('\\','\\\\').replace("'", "\\'").replace('\n','\\n') + "'"
def val(v):
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, str): return s(v)
    if isinstance(v, list): return '[' + ', '.join(val(x) for x in v) + ']'
    raise TypeError(v)
def clean(k, v):
    if k in CODEF and isinstance(v, str):
        v = v.lstrip('\n')
        if not v.endswith('\n'): v += '\n'
    if k == 'lines': v = [x for x in v]
    return v
spec = runpy.run_path(sys.argv[1])
start = spec['START']; tasks = spec['TASKS']
out = ['/* PythonPatika — pratik bankası, temel (sürüm 2): b-%03d … b-%03d */' % (start, start + len(tasks) - 1), '(function (W) {', "'use strict';", 'const B = W.PY_BANK = W.PY_BANK || [];', 'B.push(']
items = []
for i, t in enumerate(tasks):
    t = dict(t); t['id'] = 'b-%03d' % (start + i); t['lv'] = 'temel'
    for k in t:
        if k not in ORDER: raise SystemExit('bilinmeyen alan %s in %s' % (k, t['id']))
    for req in ('topic','diff','title','q','tags','min','hints','why'):
        if req not in t: raise SystemExit('%s eksik: %s' % (req, t['id']))
    if t.get('kind') == 'rehberli':
        for req in ('guide','example','start'):
            if req not in t: raise SystemExit('%s eksik: %s' % (req, t['id']))
    parts = []
    for k in ORDER:
        if k in t: parts.append('    %s: %s' % (k, val(clean(k, t[k]))))
    items.append('  {\n' + ',\n'.join(parts) + '\n  }')
out.append(',\n'.join(items))
out.append(');')
out.append('})(window);')
open(sys.argv[2], 'w').write('\n'.join(out) + '\n')
print('yazıldı', sys.argv[2], len(tasks))
