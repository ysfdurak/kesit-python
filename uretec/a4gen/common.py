"""a4 arena üreteci: problem sözlüklerinden PY_ARENA JS dosyası yazar; beklenen değerleri çözümü çalıştırarak hesaplar."""
import json, os, subprocess, sys, textwrap

ENV = dict(os.environ, PP_VERI='/home/claude/py/data')
PYLIB = '/home/claude/py/tools/pylib'
PTS = {'Kolay': 10, 'Orta': 30, 'Zor': 60}

HELPER = '''def _yakin(a, b, tol=0.01):
    if isinstance(b, bool) or b is None:
        return a == b
    if isinstance(b, float):
        try:
            return abs(float(a) - b) <= tol
        except (TypeError, ValueError):
            return False
    if isinstance(b, dict):
        return isinstance(a, dict) and set(a) == set(b) and all(_yakin(a[k], b[k], tol) for k in b)
    if isinstance(b, (list, tuple)):
        return isinstance(a, (list, tuple)) and len(a) == len(b) and all(_yakin(x, y, tol) for x, y in zip(a, b))
    return a == b
'''

EVAL = r'''
import sys, json
sys.path.insert(0, %r)
def plain(v):
    try:
        import numpy as np
        if isinstance(v, np.generic): v = v.item()
    except ImportError: pass
    if isinstance(v, dict): return {plain(k): plain(x) for k, x in v.items()}
    if isinstance(v, tuple): return tuple(plain(x) for x in v)
    if isinstance(v, list): return [plain(x) for x in v]
    return v
cfg = json.loads(sys.stdin.read())
ns = {'__name__': '__main__'}
exec(cfg['sol'], ns)
out = []
for c in cfg['calls']:
    v = plain(eval(c, ns))
    out.append(repr(v))
print(json.dumps(out))
''' % PYLIB


def run_calls(sol, calls):
    p = subprocess.run([sys.executable, '-c', EVAL], input=json.dumps({'sol': sol, 'calls': calls}),
                       capture_output=True, text=True, env=ENV, timeout=300)
    if p.returncode != 0:
        raise RuntimeError(p.stderr[-2000:])
    return json.loads(p.stdout.strip().splitlines()[-1])


def run_stdin(sol, inp):
    code = 'import sys\nsys.path.insert(0, %r)\n' % PYLIB
    p = subprocess.run([sys.executable, '-c', code + sol], input=inp, capture_output=True, text=True, env=ENV, timeout=120)
    if p.returncode != 0:
        raise RuntimeError(p.stderr[-2000:])
    return p.stdout


def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"


def short(s, n=160):
    return s if len(s) <= n else s[:n] + ' …'


def build(p, verbose=True):
    p = dict(p)
    for k in ('sol', 'start'):
        if k in p:
            p[k] = textwrap.dedent(p[k]).lstrip('\n')
    if p.get('mode', 'func') == 'func':
        p['mode'] = 'func'
        calls = [c for c, _ in p['samples']] + list(p['calls'])
        vals = run_calls(p['sol'], calls)
        ns = len(p['samples'])
        samples = []
        for (c, why), v in zip(p['samples'], vals[:ns]):
            samples.append({'in': c, 'out': v, 'why': why})
        tests = HELPER + textwrap.dedent(p.get('pre_tests', '')).lstrip('\n')
        for c, v in zip(calls, vals):
            msg = repr(f'{c} -> beklenen {short(v, 120)}, gelen ')
            tests += f'_s = {c}\nassert _yakin(_s, {v}), {msg} + repr(_s)[:150]\n'
        tests += textwrap.dedent(p.get('post_tests', '')).lstrip('\n')
        p['samples'] = samples
        p['tests'] = tests
        p.pop('calls', None)
        if verbose:
            for c, v in zip(calls, vals):
                print('   ', p['id'], c, '=>', short(v, 300))
    else:
        samples = []
        for s in p['samples']:
            out = run_stdin(p['sol'], s['in'])
            samples.append({'in': s['in'], 'out': out, 'why': s.get('why', '')})
            if verbose: print('   ', p['id'], 'sample', repr(s['in'][:60]), '=>', repr(out[:200]))
        hidden = []
        for h in p['hidden']:
            if 'gen' in h:
                g = textwrap.dedent(h['gen']).lstrip('\n')
                inp = run_stdin(g, '')
                out = run_stdin(p['sol'], inp)
                if verbose: print('   ', p['id'], 'gen', len(inp), '=>', repr(out[:120]))
                hidden.append({'gen': g})
            else:
                out = run_stdin(p['sol'], h['in'])
                if verbose: print('   ', p['id'], 'hidden', repr(h['in'][:60]), '=>', repr(out[:120]))
                hidden.append({'in': h['in'], 'out': out})
        p['samples'] = samples
        p['hidden'] = hidden
    return p


ORDER = ['id', 'title', 'track', 'diff', 'pts', 'tags', 'src', 'mode', 'fn', 'ds', 'needs', 'statement', 'input', 'output',
         'constraints', 'samples', 'hidden', 'start', 'sol', 'tests', 'editorial', 'hints']


def val(v, ind):
    if isinstance(v, str):
        return js(v)
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v):
            return '[' + ', '.join(js(x) for x in v) + ']'
        return '[\n' + ',\n'.join(ind + '  ' + val(x, ind + '  ') for x in v) + '\n' + ind + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(f'{k}: {val(x, ind)}' for k, x in v.items()) + ' }'
    raise TypeError(type(v))


def emit(path, problems):
    parts = []
    for p in problems:
        p = dict(p)
        p['pts'] = PTS[p['diff']]
        keys = [k for k in ORDER if k in p and p[k] not in (None, '')]
        body = ',\n'.join(f'  {k}: {val(p[k], "  ")}' for k in keys)
        parts.append('{\n' + body + '\n}')
    src = "(function (W) { 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(\n" + ',\n'.join(parts) + '\n); })(window);\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    print('node --check', path, 'OK' if r.returncode == 0 else r.stderr)


def main(problems, path):
    built = []
    only = sys.argv[1:]
    for p in problems:
        if only and p['id'] not in only:
            continue
        print('*', p['id'], p['title'], p['diff'])
        built.append(build(p))
    if not only:
        emit(path, built)
