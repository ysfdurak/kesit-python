#!/usr/bin/env python3
"""gen.py <data.py>: data.py defines EXT dict; writes /home/claude/py/v2/e3/<id>.js, runs pre.py examples."""
import sys, re, html, subprocess, tempfile, os, runpy, textwrap
ns = runpy.run_path(sys.argv[1])
X = ns['EXT']

def jstr(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n').replace('\t', '\\t')
    return "'" + s + "'"

def ident(k):
    return re.fullmatch(r'[A-Za-z_]\w*', k) is not None

def js(v, ind=1):
    p = '  ' * ind
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, str): return jstr(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 160:
            return '[' + ', '.join(js(x) for x in v) + ']'
        return '[\n' + ',\n'.join(p + '  ' + js(x, ind + 1) for x in v) + '\n' + p + ']'
    if isinstance(v, dict):
        parts = []
        for k, val in v.items():
            kk = k if ident(k) else jstr(k)
            parts.append(f'{kk}: {js(val, ind + 1)}')
        return '{ ' + ',\n'.join(('' if i == 0 else p + '  ') + x for i, x in enumerate(parts)) + ' }'
    raise TypeError(type(v))

def clean(s):
    if s.startswith('\n'): s = s[1:]
    return s

# normalize code fields
for e in X.get('ex', []):
    for k in ('start', 'sol', 'tests', 'code', 'example', 'expect'):
        if k in e and isinstance(e[k], str): e[k] = clean(e[k])
for m in X.get('mistakes', []):
    for k in ('bad', 'good'): m[k] = clean(m[k]).rstrip('\n')

h = clean(X['html'])
# escape code inside pre.py / pre.code / pre.out; collect pre.py for running
blocks = []
def esc(m):
    cls, body = m.group(1), m.group(2)
    body = clean(body).replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    if cls == 'py': blocks.append(body)
    return f'<pre class="{cls}">' + html.escape(body, quote=False) + '</pre>'
h = re.sub(r'<pre class="(py|code|out)">(.*?)</pre>', esc, h, flags=re.S)
assert '`' not in h and '${' not in h, 'backtick/${ in html'
X['html'] = h.replace('\\', '\\\\')
words = len(re.sub(r'<[^>]+>', ' ', h).split())
print(f"html kelime: {words}, pre.py: {len(blocks)}, ex: {len(X.get('ex', []))}")
bad = 0
for i, b in enumerate(blocks):
    with tempfile.TemporaryDirectory() as d:
        r = subprocess.run([sys.executable, '-c', b], cwd=d, capture_output=True, text=True, timeout=60)
        if r.returncode:
            bad += 1; print(f'PRE {i} HATA:\n{b}\n{r.stderr[-800:]}')
        elif not r.stdout.strip(): print(f'PRE {i} çıktı yok')
stages = {}
for e in X.get('ex', []): stages[e.get('stage')] = stages.get(e.get('stage'), 0) + 1
print('aşamalar:', stages)

html_v = X.pop('html')
out = "/* PythonPatika — uzantı: " + X['id'] + " (Derinleş) */\n(function (W) {\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push(\n  { id: " + jstr(X['id']) + ",\n    min: " + str(X['min']) + ",\n    html: `" + html_v + "`,\n"
rest = {k: v for k, v in X.items() if k not in ('id', 'min')}
for k, v in rest.items():
    out += f"    {k}: {js(v, 2)},\n"
out = out.rstrip(',\n') + "\n  }\n);\n})(window);\n"
path = f"/home/claude/py/v2/e3/{X['id']}.js"
open(path, 'w').write(out)
print('yazıldı', path)
sys.exit(1 if bad else 0)
