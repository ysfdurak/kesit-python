#!/usr/bin/env python3
"""Yazım modülünden (EXT sözlüğü) PY_EXT JS dosyası üretir.
Kullanım: gen.py kaynak.py  -> /home/claude/py/v2/x3/<id>.js (ya da EXT['_file'])"""
import html, re, runpy, sys

OUT = '/home/claude/py/v2/x3/'
KEY_ORDER = ['t', 'id', 'stage', 'kind', 'diff', 'needs', 'q', 'o', 'a', 'raises', 'code', 'lines',
             'guide', 'example', 'start', 'sol', 'tests', 'expect', 'stdin', 'hints', 'hint', 'why']


def js_str(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n')
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
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 200:
            return '[' + ', '.join(js_str(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + js_val(x, ind + 1) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        keys = sorted(v, key=lambda k: (KEY_ORDER.index(k) if k in KEY_ORDER else 99))
        return '{\n' + ',\n'.join(pad + '  ' + k + ': ' + js_val(v[k], ind + 1) for k in keys) + '\n' + pad + '}'
    raise TypeError(type(v))


def esc_pre(h):
    # <pre ...> içeriğini HTML kaçışla (yazımda ham kod yazılır)
    def f(m):
        return m.group(1) + html.escape(m.group(2).strip('\n'), quote=False) + '</pre>'
    return re.sub(r'(<pre class="(?:py|code|out)">)(.*?)</pre>', f, h, flags=re.S)


def tmpl(h):
    h = h.replace('`', '&#96;')
    return '`' + h.replace('\\', '\\\\').replace('${', '$\\{') + '`'


def main():
    src = sys.argv[1]
    E = runpy.run_path(src)['EXT']
    exts = E if isinstance(E, list) else [E]
    fname = OUT + (exts[0].get('_file') or exts[0]['id']) + '.js'
    parts = []
    for x in exts:
        x = dict(x); x.pop('_file', None)
        h = esc_pre(x.pop('html').strip())
        words = len(re.sub(r'<[^>]+>', ' ', h).split())
        print(x['id'], 'html kelime:', words, 'alıştırma:', len(x['ex']))
        lines = ['  {', "    id: " + js_str(x['id']) + ',', '    min: ' + str(x['min']) + ',']
        if x.get('needs'):
            lines.append('    needs: ' + js_val(x['needs'], 2) + ',')
        lines += [ '    html: ' + tmpl(h) + ',']
        for k in ('ex', 'faq', 'mistakes'):
            if x.get(k):
                lines.append('    ' + k + ': ' + js_val(x[k], 2) + ',')
        lines[-1] = lines[-1].rstrip(',')
        lines.append('  }')
        parts.append('\n'.join(lines))
    title = exts[0].get('title') or ', '.join("'" + x['id'] + "'" for x in exts)
    js = ("/* Kesit Python — " + ', '.join("'" + x['id'] + "'" for x in exts) + " uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */\n"
          "(function (W) {\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push(\n" + ',\n'.join(parts) + "\n);\n})(window);\n")
    open(fname, 'w', encoding='utf-8').write(js)
    print('yazıldı:', fname)


if __name__ == '__main__':
    main()
