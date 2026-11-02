#!/usr/bin/env python3
"""Kullanım: python3 build.py spec.py  -> /home/claude/py/v2/e4/<id>.js yazar, html'deki py bloklarını çalıştırır."""
import sys, html as H, subprocess, runpy, json, os, re

PY_BLOCKS = []

def py(code):
    code = code.strip('\n') + '\n'
    PY_BLOCKS.append(code)
    return '<pre class="py">' + H.escape(code.rstrip('\n'), quote=False) + '</pre>'

def code(c):
    return '<pre class="code">' + H.escape(c.strip('\n'), quote=False) + '</pre>'

def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '') + "'"

def js_val(v, ind='    '):
    if isinstance(v, str): return js_str(v)
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, list):
        return '[' + ', '.join(js_val(x, ind) for x in v) + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(f'{k}: {js_val(x, ind)}' for k, x in v.items()) + ' }'
    raise TypeError(type(v))

def main():
    spec = sys.argv[1]
    g = runpy.run_path(spec, init_globals={'py': py, 'code': code})
    E = g['EXT']
    lid = E['id']
    htm = E['html']
    assert '`' not in htm and '${' not in htm, 'html içinde backtick/${ var'
    # py bloklarını çalıştır
    bad = 0
    for i, c in enumerate(PY_BLOCKS):
        p = subprocess.run([sys.executable, '-c', c], capture_output=True, text=True, timeout=60, cwd='/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/e4')
        if p.returncode != 0:
            bad += 1; print(f'PY BLOK {i} HATA:\n{c}\n{p.stderr[-800:]}')
        elif '-v' in sys.argv:
            print(f'--- blok {i} ---\n{p.stdout}')
    words = len(re.sub(r'<[^>]+>', ' ', htm).split())
    out = [f'/* Kesit Python — v2 e4 uzantı: {lid} */', '(function (W) {', "'use strict';",
           'const X = W.PY_EXT = W.PY_EXT || [];', 'X.push({', f'  id: {js_str(lid)},', f'  min: {E["min"]},',
           '  html: `' + htm.strip().replace('\\', '\\\\') + '\n`,', '  ex: [']
    exs = []
    for e in E['ex']:
        exs.append('    ' + js_val(e))
    out.append(',\n'.join(exs))
    out.append('  ],')
    out.append('  faq: [\n' + ',\n'.join('    ' + js_val(f) for f in E['faq']) + '\n  ],')
    out.append('  mistakes: [\n' + ',\n'.join('    ' + js_val(f) for f in E['mistakes']) + '\n  ]')
    out.append('});')
    out.append('})(window);')
    path = f'/home/claude/py/v2/e4/{lid}.js'
    open(path, 'w').write('\n'.join(out) + '\n')
    r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    print('node --check:', 'OK' if r.returncode == 0 else r.stderr)
    from collections import Counter
    print('kelime:', words, '| py blok:', len(PY_BLOCKS), 'hatalı:', bad, '| ex:', len(E['ex']),
          Counter((e.get('stage'), e['t']) for e in E['ex']))
    print('yazıldı:', path)

main()
