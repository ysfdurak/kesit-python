import html as H, re, os

OUT = '/home/claude/py/v2/x1/'


def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"


def tmpl(s):
    assert '`' not in s and '${' not in s, 'backtick/${ html icinde'
    return '`' + s.replace('\\', '\\\\') + '`'


def py(code):
    return '<pre class="py">' + H.escape(code.strip('\n') + '\n', quote=False) + '</pre>'


def kod(code):
    return '<pre class="code">' + H.escape(code.strip('\n') + '\n', quote=False) + '</pre>'


def val(v, ind):
    sp = '  ' * ind
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return js_str(v)
    if isinstance(v, list):
        if all(isinstance(x, (str, int, float)) for x in v):
            return '[' + ', '.join(val(x, 0) for x in v) + ']'
        return '[\n' + ',\n'.join(sp + '  ' + val(x, ind + 1) for x in v) + '\n' + sp + ']'
    if isinstance(v, dict):
        parts = []
        for k, x in v.items():
            if k == 'html':
                parts.append(sp + '  html: ' + tmpl(x))
            else:
                parts.append(sp + '  ' + k + ': ' + val(x, ind + 1))
        return '{\n' + ',\n'.join(parts) + '\n' + sp + '}'
    raise TypeError(type(v))


def words(htmls):
    t = re.sub(r'<[^>]+>', ' ', htmls)
    return len(t.split())


def emit(lesson_id, ext, desc):
    # alıştırma metinlerini temizle
    for e in ext['ex']:
        for k in ('start', 'sol', 'tests', 'code', 'example', 'expect'):
            if k in e and isinstance(e[k], str):
                e[k] = e[k].strip('\n') + '\n'
        if 'lines' in e:
            pass
    needs = sorted({n for e in ext['ex'] for n in e.get('needs', [])} | set(ext.get('needs', [])))
    ext['needs'] = needs
    order = ['id', 'min', 'needs', 'html', 'ex', 'faq', 'mistakes']
    obj = {k: ext[k] for k in order if k in ext}
    s = ('/* PythonPatika — \'' + lesson_id + '\' dersi uzantısı: ' + desc + ' (gerçek veri setleri) */\n'
         + '// needs: ' + ', '.join(needs) + '\n'
         + "(function (W) {\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push(\n  "
         + val(obj, 1) + '\n);\n})(window);\n')
    path = OUT + lesson_id + '.js'
    os.makedirs(OUT, exist_ok=True)
    open(path, 'w', encoding='utf-8').write(s)
    print(path, 'html kelime:', words(ext['html']), 'alıştırma:', len(ext['ex']))
