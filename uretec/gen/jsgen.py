"""Ders nesnesini Kesit Python JS dosyasına çevirir (tek tırnaklı stringler, body template literal)."""
import html

def P(code):
    """Çalışan örnek kutusu."""
    return '<pre class="py">' + html.escape(code.strip('\n'), quote=False) + '</pre>'

def C(code):
    """Tarayıcıda çalışmayan gösterim kodu."""
    return '<pre class="code">' + html.escape(code.strip('\n'), quote=False) + '</pre>'

def s(v):
    assert '\ufffd' not in v
    return "'" + v.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '') + "'"

def tl(v):
    assert '`' not in v, 'body içinde backtick'
    assert '${' not in v, 'body içinde ${'
    assert '\ufffd' not in v
    return '`' + v.replace('\\', '\\\\') + '`'

def val(v, ind):
    pad = ' ' * ind
    if isinstance(v, str):
        return s(v)
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, list):
        if all(isinstance(x, str) and len(x) < 60 for x in v) and sum(len(x) for x in v) < 110:
            return '[' + ', '.join(s(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + val(x, ind + 2) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        return obj(v, ind)
    raise TypeError(type(v))

def obj(d, ind):
    pad = ' ' * ind
    parts = []
    for k, v in d.items():
        if k == 'body':
            parts.append(pad + '  body: ' + tl(v))
        else:
            parts.append(pad + '  ' + k + ': ' + val(v, ind + 2))
    return '{\n' + ',\n'.join(parts) + '\n' + pad + '}'

def write(path, header, needs_comment, lesson):
    out = '/* Kesit Python — ' + header + ' */\n'
    if needs_comment:
        out += '// needs: ' + needs_comment + '\n'
    out += "(function (W) {\n'use strict';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(\n  " + obj(lesson, 2) + '\n);\n})(window);\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(out)
    words = len(html.unescape(__import__('re').sub(r'<[^>]+>', ' ', lesson['body'])).split())
    print('yazıldı', path, 'gövde kelime:', words, 'alıştırma:', len(lesson['ex']))
