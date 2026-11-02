"""n8 ders üretici: Python verisinden tek IIFE'li JS ders dosyası yazar."""
import html as H, json, re

def py(code):
    return '<pre class="py">' + H.escape(code.strip('\n'), quote=False) + '</pre>'

def pcode(code):
    return '<pre class="code">' + H.escape(code.strip('\n'), quote=False) + '</pre>'

def js(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')
    return "'" + s + "'"

def tl(s):
    assert '`' not in s and '${' not in s, 'template literal içinde yasak karakter'
    return '`' + s.replace('\\', '\\\\') + '`'

def val(v, ind):
    pad = ' ' * ind
    if isinstance(v, str): return js(v)
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return json.dumps(v)
    if isinstance(v, list):
        if all(isinstance(x, (str, int, float)) for x in v) and sum(len(str(x)) for x in v) < 160:
            return '[' + ', '.join(val(x, ind) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + val(x, ind + 2) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        return '{\n' + ',\n'.join(pad + '  ' + f'{k}: ' + val(x, ind + 2) for k, x in v.items()) + ' }'
    raise TypeError(type(v))

def emit(path, header, lesson, needs_comment):
    assert '\ufffd' not in json.dumps(lesson, ensure_ascii=False)
    L = dict(lesson)
    body = L.pop('body')
    parts = []
    for k, v in L.items():
        if k == 'ex':
            parts.append('    ex: [\n' + ',\n'.join('      ' + val(e, 6) for e in v) + '\n    ]')
        elif k == 'body_here':
            parts.append('    body: ' + tl(body))
        else:
            parts.append(f'    {k}: ' + val(v, 4))
    out = (f'/* Kesit Python — {header} */\n'
           + (f'// needs: {needs_comment}\n' if needs_comment else '')
           + "(function (W) {\n'use strict';\nconst L = W.PY_LESSONS = W.PY_LESSONS || [];\nL.push(\n  {\n"
           + ',\n'.join(parts) + '\n  }\n);\n})(window);\n')
    open(path, 'w', encoding='utf-8').write(out)
    words = len(re.sub(r'<[^>]+>', ' ', re.sub(r'<pre class="(py|code)">.*?</pre>', ' ', body, flags=re.S)).split())
    allw = len(re.sub(r'<[^>]+>', ' ', body).split())
    print(path, 'gövde kelime (kod hariç):', words, 'toplam:', allw, 'alıştırma:', len(lesson['ex']))
