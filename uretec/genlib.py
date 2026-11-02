"""PY_EXT dosyası üretici: Python verisinden tek tırnaklı JS dosyası yazar,
html içindeki örnekleri ve alıştırmaları pandas 3 (yerel) ve pandas 2.2 (venv) ile çalıştırır."""
import html as H, json, subprocess, sys, os, re

SCR = os.path.dirname(os.path.abspath(__file__))
PY22 = os.path.join(SCR, 'v22', 'bin', 'python')
OUT = '/home/claude/py/v2/e6'
RUN = os.path.join(SCR, 'e6run')

def py(code):
    """Çalıştırılabilir örnek kutusu; kod HTML-kaçışlı olur, kaydedilir."""
    EXAMPLES.append(code)
    return '<pre class="py">' + H.escape(code.strip('\n') + '\n', quote=False) + '</pre>'

def pcode(code):
    """Çalıştırılmayan kod kutusu (kurulum komutları vb.)."""
    return '<pre class="code">' + H.escape(code.strip('\n') + '\n', quote=False) + '</pre>'

EXAMPLES = []

def js(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')
    return "'" + s + "'"

def tl(s):
    assert '`' not in s and '${' not in s, 'template literal içinde yasak karakter'
    return '`' + s.replace('\\', '\\\\') + '`'

def val(v, ind):
    pad = ' ' * ind
    if isinstance(v, str): return js(v)
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return json.dumps(v)
    if isinstance(v, list):
        if all(isinstance(x, (str, int, float)) for x in v):
            return '[' + ', '.join(val(x, ind) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + val(x, ind + 2) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        return '{ ' + ',\n'.join((pad + '  ' if i else '') + f'{k}: ' + val(x, ind + 2) for i, (k, x) in enumerate(v.items())) + ' }'
    raise TypeError(type(v))

def run(pyexe, code, tests=''):
    runner = ('import sys, io, json\ntry:\n    import matplotlib; matplotlib.use("Agg")\nexcept Exception: pass\n'
              'cfg = json.loads(sys.stdin.read()); buf = io.StringIO(); sys.stdout = buf\nns = {"__name__": "__main__", "__source__": cfg["c"]}\nerr = None\n'
              'try:\n    exec(compile(cfg["c"], "<c>", "exec"), ns)\n    if cfg["t"]: exec(compile(cfg["t"], "<t>", "exec"), ns)\n'
              'except BaseException as e:\n    import traceback; err = type(e).__name__ + ": " + traceback.format_exc()[-600:]\n'
              'sys.stdout = sys.__stdout__\nprint(json.dumps({"out": buf.getvalue(), "err": err}))\n')
    p = subprocess.run([pyexe, '-I', '-c', runner], input=json.dumps({'c': code, 't': tests}), capture_output=True, text=True, timeout=90, cwd=RUN)
    try: return json.loads(p.stdout.strip().splitlines()[-1])
    except Exception: return {'out': '', 'err': 'runner ' + p.stderr[-500:]}

def norm(s): return '\n'.join(l.rstrip() for l in str(s).split('\n')).strip()

def check22(ext):
    """Örnekleri ve alıştırmaları pandas 2.2 ve yerel ortamda çalıştır."""
    bad = 0
    for exe, tag in ((sys.executable, 'yerel'), (PY22, '2.2')):
        for i, c in enumerate(EXAMPLES):
            r = run(exe, c)
            if r['err']: bad += 1; print(f'[{tag}] ÖRNEK {i} HATA\n{r["err"]}')
            elif os.environ.get('SHOW') and tag == 'yerel': print(f'--- örnek {i} ---\n{r["out"]}')
        if tag == 'yerel': continue
        for e in ext['ex']:
            t = e['t']
            if t == 'code':
                r = run(exe, e['sol'], e.get('tests', ''))
                if r['err'] or (e.get('expect') is not None and norm(r['out']) != norm(e['expect'])):
                    bad += 1; print(f'[{tag}] {e["id"]} HATA {r["err"]} {r["out"][:300]}')
            elif t == 'predict':
                r = run(exe, e['code'])
                if e.get('raises'):
                    if not r['err'] or r['err'].split(':')[0] not in e['o'][e['a']]: bad += 1; print(f'[{tag}] predict {e["q"][:30]} hata türü {r["err"]}')
                elif r['err'] or norm(r['out']) != norm(e['o'][e['a']]):
                    bad += 1; print(f'[{tag}] predict HATA: {e["code"][:60]!r}\n  gelen: {r["out"]!r} {r["err"]}')
            elif t == 'order':
                r = run(exe, '\n'.join(e['lines']) + '\n', e.get('tests', ''))
                if r['err'] or (e.get('expect') is not None and norm(r['out']) != norm(e['expect'])):
                    bad += 1; print(f'[{tag}] order HATA {r["err"]} {r["out"]!r}')
    return bad

def words(h): return len(re.sub(r'<[^>]+>', ' ', h).split())

def emit(ext, needs):
    for e in ext['ex']:
        if needs: e['needs'] = list(needs)
    keys = ['id', 'min', 'needs', 'html', 'ex', 'faq', 'mistakes']
    if needs: ext = {'needs': list(needs), **ext}
    parts = []
    for k in keys:
        if k not in ext: continue
        v = ext[k]
        if k == 'html': parts.append('    html: ' + tl(v))
        elif k == 'ex':
            items = []
            for e in v:
                order = ['t', 'id', 'stage', 'kind', 'diff', 'needs', 'q', 'code', 'o', 'a', 'raises', 'lines', 'guide', 'example', 'start', 'sol', 'tests', 'expect', 'hint', 'hints', 'why']
                assert set(e) <= set(order), set(e) - set(order)
                fields = [f'{f}: ' + val(e[f], 8) for f in order if f in e]
                items.append('      { ' + ',\n        '.join(fields) + ' }')
            parts.append('    ex: [\n' + ',\n'.join(items) + '\n    ]')
        elif k in ('faq', 'mistakes'):
            parts.append(f'    {k}: [\n' + ',\n'.join('      ' + val(x, 6) for x in v) + '\n    ]')
        else: parts.append(f'    {k}: ' + val(v, 4))
    body = ',\n'.join(parts)
    src = ("/* PythonPatika — '" + ext['id'] + "' dersi uzantısı (Derinleş) */\n" + ("// needs: " + ', '.join(needs) + "\n" if needs else '') + "(function (W) {\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push(\n  {\n" + body + "\n  }\n);\n})(window);\n")
    os.makedirs(OUT, exist_ok=True)
    path = f"{OUT}/{ext['id']}.js"
    open(path, 'w').write(src)
    st = {}
    for e in ext['ex']: st[e.get('stage')] = st.get(e.get('stage'), 0) + 1
    print('yazıldı', path, 'html kelime:', words(ext['html']), 'ex:', len(ext['ex']), st)
    bad = check22(ext)
    print('2.2/yerel kontrol hata:', bad)
    r = subprocess.run(['python3', '/home/claude/py/tools/verify.py', path], capture_output=True, text=True, cwd=RUN)
    print(r.stdout[-4000:])
