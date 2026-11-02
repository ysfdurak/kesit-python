"""PY_EXT dosyası üretici yardımcıları."""
import html as _h, re, subprocess, sys

OUT = '/home/claude/py/v2/e1/'


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def P(code):
    """Çalıştırılabilir Python kutusu."""
    return '<pre class="py">' + esc(code.strip('\n')) + '</pre>'


def C(code):
    """Çalıştırılmayan komut/terminal kutusu."""
    return '<pre class="code">' + esc(code.strip('\n')) + '</pre>'


def O(text):
    return '<pre class="out">' + esc(text.strip('\n')) + '</pre>'


def box(kind, title, text):
    return f'<div class="{kind}"><b>{title}</b>{text}</div>'


def table(head, rows):
    h = '<tr>' + ''.join(f'<th>{c}</th>' for c in head) + '</tr>'
    b = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return '<div class="tbl-wrap"><table>' + h + b + '</table></div>'


def jsq(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '') + "'"


def js(v, ind=2):
    pad = ' ' * ind
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return jsq(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 200:
            return '[' + ', '.join(jsq(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + js(x, ind + 2) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        parts = []
        for k, x in v.items():
            if x is None:
                continue
            parts.append(pad + '  ' + k + ': ' + js(x, ind + 2))
        return '{\n' + ',\n'.join(parts) + '\n' + pad + '}'
    raise TypeError(type(v))


def tmpl(s):
    assert '`' not in s, 'html içinde backtick var'
    assert '${' not in s, 'html içinde ${ var'
    return '`' + s.replace('\\', '\\\\') + '`'


def words(s):
    t = re.sub(r'<[^>]+>', ' ', s)
    return len(t.split())


def write(lesson_id, minutes, html, ex, faq, mistakes):
    for i, e in enumerate(ex, 1):
        if e.get('t') in ('code',):
            e.setdefault('id', f'{lesson_id}-x{i}')
        else:
            e.setdefault('id', f'{lesson_id}-x{i}')
    # alan sırası
    order = ['t', 'id', 'stage', 'kind', 'diff', 'q', 'code', 'o', 'a', 'raises', 'lines', 'guide', 'example', 'start', 'sol', 'tests', 'expect', 'stdin', 'hints', 'hint', 'why']
    ex2 = []
    for e in ex:
        d = {k: e[k] for k in order if k in e}
        for k in e:
            if k not in d:
                d[k] = e[k]
        ex2.append(d)
    body = '{\n    id: ' + jsq(lesson_id) + ',\n    min: ' + str(minutes) + ',\n    html: ' + tmpl(html) + ',\n    ex: ' + js(ex2, 4) + ',\n    faq: ' + js(faq, 4) + ',\n    mistakes: ' + js(mistakes, 4) + '\n  }'
    src = ("/* Kesit Python — '" + lesson_id + "' dersi uzantısı (Derinleş + ek alıştırmalar) */\n"
           "(function (W) {\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push(\n  " + body + "\n);\n})(window);\n")
    path = OUT + lesson_id + '.js'
    open(path, 'w', encoding='utf-8').write(src)
    from collections import Counter
    c = Counter(e.get('stage') for e in ex)
    print(path, 'kelime:', words(html), 'yeni ex:', len(ex), dict(c))
    print('pre.py:', html.count('<pre class="py">'))
    r = subprocess.run(['python3', '/home/claude/py/tools/verify.py', path], capture_output=True, text=True)
    print(r.stdout[-6000:], r.stderr[-2000:])
    check_pre(path)


def check_pre(path):
    import html as H
    s = open(path, encoding='utf-8').read()
    for m in re.finditer(r'<pre class="py">(.*?)</pre>', s, re.S):
        code = H.unescape(m.group(1).replace('\\\\', '\\'))
        r = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=30)
        if r.returncode:
            print('PRE HATA:\n', code, '\n', r.stderr[-600:])
    print('pre kontrol bitti')
