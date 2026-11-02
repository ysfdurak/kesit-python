import sys, importlib.util, subprocess, json
ORDER = ['id','lv','topic','diff','kind','t','needs','title','q','guide','example','start','sol','code','o','a','raises','lines','tests','expect','hint','hints','why','tags','min']
def js(v):
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, list): return '[' + ', '.join(js(x) for x in v) + ']'
    s = str(v).replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')
    return "'" + s + "'"
def emit(n):
    spec = importlib.util.spec_from_file_location('m', f't{n:02d}.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    out = [f'/* Kesit Python — pratik bankası: ileri görevler ({m.T[0]["id"]} … {m.T[-1]["id"]}) */', '(function (W) {', "'use strict';", 'const B = W.PY_BANK = W.PY_BANK || [];', 'B.push(']
    items = []
    for t in m.T:
        t = dict(t); t.setdefault('lv', 'ileri')
        if t['kind'] in ('predict', 'order'): t['t'] = t['kind']
        if t['kind'] == 'predict':
            o = t['o']; k = int(t['id'][2:]) % len(o); t['o'] = o[k:] + o[:k]; t['a'] = (t['a'] - k) % len(o)
        for k in ('q','start','sol','code','tests','expect','example'):
            if k in t and isinstance(t[k], str) and k != 'q': t[k] = t[k].strip('\n') + '\n' if k != 'expect' else t[k].strip('\n') + '\n'
        unknown = set(t) - set(ORDER)
        assert not unknown, unknown
        lines = []
        for k in ORDER:
            if k in t: lines.append(f'    {k}: {js(t[k])}')
        items.append('  {\n' + ',\n'.join(lines) + '\n  }')
    out.append(',\n\n'.join(items)); out.append(');'); out.append('})(window);')
    path = f'/home/claude/py/v2/b3/bank_ileri_{n:02d}.js'
    open(path, 'w').write('\n'.join(out) + '\n')
    # sanity
    for t in m.T:
        if t['kind'] not in ('predict','order'):
            for k in ('start','sol','tests','hints','why','title','q','tags','min','diff'): assert k in t, (t['id'], k)
            if t['kind'] == 'rehberli': assert 'guide' in t and 'example' in t and 'TODO' in t['start'], t['id']
        else:
            for k in ('why','title','q','tags','min','diff','hints'): assert k in t, (t['id'], k)
    r = subprocess.run(['python3', '/home/claude/py/tools/verify.py', path], capture_output=True, text=True)
    print(r.stdout[-6000:], r.stderr[-2000:])
for a in sys.argv[1:]: emit(int(a))
