"""Arena üreteci ortak yardımcıları (a2: a-061 … a-120)."""
import html, json, re, subprocess, sys, textwrap

PTS = {'Kolay': 10, 'Orta': 30, 'Zor': 60}


def js(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\t', '\\t')
    s = s.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    return "'" + s + "'"


def md(s):
    """`kod` → <code>escape(kod)</code>; ```blok``` → <pre class="py">."""
    s = s.strip()
    def blk(m):
        return '<pre class="py">' + html.escape(html.unescape(textwrap.dedent(m.group(1))).strip('\n'), quote=False) + '</pre>'
    s = re.sub(r'```\n?(.*?)```', blk, s, flags=re.S)
    s = re.sub(r'`([^`]+)`', lambda m: '<code>' + html.escape(html.unescape(m.group(1)), quote=False) + '</code>', s)
    return s


def P(*parts):
    return ''.join(p if p.lstrip().startswith('<') else '<p>' + p + '</p>' for p in parts)


def ed(yol, kar, alt, hata, ek=''):
    out = '<p><b>Yaklaşım:</b> ' + yol + '</p>'
    if ek: out += ek
    out += '<p><b>Karmaşıklık:</b> ' + kar + '</p>'
    out += '<p><b>Alternatif:</b> ' + alt + '</p>'
    out += '<p><b>Sık hata:</b> ' + hata + '</p>'
    return out


RUN = r'''
import sys, io, json
cfg = json.loads(sys.stdin.read())
if cfg["mode"] == "stdin":
    sys.stdin = io.StringIO(cfg["inp"])
    buf = io.StringIO(); sys.stdout = buf
    exec(compile(cfg["code"], "<sol>", "exec"), {"__name__": "__main__"})
    sys.stdout = sys.__stdout__
    print(json.dumps({"out": buf.getvalue()}))
elif cfg["mode"] == "gen":
    buf = io.StringIO(); sys.stdout = buf
    exec(compile(cfg["code"], "<gen>", "exec"), {"__name__": "__main__"})
    sys.stdout = sys.__stdout__
    print(json.dumps({"out": buf.getvalue()}))
else:
    ns = {"__name__": "__main__", "__source__": cfg["code"]}
    exec(compile(cfg["code"], "<sol>", "exec"), ns)
    if cfg.get("setup"):
        exec(cfg["setup"], ns)
    res = []
    for snip in cfg["snips"]:
        lines = snip.strip("\n").split("\n")
        exec("\n".join(lines[:-1]), ns)
        res.append(repr(eval(lines[-1], ns)))
    print(json.dumps({"res": res}))
'''


def run(cfg):
    p = subprocess.run([sys.executable, '-I', '-c', RUN], input=json.dumps(cfg), capture_output=True, text=True, timeout=120)
    if p.returncode != 0:
        raise SystemExit('ÇALIŞMA HATASI:\n' + p.stderr[-2000:] + '\n' + json.dumps(cfg)[:600])
    return json.loads(p.stdout.strip().splitlines()[-1])


def norm(s):
    return '\n'.join(l.rstrip() for l in s.split('\n')).strip()


def build(p):
    """p: problem sözlüğü. stdin: samples=[(in, why)], hidden=[in | {'gen':..}], brute (isteğe bağlı)
       func: samples=[(snip, why)], checks=[snip], raises=[(Hata, snip, mesaj)], extra=[assert blokları]"""
    o = {'id': p['id'], 'title': p['title'], 'track': p['track'], 'diff': p['diff'], 'pts': PTS[p['diff']],
         'tags': p['tags'], 'src': p['src'], 'mode': p['mode']}
    if p['mode'] == 'func':
        o['fn'] = p['fn']
    o['statement'] = md(p['statement'])
    if p.get('input'): o['input'] = md(p['input'])
    if p.get('output'): o['output'] = md(p['output'])
    o['constraints'] = p.get('constraints', '')
    sol = textwrap.dedent(p['sol']).lstrip('\n')
    start = textwrap.dedent(p['start']).lstrip('\n')
    if p['mode'] == 'stdin':
        samples, hidden = [], []
        brute = textwrap.dedent(p['brute']) if p.get('brute') else None
        for inp, why in p['samples']:
            out = run({'mode': 'stdin', 'code': sol, 'inp': inp})['out']
            if brute:
                b = run({'mode': 'stdin', 'code': brute, 'inp': inp})['out']
                if norm(b) != norm(out):
                    raise SystemExit(f"{p['id']} brute farklı (örnek)!\nin={inp!r}\nsol={out!r}\nbrute={b!r}")
            samples.append({'in': inp, 'out': out, 'why': why})
        for h in p['hidden']:
            if isinstance(h, dict):
                g = run({'mode': 'gen', 'code': h['gen']})['out']
                run({'mode': 'stdin', 'code': sol, 'inp': g})
                if brute and h.get('brute_ok'):
                    pass
                hidden.append({'gen': h['gen']})
            else:
                out = run({'mode': 'stdin', 'code': sol, 'inp': h})['out']
                if brute:
                    b = run({'mode': 'stdin', 'code': brute, 'inp': h})['out']
                    if norm(b) != norm(out):
                        raise SystemExit(f"{p['id']} brute farklı!\nin={h!r}\nsol={out!r}\nbrute={b!r}")
                hidden.append({'in': h, 'out': out})
        o['samples'] = samples
        o['hidden'] = hidden
        n_hidden = len(hidden)
    else:
        snips = [s for s, _ in p['samples']] + p['checks']
        setup = textwrap.dedent(p.get('setup', '')).strip('\n')
        res = run({'mode': 'func', 'code': sol, 'snips': snips, 'setup': setup})['res']
        samples = []
        for (s, why), r in zip(p['samples'], res):
            d = {'in': s.strip('\n'), 'out': r}
            if why: d['why'] = why
            samples.append(d)
        tl = [setup] if setup else []
        for s, r in zip(snips, res):
            lines = s.strip('\n').split('\n')
            tl.extend(lines[:-1])
            msg = lines[-1] if len(lines[-1]) <= 70 else lines[-1][:67] + '...'
            tl.append(f'assert ({lines[-1]}) == {r}, {msg!r}')
        for exc, s, msg in p.get('raises', []):
            body = textwrap.indent(s.strip('\n'), '    ')
            tl.append(f'try:\n{body}\nexcept {exc}:\n    pass\nelse:\n    raise AssertionError({(exc + " bekleniyordu: " + msg)!r})')
        for extra in p.get('extra', []):
            tl.append(textwrap.dedent(extra).strip('\n'))
        o['samples'] = samples
        o['tests'] = '\n'.join(tl) + '\n'
        n_hidden = len(p['checks']) + len(p.get('raises', [])) + len(p.get('extra', []))
    if not (6 <= n_hidden <= 12):
        print(f"UYARI {p['id']}: gizli test sayısı {n_hidden}", file=sys.stderr)
    if not (1 <= len(o['samples']) <= 3):
        print(f"UYARI {p['id']}: örnek sayısı {len(o['samples'])}", file=sys.stderr)
    o['start'] = start
    o['sol'] = sol
    o['editorial'] = md(p['editorial'])
    o['hints'] = p['hints']
    return o


ORDER = ['id', 'title', 'track', 'diff', 'pts', 'tags', 'src', 'mode', 'fn', 'statement', 'input', 'output',
         'constraints', 'samples', 'hidden', 'tests', 'start', 'sol', 'editorial', 'hints']


def val(v):
    if isinstance(v, str): return js(v)
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, list): return '[' + ', '.join(val(x) for x in v) + ']'
    if isinstance(v, dict): return '{ ' + ', '.join(f'{k}: {val(x)}' for k, x in v.items()) + ' }'
    raise TypeError(type(v))


def emit(path, probs):
    items = []
    for p in probs:
        o = build(p)
        fields = [f'  {k}: {val(o[k])}' for k in ORDER if k in o]
        items.append('{\n' + ',\n'.join(fields) + '\n}')
    txt = "(function (W) { 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(\n" + ',\n'.join(items) + '\n); })(window);\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(txt)
    print('yazıldı', path, len(probs))
