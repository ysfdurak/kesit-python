import subprocess, sys, json, tempfile

PTS = {'Kolay': 10, 'Orta': 30, 'Zor': 60}


def run(code, inp):
    with tempfile.TemporaryDirectory() as td:
        p = subprocess.run([sys.executable, '-I', '-c', code], input=inp, capture_output=True, text=True, timeout=60, cwd=td)
    if p.returncode != 0:
        raise RuntimeError(p.stderr[-1500:])
    return p.stdout


def js(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n')
    return "'" + s + "'"


def jsv(v):
    if isinstance(v, str):
        return js(v)
    if isinstance(v, list):
        return '[' + ', '.join(jsv(x) for x in v) + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(k + ': ' + jsv(x) for k, x in v.items()) + ' }'
    if isinstance(v, (int, float)):
        return str(v)
    raise TypeError(v)


def fix(p):
    p = dict(p)
    p['pts'] = PTS[p['diff']]
    mode = p.get('mode', 'stdin')
    for s in p.get('samples', []):
        if 'in_' in s:
            s['in'] = s.pop('in_')
    if mode == 'stdin':
        sam = []
        for s in p['samples']:
            out = run(p['sol'], s['in'])
            sam.append({'in': s['in'], 'out': out, 'why': s['why']})
        p['samples'] = sam
        hid = []
        for h in p['hidden']:
            if isinstance(h, dict):
                gi = run(h['gen'], '')
                run(p['sol'], gi)
                hid.append({'gen': h['gen']})
            else:
                hid.append({'in': h, 'out': run(p['sol'], h)})
        p['hidden'] = hid
        assert 1 <= len(sam) <= 3 and 6 <= len(hid) <= 10, p['id']
        assert any('gen' in h for h in hid), p['id']
    else:
        code = p['sol'] + '\nimport json as _j\n_r=[]\n'
        for s in p['samples']:
            code += '_r.append(repr(' + s['call'] + '))\n'
        code += 'print(_j.dumps(_r))\n'
        outs = json.loads(run(code, '').strip().splitlines()[-1])
        p['samples'] = [{'in': s['call'], 'out': o, 'why': s['why']} for s, o in zip(p['samples'], outs)]
        run('__source__ = ' + repr(p['sol']) + '\n' + p['sol'] + '\n' + p['tests'], '')
        try:
            run('__source__ = ' + repr(p['start']) + '\n' + p['start'] + '\n' + p['tests'], '')
            raise AssertionError('start geçiyor ' + p['id'])
        except RuntimeError:
            pass
        n = sum(1 for l in p['tests'].split('\n') if l.startswith('assert'))
        assert 6 <= n <= 12, (p['id'], n)
        assert 1 <= len(p['samples']) <= 3
    assert len(p['hints']) == 2
    return p


ORDER = ['id', 'title', 'track', 'diff', 'pts', 'tags', 'src', 'mode', 'fn', 'statement', 'input', 'output', 'constraints',
         'samples', 'hidden', 'start', 'sol', 'tests', 'editorial', 'hints']


def build(P, path):
    items = []
    for p in P:
        p = fix(p)
        parts = ['  ' + k + ': ' + jsv(p[k]) for k in ORDER if k in p]
        items.append('{\n' + ',\n'.join(parts) + '\n}')
    src = "(function (W) { 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(\n" + ',\n'.join(items) + '\n); })(window);\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print('yazıldı', path, len(P))
