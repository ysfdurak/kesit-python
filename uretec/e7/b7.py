"""e7 uzantı derleyici: spec modülü (html'de pre()/precode() kullanır, EXT tanımlar) -> /home/claude/py/v2/e7/<id>.js"""
import sys, re, json, subprocess, html as H, builtins, os

OUT = '/home/claude/py/v2/e7/'
RUN = []
def pre(code):
    code = code.strip('\n') + '\n'; RUN.append(code)
    return '<pre class="py">' + H.escape(code, quote=False) + '</pre>'
def precode(code):
    code = code.strip('\n') + '\n'
    return '<pre class="code">' + H.escape(code, quote=False) + '</pre>'
builtins.pre = pre; builtins.precode = precode

def js(v, ind=2):
    sp = ' ' * ind
    if isinstance(v, str):
        return "'" + v.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029') + "'"
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return json.dumps(v)
    if isinstance(v, list):
        if all(isinstance(x, (str, int)) for x in v) and sum(len(str(x)) for x in v) < 100:
            return '[' + ', '.join(js(x) for x in v) + ']'
        return '[\n' + ',\n'.join(sp + '  ' + js(x, ind + 2) for x in v) + '\n' + sp + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(k + ': ' + js(x, ind + 2) for k, x in v.items()) + ' }'
    raise TypeError(type(v))

def build(path):
    RUN.clear()
    g = {'pre': pre, 'precode': precode, '__name__': 'spec'}
    exec(compile(open(path).read(), path, 'exec'), g)
    E = g['EXT']; h = E['html']
    assert '`' not in h and '${' not in h, 'html içinde backtick/${'
    words = len(re.sub(r'<[^>]+>', ' ', h).split())
    os.makedirs('run', exist_ok=True)
    bad = 0
    for i, c in enumerate(RUN):
        p = subprocess.run([sys.executable, '-I', '-c', c], capture_output=True, text=True, timeout=120, cwd='run')
        if p.returncode: bad += 1; print(f'ÖRNEK {i} HATA:\n{c}\n{p.stderr[-800:]}')
        elif '-v' in sys.argv: print(f'--- örnek {i}\n{p.stdout}')
    for e in E['ex']:
        if e.get('example'):
            p = subprocess.run([sys.executable, '-I', '-c', e['example']], capture_output=True, text=True, timeout=60, cwd='run')
            if p.returncode: bad += 1; print(f"EXAMPLE {e.get('id')} HATA:\n{p.stderr[-600:]}")
    parts = [f"  id: {js(E['id'])}", f"  min: {E['min']}", '  html: `\n' + h.replace('\\', '\\\\').strip() + '\n`']
    for k in ('ex', 'faq', 'mistakes'): parts.append(f'  {k}: ' + js(E[k], 2))
    src = (f"/* Kesit Python — v2 e7 uzantı (Derinleş): {E['id']} */\n(function (W) {{\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push(\n{{\n" + ',\n'.join(parts) + '\n}\n);\n})(window);\n')
    out = OUT + E['id'] + '.js'; open(out, 'w').write(src)
    st = {}
    for e in E['ex']: st[e.get('stage')] = st.get(e.get('stage'), 0) + 1
    print(f"{out}: kelime={words} örnek={len(RUN)} örnek-hata={bad} tablo={h.count('<table')} ex={len(E['ex'])} {st}")

for p in sys.argv[1:]:
    if not p.startswith('-'): build(p)
