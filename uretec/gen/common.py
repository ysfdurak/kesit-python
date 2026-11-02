"""Veri seti görevleri üreteci: görev sözlüklerini çalıştırıp beklenen değerleri hesaplar, JS dosyası yazar."""
import io, os, re, sys, contextlib

sys.path.insert(0, '/home/claude/py/tools/pylib')
os.environ['PP_VERI'] = '/home/claude/py/data'

ORDER = ['id', 'lv', 'topic', 'diff', 'kind', 'ds', 'needs', 'title', 'q', 'guide', 'example', 'start', 'sol',
         'tests', 'hints', 'why', 'tags', 'min']


def js(v):
    if isinstance(v, str):
        s = v.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')
        return "'" + s + "'"
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, list):
        return '[' + ', '.join(js(x) for x in v) + ']'
    raise TypeError(type(v))


def ded(s):
    """Baştaki yeni satırı at, girintiyi koru (kod 0 girintiyle yazılır)."""
    if s.startswith('\n'):
        s = s[1:]
    if not s.endswith('\n'):
        s += '\n'
    return s


def resolve(t):
    """sol'u çalıştır, calc ifadelerini değerlendir, tests içindeki @AD@ yer tutucularını repr ile doldur."""
    ns = {'__name__': '__main__'}
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(compile(t['sol'], t['id'], 'exec'), ns)
    vals = {}
    for k, expr in (t.get('calc') or {}).items():
        vals[k] = eval(expr, ns)
    print(f"{t['id']} {t['title']}")
    for k, v in vals.items():
        r = repr(v)
        print(f"   {k} = {r[:300]}")
    tests = t['tests']
    for k, v in vals.items():
        tests = tests.replace('@' + k + '@', repr(v))
    if re.search(r'@[A-Z][A-Z_0-9]*@', tests):
        raise ValueError('çözülmemiş yer tutucu: ' + t['id'])
    t['tests'] = tests
    return t


def write(path, header, tasks):
    out = ['/* ' + header + ' */', '(function (W) {', "'use strict';", 'const B = W.PY_BANK = W.PY_BANK || [];', 'B.push(']
    items = []
    for t in tasks:
        t = dict(t)
        for k in ('sol', 'start', 'tests', 'example'):
            if k in t:
                t[k] = ded(t[k])
        resolve(t)
        lines = ['  {']
        keys = [k for k in ORDER if k in t]
        for i, k in enumerate(keys):
            lines.append(f'    {k}: {js(t[k])}' + (',' if i < len(keys) - 1 else ''))
        lines.append('  }')
        items.append('\n'.join(lines))
    out.append(',\n'.join(items))
    out.append(');')
    out.append('})(window);')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    print('yazıldı:', path, len(tasks), 'görev')
