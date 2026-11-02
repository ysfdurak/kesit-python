import re, subprocess, textwrap

def s(x):
    x = x.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '').replace('\u2028', '\\u2028')
    return "'" + x + "'"

def val(v, ind=4):
    pad = ' ' * ind
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, str): return s(v)
    if isinstance(v, list):
        if all(isinstance(i, str) for i in v) and sum(len(i) for i in v) < 70:
            return '[' + ', '.join(s(i) for i in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + val(i, ind + 2) for i in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        return '{ ' + ',\n'.join((pad + '  ' if k else '') + f'{key}: {val(x, ind + 2)}' for k, (key, x) in enumerate(v.items())) + ' }'
    raise TypeError(type(v))

def ded(c):
    return textwrap.dedent(c).strip('\n') + '\n'

def write(lesson, path):
    body = lesson['body']
    assert '`' not in body and '${' not in body, 'body backtick/${'
    body = body.replace('\\', '\\\\')
    out = ['/* Kesit Python — ileri: ' + lesson['id'] + ' */', '(function (W) {', "'use strict';",
           'const L = W.PY_LESSONS = W.PY_LESSONS || [];', 'L.push({']
    items = []
    for k, v in lesson.items():
        if k == 'body':
            items.append('  body: `' + body + '`')
        else:
            items.append('  ' + k + ': ' + val(v, 2))
    out.append(',\n'.join(items))
    out.append('});')
    out.append('})(window);')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    subprocess.run(['node', '--check', path], check=True)
    words = len(re.sub(r'<[^>]+>', ' ', lesson['body']).split())
    print(path, 'body kelime:', words, 'ex:', len(lesson['ex']))

def esc(code):
    return code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def py(code):
    return '<pre class="py">' + esc(ded(code).rstrip('\n')) + '</pre>'

def pc(code):
    return '<pre class="code">' + esc(ded(code).rstrip('\n')) + '</pre>'
