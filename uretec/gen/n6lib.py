import html, re, sys

def jstr(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t') + "'"

def tmpl(s):
    assert '`' not in s, 'backtick in body'
    assert '${' not in s, '${ in body'
    return '`' + s.replace('\\', '\\\\') + '`'

def jval(v, ind='  '):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return jstr(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 400:
            return '[' + ', '.join(jstr(x) for x in v) + ']'
        inner = ind + '  '
        return '[\n' + ',\n'.join(inner + jval(x, inner) for x in v) + '\n' + ind + ']'
    if isinstance(v, dict):
        inner = ind + '  '
        parts = []
        for k, x in v.items():
            parts.append(inner + k + ': ' + jval(x, inner))
        return '{\n' + ',\n'.join(parts) + '\n' + ind + '}'
    raise TypeError(type(v))

def PY(code):
    return '<pre class="py">' + html.escape(code.strip('\n'), quote=False) + '</pre>\n'

def CODE(code):
    return '<pre class="code">' + html.escape(code.strip('\n'), quote=False) + '</pre>\n'

def C(s):
    """Normalize code: strip leading newline, keep trailing single newline."""
    s = s.strip('\n')
    return s + '\n'

def write(path, title, lesson):
    body = lesson.pop('body')
    out = ['/* PythonPatika v2/n6 — ' + title + ' */', '(function (W) {', "'use strict';",
           'const L = W.PY_LESSONS = W.PY_LESSONS || [];', 'L.push({']
    keys = list(lesson.keys())
    lines = []
    for k in keys:
        if k == 'ex':
            lines.append('  body: ' + tmpl(body))
        lines.append('  ' + k + ': ' + jval(lesson[k], '  '))
    out.append(',\n'.join(lines))
    out.append('});')
    out.append('})(window);')
    open(path, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    print('yazıldı', path, 'body kelime ~', words, 'ex', len(lesson['ex']))
