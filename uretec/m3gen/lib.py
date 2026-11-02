import subprocess, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUTDIR = '/home/claude/py/v3/m3'
ORDER = ['id','roles','lv','topic','kind','q','a','code','out','follow','flags','tip']

def jsq(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')
    s = s.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    assert '\ufffd' not in s
    return "'" + s + "'"

def val(v):
    if isinstance(v, list): return '[' + ', '.join(jsq(x) for x in v) + ']'
    return jsq(v)

def run(cid):
    code = open(os.path.join(HERE, 'c', cid + '.py'), encoding='utf-8').read()
    p = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, cwd='/tmp')
    if p.returncode: raise SystemExit(f'{cid} hata: {p.stderr}')
    return code, '\n'.join(l.rstrip() for l in p.stdout.split('\n')).strip('\n')

def emit(fname, items):
    parts = []
    for it in items:
        it = dict(it)
        if it.pop('c', False):
            it['code'], it['out'] = run(it['id'][2:])
        it['a'] = ''.join(l.strip() for l in it['a'].strip().splitlines())
        for k in ('q','a','tip','topic'): it[k] = it[k].strip()
        keys = [k for k in ORDER if k in it]
        assert set(it) <= set(ORDER), set(it) - set(ORDER)
        body = ',\n  '.join(f'{k}: {val(it[k])}' for k in keys)
        parts.append('{ ' + body + ' }')
    js = "(function (W) { 'use strict'; const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || []; Q.push(\n" + ',\n'.join(parts) + '\n); })(window);\n'
    os.makedirs(OUTDIR, exist_ok=True)
    open(os.path.join(OUTDIR, fname), 'w', encoding='utf-8').write(js)
    print('yazıldı', fname, len(items))
