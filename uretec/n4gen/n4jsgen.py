import html, re

def py(code):
    return '<pre class="py">' + html.escape(code.strip('\n'), quote=False) + '</pre>'

def code(c):
    return '<pre class="code">' + html.escape(c.strip('\n'), quote=False) + '</pre>'

def js_str(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n')
    s = s.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    return "'" + s + "'"

def js_val(v, ind):
    pad = '  ' * ind
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return js_str(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 400:
            return '[' + ', '.join(js_str(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + js_val(x, ind + 1) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        items = [pad + '  ' + k + ': ' + js_val(x, ind + 1) for k, x in v.items() if x is not None]
        return '{\n' + ',\n'.join(items) + '\n' + pad + '}'
    raise TypeError(type(v))

def emit(lesson, path):
    body = lesson['body']
    assert '`' not in body and '${' not in body, 'body içinde backtick/${ var'
    body_js = body.replace('\\', '\\\\')
    parts = []
    for k, v in lesson.items():
        if k == 'body':
            parts.append('  body: `\n' + body_js.strip('\n') + '\n`')
        else:
            parts.append('  ' + k + ': ' + js_val(v, 1))
    out = ("/* Kesit Python v2 — " + lesson['id'] + " */\n(function (W) {\n'use strict';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(\n{\n"
           + ',\n'.join(parts) + "\n}\n);\n})(window);\n")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(out)
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    print(path, 'body kelime:', words, 'alıştırma:', len(lesson['ex']))
