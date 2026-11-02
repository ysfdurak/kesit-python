"""i2 grubu ders yazım yardımcıları: Python sözlüğünden PythonPatika JS dosyası üretir."""
import html, re, subprocess, sys, os
from collections import Counter

OUT = '/home/claude/py/v2/i2/'
RUN = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'run')


def PY(code):
    code = code.strip('\n') + '\n'
    return '<pre class="py">' + html.escape(code, quote=False) + '</pre>'


def CODE(code):
    code = code.strip('\n') + '\n'
    return '<pre class="code">' + html.escape(code, quote=False) + '</pre>'


def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '') + "'"


def js_val(v, ind='  '):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if v is None:
        return 'null'
    if isinstance(v, str):
        return js_str(v)
    if isinstance(v, list):
        if all(isinstance(x, str) and len(x) < 60 for x in v) and sum(len(x) for x in v) < 200:
            return '[' + ', '.join(js_val(x) for x in v) + ']'
        return '[\n' + ',\n'.join(ind + '  ' + js_val(x, ind + '  ') for x in v) + '\n' + ind + ']'
    if isinstance(v, dict):
        parts = [f'{k}: {js_val(x, ind + "  ")}' for k, x in v.items()]
        return '{ ' + (',\n' + ind + '  ').join(parts) + ' }'
    raise TypeError(type(v))


def check_body(body, lid):
    assert '`' not in body and '${' not in body, 'body içinde backtick/${ var'
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    pres = re.findall(r'<pre class="py">(.*?)</pre>', body, re.S)
    print(f'{lid}: body {words} kelime, {len(pres)} pre.py')
    bad = 0
    os.makedirs(RUN, exist_ok=True)
    for i, p in enumerate(pres):
        code = html.unescape(p)
        r = subprocess.run([sys.executable, '-c', 'import matplotlib\nmatplotlib.use("Agg")\n' + code],
                           capture_output=True, text=True, timeout=180, cwd=RUN)
        if r.returncode:
            bad += 1
            print(f'  ÖRNEK {i} HATA:\n{code}\n{r.stderr[-1500:]}')
        elif '-v' in sys.argv:
            print(f'--- örnek {i}\n{r.stdout}')
    return bad


def write(lesson):
    lid = lesson['id']
    bad = check_body(lesson['body'], lid)
    print('aşamalar:', dict(Counter(e['stage'] for e in lesson['ex'])), 'toplam', len(lesson['ex']))
    print('türler:', dict(Counter(e['t'] for e in lesson['ex'])))
    lesson = dict(lesson)
    body = lesson.pop('body'); ex = lesson.pop('ex'); faq = lesson.pop('faq'); mistakes = lesson.pop('mistakes')
    head = [f'  {k}: {js_val(v)}' for k, v in lesson.items()]
    s = ('/* PythonPatika — ileri: ' + lid + ' */\n(function (W) {\n\'use strict\';\n'
         'const L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push({\n')
    s += ',\n'.join(head) + ',\n'
    s += '  body: `\n' + body.strip() + '\n`,\n'
    s += '  ex: [\n' + ',\n'.join('    ' + js_val(e, '    ') for e in ex) + '\n  ],\n'
    s += '  faq: [\n' + ',\n'.join('    ' + js_val(e, '    ') for e in faq) + '\n  ],\n'
    s += '  mistakes: [\n' + ',\n'.join('    ' + js_val(e, '    ') for e in mistakes) + '\n  ]\n'
    s += '});\n})(window);\n'
    path = OUT + lid + '.js'
    open(path, 'w').write(s)
    r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    print('node --check:', 'OK' if not r.returncode else r.stderr)
    if bad:
        print('BODY ÖRNEK HATASI:', bad)
    return path
