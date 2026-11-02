"""Ders nesnesini Kesit Python JS dosyasına yazar (tek tırnaklı stringler, body template literal)."""
import re

KEY_ORDER = ['id', 'lv', 'mod', 'min', 'title', 'sum', 'goals', 'body', 'ex', 'faq', 'mistakes',
             't', 'stage', 'kind', 'diff', 'q', 'code', 'lines', 'o', 'a', 'raises', 'guide', 'example',
             'start', 'sol', 'tests', 'expect', 'stdin', 'hint', 'hints', 'why', 'bad', 'good']


def C(s):
    """Kod bloğu: baştaki boş satırı at, sonda tek \n bırak."""
    s = s.lstrip('\n').rstrip() + '\n'
    return s


def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '') + "'"


def tmpl(s):
    assert '`' not in s, 'body içinde backtick var'
    assert '${' not in s, 'body içinde ${ var'
    return '`' + s.replace('\\', '\\\\') + '`'


def ser(v, ind=1, key=None):
    pad = '  ' * ind
    if key == 'body':
        return tmpl(v)
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return js_str(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 200:
            return '[' + ', '.join(js_str(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + ser(x, ind + 1) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        keys = sorted(v.keys(), key=lambda k: KEY_ORDER.index(k) if k in KEY_ORDER else 99)
        parts = []
        for k in keys:
            kk = k if re.match(r'^[A-Za-z_]\w*$', k) else js_str(k)
            parts.append(pad + '  ' + kk + ': ' + ser(v[k], ind + 1, k))
        return '{\n' + ',\n'.join(parts) + '\n' + pad + '}'
    raise TypeError(type(v))


def emit(lesson, path, note=''):
    out = ['/* Kesit Python — v2 o2: ' + lesson['id'] + (' — ' + note if note else '') + ' */',
           '(function (W) {', "'use strict';", 'const L = W.PY_LESSONS = W.PY_LESSONS || [];',
           'L.push(', ser(lesson, 0), ');', '})(window);', '']
    open(path, 'w', encoding='utf-8').write('\n'.join(out))
    words = len(re.sub(r'<[^>]+>', ' ', lesson['body']).split())
    stages = {}
    for e in lesson['ex']:
        stages[e.get('stage')] = stages.get(e.get('stage'), 0) + 1
    print(path, 'kelime=', words, 'pre.py=', lesson['body'].count('<pre class="py">'), 'ex=', len(lesson['ex']), stages)
