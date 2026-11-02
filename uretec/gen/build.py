"""Görev tanımlarından PY_BANK JS dosyası üretir. ⟨expr⟩ -> repr(değer), «expr» -> str(değer)."""
import sys, os, re, io, contextlib, json, importlib
sys.path.insert(0, '/home/claude/py/tools/pylib'); os.environ['PP_VERI'] = '/home/claude/py/data'

def to_py(v):
    try:
        import numpy as np
        if isinstance(v, np.generic): v = v.item()
    except ImportError: pass
    if isinstance(v, float): return round(v, 4)
    if isinstance(v, dict): return {to_py(k): to_py(x) for k, x in v.items()}
    if isinstance(v, list): return [to_py(x) for x in v]
    if isinstance(v, tuple): return tuple(to_py(x) for x in v)
    return v

TOK = re.compile(r'⟨(.+?)⟩|«(.+?)»')

def fill_tests(sol, tests, name):
    ns = {'__name__': '__main__', '__source__': sol}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(compile(sol, name + ':sol', 'exec'), ns)
        out = []
        for line in tests.split('\n'):
            def rep(m):
                if m.group(1) is not None:
                    return repr(to_py(eval(m.group(1), ns)))
                v = to_py(eval(m.group(2), ns))
                return str(v)
            nl = TOK.sub(rep, line)
            if nl.strip():
                exec(compile(nl, name + ':test', 'exec'), ns)
            out.append(nl)
    return '\n'.join(out)

def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"

ORDER = ['id', 'lv', 'topic', 'ds', 'diff', 'kind', 'needs', 'title', 'q', 'start', 'sol', 'tests', 'expect', 'guide', 'example', 'hints', 'why', 'tags', 'min']

def ser(v):
    if isinstance(v, str): return js(v)
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, list): return '[' + ', '.join(ser(x) for x in v) + ']'
    raise TypeError(v)

def build(modname, out):
    mod = importlib.import_module(modname)
    parts = []
    for t in mod.TASKS:
        t = dict(t)
        t.setdefault('ds', mod.DS); t.setdefault('topic', mod.TOPIC)
        for k in ('q', 'start', 'sol', 'tests', 'why', 'example'):
            if k in t and isinstance(t[k], str):
                t[k] = t[k].strip('\n') + ('\n' if k in ('start', 'sol', 'tests', 'example') else '')
        t['tests'] = fill_tests(t['sol'], t['tests'], t['id'])
        if t.get('example'):
            with contextlib.redirect_stdout(io.StringIO()):
                exec(t['example'], {'__name__': '__main__'})
        assert mod.DS in t['start'], t['id'] + ' start veri seti adını içermiyor'
        if t['kind'] == 'rehberli':
            assert t.get('guide') and t.get('example') and 'TODO' in t['start'], t['id']
        lines = ['  {']
        for k in ORDER:
            if k in t and t[k] is not None:
                lines.append(f'    {k}: {ser(t[k])},')
        lines[-1] = lines[-1].rstrip(',')
        lines.append('  }')
        parts.append('\n'.join(lines))
    body = "/* PythonPatika — veri seti görevleri: " + mod.TITLE + " */\n(function (W) {\n'use strict';\nconst B = W.PY_BANK = W.PY_BANK || [];\nB.push(\n" + ',\n'.join(parts) + "\n);\n})(window);\n"
    open(out, 'w', encoding='utf-8').write(body)
    from collections import Counter
    print(out, len(mod.TASKS), Counter(t['lv'] for t in mod.TASKS), Counter(t['kind'] for t in mod.TASKS))

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
