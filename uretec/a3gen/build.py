import sys, io, time, random, importlib, textwrap, contextlib

OUTDIR = '/home/claude/py/v3/a3/'
PTS = {'Kolay': 10, 'Orta': 30, 'Zor': 60}


def D(s):
    return textwrap.dedent(s).lstrip('\n')


def run(code, inp):
    old_in, old_out = sys.stdin, sys.stdout
    sys.stdin = io.StringIO(inp)
    buf = io.StringIO()
    sys.stdout = buf
    try:
        exec(compile(code, '<sol>', 'exec'), {'__name__': '__main__'})
    except SystemExit:
        pass
    finally:
        sys.stdin, sys.stdout = old_in, old_out
    return buf.getvalue()


def norm(s):
    return '\n'.join(l.rstrip() for l in str(s).replace('\r\n', '\n').split('\n')).strip()


def js(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n').replace('\t', '    ')
    return "'" + s + "'"


def jsval(v, ind=''):
    if isinstance(v, str):
        return js(v)
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 120:
            return '[' + ', '.join(js(x) for x in v) + ']'
        return '[\n' + ',\n'.join(ind + '    ' + jsval(x, ind + '    ') for x in v) + '\n' + ind + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(f'{k}: {jsval(x, ind)}' for k, x in v.items()) + ' }'
    raise TypeError(type(v))


ORDER = ['id', 'title', 'track', 'diff', 'pts', 'tags', 'src', 'mode', 'fn', 'statement', 'input', 'output',
         'constraints', 'samples', 'hidden', 'tests', 'start', 'sol', 'editorial', 'hints']


def process(p, ntries=40):
    p = dict(p)
    p['pts'] = PTS[p['diff']]
    p.setdefault('mode', 'stdin')
    log = []
    if p['mode'] == 'func':
        ns = {}
        exec(p['sol'] + '\n' + p['tests'], ns)
        ns2 = {}
        try:
            exec(p['start'] + '\n' + p['tests'], ns2)
            raise SystemExit(p['id'] + ': start testleri geçiyor')
        except AssertionError:
            pass
        except Exception:
            pass
    else:
        samples = []
        for s in p['samples']:
            inp, why = s
            out = run(p['sol'], inp)
            samples.append({'in': inp, 'out': out, 'why': why})
            log.append(f'  ÖRNEK out={norm(out)[:150]!r}')
        p['samples'] = samples
        hidden = []
        for h in p['hidden']:
            if isinstance(h, dict):
                g = run(h['gen'], '')
                t = time.process_time(); out = run(p["sol"], g); dt = time.process_time() - t
                log.append(f'  GEN girdi={len(g)}B süre={dt:.2f}s out={norm(out)[:60]!r}')
                if not norm(out):
                    raise SystemExit(p['id'] + ' boş çıktı (gen)')
                hidden.append({'gen': h['gen']})
            else:
                out = run(p['sol'], h)
                if not norm(out):
                    raise SystemExit(p['id'] + ' boş çıktı: ' + repr(h[:80]))
                hidden.append({'in': h, 'out': out})
        p['hidden'] = hidden
        if p.get('brute') and p.get('rnd'):
            r = random.Random(hash(p['id']) & 0xffff)
            for k in range(ntries):
                inp = p['rnd'](r)
                a, b = run(p['sol'], inp), run(p['brute'], inp)
                if norm(a) != norm(b):
                    raise SystemExit(f"{p['id']} BRUTE FARK\nINPUT:\n{inp}\nSOL:{a}\nBRUTE:{b}")
            log.append(f'  brute ok x{ntries}')
    return p, log


def emit(problems, fname, header):
    parts = []
    for p in problems:
        lines = []
        for k in ORDER:
            if k in p:
                lines.append(f'  {k}: {jsval(p[k], "  ")}')
        parts.append('{\n' + ',\n'.join(lines) + '\n}')
    s = f"/* Kesit Python — v3/a3: {header} */\n(function (W) {{ 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(\n" + ',\n'.join(parts) + '\n); })(window);\n'
    open(OUTDIR + fname, 'w').write(s)


if __name__ == '__main__':
    modname, fname, header = sys.argv[1], sys.argv[2], sys.argv[3]
    only = sys.argv[4] if len(sys.argv) > 4 else None
    m = importlib.import_module(modname)
    out = []
    for p in m.P:
        if only and p['id'] != only:
            continue
        q, log = process(p)
        print(p['id'], p['diff'], p['title'])
        print('\n'.join(log))
        out.append(q)
    if not only:
        emit(out, fname, header)
        print('yazıldı', fname, len(out))
