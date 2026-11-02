import html as _h, subprocess, sys, textwrap, os, re

OUT = '/home/claude/py/v2/x2'
RUN = '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x2run'


def d(s):
    return textwrap.dedent(s).strip('\n') + '\n'


def py(code):
    return '<pre class="py">' + _h.escape(textwrap.dedent(code).strip('\n'), quote=False) + '</pre>'


def pc(code):
    return '<pre class="code">' + _h.escape(textwrap.dedent(code).strip('\n'), quote=False) + '</pre>'


def jsstr(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n')
    return "'" + s.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029') + "'"


def tl(s):
    assert '`' not in s, 'html içinde backtick var'
    assert '${' not in s, 'html içinde ${ var'
    return '`' + s.replace('\\', '\\\\') + '`'


def ser(v, key=None, ind=4):
    pad = ' ' * ind
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return tl(v) if key == 'html' else jsstr(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and key not in ('ex', 'faq', 'mistakes'):
            return '[' + ', '.join(jsstr(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + ser(x, None, ind + 2) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        parts = [f'{k}: {ser(x, k, ind + 2)}' for k, x in v.items() if x is not None]
        return '{ ' + (',\n' + pad + '  ').join(parts) + ' }'
    raise TypeError(type(v))


def emit(ext, aciklama, fname=None):
    path = os.path.join(OUT, (fname or ext['id']) + '.js')
    body = ser(ext, None, 2)
    js = f"/* Kesit Python — '{ext['id']}' dersi uzantısı: {aciklama} */\n(function (W) {{\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push(\n  {body}\n);\n}})(window);\n"
    os.makedirs(OUT, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(js)
    words = len(re.sub(r'<[^>]+>', ' ', ext.get('html', '')).split())
    print('yazıldı', path, '| html kelime:', words, '| alıştırma:', len(ext['ex']), '| ids:', [e.get('id') for e in ext['ex'] if e.get('id')])
    r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    if r.returncode:
        print(r.stderr); sys.exit(1)
    if os.environ.get('NOVERIFY'):
        return path
    r = subprocess.run([sys.executable, '/home/claude/py/tools/verify.py', '-q', path], capture_output=True, text=True, cwd=RUN)
    print(r.stdout[-8000:], r.stderr[-3000:])
    r = subprocess.run([sys.executable, '/home/claude/py/tools/examples.py', path], capture_output=True, text=True, cwd=RUN)
    print(r.stdout[-5000:], r.stderr[-3000:])
    return path
