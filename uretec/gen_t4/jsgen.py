"""t4: PythonPatika ders nesnesini tek IIFE'li JS dosyasına yazar."""
import html, re, sys, subprocess, tempfile

KEY_ORDER = ['id', 'lv', 'mod', 'min', 'title', 'sum', 'goals', 'body', 'ex', 'faq', 'mistakes']


def js_str(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n').replace('\t', '    ')
    return "'" + s + "'"


def body_fix(b):
    def esc(m):
        return '<pre class="%s">' % m.group(1) + html.escape(m.group(2).strip('\n'), quote=False) + '</pre>'
    b = re.sub(r'<pre class="(py|code|out)">(.*?)</pre>', esc, b, flags=re.S)
    assert '`' not in b and '${' not in b, 'body içinde backtick ya da ${ var'
    return b


def ser(v, ind=0, key=None):
    sp = '  ' * ind
    if key == 'body':
        return '`\n' + body_fix(v).replace('\\', '\\\\').strip('\n') + '\n`'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return js_str(v)
    if isinstance(v, list):
        if all(isinstance(x, str) and len(x) < 60 for x in v) and sum(len(x) for x in v) < 160:
            return '[' + ', '.join(js_str(x) for x in v) + ']'
        return '[\n' + ',\n'.join(sp + '  ' + ser(x, ind + 1) for x in v) + '\n' + sp + ']'
    if isinstance(v, dict):
        keys = sorted(v.keys(), key=lambda k: KEY_ORDER.index(k) if k in KEY_ORDER else 100)
        parts = [f'{k}: {ser(v[k], ind + 1, k)}' for k in keys]
        return '{ ' + (',\n' + sp + '  ').join(parts) + ' }'
    raise TypeError(type(v))


def words(b):
    return len(re.sub(r'<[^>]+>', ' ', b).split())


def check_body(b):
    blocks = re.findall(r'<pre class="py">(.*?)</pre>', b, re.S)
    for i, code in enumerate(blocks):
        with tempfile.TemporaryDirectory() as d:
            p = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=60, cwd=d)
        if p.returncode:
            print(f'BODY ÖRNEK {i} HATA:\n{p.stderr[-800:]}')
        elif not p.stdout.strip():
            print(f'BODY ÖRNEK {i}: çıktı yok')


def emit(lesson, path, note=''):
    for e in lesson['ex']:
        for k in ('start', 'sol', 'tests', 'code', 'example'):
            if k in e and isinstance(e[k], str):
                e[k] = e[k].strip('\n') + '\n'
        if 'expect' in e:
            e['expect'] = e['expect'].strip('\n') + '\n'
    js = ("/* PythonPatika — " + note + " */\n(function (W) {\n'use strict';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(\n"
          + ser(lesson, 0) + "\n);\n})(window);\n")
    open(path, 'w', encoding='utf-8').write(js)
    b = lesson['body']
    check_body(b)
    st = {}
    for e in lesson['ex']:
        st[e['stage']] = st.get(e['stage'], 0) + 1
    print('kelime:', words(b), '| pre.py:', b.count('<pre class="py">'), '| tablo:', b.count('<table>'),
          '| deep:', 'class="deep"' in b, '| Gerçek işte:', 'Gerçek işte' in b)
    print('alıştırma:', len(lesson['ex']), st, '| bug:', sum(1 for e in lesson['ex'] if e.get('kind') == 'bug'))
    for e in lesson['ex']:
        if e['stage'] == 'Rehberli':
            assert e.get('guide') and e.get('example') and 'TODO' in e.get('start', ''), e['id']
    r = subprocess.run(['python3', '/home/claude/py/tools/verify.py', path], capture_output=True, text=True)
    print(r.stdout[-6000:], r.stderr[-2000:])
