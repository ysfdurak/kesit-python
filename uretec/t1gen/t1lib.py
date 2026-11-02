"""t1: Ders sözlüğünü PythonPatika JS dosyasına çevirir ve body örneklerini çalıştırır."""
import re, subprocess, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
IDENT = re.compile(r'^[A-Za-z_][A-Za-z0-9_]*$')

def sq(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n')
    s = s.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    return "'" + s + "'"

def js(v, ind=1):
    pad = '  ' * ind
    if isinstance(v, bool): return 'true' if v else 'false'
    if v is None: return 'null'
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, str): return sq(v)
    if isinstance(v, list):
        if not v: return '[]'
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 200:
            return '[' + ', '.join(sq(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + js(x, ind + 1) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        parts = []
        for k, x in v.items():
            key = k if IDENT.match(k) else sq(k)
            parts.append(f'{key}: {js(x, ind + 1)}')
        one = '{ ' + ', '.join(parts) + ' }'
        if len(one) < 160 and '\n' not in one: return one
        return '{\n' + ',\n'.join(pad + '  ' + p for p in parts) + '\n' + pad + '}'
    raise TypeError(type(v))

PRE = re.compile(r'(<pre class="(py|code|out)">)(.*?)(</pre>)', re.S)

def prep_body(body):
    def rep(m):
        inner = m.group(3).strip('\n')
        inner = inner.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
        inner = inner.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        if m.group(2) == 'py': assert '${' not in inner, 'pre.py içinde ${'
        inner = inner.replace('${', '&#36;{')
        return m.group(1) + inner + m.group(4)
    b = PRE.sub(rep, body.strip('\n'))
    assert '`' not in b, 'body içinde backtick'
    assert '${' not in b, 'body içinde ${'
    return b

def run_examples(body):
    blocks = re.findall(r'<pre class="py">(.*?)</pre>', body, re.S)
    rd = os.path.join(HERE, 'run'); os.makedirs(rd, exist_ok=True)
    for i, code in enumerate(blocks):
        p = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=30, cwd=rd)
        if p.returncode or not p.stdout.strip():
            print(f'ÖRNEK {i+1} HATALI:\n{code}\n{p.stderr[-800:]}'); sys.exit(3)
        if '-v' in sys.argv: print(f'--- örnek {i+1}\n{p.stdout}')
    return len(blocks)

def words(body):
    return len(re.sub(r'<[^>]+>', ' ', body).split())

def emit(lesson, path):
    n = run_examples(lesson['body'])
    body = prep_body(lesson['body'])
    out = ['/* PythonPatika — v2/t1: ' + lesson['id'] + ' */', '(function (W) {', "'use strict';",
           'const L = W.PY_LESSONS = W.PY_LESSONS || [];', 'L.push(', '{']
    for k in ['id', 'lv', 'mod', 'min', 'title', 'sum', 'goals']: out.append(f'  {k}: {js(lesson[k], 1)},')
    out.append('  body: `\n' + body.replace('\\', '\\\\') + '\n`,')
    for k in ['ex', 'faq', 'mistakes']:
        out.append(f'  {k}: {js(lesson[k], 1)}' + (',' if k != 'mistakes' else ''))
    out += ['}', ');', '})(window);', '']
    open(path, 'w', encoding='utf-8').write('\n'.join(out))
    st = {}
    for e in lesson['ex']: st[e['stage']] = st.get(e['stage'], 0) + 1
    print(f"{lesson['id']}: kelime={words(body)} pre.py={n} ex={len(lesson['ex'])} {st}")
