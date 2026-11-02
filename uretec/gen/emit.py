import html, json, re

def PY(code):
    return '<pre class="py">' + html.escape(code.strip('\n'), quote=False) + '</pre>'

def CODE(code):
    return '<pre class="code">' + html.escape(code.strip('\n'), quote=False) + '</pre>'

def jstr(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '') + "'"

def jval(v, ind='      '):
    if isinstance(v, str):
        return jstr(v)
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return json.dumps(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 200:
            return '[' + ', '.join(jstr(x) for x in v) + ']'
        return '[\n' + ',\n'.join(ind + '  ' + jval(x, ind + '  ') for x in v) + '\n' + ind + ']'
    if isinstance(v, dict):
        parts = []
        for k, x in v.items():
            if x is None:
                continue
            parts.append(ind + '  ' + k + ': ' + jval(x, ind + '  '))
        return '{\n' + ',\n'.join(parts) + ' }'
    raise TypeError(type(v))

def body_lit(b):
    assert '`' not in b, 'body içinde backtick'
    assert '${' not in b, 'body içinde ${'
    return '`' + b.replace('\\', '\\\\') + '`'

ORDER = ['id', 'lv', 'mod', 'min', 'needs', 'title', 'sum', 'goals']

def write(path, lesson, comment):
    L = dict(lesson)
    body = L.pop('body'); ex = L.pop('ex'); faq = L.pop('faq'); mis = L.pop('mistakes')
    out = ['/* PythonPatika — ' + comment + ' */']
    if L.get('needs'):
        out.append('// needs: ' + ', '.join(L['needs']))
    out += ["(function (W) {", "'use strict';", "const L = W.PY_LESSONS = W.PY_LESSONS || [];", "L.push(", "  {"]
    fields = []
    for k in ORDER:
        if k in L:
            fields.append('    ' + k + ': ' + jval(L[k], '    '))
    fields.append('    body: ' + body_lit(body))
    fields.append('    ex: [\n' + ',\n'.join('      ' + jval(e, '      ') for e in ex) + '\n    ]')
    fields.append('    faq: ' + jval(faq, '    '))
    fields.append('    mistakes: ' + jval(mis, '    '))
    out.append(',\n'.join(fields))
    out += ["  }", ");", "})(window);", ""]
    open(path, 'w', encoding='utf-8').write('\n'.join(out))
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    st = {}
    for e in ex:
        st[e.get('stage')] = st.get(e.get('stage'), 0) + 1
    print('yazıldı', path, 'body kelime:', words, 'py örnek:', body.count('<pre class="py">'), 'alıştırma:', len(ex), st)
