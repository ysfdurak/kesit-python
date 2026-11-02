#!/usr/bin/env python3
"""i1 grubu: ders kaynak dosyasını (Python, LESSON sözlüğü) Kesit Python JS dosyasına çevirir.
Kullanım: python3 gen_i1.py l_xxx.py [-v] -> /home/claude/py/v2/i1/<id>.js yazar, body örneklerini çalıştırır, verify eder."""
import html, os, re, subprocess, sys, tempfile, runpy

OUT = '/home/claude/py/v2/i1'
KEYS = ['id', 'lv', 'mod', 'min', 'needs', 'title', 'sum', 'goals', 'body', 'ex', 'faq', 'mistakes']


def js_str(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')
    return "'" + s + "'"


def js_val(v, ind=0):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return js_str(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 400:
            return '[' + ', '.join(js_str(x) for x in v) + ']'
        pad = '  ' * (ind + 1)
        return '[\n' + ',\n'.join(pad + js_val(x, ind + 1) for x in v) + '\n' + '  ' * ind + ']'
    if isinstance(v, dict):
        parts = [f'{k}: {js_val(x, ind + 1)}' for k, x in v.items()]
        return '{ ' + ',\n'.join(('  ' * (ind + 1) if i else '') + p for i, p in enumerate(parts)) + ' }'
    raise TypeError(type(v))


PRE = re.compile(r'<pre class="(py|code)">(.*?)</pre>', re.S)


def prep_body(body):
    def esc(m):
        return f'<pre class="{m.group(1)}">' + html.escape(m.group(2).strip('\n'), quote=False) + '</pre>'
    out = PRE.sub(esc, body)
    assert '`' not in out and '${' not in out, 'body içinde backtick ya da ${ var'
    return out


V22 = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'v22/bin/python')


def run_examples(body):
    fails = 0
    for exe in (sys.executable, V22):
        fails += run_examples_with(body, exe)
    return fails


def run_examples_with(body, exe):
    fails = 0
    for i, m in enumerate(PRE.finditer(body)):
        if m.group(1) != 'py':
            continue
        code = m.group(2).strip('\n')
        with tempfile.TemporaryDirectory() as d:
            p = subprocess.run([exe, '-I', '-W', 'error::FutureWarning', '-c', 'import matplotlib; matplotlib.use("Agg")\n' + code],
                               capture_output=True, text=True, cwd=d, timeout=180)
        if p.returncode:
            fails += 1
            print(f'[{exe[-12:]}] ÖRNEK {i} HATA:\n{code[:300]}\n---\n{p.stderr[-1500:]}')
        elif not p.stdout.strip():
            print(f'ÖRNEK {i} çıktı üretmiyor')
        if p.stderr.strip() and not p.returncode:
            print(f'ÖRNEK {i} stderr: {p.stderr[-600:]}')
        if '-v' in sys.argv and exe == sys.executable:
            print(f'--- örnek {i} ---\n{p.stdout[:2500]}')
    return fails


def words(body):
    return len(re.sub(r'<[^>]+>', ' ', body).split())


def main():
    src = sys.argv[1]
    L = runpy.run_path(src)['LESSON']
    body_raw = L['body']
    L['body'] = prep_body(body_raw)
    n_py = len([m for m in PRE.finditer(body_raw) if m.group(1) == 'py'])
    lines = ['/* Kesit Python — v2/i1: ' + L['title'] + ' */', '(function (W) {', "'use strict';",
             'const L = W.PY_LESSONS = W.PY_LESSONS || [];', 'L.push(']
    parts = []
    for k in KEYS:
        if k not in L:
            continue
        v = L[k]
        if k == 'body':
            parts.append('    body: `' + v.replace('\\', '\\\\') + '`')
        elif k in ('ex', 'faq', 'mistakes'):
            parts.append(f'    {k}: [\n' + ',\n'.join('      ' + js_val(e, 3) for e in v) + '\n    ]')
        else:
            parts.append(f'    {k}: {js_val(v, 2)}')
    lines.append('  {\n' + ',\n'.join(parts) + '\n  }')
    lines += [');', '})(window);', '']
    path = os.path.join(OUT, L['id'] + '.js')
    with open(path, 'w') as f:
        f.write('\n'.join(lines))
    stages, types = {}, {}
    for e in L['ex']:
        assert e.get('stage'), e
        stages[e['stage']] = stages.get(e['stage'], 0) + 1
        types[e['t']] = types.get(e['t'], 0) + 1
        if e['t'] == 'code' and e['stage'] == 'Rehberli':
            assert e.get('guide') and e.get('example') and 'TODO' in e.get('start', ''), e['id']
    print(f"{path}: kelime={words(L['body'])} pre.py={n_py} ex={len(L['ex'])} {types} {stages}")
    print('goals', len(L['goals']), 'faq', len(L['faq']), 'mistakes', len(L['mistakes']))
    for tag in ['class="tip"', 'class="warn"', 'class="note"', 'Gerçek işte', 'class="deep"', '<table>']:
        if tag not in L['body']:
            print('EKSİK:', tag)
    print('örnek hataları:', run_examples(body_raw))
    r = subprocess.run([sys.executable, '/home/claude/py/tools/verify.py', path], capture_output=True, text=True)
    print(r.stdout[-8000:], r.stderr[-2000:])
    r = subprocess.run([V22, '/home/claude/py/tools/verify.py', path], capture_output=True, text=True)
    print('pandas 2.2:', r.stdout[-8000:], r.stderr[-2000:])


if __name__ == '__main__':
    main()
