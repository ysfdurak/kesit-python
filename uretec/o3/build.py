"""Ders tanımı (python modülü, LESSON dict) -> PythonPatika JS dosyası.
Kullanım: python3 build.py ders.py cikti.js"""
import sys, re, html, subprocess, importlib.util, textwrap, json

def js_str(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n')
    return "'" + s + "'"

CODE_KEYS = {'start', 'sol', 'tests', 'code', 'example', 'expect'}

def emit(v, ind, key=None):
    pad = '  ' * ind
    if isinstance(v, dict):
        parts = []
        for k, x in v.items():
            if k == 'body':
                b = x
                assert '`' not in b and '${' not in b, 'body içinde backtick/${'
                parts.append(f"{pad}  body: `{b}`")
            else:
                kk = k if re.match(r'^[A-Za-z_]\w*$', k) else js_str(k)
                parts.append(f"{pad}  {kk}: {emit(x, ind + 1, k)}")
        return '{\n' + ',\n'.join(parts) + '\n' + pad + '}'
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 300 and key not in ('o',):
            return '[' + ', '.join(js_str(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + emit(x, ind + 1) for x in v) + '\n' + pad + ']'
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, str):
        if key in CODE_KEYS:
            v = textwrap.dedent(v).lstrip('\n')
            if key != 'expect' and not v.endswith('\n'): v += '\n'
        return js_str(v)
    raise TypeError(type(v))

def main():
    src, out = sys.argv[1], sys.argv[2]
    spec = importlib.util.spec_from_file_location('ders', src); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    L = m.LESSON
    for e in L['ex']:
        for k in list(e):
            if k in CODE_KEYS and isinstance(e[k], str):
                e[k] = textwrap.dedent(e[k]).lstrip('\n')
                if k != 'expect' and not e[k].endswith('\n'): e[k] += '\n'
        if 'lines' in e: e['lines'] = [x for x in e['lines']]
    for mm in L.get('mistakes', []):
        for k in ('bad', 'good'): mm[k] = textwrap.dedent(mm[k]).strip('\n')
    js = "/* PythonPatika — v2 o3: " + L['title'] + " */\n(function (W) {\n'use strict';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(\n" + emit(L, 0) + "\n);\n})(window);\n"
    open(out, 'w').write(js)
    # body denetimi
    body = L['body']
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    blocks = re.findall(r'<pre class="py">(.*?)</pre>', body, re.S)
    print(f"body kelime={words}  pre.py={len(blocks)}  ex={len(L['ex'])}")
    st = {}
    for e in L['ex']: st[e['stage']] = st.get(e['stage'], 0) + 1
    print('aşamalar:', st)
    for i, b in enumerate(blocks):
        code = html.unescape(b)
        r = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True, timeout=60, cwd=sys.argv[3] if len(sys.argv) > 3 else None)
        if r.returncode: print(f'ÖRNEK {i} HATA:\n{code[:300]}\n{r.stderr[-600:]}')
    for k in ('tbl-wrap', 'class="tip"', 'class="warn"', 'class="note"', 'Gerçek işte', 'class="deep"'):
        if k not in body: print('EKSİK body öğesi:', k)
main()
